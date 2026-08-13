import { requireFirebaseAppCheck, AppCheckError } from "@/lib/app-check";
import { verifyFirebaseIdToken } from "@/lib/security";

const FIREBASE_AUTH_API = "https://identitytoolkit.googleapis.com/v1/accounts:lookup";
const MAX_TOKEN_LENGTH = 5000;

export type AuthenticatedUser = {
  uid: string;
  email?: string;
  emailVerified?: boolean;
};

function firebaseApiKey() {
  return process.env.FIREBASE_WEB_API_KEY || process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "";
}

export async function requireFirebaseUser(request: Request): Promise<AuthenticatedUser> {
  const authorization = request.headers.get("authorization") || "";
  const match = /^Bearer\s+([^\s]+)$/i.exec(authorization);
  const token = match?.[1];
  if (!token) throw new AuthError("Authentication required.", 401);
  if (token.length < 100 || token.length > MAX_TOKEN_LENGTH) throw new AuthError("Invalid authentication token.", 401);

  let claims: Awaited<ReturnType<typeof verifyFirebaseIdToken>>;
  try {
    claims = await verifyFirebaseIdToken(token);
  } catch {
    throw new AuthError("Invalid or expired session.", 401);
  }

  const apiKey = firebaseApiKey();
  if (!apiKey) throw new AuthError("Authentication service is not configured.", 503);

  const response = await fetch(`${FIREBASE_AUTH_API}?key=${encodeURIComponent(apiKey)}`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify({ idToken: token }),
    cache: "no-store",
    signal: AbortSignal.timeout(8_000),
  });

  const payload = await response.json().catch(() => null);
  if (!response.ok || !Array.isArray(payload?.users) || !payload.users[0]?.localId) {
    throw new AuthError("Invalid or expired session.", 401);
  }

  const user = payload.users[0];
  if (String(user.localId) !== String(claims.sub)) throw new AuthError("Invalid authentication subject.", 401);
  if (user.disabled === true) throw new AuthError("This account is disabled.", 403);

  if (process.env.FIREBASE_APPCHECK_ENFORCE === "true") {
    try {
      await requireFirebaseAppCheck(request);
    } catch (error) {
      if (error instanceof AppCheckError) throw error;
      throw new AuthError("App verification failed.", 401);
    }
  }

  return {
    uid: String(claims.sub),
    email: typeof user.email === "string" ? user.email : undefined,
    emailVerified: user.emailVerified === true,
  };
}

export class AuthError extends Error {
  readonly status: number;
  constructor(message: string, status: number) {
    super(message);
    this.name = "AuthError";
    this.status = status;
  }
}
