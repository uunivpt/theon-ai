"use client";

import { ArrowLeft, Moon, ShieldCheck } from "lucide-react";
import { useRouter } from "next/navigation";

export default function SettingsPage() {
  const router = useRouter();

  return (
    <main className="min-h-screen bg-[#05050a] px-5 py-8 text-white">
      <div className="mx-auto max-w-2xl">
        <button onClick={() => router.push("/")} className="mb-8 flex items-center gap-2 text-sm text-white/50 hover:text-white">
          <ArrowLeft size={17} /> Back to Theon
        </button>
        <h1 className="text-3xl font-semibold">Settings</h1>
        <p className="mt-2 text-sm text-white/40">Manage your Theon AI experience.</p>

        <div className="mt-8 space-y-3">
          <div className="flex items-center gap-4 rounded-2xl border border-white/10 bg-white/[0.04] p-5">
            <Moon size={20} className="text-violet-300" />
            <div><p className="font-medium">Appearance</p><p className="text-xs text-white/35">Dark mode is currently the Theon default.</p></div>
          </div>
          <div className="flex items-center gap-4 rounded-2xl border border-white/10 bg-white/[0.04] p-5">
            <ShieldCheck size={20} className="text-cyan-300" />
            <div><p className="font-medium">Privacy</p><p className="text-xs text-white/35">Your conversations are stored under your authenticated account.</p></div>
          </div>
        </div>
      </div>
    </main>
  );
}
