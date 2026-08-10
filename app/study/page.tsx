"use client";

import { FormEvent, useEffect, useRef, useState } from "react";
import { ArrowLeft, BookOpen, ChevronRight, GraduationCap, Lightbulb, Loader2, Send, Sparkles, Target } from "lucide-react";
import { useRouter } from "next/navigation";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

type StudyMessage = { role: "user" | "ai"; text: string };
const quickPrompts = [
  ["Explain a concept", "Explain this concept from basics, then build up to the difficult part."],
  ["Help me revise", "Help me revise this topic with the most important points and a quick recall test."],
  ["Quiz me", "Quiz me on this topic one question at a time and explain my mistakes."],
  ["Make it simple", "Explain this like I'm learning it for the first time, with a simple example."],
] as const;

function Answer({ text }: { text: string }) { return <div className="prose prose-invert max-w-none break-words text-[15px] leading-[1.78] prose-headings:font-semibold prose-headings:tracking-[-.02em] prose-h1:mb-4 prose-h1:mt-1 prose-h1:text-xl prose-h2:mb-3 prose-h2:mt-7 prose-h2:text-lg prose-h3:mb-2 prose-h3:mt-5 prose-h3:text-base prose-p:my-3.5 prose-p:leading-[1.8] prose-ul:my-3.5 prose-ol:my-3.5 prose-li:my-2 prose-li:leading-[1.75] prose-strong:text-white prose-blockquote:my-5 prose-blockquote:border-violet-400/30 prose-blockquote:bg-violet-400/[.04] prose-blockquote:px-4 prose-blockquote:py-2"><ReactMarkdown remarkPlugins={[remarkGfm]}>{text}</ReactMarkdown></div>; }

export default function StudyRoom() {
  const router = useRouter();
  const [messages, setMessages] = useState<StudyMessage[]>([]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [topic, setTopic] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => { try { const saved = sessionStorage.getItem("theon-study-room-messages"); const savedTopic = sessionStorage.getItem("theon-study-topic"); if (saved) setMessages(JSON.parse(saved)); if (savedTopic) setTopic(savedTopic); } catch {} }, []);
  useEffect(() => { try { sessionStorage.setItem("theon-study-room-messages", JSON.stringify(messages)); } catch {} bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages, isTyping]);

  async function ask(text = input) {
    const clean = text.trim(); if (!clean || isTyping) return;
    setInput(""); setMessages((prev) => [...prev, { role: "user", text: clean }]); setIsTyping(true);
    try {
      const res = await fetch("/api/chat", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({
        message: topic ? `Study context: The student is currently studying: ${topic}.\n\nStudent question: ${clean}` : clean,
        history: messages.slice(-20), mode: "study", featureId: "study",
        preferences: { style: "detailed", explanation: "simple", language: "auto" },
      }) });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || typeof data.reply !== "string") throw new Error(data.error || "I couldn't answer that right now.");
      setMessages((prev) => [...prev, { role: "ai", text: data.reply.trim() }]);
    } catch (error) { setMessages((prev) => [...prev, { role: "ai", text: `I couldn't answer that right now. ${error instanceof Error ? error.message : "Please try again."}` }]); }
    finally { setIsTyping(false); }
  }
  function submit(e: FormEvent) { e.preventDefault(); void ask(); }

  return <main className="min-h-[100dvh] overflow-hidden bg-[#08080b] text-white"><div className="pointer-events-none fixed inset-0 opacity-40 [background-image:linear-gradient(rgba(255,255,255,.025)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.025)_1px,transparent_1px)] [background-size:36px_36px]"/><div className="pointer-events-none fixed left-1/2 top-[-220px] h-[500px] w-[700px] -translate-x-1/2 rounded-full bg-violet-600/[.10] blur-[130px]"/>
    <div className="relative mx-auto flex h-[100dvh] w-full max-w-6xl flex-col px-4 sm:px-6">
      <header className="flex h-[72px] shrink-0 items-center justify-between border-b border-white/[.07]"><button onClick={() => router.push("/")} className="flex items-center gap-2 rounded-xl px-2 py-2 text-xs text-white/45 hover:bg-white/[.04] hover:text-white"><ArrowLeft size={15}/> Back to Theon</button><div className="flex items-center gap-2.5"><div className="flex h-9 w-9 items-center justify-center rounded-xl border border-violet-300/15 bg-violet-400/[.07] text-violet-300"><GraduationCap size={19}/></div><div><p className="text-sm font-semibold">Study Room</p><p className="text-[10px] text-white/30">Learn • understand • remember</p></div></div><div className="hidden items-center gap-2 rounded-full border border-white/[.07] bg-white/[.025] px-3 py-1.5 text-[10px] text-white/35 sm:flex"><Target size={12}/> Focus mode</div></header>
      <section className="min-h-0 flex-1 overflow-y-auto py-6 sm:py-8">{messages.length === 0 ? <div className="mx-auto flex min-h-full max-w-3xl flex-col justify-center pb-20"><div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl border border-violet-300/15 bg-violet-400/[.07] text-violet-300 shadow-[0_0_50px_rgba(139,92,246,.12)]"><BookOpen size={25}/></div><p className="text-[10px] font-medium uppercase tracking-[.22em] text-violet-300/60">Your learning space</p><h1 className="mt-3 text-3xl font-semibold tracking-[-.03em] sm:text-5xl">What are you learning today?</h1><p className="mt-4 max-w-2xl text-sm leading-6 text-white/40">Ask Theon anything. It will teach step by step, connect ideas, use examples, and help you remember — not just give you an answer.</p><div className="mt-7 flex items-center gap-2 rounded-2xl border border-white/[.08] bg-white/[.025] p-2"><Sparkles size={16} className="ml-2 shrink-0 text-violet-300/70"/><input value={topic} onChange={(e) => { setTopic(e.target.value); sessionStorage.setItem("theon-study-topic", e.target.value); }} placeholder="Optional: What subject are you studying? e.g. Operating Systems" className="min-w-0 flex-1 bg-transparent px-2 py-3 text-xs outline-none placeholder:text-white/20"/></div><div className="mt-6 grid gap-2 sm:grid-cols-2">{quickPrompts.map(([label, text]) => <button key={label} onClick={() => setInput(text)} className="group flex items-center justify-between rounded-2xl border border-white/[.07] bg-white/[.02] px-4 py-3.5 text-left hover:border-violet-300/20 hover:bg-violet-400/[.04]"><span><span className="block text-xs font-medium text-white/75">{label}</span><span className="mt-1 block text-[10px] text-white/25">{text}</span></span><ChevronRight size={14} className="text-white/20 group-hover:text-violet-300/70"/></button>)}</div></div> : <div className="mx-auto max-w-3xl space-y-7 pb-8">{topic && <div className="flex items-center gap-2 text-[10px] uppercase tracking-[.16em] text-white/25"><BookOpen size={12}/> Studying: <span className="text-violet-300/60">{topic}</span></div>}{messages.map((msg, index) => <div key={`${msg.role}-${index}`} className={msg.role === "user" ? "flex justify-end" : "flex gap-3"}>{msg.role === "ai" && <div className="mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-xl border border-violet-300/15 bg-violet-400/[.06] text-violet-300"><GraduationCap size={15}/></div>}{msg.role === "user" ? <div className="max-w-[88%] rounded-2xl rounded-br-md border border-violet-400/20 bg-violet-500/[.12] px-4 py-3 text-sm leading-6 text-white/90">{msg.text}</div> : <div className="min-w-0 flex-1 rounded-2xl border border-white/[.07] bg-white/[.025] px-4 py-4 sm:px-5"><Answer text={msg.text}/></div>}</div>)}{isTyping && <div className="flex gap-3"><div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl border border-violet-300/15 bg-violet-400/[.06] text-violet-300"><GraduationCap size={15}/></div><div className="flex items-center gap-2 rounded-2xl border border-white/[.07] bg-white/[.025] px-4 py-3 text-xs text-white/35"><Loader2 size={14} className="animate-spin"/> Thinking through it…</div></div>}<div ref={bottomRef}/></div>}</section>
      <footer className="shrink-0 pb-4 pt-2 sm:pb-6"><form onSubmit={submit} className="mx-auto max-w-3xl rounded-2xl border border-white/[.09] bg-[#111116]/95 p-2 shadow-[0_-15px_50px_rgba(0,0,0,.35)] backdrop-blur-xl"><textarea value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); void ask(); } }} rows={2} placeholder="Ask Theon anything about what you're studying…" className="w-full resize-none bg-transparent px-3 py-2 text-sm leading-6 outline-none placeholder:text-white/25"/><div className="flex items-center justify-between px-2 pb-1"><div className="flex items-center gap-1.5 text-[10px] text-white/20"><Lightbulb size={12}/> Step-by-step student mode</div><button type="submit" disabled={!input.trim() || isTyping} className="flex h-9 items-center gap-2 rounded-xl bg-violet-500 px-4 text-xs font-medium text-white hover:bg-violet-400 disabled:cursor-not-allowed disabled:opacity-30">{isTyping ? <Loader2 size={14} className="animate-spin"/> : <Send size={14}/>} Ask Theon</button></div></form><p className="mt-2 text-center text-[9px] text-white/15">Enter to send • Shift + Enter for a new line</p></footer>
    </div></main>;
}
