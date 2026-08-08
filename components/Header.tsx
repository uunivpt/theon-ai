"use client";

import Image from "next/image";
import { LogOut } from "lucide-react";
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
    <header className="flex h-[64px] shrink-0 items-center justify-between border-b border-white/[0.08] bg-black px-5 sm:px-6">
      <div className="flex min-w-0 items-center gap-3">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white/[0.035]">
          <Image src="/logo.png" alt="Theon AI" width={34} height={34} priority className="h-8 w-8 object-contain [image-rendering:pixelated]" />
        </div>
        <div className="min-w-0 leading-tight">
          <h2 className="truncate text-[14px] font-semibold tracking-[-0.01em] text-white/90">Theon AI</h2>
          <p className="mt-0.5 text-[10px] tracking-wide text-white/30">Personal AI assistant</p>
        </div>
      </div>

      <button onClick={logout} aria-label="Log out" className="flex h-9 items-center gap-2 rounded-xl border border-white/[0.09] bg-white/[0.035] px-3 text-xs font-medium text-white/55 transition hover:border-white/[0.15] hover:bg-white/[0.07] hover:text-white/85 active:scale-[0.98]">
        <LogOut size={15} strokeWidth={1.7} />
        <span className="hidden sm:inline">Log out</span>
      </button>
    </header>
  );
}
