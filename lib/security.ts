import { createVerify } from "node:crypto";

const FIREBASE_PROJECT_ID = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "theon-ai";
const FIREBASE_ISSUER = `https://securetoken.google.com/${FIREBASE_PROJECT_ID}`;
const CERTS_URL = "https://www.googleapis.com/robot/v1/metadata/x509/securetoken@system.gserviceaccount.com";
const CLOCK_SKEW_SECONDS = 60;

type FirebaseClaims = {
  aud?: unknown;
  iss?: unknown;
  sub?: unknown;
  exp?: unknown;
  iat?: unknown;
  auth_time?: unknown;
  email?: unknown;
  email_verified?: unknown;
};

type CertCache = { certs: Record<string, string>; expiresAt: number };
let certCache: CertCache | null = null;

function base64UrlDecode(value: string) {
  return Buffer.from(value.replace(/-/g, "+").replace(/_/g, "/") + "=".repeat((4 - (value.length % 4)) % 4), "base64");
}

function decodeJson(value: string): Record<string, unknown> {
  const parsed = JSON.parse(base64UrlDecode(value).toString("utf8"));
  if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) throw new Error("Invalid JWT object");
  return parsed as Record<string, unknown>;
}

async function fetchFirebaseCerts(force = false): Promise<Record<string, string>> {
  const now = Date.now();
  if (!force && certCache && certCache.expiresAt > now + 30_000) return certCache.certs;

  const response = await fetch(CERTS_URL, { cache: "no-store", headers: { Accept: "application/json" } });
  if (!response.ok) throw new Error("Unable to load Firebase signing certificates");
  const certs = await response.json();
  if (!certs || typeof certs !== "object" || Array.isArray(certs)) throw new Error("Invalid Firebase certificate response");

  const cacheControl = response.headers.get("cache-control") || "";
  const maxAge = Number(cacheControl.match(/max-age=(\d+)/i)?.[1] || 3600);
  certCache = { certs: certs as Record<string, string>, expiresAt: now + Math.min(Math.max(maxAge, 60), 86_400) * 1000 };
  return certCache.certs;
}

async function verifyFirebaseJwt(token: string): Promise<FirebaseClaims> {
  const parts = token.split(".");
  if (parts.length !== 3 || parts.some((part) => !part || part.length > 16_384)) throw new Error("Malformed token");

  const header = decodeJson(parts[0]);
  const payload = decodeJson(parts[1]);
  if (header.alg !== "RS256" || typeof header.kid !== "string") throw new Error("Unsupported token signature");

  let certs = await fetchFirebaseCerts();
  let cert = certs[header.kid];
  if (!cert) {
    certs = await fetchFirebaseCerts(true);
    cert = certs[header.kid];
  }
  if (!cert) throw new Error("Unknown signing key");

  const verifier = createVerify("RSA-SHA256");
  verifier.update(`${parts[0]}.${parts[1]}`);
  verifier.end();
  if (!verifier.verify(cert, base64UrlDecode(parts[2]))) throw new Error("Invalid token signature");

  const now = Math.floor(Date.now() / 1000);
  if (payload.aud !== FIREBASE_PROJECT_ID || payload.iss !== FIREBASE_ISSUER) throw new Error("Invalid token audience or issuer");
  if (typeof payload.sub !== "string" || payload.sub.length === 0 || payload.sub.length > 128) throw new Error("Invalid token subject");
  if (typeof payload.exp !== "number" || payload.exp <= now - CLOCK_SKEW_SECONDS) throw new Error("Expired token");
  if (typeof payload.iat !== "number" || payload.iat > now + CLOCK_SKEW_SECONDS) throw new Error("Invalid token issue time");
  if (typeof payload.auth_time !== "number" || payload.auth_time > now + CLOCK_SKEW_SECONDS) throw new Error("Invalid authentication time");

  return payload as FirebaseClaims;
}

export async function verifyFirebaseIdToken(token: string) {
  return verifyFirebaseJwt(token);
}

export function getClientIp(request: Request) {
  const forwarded = request.headers.get("x-forwarded-for");
  const real = request.headers.get("x-real-ip");
  const candidate = forwarded?.split(",")[0]?.trim() || real?.trim() || "unknown";
  return candidate.slice(0, 128);
}

export function sameOrigin(request: Request) {
  const origin = request.headers.get("origin");
  if (!origin) return true;
  const requestUrl = new URL(request.url);
  const configured = process.env.NEXT_PUBLIC_APP_ORIGIN?.replace(/\/$/, "");
  return origin === requestUrl.origin || (configured ? origin === configured : false);
}

type RateState = { startedAt: number; count: number };
const rateStore = new Map<string, RateState>();

export function consumeRateLimit(key: string, limit: number, windowMs: number) {
  const now = Date.now();
  const current = rateStore.get(key);
  if (!current || now - current.startedAt >= windowMs) {
    rateStore.set(key, { startedAt: now, count: 1 });
    return { allowed: true, retryAfter: 0 };
  }
  current.count += 1;
  if (current.count <= limit) return { allowed: true, retryAfter: 0 };
  return { allowed: false, retryAfter: Math.ceil((windowMs - (now - current.startedAt)) / 1000) };
}

export function cleanupRateStore() {
  if (rateStore.size < 2_000) return;
  const cutoff = Date.now() - 120_000;
  for (const [key, state] of rateStore) if (state.startedAt < cutoff) rateStore.delete(key);
}

export function requestContentLength(request: Request) {
  const value = request.headers.get("content-length");
  if (!value) return null;
  const size = Number(value);
  return Number.isSafeInteger(size) && size >= 0 ? size : null;
}

export async function readJsonBody(request: Request, maxBytes: number) {
  const declared = requestContentLength(request);
  if (declared !== null && declared > maxBytes) throw new BodyLimitError();
  const text = await request.text();
  if (Buffer.byteLength(text, "utf8") > maxBytes) throw new BodyLimitError();
  try { return JSON.parse(text) as unknown; } catch { throw new InvalidJsonError(); }
}

export class BodyLimitError extends Error {
  readonly status = 413;
  constructor() { super("Request body is too large."); this.name = "BodyLimitError"; }
}

export class InvalidJsonError extends Error {
  readonly status = 400;
  constructor() { super("Invalid JSON request body."); this.name = "InvalidJsonError"; }
}
