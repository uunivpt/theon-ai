const FIREBASE_AUTH_API = "https://identitytoolkit.googleapis.com/v1/accounts:lookup";

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
  const apiKey = firebaseApiKey();

  if (!token) throw new AuthError("Authentication required.", 401);
  if (!apiKey) throw new AuthError("Authentication service is not configured.", 503);
  if (token.length < 100 || token.length > 5000) throw new AuthError("Invalid authentication token.", 401);

  const response = await fetch(`${FIREBASE_AUTH_API}?key=${encodeURIComponent(apiKey)}`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify({ idToken: token }),
    cache: "no-store",
  });

  const payload = await response.json().catch(() => null);
  if (!response.ok || !Array.isArray(payload?.users) || !payload.users[0]?.localId) {
    throw new AuthError("Invalid or expired session.", 401);
  }

  const user = payload.users[0];
  if (user.disabled === true) throw new AuthError("This account is disabled.", 403);

  return {
    uid: String(user.localId),
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
