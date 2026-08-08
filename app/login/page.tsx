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
    <main className="flex min-h-screen items-center justify-center bg-black px-4">
      <div className="w-full max-w-md rounded-3xl border border-white/10 bg-[#111827] p-8 shadow-2xl">
        <h1 className="text-center text-4xl font-bold text-white">Theon AI</h1>
        <p className="mb-8 mt-2 text-center text-gray-400">Welcome back</p>

        <button disabled={loading} onClick={googleLogin} className="h-14 w-full rounded-2xl bg-white font-semibold text-black transition hover:bg-gray-200 disabled:opacity-50">
          Continue with Google
        </button>

        <div className="my-6 flex items-center gap-3">
          <div className="h-px flex-1 bg-gray-700" />
          <span className="text-sm text-gray-500">OR</span>
          <div className="h-px flex-1 bg-gray-700" />
        </div>

        <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} className="mb-4 h-14 w-full rounded-2xl border border-gray-700 bg-[#1f2937] px-5 text-white outline-none focus:border-violet-500" />
        <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} onKeyDown={(e) => e.key === "Enter" && emailLogin()} className="h-14 w-full rounded-2xl border border-gray-700 bg-[#1f2937] px-5 text-white outline-none focus:border-violet-500" />

        <div className="mt-3 text-right">
          <button onClick={forgotPassword} className="text-sm text-blue-400 hover:underline">Forgot Password?</button>
        </div>

        <button disabled={loading || !email.trim() || !password} onClick={emailLogin} className="mt-6 h-14 w-full rounded-2xl bg-gradient-to-r from-violet-600 to-cyan-500 font-semibold text-white disabled:opacity-50">
          {loading ? "Signing in..." : "Login"}
        </button>

        <p className="mt-6 text-center text-gray-400">
          Don&apos;t have an account? <Link href="/signup" className="text-blue-400 hover:underline">Create Account</Link>
        </p>
      </div>
    </main>
  );
}
