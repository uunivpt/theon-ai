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
    <header className="flex h-[72px] items-center justify-between border-b border-white/[0.07] bg-black/20 px-6 backdrop-blur-2xl">
      <div className="flex items-center gap-3.5">
        <div className="relative flex h-10 w-10 items-center justify-center">
          <div className="absolute inset-0 rounded-xl bg-violet-500/[0.10] blur-xl" />
          <Image src="/logo.png" alt="Theon AI" width={38} height={38} priority className="relative h-9 w-9 object-contain" />
        </div>
        <div className="leading-tight">
          <h2 className="text-[15px] font-semibold tracking-[-0.01em] text-white/90">Theon AI</h2>
          <p className="mt-0.5 text-[11px] tracking-wide text-white/35">Personal AI assistant</p>
        </div>
      </div>

      <button onClick={logout} className="rounded-xl border border-white/[0.08] bg-white/[0.035] px-4 py-2 text-xs font-medium text-white/60 transition hover:border-white/[0.14] hover:bg-white/[0.07] hover:text-white/90">
        Log out
      </button>
    </header>
  );
}
