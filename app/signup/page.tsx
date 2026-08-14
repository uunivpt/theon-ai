"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { createUserWithEmailAndPassword, sendEmailVerification, signOut, updateProfile } from "firebase/auth";
import { auth } from "@/lib/firebase";

const DEBOUNCE_MS = 700;

function authMessage(error: unknown) {
  const code = typeof error === "object" && error && "code" in error ? String((error as { code?: unknown }).code) : "";
  if (code === "auth/email-already-in-use") return "An account already exists for this email.";
  if (code === "auth/invalid-email") return "Enter a valid email address.";
  if (code === "auth/weak-password") return "Choose a stronger password.";
  if (code === "auth/too-many-requests") return "Too many attempts. Please wait and try again.";
  return "Unable to create the account. Please try again.";
}

export default function SignupPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const signupTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => () => { if (signupTimer.current) clearTimeout(signupTimer.current); }, []);

  function scheduleSignup() {
    if (signupTimer.current) clearTimeout(signupTimer.current);
    signupTimer.current = setTimeout(() => { void createAccount(); }, DEBOUNCE_MS);
  }

  async function createAccount() {
    const cleanName = name.trim().replace(/\s+/g, " ");
    const cleanEmail = email.trim().toLowerCase();
    if (!cleanName || !cleanEmail || !password || !confirmPassword) return;
    if (cleanName.length > 80 || cleanEmail.length > 254) { alert("Please check the entered details."); return; }
    if (password.length < 12) { alert("Password must be at least 12 characters."); return; }
    if (password !== confirmPassword) { alert("Passwords do not match."); return; }
    if (loading) return;

    setLoading(true);
    try {
      const credential = await createUserWithEmailAndPassword(auth, cleanEmail, password);
      await updateProfile(credential.user, { displayName: cleanName });
      await sendEmailVerification(credential.user);
      await signOut(auth);
      alert("Account created. Please verify your email before signing in.");
      router.replace("/login");
    } catch (error: unknown) {
      console.error(error);
      alert(authMessage(error));
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-black px-4 py-8 text-white">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_15%,rgba(139,92,246,0.14),transparent_34%)]" />
      <div className="relative w-full max-w-[430px]">
        <div className="mb-7 text-center"><div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.045]"><span className="text-xl font-semibold">T</span></div><h1 className="text-[30px] font-semibold">Create your account</h1><p className="mt-2 text-sm text-white/40">Start your journey with Theon AI</p></div>
        <div className="rounded-[28px] border border-white/[0.09] bg-[#0d0d0f]/95 p-5 shadow-2xl sm:p-7">
          <div className="space-y-3">
            <input autoComplete="name" maxLength={80} type="text" placeholder="Full name" value={name} onChange={(e) => setName(e.target.value)} className="h-14 w-full rounded-2xl border border-white/[0.09] bg-white/[0.035] px-5 text-sm outline-none" />
            <input autoComplete="email" maxLength={254} type="email" placeholder="Email address" value={email} onChange={(e) => setEmail(e.target.value)} className="h-14 w-full rounded-2xl border border-white/[0.09] bg-white/[0.035] px-5 text-sm outline-none" />
            <input autoComplete="new-password" type="password" placeholder="Password (12+ characters)" value={password} onChange={(e) => setPassword(e.target.value)} className="h-14 w-full rounded-2xl border border-white/[0.09] bg-white/[0.035] px-5 text-sm outline-none" />
            <input autoComplete="new-password" type="password" placeholder="Confirm password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} onKeyDown={(e) => e.key === "Enter" && scheduleSignup()} className="h-14 w-full rounded-2xl border border-white/[0.09] bg-white/[0.035] px-5 text-sm outline-none" />
          </div>
          <button disabled={loading} onClick={scheduleSignup} className="mt-5 h-14 w-full rounded-2xl bg-gradient-to-r from-violet-600 to-cyan-500 font-semibold disabled:opacity-40">{loading ? "Creating account..." : "Create account"}</button>
          <p className="mt-6 text-center text-sm text-white/35">Already have an account? <button type="button" onClick={() => router.push("/login")} className="font-medium text-white/70">Sign in</button></p>
        </div>
      </div>
    </main>
  );
}
