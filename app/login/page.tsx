"use client";

import Link from "next/link";
import { useState } from "react";
import { sendPasswordResetEmail, signInWithEmailAndPassword, signInWithPopup } from "firebase/auth";
import { auth, provider } from "@/lib/firebase";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  async function googleLogin() {
    setLoading(true);
    try {
      await signInWithPopup(auth, provider);
      router.replace("/");
    } catch (error: unknown) {
      console.error(error);
      alert(error instanceof Error ? error.message : "Google login failed.");
    } finally {
      setLoading(false);
    }
  }

  async function emailLogin() {
    if (!email.trim() || !password) return;
    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email.trim(), password);
      router.replace("/");
    } catch (error: unknown) {
      console.error(error);
      alert(error instanceof Error ? error.message : "Login failed.");
    } finally {
      setLoading(false);
    }
  }

  async function forgotPassword() {
    if (!email.trim()) {
      alert("Enter your email first.");
      return;
    }
    try {
      await sendPasswordResetEmail(auth, email.trim());
      alert("Password reset email sent. Check your inbox.");
    } catch (error: unknown) {
      console.error(error);
      alert(error instanceof Error ? error.message : "Unable to send reset email.");
    }
  }

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-black px-4 py-8 text-white">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_15%,rgba(139,92,246,0.14),transparent_34%)]" />
      <div className="relative w-full max-w-[430px]">
        <div className="mb-7 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.045] shadow-[0_0_45px_rgba(139,92,246,0.12)]">
            <span className="text-xl font-semibold tracking-[-0.06em]">T</span>
          </div>
          <h1 className="text-[30px] font-semibold tracking-[-0.035em]">Welcome back</h1>
          <p className="mt-2 text-sm text-white/40">Sign in to continue with Theon AI</p>
        </div>

        <div className="rounded-[28px] border border-white/[0.09] bg-[#0d0d0f]/95 p-5 shadow-2xl shadow-black/50 backdrop-blur-xl sm:p-7">
          <button disabled={loading} onClick={googleLogin} className="group flex h-14 w-full items-center justify-center gap-3 rounded-2xl border border-white/10 bg-white/[0.045] font-medium text-white transition duration-150 hover:border-white/20 hover:bg-white/[0.08] active:scale-[0.99] disabled:opacity-50">
            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-white text-sm font-bold text-[#4285F4]">G</span>
            <span>Continue with Google</span>
          </button>

          <div className="my-6 flex items-center gap-3">
            <div className="h-px flex-1 bg-white/[0.08]" />
            <span className="text-[10px] font-medium tracking-[0.18em] text-white/25">OR</span>
            <div className="h-px flex-1 bg-white/[0.08]" />
          </div>

          <div className="space-y-3">
            <input type="email" placeholder="Email address" value={email} onChange={(e) => setEmail(e.target.value)} className="h-14 w-full rounded-2xl border border-white/[0.09] bg-white/[0.035] px-5 text-sm text-white placeholder:text-white/25 outline-none transition focus:border-violet-400/60 focus:bg-white/[0.05]" />
            <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} onKeyDown={(e) => e.key === "Enter" && emailLogin()} className="h-14 w-full rounded-2xl border border-white/[0.09] bg-white/[0.035] px-5 text-sm text-white placeholder:text-white/25 outline-none transition focus:border-violet-400/60 focus:bg-white/[0.05]" />
          </div>

          <div className="mt-3 text-right">
            <button onClick={forgotPassword} className="text-xs text-white/40 transition hover:text-white/70">Forgot password?</button>
          </div>

          <button disabled={loading || !email.trim() || !password} onClick={emailLogin} className="mt-5 h-14 w-full rounded-2xl bg-gradient-to-r from-violet-600 to-cyan-500 font-semibold text-white shadow-lg shadow-violet-900/20 transition duration-150 hover:brightness-110 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-40">
            {loading ? "Signing in..." : "Sign in"}
          </button>

          <p className="mt-6 text-center text-sm text-white/35">
            Don&apos;t have an account? <Link href="/signup" className="font-medium text-white/70 transition hover:text-white">Create account</Link>
          </p>
        </div>
        <p className="mt-6 text-center text-[10px] tracking-wide text-white/20">Your personal AI, ready when you are.</p>
      </div>
    </main>
  );
}
