"use client";
import { useState } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { signInWithPopup } from "firebase/auth";
import { auth, provider } from "@/lib/firebase";
import { useRouter } from "next/navigation";
export default function LoginPage() {
const router = useRouter();
const [email, setEmail] = useState("");
const [password, setPassword] = useState("");
async function googleLogin() {
  try {
    await signInWithPopup(auth, provider);

    alert("Login Successful ✅");

    router.push("/");
  } catch (error) {
    console.error(error);
    alert("Login Failed ❌");
  }
}
async function emailLogin() {
  try {
    await signInWithEmailAndPassword(auth, email, password);

    alert("Login Successful ✅");

    router.push("/");
  } catch (error: any) {
    alert(error.message);
  }
}
  return (
    <main className="min-h-screen bg-black flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-[#111827] rounded-3xl p-8 shadow-2xl border border-gray-800">

        <h1 className="text-4xl font-bold text-white text-center">
          Theon AI
        </h1>

        <p className="text-center text-gray-400 mt-2 mb-8">
          Welcome back
        </p>

        <button
  onClick={googleLogin}
  className="w-full h-14 rounded-2xl bg-white text-black font-semibold hover:bg-gray-200 transition"
>
  Continue with Google
</button>

        <div className="flex items-center gap-3 my-6">
          <div className="flex-1 h-px bg-gray-700"></div>
          <span className="text-gray-500 text-sm">OR</span>
          <div className="flex-1 h-px bg-gray-700"></div>
        </div>

        <input
  type="email"
  placeholder="Email"
  value={email}
  onChange={(e) => setEmail(e.target.value)}
  className="w-full h-14 rounded-2xl bg-[#1f2937] text-white px-5 mb-4 outline-none border border-gray-700 focus:border-blue-500"
/>

        <input
  type="password"
  placeholder="Password"
  value={password}
  onChange={(e) => setPassword(e.target.value)}
  className="w-full h-14 rounded-2xl bg-[#1f2937] text-white px-5 outline-none border border-gray-700 focus:border-blue-500"
/>

        <div className="text-right mt-3">
          <button className="text-blue-400 text-sm hover:underline">
            Forgot Password?
          </button>
        </div>

       <button
  onClick={emailLogin}
  className="w-full h-14 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-semibold mt-6"
>
  Login
</button>
        <p className="text-center text-gray-400 mt-6">
          Don't have an account?{" "}
          <button className="text-blue-400 hover:underline">
            Create Account
          </button>
        </p>

      </div>
    </main>
  );
}