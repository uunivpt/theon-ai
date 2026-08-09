"use client";

import { useState } from "react";
import { ArrowLeft, BookOpen, Brain, CheckCircle2, FileText, Sparkles } from "lucide-react";
import { useRouter } from "next/navigation";

const actions = [
  ["Explain deeply, simply", "Break any concept down from first principles without making the language complicated.", Brain],
  ["Build a study plan", "Turn a subject, exam date, or uploaded notes into a realistic learning path.", BookOpen],
  ["Quiz me", "Generate questions, check answers, and focus the next round on weak areas.", CheckCircle2],
  ["Make revision notes", "Convert material into clean, high-signal notes, formulas, and key takeaways.", FileText],
] as const;

export default function StudyRoom() {
  const router = useRouter(); const [topic, setTopic] = useState("");
  function start() { if (!topic.trim()) return; sessionStorage.setItem("theon-study-topic", topic.trim()); router.push(`/?study=${encodeURIComponent(topic.trim())}`); }
  return <main className="min-h-[100dvh] bg-black px-5 py-6 text-white"><div className="mx-auto w-full max-w-4xl"><button onClick={() => router.back()} className="mb-8 flex items-center gap-2 text-xs text-white/40 hover:text-white/70"><ArrowLeft size={15}/> Back to Theon</button><div className="relative overflow-hidden rounded-[32px] border border-white/[.1] bg-white/[.035] p-6 shadow-[0_30px_100px_rgba(0,0,0,.45)] backdrop-blur-2xl sm:p-10"><div className="pointer-events-none absolute -right-24 -top-24 h-64 w-64 rounded-full bg-violet-500/[.1] blur-[90px]"/><div className="relative"><div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-violet-300/[.15] bg-violet-400/[.06] text-violet-300"><Sparkles size={22}/></div><p className="mt-5 text-[10px] uppercase tracking-[.2em] text-violet-300/60">Theon AI</p><h1 className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">Study Room</h1><p className="mt-3 max-w-2xl text-sm leading-6 text-white/40">A focused space to learn deeply — while keeping explanations simple, structured, and easy to remember.</p><div className="mt-7 flex flex-col gap-3 sm:flex-row"><input value={topic} onChange={(e) => setTopic(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter") start(); }} placeholder="What are you studying?" className="h-13 min-w-0 flex-1 rounded-2xl border border-white/[.1] bg-black/40 px-4 text-sm outline-none placeholder:text-white/25 focus:border-violet-400/30"/><button onClick={start} disabled={!topic.trim()} className="h-13 rounded-2xl bg-gradient-to-r from-violet-600 to-cyan-500 px-6 text-sm font-medium text-white disabled:opacity-35">Start learning</button></div></div></div><div className="mt-5 grid gap-3 sm:grid-cols-2">{actions.map(([title, description, Icon]) => <div key={title} className="rounded-2xl border border-white/[.08] bg-white/[.025] p-5 backdrop-blur-xl"><Icon size={18} className="text-violet-300/70"/><h2 className="mt-4 text-sm font-medium text-white/85">{title}</h2><p className="mt-2 text-xs leading-5 text-white/30">{description}</p></div>)}</div></div></main>;
}
