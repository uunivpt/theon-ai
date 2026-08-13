import { NextRequest, NextResponse } from "next/server";
import { consumeRateLimit, cleanupRateStore, getClientIp, requestContentLength, sameOrigin } from "@/lib/security";

const API_BODY_LIMITS: Record<string, number> = {
  "/api/chat": 16 * 1024 * 1024,
  "/api/generate-image": 256 * 1024,
};

const ALLOWED_ORIGINS = new Set([
  "https://theonai.online",
  "https://www.theonai.online",
  "http://localhost:3000",
  "http://127.0.0.1:3000",
]);

function isAllowedOrigin(request: NextRequest) {
  const origin = request.headers.get("origin");
  if (!origin) return true;
  return sameOrigin(request) || ALLOWED_ORIGINS.has(origin);
}

function secure(response: NextResponse, requestId: string) {
  response.headers.set("Cache-Control", "no-store");
  response.headers.set("X-Request-Id", requestId);
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("X-Frame-Options", "DENY");
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  response.headers.set("Cross-Origin-Resource-Policy", "same-origin");
  return response;
}

export function proxy(request: NextRequest) {
  cleanupRateStore();
  const pathname = request.nextUrl.pathname;
  const requestId = crypto.randomUUID();

  if (pathname === "/study") {
    const url = request.nextUrl.clone();
    url.pathname = "/study-v2";
    return secure(NextResponse.rewrite(url), requestId);
  }

  if (pathname.startsWith("/api/")) {
    if (!isAllowedOrigin(request)) return secure(NextResponse.json({ error: "Request origin is not allowed." }, { status: 403 }), requestId);

    const fetchSite = request.headers.get("sec-fetch-site");
    if (fetchSite && !["same-origin", "same-site", "none"].includes(fetchSite)) {
      return secure(NextResponse.json({ error: "Cross-site API requests are not allowed." }, { status: 403 }), requestId);
    }

    if (request.method !== "POST") {
      return secure(NextResponse.json({ error: "Method not allowed." }, { status: 405, headers: { Allow: "POST" } }), requestId);
    }

    const maxBody = API_BODY_LIMITS[pathname] || 2 * 1024 * 1024;
    const contentLength = requestContentLength(request);
    if (contentLength !== null && contentLength > maxBody) {
      return secure(NextResponse.json({ error: "Request is too large." }, { status: 413 }), requestId);
    }

    const auth = request.headers.get("authorization") || "";
    if (!/^Bearer\s+[^\s]+$/i.test(auth)) {
      return secure(NextResponse.json({ error: "Authentication required." }, { status: 401 }), requestId);
    }

    const ip = getClientIp(request);
    const limit = pathname === "/api/generate-image" ? 6 : 20;
    const rate = consumeRateLimit(`${pathname}:${ip}`, limit, 10_000);
    if (!rate.allowed) {
      return secure(NextResponse.json({ error: "Too many requests. Please slow down." }, { status: 429, headers: { "Retry-After": String(rate.retryAfter) } }), requestId);
    }
  }

  return secure(NextResponse.next(), requestId);
}

export const config = { matcher: ["/study", "/api/:path*"] };
