"use client";

import Image from "next/image";
import { signOut } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { useRouter } from "next/navigation";

export default function Header() {
  const router = useRouter();

  async function logout() {
    await signOut(auth);
    router.push("/login");
  }

  return (
    <header className="h-16 border-b border-white/10 bg-white/5 backdrop-blur-xl flex items-center justify-between px-6">

      <div className="flex items-center gap-4">

        <Image
          src="/logo.png"
          alt="Theon AI"
          width={45}
          height={45}
          priority
        />

        <div>
          <h2 className="text-white text-xl font-semibold">
            Welcome to Theon AI 👋
          </h2>

          <p className="text-gray-400 text-sm">
            Your Personal AI Assistant
          </p>
        </div>

      </div>

      <div className="flex items-center gap-4">

        <button
          onClick={logout}
          className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-xl transition"
        >
          Logout
        </button>

      </div>

    </header>
  );
}