"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth } from "@/lib/firebase";

export default function SignupPage() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  async function createAccount() {
    if (!name || !email || !password || !confirmPassword) {
      alert("Please fill all fields");
      return;
    }

    if (password !== confirmPassword) {
      alert("Passwords do not match");
      return;
    }

    try {
      await createUserWithEmailAndPassword(auth, email, password);

      alert("Account Created Successfully ✅");
      router.push("/login");
    } catch (error: any) {
      alert(error.message);
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-black">
      <div className="w-full max-w-md bg-[#111827] p-8 rounded-3xl border border-gray-700">

        <h1 className="text-3xl font-bold text-white text-center mb-6">
          Create Account
        </h1>

        <input
          type="text"
          placeholder="Full Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full h-14 rounded-xl bg-[#1f2937] text-white px-4 mb-4 outline-none"
        />

        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full h-14 rounded-xl bg-[#1f2937] text-white px-4 mb-4 outline-none"
        />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full h-14 rounded-xl bg-[#1f2937] text-white px-4 mb-4 outline-none"
        />

        <input
          type="password"
          placeholder="Confirm Password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          className="w-full h-14 rounded-xl bg-[#1f2937] text-white px-4 mb-6 outline-none"
        />

        <button
          onClick={createAccount}
          className="w-full h-14 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold"
        >
          Create Account
        </button>

      </div>
    </main>
  );
}