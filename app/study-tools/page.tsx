"use client";

import { FormEvent, useState } from "react";
import { BookOpen, Brain, CheckCircle2, Clock3, FileText, Flame, GraduationCap, Lightbulb, ListChecks, RefreshCw, Sparkles, Trophy } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import "katex/dist/katex.min.css";

type Tool = { title: string; icon: any; prompt: string; description: string };

const TOOLS: Tool[] = [
  { title: "Teach me", icon: Lightbulb, prompt: "Teach me this topic as a personal tutor. Start with intuition, build the idea step by step, use an example, check my understanding briefly, then give me a concise takeaway.", description: "Learn from first principles" },
  { title: "Smart revision", icon: RefreshCw, prompt: "Create a smart revision session for this topic. Prioritise high-yield and easily forgotten ideas, include active recall questions, common mistakes, and a final recap.", description: "Revise what matters most" },
  { title: "Adaptive quiz", icon: Trophy, prompt: "Quiz me one question at a time on this topic. Start at an appropriate level, adapt difficulty to my answers, explain mistakes, and finish with strengths and weak areas.", description: "Difficulty adapts to me" },
  { title: "Exam prep", icon: GraduationCap, prompt: "Prepare me for an exam on this topic. Create likely questions for different mark levels, show what a strong answer should contain, and highlight high-priority areas.", description: "Turn knowledge into marks" },
  { title: "Make a study sheet", icon: FileText, prompt: "Create a clean study sheet from this topic with key concepts, definitions, formulas, examples, common mistakes, and a short recap. Use tables where they improve clarity.", description: "A compact learning page" },
  { title: "Flashcards", icon: Sparkles, prompt: "Create focused active-recall flashcards from this topic. Cover the most important concepts and keep each card to one clear question and answer.", description: "Remember through active recall" },
  { title: "Check my understanding", icon: CheckCircle2, prompt: "Test my understanding of this topic with short questions. Diagnose misconceptions from my answers and explain anything I have misunderstood.", description: "Find gaps before the exam" },
  { title: "5-minute recap", icon: Clock3, prompt: "Give me a five-minute high-yield recap of this topic: core idea, key facts or formulas, one example, common mistake, and five quick recall prompts.", description: "Last-minute revision" },
];

function clean(text: string) {
  const lines = text.split(/\r?\n/);
  const output: string[] = [];
  for (const line of lines) {
    if (/^\s*(?:#{1,6}\s*)?(?:sources?|references?|citations?)\s*:?[ \t]*$/i.test(line)) break;
    output.push(line);
  }
  return output.join("\n")
    .replace(/\[\d+(?:\s*[,;]\s*\d+)*\]/g, "")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

export default function StudyLab() {
  const [topic, setTopic] = useState("");
  const [answer, setAnswer] = useState("");
  const [busy, setBusy] = useState(false);
  const [active, setActive] = useState("");

  async function run(tool: Tool) {
    const value = topic.trim();
    if (!value || busy) return;
    setActive(tool.title);
    setBusy(true);
    setAnswer("");
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: `${tool.prompt}\n\nTopic: ${value}`,
          history: [],
          mode: "study",
          featureId: "study-lab",
          preferences: { style: "detailed", explanation: "simple", language: "auto" },
        }),
      });
      const data = await res.json();
      if (!res.ok || typeof data.reply !== "string") throw new Error(data.error || "I couldn't complete that study task.");
      setAnswer(clean(data.reply));
    } catch (error) {
      setAnswer(error instanceof Error ? error.message : "I couldn't complete that study task. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  function submit(e: FormEvent) {
    e.preventDefault();
    if (topic.trim()) void run(TOOLS[0]);
  }

  return (
    <main className="min-h-[100dvh] bg-[#07070a] text-white">
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(139,92,246,.18),transparent_38%)]" />
      <div className="relative mx-auto min-h-[100dvh] max-w-6xl px-4 py-7 sm:px-7 sm:py-10">
        <header className="mb-8 flex items-center gap-3">
          <div className="grid h-11 w-11 place-items-center rounded-2xl border border-white/10 bg-white/[.06] shadow-[0_10px_40px_rgba(139,92,246,.15)]"><BookOpen size={21} /></div>
          <div><p className="text-xs font-semibold uppercase tracking-[.24em] text-violet-300/80">Theon AI</p><h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">Study Lab</h1></div>
        </header>

        <section className="rounded-[28px] border border-white/10 bg-white/[.045] p-5 shadow-2xl backdrop-blur-xl sm:p-7">
          <div className="mb-5 flex items-start gap-3">
            <div className="mt-1 rounded-xl bg-violet-500/10 p-2.5 text-violet-300"><Brain size={19} /></div>
            <div><h2 className="text-lg font-semibold">What are you studying?</h2><p className="mt-1 text-sm leading-6 text-white/45">Give Theon a topic, chapter, question or subject. Then choose how you want to learn it.</p></div>
          </div>
          <form onSubmit={submit} className="flex flex-col gap-3 sm:flex-row">
            <input value={topic} onChange={(e) => setTopic(e.target.value)} placeholder="e.g. Process scheduling in Operating Systems" className="min-h-12 flex-1 rounded-2xl border border-white/10 bg-black/20 px-4 text-sm outline-none transition focus:border-violet-400/40 focus:bg-black/30" />
            <button disabled={!topic.trim() || busy} className="min-h-12 rounded-2xl bg-violet-500 px-5 text-sm font-semibold transition hover:bg-violet-400 disabled:cursor-not-allowed disabled:opacity-40">Teach me</button>
          </form>
        </section>

        <section className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {TOOLS.map((tool) => { const Icon = tool.icon; return (
            <button key={tool.title} onClick={() => void run(tool)} disabled={!topic.trim() || busy} className="group rounded-2xl border border-white/[.08] bg-white/[.035] p-4 text-left transition hover:-translate-y-0.5 hover:border-violet-400/25 hover:bg-white/[.06] disabled:cursor-not-allowed disabled:opacity-45">
              <div className="mb-4 flex items-center justify-between"><span className="grid h-9 w-9 place-items-center rounded-xl bg-violet-500/10 text-violet-300"><Icon size={17} /></span><Sparkles size={14} className="text-white/15 transition group-hover:text-violet-300/60" /></div>
              <p className="font-medium">{tool.title}</p><p className="mt-1 text-xs leading-5 text-white/40">{tool.description}</p>
            </button>
          ); })}
        </section>

        <section className="mt-6 rounded-[28px] border border-white/10 bg-black/20 p-5 backdrop-blur-xl sm:p-7">
          <div className="mb-5 flex items-center justify-between gap-3 border-b border-white/[.07] pb-4"><div><p className="text-xs uppercase tracking-[.18em] text-white/30">Learning output</p><h2 className="mt-1 text-lg font-semibold">{active || "Your study session"}</h2></div>{busy && <span className="inline-flex items-center gap-2 text-xs text-white/40"><span className="h-2 w-2 animate-pulse rounded-full bg-violet-400" />Thinking</span>}</div>
          {answer ? <div className="max-w-none break-words text-[15px] leading-7 text-white/85 [&_h1]:mb-3 [&_h1]:mt-6 [&_h1]:text-xl [&_h1]:font-semibold [&_h2]:mb-2 [&_h2]:mt-6 [&_h2]:text-lg [&_h2]:font-semibold [&_h3]:mb-2 [&_h3]:mt-5 [&_h3]:font-semibold [&_p]:my-3 [&_li]:my-1.5 [&_table]:my-5 [&_table]:w-full [&_th]:border [&_th]:border-white/10 [&_th]:bg-violet-400/[.08] [&_th]:px-3 [&_th]:py-2 [&_td]:border [&_td]:border-white/[.08] [&_td]:px-3 [&_td]:py-2"><ReactMarkdown remarkPlugins={[remarkGfm, remarkMath]} rehypePlugins={[rehypeKatex]}>{answer}</ReactMarkdown></div> : <div className="grid min-h-44 place-items-center rounded-2xl border border-dashed border-white/[.08] text-center text-sm text-white/30"><div><ListChecks size={25} className="mx-auto mb-3 text-white/20" /><p>Pick a learning mode above.</p><p className="mt-1 text-xs text-white/20">Theon will build the session around your topic.</p></div></div>}
        </section>

        <div className="mt-5 flex items-center justify-center gap-2 text-[11px] text-white/20"><Flame size={13} /> Learn • Practice • Revise • Master</div>
      </div>
    </main>
  );
}
