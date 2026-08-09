"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { auth } from "@/lib/firebase";

export default function SignupPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);

  async function createAccount() {
    const cleanName = name.trim();
    const cleanEmail = email.trim();
    if (!cleanName || !cleanEmail || !password || !confirmPassword) {
      alert("Please fill all fields");
      return;
    }
    if (password.length < 6) {
      alert("Password must be at least 6 characters.");
      return;
    }
    if (password !== confirmPassword) {
      alert("Passwords do not match");
      return;
    }

    setLoading(true);
    try {
      const credential = await createUserWithEmailAndPassword(auth, cleanEmail, password);
      await updateProfile(credential.user, { displayName: cleanName });
      router.replace("/");
    } catch (error: unknown) {
      console.error(error);
      alert(error instanceof Error ? error.message : "Something went wrong.");
    } finally {
      setLoading(false);
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
          <h1 className="text-[30px] font-semibold tracking-[-0.035em]">Create your account</h1>
          <p className="mt-2 text-sm text-white/40">Start your journey with Theon AI</p>
        </div>

        <div className="rounded-[28px] border border-white/[0.09] bg-[#0d0d0f]/95 p-5 shadow-2xl shadow-black/50 backdrop-blur-xl sm:p-7">
          <div className="space-y-3">
            <input type="text" placeholder="Full name" value={name} onChange={(e) => setName(e.target.value)} className="h-14 w-full rounded-2xl border border-white/[0.09] bg-white/[0.035] px-5 text-sm text-white placeholder:text-white/25 outline-none transition focus:border-violet-400/60 focus:bg-white/[0.05]" />
            <input type="email" placeholder="Email address" value={email} onChange={(e) => setEmail(e.target.value)} className="h-14 w-full rounded-2xl border border-white/[0.09] bg-white/[0.035] px-5 text-sm text-white placeholder:text-white/25 outline-none transition focus:border-violet-400/60 focus:bg-white/[0.05]" />
            <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} className="h-14 w-full rounded-2xl border border-white/[0.09] bg-white/[0.035] px-5 text-sm text-white placeholder:text-white/25 outline-none transition focus:border-violet-400/60 focus:bg-white/[0.05]" />
            <input type="password" placeholder="Confirm password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} onKeyDown={(e) => e.key === "Enter" && createAccount()} className="h-14 w-full rounded-2xl border border-white/[0.09] bg-white/[0.035] px-5 text-sm text-white placeholder:text-white/25 outline-none transition focus:border-violet-400/60 focus:bg-white/[0.05]" />
          </div>

          <button disabled={loading} onClick={createAccount} className="mt-5 h-14 w-full rounded-2xl bg-gradient-to-r from-violet-600 to-cyan-500 font-semibold text-white shadow-lg shadow-violet-900/20 transition duration-150 hover:brightness-110 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-40">
            {loading ? "Creating account..." : "Create account"}
          </button>

          <p className="mt-6 text-center text-sm text-white/35">
            Already have an account? <button type="button" onClick={() => router.push("/login")} className="font-medium text-white/70 transition hover:text-white">Sign in</button>
          </p>
        </div>
        <p className="mt-6 text-center text-[10px] tracking-wide text-white/20">Your personal AI, ready when you are.</p>
      </div>
    </main>
  );
}
