"use client";

import { ChangeEvent, FormEvent, useEffect, useRef, useState } from "react";
import { ArrowLeft, BookOpen, ChevronRight, FileImage, FileText, GraduationCap, ImagePlus, Lightbulb, Loader2, Paperclip, Send, Sparkles, Target, X } from "lucide-react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

type StudyAttachment = { name: string; type: string; dataUrl?: string; extractedText?: string };
type StudyMessage = { role: "user" | "ai"; text: string; attachments?: StudyAttachment[] };
const quickPrompts = [
  ["Explain a concept", "Explain this concept from basics, then build up to the difficult part."],
  ["Help me revise", "Help me revise this topic with the most important points and a quick recall test."],
  ["Quiz me", "Quiz me on this topic one question at a time and explain my mistakes."],
  ["Make it simple", "Explain this like I'm learning it for the first time, with a simple example."],
] as const;

function cleanAnswer(text: string) {
  return text.replace(/\n{0,2}(?:#{1,4}\s*)?Sources\s*:\s*[\s\S]*$/i, "").replace(/\[(?:\d+\s*(?:,\s*\d+)*|\d+\s*[-–]\s*\d+)\]/g, "").replace(/\n{3,}/g, "\n\n").trim();
}
function Answer({ text }: { text: string }) { return <div className="prose prose-invert max-w-none break-words text-[15px] leading-[1.78] prose-headings:font-semibold prose-headings:tracking-[-.02em] prose-h1:mb-4 prose-h1:mt-1 prose-h1:text-xl prose-h2:mb-3 prose-h2:mt-7 prose-h2:text-lg prose-h3:mb-2 prose-h3:mt-5 prose-h3:text-base prose-p:my-3.5 prose-p:leading-[1.8] prose-ul:my-3.5 prose-ol:my-3.5 prose-li:my-2 prose-li:leading-[1.75] prose-strong:text-white prose-blockquote:my-5 prose-blockquote:border-violet-400/30 prose-blockquote:bg-violet-400/[.04] prose-blockquote:px-4 prose-blockquote:py-2"><ReactMarkdown remarkPlugins={[remarkGfm]}>{cleanAnswer(text)}</ReactMarkdown></div>; }

async function readPdf(file: File) {
  const bytes = new Uint8Array(await file.arrayBuffer());
  const pdfjs = await import("pdfjs-dist/legacy/build/pdf.mjs");
  const pdf = await pdfjs.getDocument({ data: bytes, disableWorker: true }).promise;
  let text = "";
  const pageLimit = Math.min(pdf.numPages, 40);
  for (let pageNumber = 1; pageNumber <= pageLimit; pageNumber++) {
    const page = await pdf.getPage(pageNumber);
    const content = await page.getTextContent();
    text += `\n\n--- Page ${pageNumber} ---\n` + content.items.map((item: any) => typeof item?.str === "string" ? item.str : "").join(" ");
    if (text.length > 120000) break;
  }
  return text.slice(0, 120000).trim();
}

export default function StudyRoom() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [messages, setMessages] = useState<StudyMessage[]>([]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [topic, setTopic] = useState("");
  const [attachments, setAttachments] = useState<StudyAttachment[]>([]);
  const [readingFile, setReadingFile] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => { try { const saved = sessionStorage.getItem("theon-study-room-messages"); const savedTopic = sessionStorage.getItem("theon-study-topic"); if (saved) setMessages(JSON.parse(saved)); if (savedTopic) setTopic(savedTopic); } catch {} }, []);
  useEffect(() => { try { sessionStorage.setItem("theon-study-room-messages", JSON.stringify(messages)); } catch {} bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages, isTyping]);

  async function addFiles(event: ChangeEvent<HTMLInputElement>) {
    const files = Array.from(event.target.files || []).slice(0, 4);
    if (!files.length) return;
    setReadingFile(true);
    try {
      const next: StudyAttachment[] = [];
      for (const file of files) {
        if (file.type === "application/pdf") {
          const extractedText = await readPdf(file);
          if (!extractedText) throw new Error(`I couldn't read text from ${file.name}.`);
          next.push({ name: file.name, type: file.type, extractedText });
        } else if (["image/jpeg", "image/png", "image/webp", "image/gif"].includes(file.type)) {
          const dataUrl = await new Promise<string>((resolve, reject) => { const reader = new FileReader(); reader.onload = () => resolve(String(reader.result)); reader.onerror = () => reject(new Error("Image could not be read.")); reader.readAsDataURL(file); });
          if (dataUrl.length > 3500000) throw new Error(`${file.name} is too large. Please choose a smaller image.`);
          next.push({ name: file.name, type: file.type, dataUrl });
        }
      }
      setAttachments((prev) => [...prev, ...next].slice(0, 4));
    } catch (error) { setMessages((prev) => [...prev, { role: "ai", text: error instanceof Error ? error.message : "I couldn't read that file." }]); }
    finally { setReadingFile(false); if (fileInputRef.current) fileInputRef.current.value = ""; }
  }
  function removeAttachment(index: number) { setAttachments((prev) => prev.filter((_, i) => i !== index)); }

  async function ask(text = input) {
    const clean = text.trim(); if ((!clean && attachments.length === 0) || isTyping) return;
    const sentAttachments = attachments;
    setInput(""); setAttachments([]); setMessages((prev) => [...prev, { role: "user", text: clean || "Study these materials.", attachments: sentAttachments }]); setIsTyping(true);
    try {
      const res = await fetch("/api/chat", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({
        message: topic ? `Study context: The student is currently studying: ${topic}.\n\nStudent question: ${clean || "Study the attached material and teach me the key concepts."}` : (clean || "Study the attached material and teach me the key concepts."),
        history: messages.slice(-20), mode: "study", featureId: "study", attachments: sentAttachments,
        preferences: { style: "detailed", explanation: "simple", language: "auto" },
      }) });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || typeof data.reply !== "string") throw new Error(data.error || "I couldn't answer that right now.");
      setMessages((prev) => [...prev, { role: "ai", text: data.reply.trim() }]);
    } catch (error) { setMessages((prev) => [...prev, { role: "ai", text: `I couldn't answer that right now. ${error instanceof Error ? error.message : "Please try again."}` }]); }
    finally { setIsTyping(false); }
  }
  function submit(e: FormEvent) { e.preventDefault(); void ask(); }

  return <main className="min-h-[100dvh] overflow-hidden bg-[#07070a] text-white">
    <div className="pointer-events-none fixed inset-0 opacity-50 [background-image:linear-gradient(rgba(255,255,255,.022)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.022)_1px,transparent_1px)] [background-size:36px_36px]"/>
    <div className="pointer-events-none fixed left-1/2 top-[-240px] h-[520px] w-[760px] -translate-x-1/2 rounded-full bg-violet-600/[.11] blur-[140px]"/>
    <div className="relative mx-auto flex h-[100dvh] w-full max-w-6xl flex-col px-4 sm:px-6">
      <header className="flex h-[72px] shrink-0 items-center justify-between border-b border-white/[.07]">
        <button onClick={() => router.push("/")} className="flex items-center gap-2 rounded-xl px-2 py-2 text-xs text-white/45 hover:bg-white/[.04] hover:text-white"><ArrowLeft size={15}/> Back to Theon</button>
        <div className="flex items-center gap-2.5"><div className="flex h-9 w-9 items-center justify-center rounded-xl border border-violet-300/15 bg-violet-400/[.07] text-violet-300"><GraduationCap size={19}/></div><div><p className="text-sm font-semibold">Study Room</p><p className="text-[10px] text-white/30">Learn • understand • remember</p></div></div>
        <div className="hidden items-center gap-2 rounded-full border border-white/[.07] bg-white/[.025] px-3 py-1.5 text-[10px] text-white/35 sm:flex"><Target size={12}/> Focus mode</div>
      </header>

      <section className="min-h-0 flex-1 overflow-y-auto py-6 sm:py-8">
        {messages.length === 0 ? <div className="mx-auto flex min-h-full max-w-4xl flex-col justify-center pb-20">
          <div className="grid gap-6 lg:grid-cols-[1fr_280px] lg:items-end">
            <div><div className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl border border-violet-300/15 bg-violet-400/[.07] text-violet-300 shadow-[0_0_50px_rgba(139,92,246,.12)]"><BookOpen size={25}/></div><p className="text-[10px] font-medium uppercase tracking-[.22em] text-violet-300/60">Your learning space</p><h1 className="mt-3 text-3xl font-semibold tracking-[-.03em] sm:text-5xl">What are you learning today?</h1><p className="mt-4 max-w-2xl text-sm leading-6 text-white/40">Turn PDFs, notes and images into a focused study session. Theon explains, connects ideas, quizzes you and helps you revise.</p></div>
            <div className="rounded-3xl border border-violet-300/10 bg-gradient-to-br from-violet-400/[.09] to-white/[.025] p-5 shadow-[0_20px_70px_rgba(0,0,0,.25)]"><div className="flex items-center gap-2 text-xs font-medium text-white/80"><Sparkles size={15} className="text-violet-300"/> Study workspace</div><div className="mt-4 space-y-3 text-[11px] text-white/35"><div className="flex items-center gap-2"><FileText size={13}/> PDF notes & textbooks</div><div className="flex items-center gap-2"><ImagePlus size={13}/> Photos of handwritten notes</div><div className="flex items-center gap-2"><Lightbulb size={13}/> Explain • revise • quiz</div></div></div>
          </div>
          <div className="mt-7 flex items-center gap-2 rounded-2xl border border-white/[.08] bg-white/[.025] p-2"><Sparkles size={16} className="ml-2 shrink-0 text-violet-300/70"/><input value={topic} onChange={(e) => { setTopic(e.target.value); sessionStorage.setItem("theon-study-topic", e.target.value); }} placeholder="What subject are you studying? e.g. Operating Systems" className="min-w-0 flex-1 bg-transparent px-2 py-3 text-xs outline-none placeholder:text-white/20"/></div>
          <div className="mt-3 flex flex-wrap items-center gap-2"><button onClick={() => fileInputRef.current?.click()} className="flex items-center gap-2 rounded-xl border border-white/[.08] bg-white/[.025] px-3.5 py-2.5 text-xs text-white/60 transition hover:border-violet-300/20 hover:bg-violet-400/[.05] hover:text-white"><Paperclip size={14}/> Add PDF / photo</button><span className="text-[10px] text-white/20">Up to 4 materials</span><input ref={fileInputRef} type="file" accept="application/pdf,image/jpeg,image/png,image/webp,image/gif" multiple className="hidden" onChange={addFiles}/></div>
          {attachments.length > 0 && <MaterialStrip attachments={attachments} onRemove={removeAttachment}/>} 
          <div className="mt-6 grid gap-2 sm:grid-cols-2">{quickPrompts.map(([label, text]) => <button key={label} onClick={() => setInput(text)} className="group flex items-center justify-between rounded-2xl border border-white/[.07] bg-white/[.02] px-4 py-3.5 text-left hover:border-violet-300/20 hover:bg-violet-400/[.04]"><span><span className="block text-xs font-medium text-white/75">{label}</span><span className="mt-1 block text-[10px] text-white/25">{text}</span></span><ChevronRight size={14} className="text-white/20 group-hover:text-violet-300/70"/></button>)}</div>
        </div> : <div className="mx-auto max-w-3xl space-y-7 pb-8">
          {topic && <div className="flex items-center gap-2 text-[10px] uppercase tracking-[.16em] text-white/25"><BookOpen size={12}/> Studying: <span className="text-violet-300/60">{topic}</span></div>}
          {messages.map((msg, index) => <div key={`${msg.role}-${index}`} className={msg.role === "user" ? "flex justify-end" : "flex gap-3"}>{msg.role === "ai" && <div className="mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-xl border border-violet-300/15 bg-violet-400/[.06] text-violet-300"><GraduationCap size={15}/></div>}{msg.role === "user" ? <div className="max-w-[88%] rounded-2xl rounded-br-md border border-violet-400/20 bg-violet-500/[.12] px-4 py-3 text-sm leading-6 text-white/90">{msg.attachments?.length ? <MaterialStrip attachments={msg.attachments} compact onRemove={() => {}}/> : null}{msg.text}</div> : <div className="min-w-0 flex-1 rounded-2xl border border-white/[.07] bg-white/[.025] px-4 py-4 sm:px-5"><Answer text={msg.text}/></div>}</div>)}
          {isTyping && <div className="flex gap-3"><div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl border border-violet-300/15 bg-violet-400/[.06] text-violet-300"><GraduationCap size={15}/></div><div className="flex items-center gap-2 rounded-2xl border border-white/[.07] bg-white/[.025] px-4 py-3 text-xs text-white/35"><Loader2 size={14} className="animate-spin"/> Building your lesson…</div></div>}
          <div ref={bottomRef}/>
        </div>}
      </section>

      <footer className="shrink-0 pb-4 pt-2 sm:pb-6"><form onSubmit={submit} className="mx-auto max-w-3xl rounded-2xl border border-white/[.09] bg-[#111116]/95 p-2 shadow-[0_-15px_50px_rgba(0,0,0,.35)] backdrop-blur-xl">
        {attachments.length > 0 && <div className="px-2 pt-1"><MaterialStrip attachments={attachments} onRemove={removeAttachment} compact/></div>}
        <textarea value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); void ask(); } }} rows={2} placeholder="Ask Theon about your study material…" className="w-full resize-none bg-transparent px-3 py-2 text-sm leading-6 outline-none placeholder:text-white/25"/>
        <div className="flex items-center justify-between px-2 pb-1"><div className="flex items-center gap-1.5"><button type="button" onClick={() => fileInputRef.current?.click()} className="flex items-center gap-1.5 rounded-lg px-2 py-1.5 text-[10px] text-white/30 hover:bg-white/[.05] hover:text-white/70"><Paperclip size={12}/> Material</button><span className="hidden items-center gap-1.5 text-[10px] text-white/20 sm:flex"><Lightbulb size={12}/> Step-by-step student mode</span></div><button type="submit" disabled={(!input.trim() && attachments.length === 0) || isTyping || readingFile} className="flex h-9 items-center gap-2 rounded-xl bg-violet-500 px-4 text-xs font-medium text-white hover:bg-violet-400 disabled:cursor-not-allowed disabled:opacity-30">{isTyping || readingFile ? <Loader2 size={14} className="animate-spin"/> : <Send size={14}/>} {readingFile ? "Reading…" : "Ask Theon"}</button></div>
        <input ref={fileInputRef} type="file" accept="application/pdf,image/jpeg,image/png,image/webp,image/gif" multiple className="hidden" onChange={addFiles}/>
      </form><p className="mt-2 text-center text-[9px] text-white/15">Enter to send • Shift + Enter for a new line</p></footer>
    </div>
  </main>;
}

function MaterialStrip({ attachments, onRemove, compact = false }: { attachments: StudyAttachment[]; onRemove: (index: number) => void; compact?: boolean }) {
  return <div className={`flex flex-wrap gap-2 ${compact ? "mb-2" : "mt-3"}`}>{attachments.map((file, index) => { const image = file.type.startsWith("image/"); return <div key={`${file.name}-${index}`} className={`group flex items-center gap-2 rounded-xl border border-white/[.08] bg-white/[.035] ${compact ? "px-2 py-1.5" : "px-3 py-2"}`}>{image && file.dataUrl ? <Image src={file.dataUrl} alt="Study material" width={32} height={32} unoptimized className="h-8 w-8 rounded-md object-cover"/> : <div className="flex h-8 w-8 items-center justify-center rounded-md bg-violet-400/[.08] text-violet-300"><FileText size={15}/></div>}<div className="min-w-0"><p className="max-w-[170px] truncate text-[10px] font-medium text-white/70">{file.name}</p><p className="text-[9px] text-white/25">{image ? "Image" : "PDF • ready"}</p></div><button type="button" onClick={() => onRemove(index)} aria-label={`Remove ${file.name}`} className="rounded-md p-1 text-white/25 hover:bg-white/10 hover:text-white"><X size={13}/></button></div>; })}</div>;
}
