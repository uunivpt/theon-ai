import { createSign } from "node:crypto";

const TOKEN_ENDPOINT = "https://oauth2.googleapis.com/token";
const VERIFY_BASE = "https://firebaseappcheck.googleapis.com/v1beta/projects";
let accessTokenCache: { token: string; expiresAt: number } | null = null;

function serviceAccount() {
  const raw = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;
  if (!raw) throw new Error("FIREBASE_SERVICE_ACCOUNT_JSON is not configured.");
  const parsed = JSON.parse(raw) as { client_email?: string; private_key?: string; project_id?: string };
  if (!parsed.client_email || !parsed.private_key || !parsed.project_id) throw new Error("Invalid Firebase service account configuration.");
  return parsed;
}

function base64Url(value: string | Buffer) { return Buffer.from(value).toString("base64url"); }

async function getGoogleAccessToken() {
  if (accessTokenCache && accessTokenCache.expiresAt > Date.now() + 60_000) return accessTokenCache.token;
  const account = serviceAccount();
  const now = Math.floor(Date.now() / 1000);
  const header = base64Url(JSON.stringify({ alg: "RS256", typ: "JWT" }));
  const claim = base64Url(JSON.stringify({ iss: account.client_email, scope: "https://www.googleapis.com/auth/firebase", aud: TOKEN_ENDPOINT, iat: now, exp: now + 3600 }));
  const unsigned = `${header}.${claim}`;
  const signer = createSign("RSA-SHA256");
  signer.update(unsigned);
  signer.end();
  const assertion = `${unsigned}.${base64Url(signer.sign(account.private_key))}`;

  const response = await fetch(TOKEN_ENDPOINT, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded", Accept: "application/json" },
    body: new URLSearchParams({ grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer", assertion }),
    cache: "no-store",
    signal: AbortSignal.timeout(5000),
  });
  if (!response.ok) throw new Error("Google service authentication failed.");
  const payload = await response.json() as { access_token?: string; expires_in?: number };
  if (!payload.access_token) throw new Error("Google service authentication returned no token.");
  accessTokenCache = { token: payload.access_token, expiresAt: Date.now() + Math.min(Number(payload.expires_in) || 3600, 3600) * 1000 };
  return payload.access_token;
}

export type AppCheckClaims = { appId?: string; sub?: string; aud?: string[]; exp?: number; iat?: number };

export async function verifyFirebaseAppCheck(token: string) {
  if (!token || token.length > 16_384) throw new Error("Missing or malformed App Check token.");
  const account = serviceAccount();
  const accessToken = await getGoogleAccessToken();
  const project = process.env.FIREBASE_PROJECT_NUMBER || account.project_id;
  const response = await fetch(`${VERIFY_BASE}/${encodeURIComponent(project)}:verifyAppCheckToken`, {
    method: "POST",
    headers: { Authorization: `Bearer ${accessToken}`, "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify({ appCheckToken: token }),
    cache: "no-store",
    signal: AbortSignal.timeout(5000),
  });
  if (!response.ok) {
    accessTokenCache = null;
    throw new Error("App Check verification failed.");
  }
  const payload = await response.json() as { token?: AppCheckClaims };
  if (!payload.token) throw new Error("Invalid App Check token response.");
  return payload.token;
}

export async function requireFirebaseAppCheck(request: Request) {
  const token = request.headers.get("x-firebase-appcheck")?.trim() || "";
  if (!token) throw new AppCheckError("App verification required.", 401);
  try { return await verifyFirebaseAppCheck(token); }
  catch { throw new AppCheckError("App verification failed.", 401); }
}

export class AppCheckError extends Error {
  constructor(message: string, readonly status: number) { super(message); this.name = "AppCheckError"; }
}
