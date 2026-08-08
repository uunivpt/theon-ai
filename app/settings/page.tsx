"use client";

import { ArrowLeft, Moon, ShieldCheck, Sun } from "lucide-react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function SettingsPage() {
  const router = useRouter();
  const [theme, setTheme] = useState<"dark" | "light">("dark");

  useEffect(() => {
    const saved = window.localStorage.getItem("theon-theme");
    const nextTheme = saved === "light" ? "light" : "dark";
    setTheme(nextTheme);
    document.documentElement.classList.toggle("light", nextTheme === "light");
  }, []);

  function changeTheme(nextTheme: "dark" | "light") {
    setTheme(nextTheme);
    window.localStorage.setItem("theon-theme", nextTheme);
    document.documentElement.classList.toggle("light", nextTheme === "light");
  }

  return (
    <main className="min-h-screen bg-[#05050a] px-5 py-8 text-white">
      <div className="mx-auto max-w-2xl">
        <button onClick={() => router.push("/")} className="mb-8 flex items-center gap-2 text-sm text-white/50 hover:text-white">
          <ArrowLeft size={17} /> Back to Theon
        </button>
        <h1 className="text-3xl font-semibold">Settings</h1>
        <p className="mt-2 text-sm text-white/40">Manage your Theon AI experience.</p>

        <div className="mt-8 space-y-3">
          <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-5">
            <div className="flex items-center gap-4">
              {theme === "light" ? <Sun size={20} className="text-violet-500" /> : <Moon size={20} className="text-violet-300" />}
              <div><p className="font-medium">Appearance</p><p className="text-xs text-white/35">Choose how Theon looks across the app.</p></div>
            </div>
            <div className="mt-5 grid grid-cols-2 gap-3">
              <button onClick={() => changeTheme("dark")} className={`flex items-center justify-center gap-2 rounded-xl border px-4 py-3 text-sm transition ${theme === "dark" ? "border-violet-400/50 bg-violet-500/15 text-white" : "border-white/10 bg-white/[0.03] text-white/45 hover:text-white"}`}>
                <Moon size={16} /> Dark
              </button>
              <button onClick={() => changeTheme("light")} className={`flex items-center justify-center gap-2 rounded-xl border px-4 py-3 text-sm transition ${theme === "light" ? "border-violet-400/50 bg-violet-500/15 text-white" : "border-white/10 bg-white/[0.03] text-white/45 hover:text-white"}`}>
                <Sun size={16} /> Light
              </button>
            </div>
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
