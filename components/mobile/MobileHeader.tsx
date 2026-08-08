"use client";

import { Menu, Moon, Sun, UserRound, LogOut } from "lucide-react";
import { signOut } from "firebase/auth";
import { useEffect, useState } from "react";
import { auth } from "@/lib/firebase";

type Props = { onMenu: () => void; onSettings: () => void; onLogout?: () => void; };

export default function MobileHeader({ onMenu, onSettings, onLogout }: Props) {
  const [profileOpening, setProfileOpening] = useState(false);
  const [theme, setTheme] = useState<"dark" | "light">("dark");
  useEffect(() => { const saved = localStorage.getItem("theon-theme"); if (saved === "light" || saved === "dark") setTheme(saved); }, []);
  const buttonClass = "flex h-10 w-10 items-center justify-center rounded-full text-white/85 transition duration-100 active:scale-95 hover:bg-white/[0.05]";
  function changeTheme(value: "dark" | "light") { setTheme(value); localStorage.setItem("theon-theme", value); document.documentElement.classList.toggle("light", value === "light"); }
  function openProfile() { if (profileOpening) return; setProfileOpening(true); window.setTimeout(() => setProfileOpening(false), 100); }
  async function handleLogout() { if (onLogout) return onLogout(); await signOut(auth); window.location.href = "/login"; }
  const email = auth.currentUser?.email ?? "Theon account";
  return <header className="relative z-20 flex h-[64px] shrink-0 items-center justify-between bg-transparent px-4 pt-1"><button onClick={onMenu} aria-label="Open menu" className={buttonClass}><Menu size={27} strokeWidth={1.45} /></button><div className="relative"><button onClick={openProfile} aria-label="Open profile" className={`${buttonClass} ${profileOpening ? "scale-90 opacity-70" : ""}`}><UserRound size={24} strokeWidth={1.45} /></button>{profileOpening && <div className="absolute right-0 top-12 w-60 rounded-2xl border border-white/10 bg-[#0b0b0b]/95 p-2 shadow-2xl shadow-black/50 backdrop-blur-xl"><div className="px-3 py-2"><p className="text-[10px] uppercase tracking-[0.16em] text-white/25">Profile</p><p className="mt-1 truncate text-xs text-white/60">{email}</p></div><div className="my-1 h-px bg-white/[0.07]"/><div className="grid grid-cols-2 gap-1 px-1"><button onClick={() => changeTheme("dark")} className={`flex items-center justify-center gap-1.5 rounded-lg py-2 text-[10px] ${theme === "dark" ? "bg-white/10 text-white" : "text-white/35"}`}><Moon size={12}/>Dark</button><button onClick={() => changeTheme("light")} className={`flex items-center justify-center gap-1.5 rounded-lg py-2 text-[10px] ${theme === "light" ? "bg-white/10 text-white" : "text-white/35"}`}><Sun size={12}/>Light</button></div><button onClick={handleLogout} className="mt-1 flex w-full items-center gap-2 rounded-xl px-3 py-2.5 text-left text-xs text-red-300/70 hover:bg-red-400/10"><LogOut size={14}/>Log out</button></div>}</div></header>;
}
