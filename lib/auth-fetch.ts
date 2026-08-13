import type { User } from "firebase/auth";
import { getToken } from "firebase/app-check";
import { appCheck } from "@/lib/firebase";

export async function authenticatedJsonFetch(user: User, input: RequestInfo | URL, init: RequestInit = {}) {
  const token = await user.getIdToken();
  const headers = new Headers(init.headers);
  headers.set("Authorization", `Bearer ${token}`);

  if (appCheck) {
    try {
      const appCheckToken = await getToken(appCheck, false);
      if (appCheckToken.token) headers.set("X-Firebase-AppCheck", appCheckToken.token);
    } catch (error) {
      console.warn("Firebase App Check token unavailable", error instanceof Error ? error.message : "unknown");
    }
  }

  if (!headers.has("Content-Type") && init.body) headers.set("Content-Type", "application/json");
  return fetch(input, { ...init, headers, cache: "no-store", credentials: "same-origin" });
}
