"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { sendPasswordResetEmail, signInWithEmailAndPassword, signInWithPopup, signOut } from "firebase/auth";
import { auth, provider } from "@/lib/firebase";
import { useRouter } from "next/navigation";

const DEBOUNCE_MS = 700;

function authMessage(error: unknown) {
  const code = typeof error === "object" && error && "code" in error ? String((error as { code?: unknown }).code) : "";
  if (["auth/invalid-credential", "auth/user-not-found", "auth/wrong-password"].includes(code)) return "Invalid email or password.";
  if (code === "auth/too-many-requests") return "Too many attempts. Please wait and try again.";
  if (code === "auth/invalid-email") return "Enter a valid email address.";
  if (code === "auth/popup-closed-by-user") return "Google sign-in was cancelled.";
  return "Authentication failed. Please try again.";
}

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const loginTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => () => { if (loginTimer.current) clearTimeout(loginTimer.current); }, []);

  function scheduleLogin() {
    if (loginTimer.current) clearTimeout(loginTimer.current);
    loginTimer.current = setTimeout(() => { void emailLogin(); }, DEBOUNCE_MS);
  }

  async function googleLogin() {
    if (loading) return;
    setLoading(true);
    try {
      const credential = await signInWithPopup(auth, provider);
      if (!credential.user.emailVerified) {
        await signOut(auth);
        alert("Please verify your Google account email before continuing.");
        return;
      }
      router.replace("/");
    } catch (error: unknown) {
      console.error(error);
      alert(authMessage(error));
    } finally {
      setLoading(false);
    }
  }

  async function emailLogin() {
    if (!email.trim() || !password || loading) return;
    setLoading(true);
    try {
      const credential = await signInWithEmailAndPassword(auth, email.trim(), password);
      if (!credential.user.emailVerified) {
        await signOut(auth);
        alert("Please verify your email address before signing in.");
        return;
      }
      router.replace("/");
    } catch (error: unknown) {
      console.error(error);
      alert(authMessage(error));
    } finally {
      setLoading(false);
    }
  }

  async function forgotPassword() {
    if (!email.trim() || loading) {
      if (!email.trim()) alert("Enter your email first.");
      return;
    }
    setLoading(true);
    try {
      await sendPasswordResetEmail(auth, email.trim());
      alert("If an account exists for that email, a password reset email has been sent.");
    } catch (error: unknown) {
      console.error(error);
      alert("Unable to process the password reset request.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-black px-4 py-8 text-white">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_15%,rgba(139,92,246,0.14),transparent_34%)]" />
      <div className="relative w-full max-w-[430px]">
        <div className="mb-7 text-center"><div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.045]"><span className="text-xl font-semibold">T</span></div><h1 className="text-[30px] font-semibold">Welcome back</h1><p className="mt-2 text-sm text-white/40">Sign in to continue with Theon AI</p></div>
        <div className="rounded-[28px] border border-white/[0.09] bg-[#0d0d0f]/95 p-5 shadow-2xl sm:p-7">
          <button disabled={loading} onClick={googleLogin} className="flex h-14 w-full items-center justify-center gap-3 rounded-2xl border border-white/10 bg-white/[0.045] font-medium disabled:opacity-50"><span className="flex h-7 w-7 items-center justify-center rounded-full bg-white text-sm font-bold text-[#4285F4]">G</span><span>Continue with Google</span></button>
          <div className="my-6 flex items-center gap-3"><div className="h-px flex-1 bg-white/[0.08]" /><span className="text-[10px] text-white/25">OR</span><div className="h-px flex-1 bg-white/[0.08]" /></div>
          <div className="space-y-3"><input autoComplete="email" type="email" placeholder="Email address" value={email} onChange={(e) => setEmail(e.target.value)} className="h-14 w-full rounded-2xl border border-white/[0.09] bg-white/[0.035] px-5 text-sm outline-none" /><input autoComplete="current-password" type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} onKeyDown={(e) => e.key === "Enter" && scheduleLogin()} className="h-14 w-full rounded-2xl border border-white/[0.09] bg-white/[0.035] px-5 text-sm outline-none" /></div>
          <div className="mt-3 text-right"><button disabled={loading} onClick={forgotPassword} className="text-xs text-white/40">Forgot password?</button></div>
          <button disabled={loading || !email.trim() || !password} onClick={scheduleLogin} className="mt-5 h-14 w-full rounded-2xl bg-gradient-to-r from-violet-600 to-cyan-500 font-semibold disabled:opacity-40">{loading ? "Signing in..." : "Sign in"}</button>
          <p className="mt-6 text-center text-sm text-white/35">Don&apos;t have an account? <Link href="/signup" className="font-medium text-white/70">Create account</Link></p>
        </div>
      </div>
    </main>
  );
}
