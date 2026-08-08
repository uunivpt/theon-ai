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
    <main className="flex min-h-screen items-center justify-center bg-black px-4">
      <div className="w-full max-w-md rounded-3xl border border-white/10 bg-[#111827] p-8">
        <h1 className="mb-6 text-center text-3xl font-bold text-white">Create Account</h1>

        <input type="text" placeholder="Full Name" value={name} onChange={(e) => setName(e.target.value)} className="mb-4 h-14 w-full rounded-xl border border-white/10 bg-[#1f2937] px-4 text-white outline-none focus:border-violet-500" />
        <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} className="mb-4 h-14 w-full rounded-xl border border-white/10 bg-[#1f2937] px-4 text-white outline-none focus:border-violet-500" />
        <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} className="mb-4 h-14 w-full rounded-xl border border-white/10 bg-[#1f2937] px-4 text-white outline-none focus:border-violet-500" />
        <input type="password" placeholder="Confirm Password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} onKeyDown={(e) => e.key === "Enter" && createAccount()} className="mb-6 h-14 w-full rounded-xl border border-white/10 bg-[#1f2937] px-4 text-white outline-none focus:border-violet-500" />

        <button disabled={loading} onClick={createAccount} className="h-14 w-full rounded-xl bg-gradient-to-r from-violet-600 to-cyan-500 font-semibold text-white disabled:opacity-50">
          {loading ? "Creating account..." : "Create Account"}
        </button>
      </div>
    </main>
  );
}
