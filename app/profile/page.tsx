"use client";

import { ArrowLeft, LogOut, Mail, UserRound } from "lucide-react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { auth } from "@/lib/firebase";
import { signOut, updateProfile } from "firebase/auth";

export default function ProfilePage() {
  const router = useRouter(); const [name, setName] = useState(""); const [savedName, setSavedName] = useState(""); const [status, setStatus] = useState("");
  useEffect(() => { const user = auth.currentUser; if (user) { setName(user.displayName || ""); setSavedName(user.displayName || ""); } }, []);
  const user = auth.currentUser; const display = savedName || user?.email?.split("@")[0] || "Theon user"; const initial = display[0]?.toUpperCase() || "T";
  async function save() { if (!user) return; const clean = name.trim().slice(0, 60); try { await updateProfile(user, { displayName: clean || null }); setSavedName(clean); setName(clean); setStatus("Profile updated."); } catch { setStatus("Could not update your profile."); } }
  async function logout() { await signOut(auth); router.replace("/login"); }
  return <main className="min-h-screen bg-[#05050a] px-5 py-8 text-white"><div className="mx-auto max-w-2xl"><button onClick={() => router.push("/")} className="mb-8 flex items-center gap-2 text-sm text-white/50 hover:text-white"><ArrowLeft size={17}/> Back to Theon</button><h1 className="text-3xl font-semibold">Profile</h1><p className="mt-2 text-sm text-white/40">Manage your account identity.</p><div className="mt-8 rounded-3xl border border-white/10 bg-white/[.04] p-6"><div className="flex items-center gap-4"><div className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-violet-600 to-cyan-500 text-2xl font-semibold">{initial}</div><div className="min-w-0"><p className="truncate text-lg font-medium">{display}</p><p className="mt-1 flex items-center gap-1.5 truncate text-sm text-white/40"><Mail size={14}/> {user?.email || "Signed-in account"}</p></div></div><div className="mt-7"><label className="text-xs uppercase tracking-[.14em] text-white/30">Display name</label><input value={name} onChange={(e) => setName(e.target.value)} maxLength={60} placeholder="Your name" className="mt-2 h-12 w-full rounded-xl border border-white/10 bg-black/30 px-4 text-sm text-white outline-none focus:border-violet-400/40"/><button onClick={save} disabled={name.trim() === savedName} className="mt-3 rounded-xl bg-gradient-to-r from-violet-600 to-cyan-500 px-5 py-2.5 text-sm font-medium text-white disabled:opacity-35">Save changes</button></div><div className="mt-7 border-t border-white/10 pt-5"><p className="flex items-center gap-2 text-sm text-white/35"><UserRound size={15}/> Email is managed by your authentication provider.</p><button onClick={logout} className="mt-5 flex items-center gap-2 rounded-xl border border-red-400/15 px-4 py-3 text-sm text-red-300/80 hover:bg-red-500/10"><LogOut size={16}/> Log out</button></div>{status && <p className="mt-4 text-xs text-emerald-300">{status}</p>}</div></div></main>;
}
