import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const buckets = new Map<string, { count: number; resetAt: number }>();
const WINDOW_MS = 60_000;
const MAX_API_REQUESTS_PER_MINUTE = 30;
const ALLOWED_ORIGINS = new Set([
  "https://theonai.online",
  "https://www.theonai.online",
  "http://localhost:3000",
  "http://127.0.0.1:3000",
]);

function rateLimitKey(request: NextRequest) {
  return request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || request.headers.get("x-real-ip") || "unknown";
}

function isAllowedOrigin(request: NextRequest) {
  const origin = request.headers.get("origin");
  if (!origin) return true;
  return origin === request.nextUrl.origin || ALLOWED_ORIGINS.has(origin);
}

export function proxy(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  if (pathname === "/study") {
    const url = request.nextUrl.clone();
    url.pathname = "/study-v2";
    return NextResponse.rewrite(url);
  }

  if (pathname.startsWith("/api/")) {
    if (!isAllowedOrigin(request)) {
      return NextResponse.json({ error: "Request origin is not allowed." }, { status: 403 });
    }

    const fetchSite = request.headers.get("sec-fetch-site");
    if (fetchSite && !["same-origin", "same-site", "none"].includes(fetchSite)) {
      return NextResponse.json({ error: "Cross-site API requests are not allowed." }, { status: 403 });
    }

    const contentLength = Number(request.headers.get("content-length") || "0");
    const maxBody = pathname === "/api/chat" ? 5 * 1024 * 1024 : 256 * 1024;
    if (contentLength > maxBody) {
      return NextResponse.json({ error: "Request is too large." }, { status: 413 });
    }

    const key = `${pathname}:${rateLimitKey(request)}`;
    const now = Date.now();
    const bucket = buckets.get(key);
    if (!bucket || bucket.resetAt <= now) {
      buckets.set(key, { count: 1, resetAt: now + WINDOW_MS });
    } else {
      bucket.count += 1;
      if (bucket.count > MAX_API_REQUESTS_PER_MINUTE) {
        return NextResponse.json(
          { error: "Too many requests. Please try again in a minute." },
          { status: 429, headers: { "Retry-After": "60" } },
        );
      }
    }
  }

  return NextResponse.next();
}

export const config = { matcher: ["/study", "/api/:path*"] };
