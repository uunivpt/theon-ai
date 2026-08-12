"use client";

import { useEffect } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "@/lib/firebase";

const originalFetch = typeof window !== "undefined" ? window.fetch.bind(window) : null;

function isInternalApi(input: RequestInfo | URL) {
  const url = typeof input === "string" ? input : input instanceof URL ? input.toString() : input.url;
  return url.startsWith("/api/") || (typeof window !== "undefined" && new URL(url, window.location.origin).origin === window.location.origin && new URL(url, window.location.origin).pathname.startsWith("/api/"));
}

export default function AuthenticatedApiBridge() {
  useEffect(() => {
    if (!originalFetch) return;
    const previousFetch = window.fetch;
    let currentUser = auth.currentUser;
    let disposed = false;

    const unsubscribe = onAuthStateChanged(auth, (user) => { currentUser = user; });

    window.fetch = async (input, init = {}) => {
      if (disposed || !isInternalApi(input)) return previousFetch(input, init);
      const user = currentUser;
      if (!user) return previousFetch(input, init);

      const token = await user.getIdToken();
      const headers = new Headers(init.headers);
      headers.set("Authorization", `Bearer ${token}`);
      return previousFetch(input, { ...init, headers });
    };

    return () => {
      disposed = true;
      unsubscribe();
      window.fetch = previousFetch;
    };
  }, []);

  return null;
}
