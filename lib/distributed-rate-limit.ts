type RedisResponse<T = unknown> = { result?: T; error?: string };

const REDIS_URL = process.env.UPSTASH_REDIS_REST_URL?.replace(/\/$/, "");
const REDIS_TOKEN = process.env.UPSTASH_REDIS_REST_TOKEN;

function configured() {
  return Boolean(REDIS_URL && REDIS_TOKEN);
}

async function redis<T>(command: string[]) {
  if (!REDIS_URL || !REDIS_TOKEN) throw new Error("Distributed rate limiter is not configured.");
  const response = await fetch(REDIS_URL, {
    method: "POST",
    headers: { Authorization: `Bearer ${REDIS_TOKEN}`, "Content-Type": "application/json" },
    body: JSON.stringify(command),
    cache: "no-store",
    signal: AbortSignal.timeout(1500),
  });
  if (!response.ok) throw new Error(`Rate-limit store returned ${response.status}.`);
  const payload = (await response.json()) as RedisResponse<T>;
  if (payload.error) throw new Error(payload.error);
  return payload.result as T;
}

/** Distributed limiter. Production is fail-closed unless explicitly opted into a local fallback. */
export async function consumeDistributedLimit(key: string, limit: number, windowSeconds: number) {
  if (!configured()) {
    if (process.env.NODE_ENV === "production" && process.env.ALLOW_LOCAL_RATE_LIMIT_FALLBACK !== "true") {
      return { allowed: false, retryAfter: 30, unavailable: true };
    }
    return { allowed: true, retryAfter: 0, unavailable: true };
  }

  const bucket = Math.floor(Date.now() / 1000 / windowSeconds);
  const redisKey = `theon:rl:v1:${key}:${bucket}`;
  try {
    const count = Number(await redis<number>(["INCR", redisKey]));
    if (count === 1) await redis(["EXPIRE", redisKey, String(windowSeconds + 5)]);
    const elapsed = Math.floor(Date.now() / 1000) % windowSeconds;
    const retryAfter = Math.max(1, windowSeconds - elapsed);
    return { allowed: count <= limit, retryAfter: count <= limit ? 0 : retryAfter, unavailable: false };
  } catch (error) {
    console.error("Distributed rate limiter unavailable", error instanceof Error ? error.message : "unknown");
    if (process.env.NODE_ENV === "production" && process.env.ALLOW_LOCAL_RATE_LIMIT_FALLBACK !== "true") {
      return { allowed: false, retryAfter: 15, unavailable: true };
    }
    return { allowed: true, retryAfter: 0, unavailable: true };
  }
}
