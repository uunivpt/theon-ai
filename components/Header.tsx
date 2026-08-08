"use client";

import Image from "next/image";
import { LogOut, Moon, Sun, UserRound } from "lucide-react";
import { signOut } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

export default function Header() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [theme, setTheme] = useState<"dark" | "light">("dark");
  const menuRef = useRef<HTMLDivElement>(null);
  useEffect(() => { const saved = localStorage.getItem("theon-theme"); if (saved === "light" || saved === "dark") setTheme(saved); const close = (event: MouseEvent) => { if (menuRef.current && !menuRef.current.contains(event.target as Node)) setOpen(false); }; document.addEventListener("mousedown", close); return () => document.removeEventListener("mousedown", close); }, []);
  function changeTheme(value: "dark" | "light") { setTheme(value); localStorage.setItem("theon-theme", value); document.documentElement.classList.toggle("light", value === "light"); setOpen(false); }
  async function logout() { await signOut(auth); router.push("/login"); }
  const email = auth.currentUser?.email ?? "Theon account";
  return <header className="relative z-30 flex h-[64px] shrink-0 items-center justify-between border-b border-white/[0.08] bg-black/90 px-5 backdrop-blur-xl sm:px-6"><div className="flex min-w-0 items-center gap-3"><div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white/[0.035]"><Image src="/logo.png" alt="Theon AI" width={34} height={34} priority className="h-8 w-8 object-contain [image-rendering:pixelated]" /></div><div className="min-w-0 leading-tight"><h2 className="truncate text-[14px] font-semibold tracking-[-0.01em] text-white/90">Theon AI</h2><p className="mt-0.5 text-[10px] tracking-wide text-white/30">Personal AI assistant</p></div></div><div ref={menuRef} className="relative"><button onClick={() => setOpen((value) => !value)} aria-label="Open profile menu" aria-expanded={open} className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/[0.09] bg-white/[0.035] text-white/60 transition hover:border-white/[0.16] hover:bg-white/[0.07] hover:text-white active:scale-[0.97]"><UserRound size={16} strokeWidth={1.7} /></button>{open && <div className="absolute right-0 top-12 w-64 overflow-hidden rounded-2xl border border-white/10 bg-[#0b0b0b]/95 p-2 shadow-2xl shadow-black/60 backdrop-blur-xl"><div className="px-3 py-2.5"><p className="text-[10px] uppercase tracking-[0.16em] text-white/25">Profile</p><p className="mt-1 truncate text-xs text-white/60">{email}</p></div><div className="my-1 h-px bg-white/[0.07]" /><div className="px-1"><p className="px-2 py-1.5 text-[9px] uppercase tracking-[0.16em] text-white/20">Appearance</p><div className="grid grid-cols-2 gap-1"><button onClick={() => changeTheme("dark")} className={`flex items-center justify-center gap-1.5 rounded-lg py-2 text-[10px] ${theme === "dark" ? "bg-white/10 text-white" : "text-white/35 hover:bg-white/5"}`}><Moon size={12}/>Dark</button><button onClick={() => changeTheme("light")} className={`flex items-center justify-center gap-1.5 rounded-lg py-2 text-[10px] ${theme === "light" ? "bg-white/10 text-white" : "text-white/35 hover:bg-white/5"}`}><Sun size={12}/>Light</button></div></div><button onClick={logout} className="mt-1 flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-xs text-red-300/70 transition hover:bg-red-400/10 hover:text-red-200"><LogOut size={15}/><span>Log out</span></button></div>}</div></header>;
}
