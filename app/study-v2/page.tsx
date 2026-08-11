"use client";

import { ChangeEvent, FormEvent, Suspense, useEffect, useRef, useState } from "react";
import { ArrowLeft, BookOpen, Brain, Camera, CheckCircle2, FileText, Flame, GraduationCap, ImagePlus, Lightbulb, Loader2, Paperclip, Send, Sparkles, Table2, Target, Trophy, X } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { createChat, getChatSummary, loadMessages, saveMessage, updateStudyChat, type ChatMessage } from "@/lib/chat-history";

type Attachment = { name: string; type: string; dataUrl?: string; extractedText?: string };
type Message = { role: "user" | "ai"; text: string; attachments?: Attachment[] };

type Tool = { label: string; prompt: string; icon: any; tone?: string };

function cleanAnswer(text: string) {
  return text
    .replace(/(^|\n)\s*(?:#{1,6}\s*)?(?:\*{1,3}|_{1,3})?\s*(?:sources?|references?|citations?)\s*(?:\*{1,3}|_{1,3})?\s*:?[ \t]*[\s\S]*$/im, "")
    .replace(/\[(?:\d+\s*(?:[,;]\s*\d+)*|\d+\s*[-–]\s*\d+)(?:\s*[,;]\s*\d+)*\]/g, "")
    .replace(/\s*\((?:source|sources|citation|citations|reference|references)\s*:?\s*\d+(?:\s*[,;]\s*\d+)*\)\.?/gi, "")
    .replace(/[ \t]{2,}/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

function Answer({ text }: { text: string }) {
  return <div className="theon-markdown prose prose-invert max-w-none break-words text-[15px] leading-[1.85] prose-headings:font-semibold prose-headings:tracking-[-.02em] prose-h1:text-xl prose-h2:mt-7 prose-h2:mb-3 prose-h3:mt-5 prose-h3:mb-2 prose-p:my-3.5 prose-li:my-2 prose-li:leading-7 prose-table:my-5 prose-table:w-full prose-th:border prose-th:border-white/10 prose-th:bg-violet-400/[.06] prose-th:px-3 prose-th:py-2 prose-td:border prose-td:border-white/[.07] prose-td:px-3 prose-td:py-2 prose-strong:text-white prose-a:text-violet-300"><ReactMarkdown remarkPlugins={[remarkGfm]}>{cleanAnswer(text)}</ReactMarkdown></div>;
}

async function readPdf(file: File) {
  const bytes = new Uint8Array(await file.arrayBuffer());
  const pdfjs = await import("pdfjs-dist/legacy/build/pdf.mjs");
  const pdf = await pdfjs.getDocument({ data: bytes }).promise;
  let text = "";
  for (let n = 1; n <= Math.min(pdf.numPages, 40); n++) {
    const page = await pdf.getPage(n);
    const content = await page.getTextContent();
    text += `\n\n--- Page ${n} ---\n` + content.items.map((x: any) => typeof x?.str === "string" ? x.str : "").join(" ");
    if (text.length > 120000) break;
  }
  return text.slice(0, 120000).trim();
}

const TOOLS: Tool[] = [
  { label: "Learn a concept", prompt: "Teach me this concept from the basics. Build it step by step, use an intuitive example, then go deeper.", icon: Lightbulb },
  { label: "Revision sheet", prompt: "Create a clean revision sheet from our study material with key concepts, definitions, formulas, and must-remember points.", icon: FileText },
  { label: "Make a table", prompt: "Turn the important information into a well-formatted Markdown table directly in the chat. Choose useful columns and keep it easy to revise.", icon: Table2 },
  { label: "Flashcards", prompt: "Create 10 useful flashcards from this topic. Show the question first and then the answer clearly.", icon: Sparkles },
  { label: "Quiz me", prompt: "Quiz me one question at a time. Wait for my answer, evaluate it, explain my mistake if any, and then continue.", icon: Trophy },
  { label: "Exam practice", prompt: "Create exam-style questions from this topic with a mix of short and long-answer questions. Ask me one at a time.", icon: Target },
  { label: "Compare topics", prompt: "Compare the relevant concepts systematically in a clear table, followed by the most important difference to remember.", icon: Table2 },
  { label: "Study plan", prompt: "Create a realistic study plan for this topic based on what we have discussed, with priorities, revision and practice blocks.", icon: CheckCircle2 },
];

function PersistentStudyRoomContent() {
  const router = useRouter();
  const params = useSearchParams();
  const selectedChat = params.get("chat");
  const fileRef = useRef<HTMLInputElement>(null);
  const cameraRef = useRef<HTMLInputElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [chatId, setChatId] = useState<string | null>(selectedChat);
  const [topic, setTopic] = useState("");
  const [input, setInput] = useState("");
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [busy, setBusy] = useState(false);
  const [loading, setLoading] = useState(Boolean(selectedChat));
  const [reading, setReading] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let active = true;
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) { router.replace("/login"); return; }
      if (!active) return;
      setReady(true);
      if (!selectedChat) { setMessages([]); setChatId(null); setTopic(""); setLoading(false); return; }
      setLoading(true);
      try {
        const [saved, summary] = await Promise.all([loadMessages(user.uid, selectedChat), getChatSummary(user.uid, selectedChat)]);
        if (!active) return;
        setChatId(selectedChat);
        setMessages(saved.map((m: ChatMessage) => ({ role: m.role, text: m.text })));
        setTopic(summary?.studyTopic || "");
      } catch (e) { console.error("Failed to open study session", e); }
      finally { if (active) setLoading(false); }
    });
    return () => { active = false; unsubscribe(); };
  }, [router, selectedChat]);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages, busy]);

  async function attach(event: ChangeEvent<HTMLInputElement>) {
    const files = Array.from(event.target.files || []).slice(0, 4);
    if (!files.length) return;
    setReading(true);
    try {
      const next: Attachment[] = [];
      for (const file of files) {
        if (file.type === "application/pdf") {
          const extractedText = await readPdf(file);
          if (!extractedText) throw new Error(`I couldn't read ${file.name}.`);
          next.push({ name: file.name, type: file.type, extractedText });
        } else if (file.type.startsWith("image/")) {
          const dataUrl = await new Promise<string>((resolve, reject) => {
            const r = new FileReader(); r.onload = () => resolve(String(r.result)); r.onerror = () => reject(new Error("Image could not be read.")); r.readAsDataURL(file);
          });
          if (dataUrl.length > 3500000) throw new Error(`${file.name} is too large.`);
          next.push({ name: file.name, type: file.type, dataUrl });
        }
      }
      setAttachments((old) => [...old, ...next].slice(0, 4));
    } catch (e) {
      setMessages((old) => [...old, { role: "ai", text: e instanceof Error ? e.message : "I couldn't read that material." }]);
    } finally {
      setReading(false);
      if (fileRef.current) fileRef.current.value = "";
      if (cameraRef.current) cameraRef.current.value = "";
    }
  }

  function removeAttachment(i: number) { setAttachments((old) => old.filter((_, n) => n !== i)); }

  async function send(text = input) {
    const user = auth.currentUser;
    const cleanText = text.trim();
    if (!user || !ready || busy || (!cleanText && !attachments.length)) return;
    const sent = attachments;
    const visible = cleanText || "Study these materials.";
    const studyTopic = topic.trim();
    setInput(""); setAttachments([]); setMessages((old) => [...old, { role: "user", text: visible, attachments: sent }]); setBusy(true);
    try {
      let id = chatId;
      if (!id) { id = await createChat(user.uid, `Study Room • ${(studyTopic || visible).slice(0, 52)}`, "study", studyTopic); setChatId(id); }
      else if (studyTopic) await updateStudyChat(user.uid, id, studyTopic, `Study Room • ${studyTopic.slice(0, 52)}`);
      await saveMessage(user.uid, id, "user", visible);
      const context = studyTopic ? `Study context: ${studyTopic}\n\n` : "";
      const res = await fetch("/api/chat", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ message: `${context}${cleanText || "Study the attached material and teach me the key concepts."}`, history: messages.slice(-20), mode: "study", featureId: "study", attachments: sent, preferences: { style: "detailed", explanation: "simple", language: "auto" } }) });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || typeof data.reply !== "string") throw new Error(data.error || "I couldn't answer that right now.");
      const reply = data.reply.trim();
      await saveMessage(user.uid, id, "ai", reply);
      setMessages((old) => [...old, { role: "ai", text: reply }]);
    } catch (e) {
      setMessages((old) => [...old, { role: "ai", text: `I couldn't answer that right now. ${e instanceof Error ? e.message : "Please try again."}` }]);
    } finally { setBusy(false); }
  }

  function submit(e: FormEvent) { e.preventDefault(); void send(); }

  return <main className="min-h-[100dvh] overflow-hidden bg-[#07070a] text-white">
    <div className="pointer-events-none fixed inset-0 opacity-50 [background-image:linear-gradient(rgba(255,255,255,.018)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.018)_1px,transparent_1px)] [background-size:36px_36px]" />
    <div className="pointer-events-none fixed left-1/2 top-[-300px] h-[620px] w-[900px] -translate-x-1/2 rounded-full bg-violet-600/[.13] blur-[160px]" />
    <div className="relative mx-auto flex h-[100dvh] max-w-7xl flex-col px-3 sm:px-6">
      <header className="flex h-[72px] shrink-0 items-center justify-between border-b border-white/[.07]">
        <button onClick={() => router.push("/")} className="flex items-center gap-2 rounded-xl px-2 py-2 text-xs text-white/45 hover:bg-white/[.05] hover:text-white"><ArrowLeft size={15}/> Back to Theon</button>
        <div className="flex items-center gap-3"><div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-violet-300/15 bg-violet-400/[.08] text-violet-300 shadow-[0_0_30px_rgba(139,92,246,.16)]"><GraduationCap size={20}/></div><div><p className="text-sm font-semibold tracking-tight">Study Room</p><p className="text-[10px] text-white/30">Your AI learning workspace</p></div></div>
        <div className="hidden items-center gap-2 rounded-full border border-violet-300/10 bg-violet-400/[.04] px-3 py-1.5 text-[10px] text-violet-200/50 sm:flex"><Flame size={12}/> Focus mode</div>
      </header>

      <section className="min-h-0 flex-1 overflow-y-auto py-5 sm:py-7">
        {loading ? <div className="flex h-full items-center justify-center text-xs text-white/35"><Loader2 size={17} className="mr-2 animate-spin"/> Opening study session…</div> : messages.length === 0 ? <div className="mx-auto max-w-6xl pb-20">
          <div className="grid gap-7 lg:grid-cols-[1fr_310px] lg:items-end">
            <div className="pt-5 sm:pt-12"><div className="mb-5 inline-flex items-center gap-2 rounded-full border border-violet-300/15 bg-violet-400/[.06] px-3 py-1.5 text-[10px] uppercase tracking-[.18em] text-violet-200/60"><BookOpen size={12}/> Learning workspace</div><h1 className="max-w-3xl text-3xl font-semibold tracking-[-.045em] sm:text-5xl">Turn studying into a conversation.</h1><p className="mt-4 max-w-2xl text-sm leading-7 text-white/40">Bring your notes, textbook PDF, a photo of a handwritten page, or just a question. Theon can teach it, turn it into tables and sheets, quiz you, and help you revise — all in one session.</p></div>
            <div className="rounded-[28px] border border-violet-300/10 bg-gradient-to-br from-violet-400/[.10] to-white/[.025] p-5 shadow-[0_25px_80px_rgba(0,0,0,.3)]"><div className="flex items-center gap-2 text-xs font-medium"><Brain size={15} className="text-violet-300"/> Study toolkit</div><div className="mt-4 grid grid-cols-2 gap-3 text-[11px] text-white/40"><div className="rounded-2xl border border-white/[.06] p-3"><FileText size={14} className="mb-2 text-violet-300/70"/>PDFs & notes</div><div className="rounded-2xl border border-white/[.06] p-3"><ImagePlus size={14} className="mb-2 text-violet-300/70"/>Photos</div><div className="rounded-2xl border border-white/[.06] p-3"><Table2 size={14} className="mb-2 text-violet-300/70"/>Sheets & tables</div><div className="rounded-2xl border border-white/[.06] p-3"><Trophy size={14} className="mb-2 text-violet-300/70"/>Quizzes</div></div></div>
          </div>
          <div className="mt-8 rounded-[28px] border border-white/[.08] bg-white/[.025] p-2 shadow-[0_25px_70px_rgba(0,0,0,.25)]"><div className="flex items-center gap-2 rounded-2xl bg-black/20 px-2"><Sparkles size={16} className="ml-2 text-violet-300/70"/><input value={topic} onChange={(e) => setTopic(e.target.value)} placeholder="What are you studying?  e.g. Operating Systems" className="min-w-0 flex-1 bg-transparent px-3 py-4 text-xs outline-none placeholder:text-white/20"/></div></div>
          <div className="mt-3 flex flex-wrap gap-2"><button type="button" onClick={() => fileRef.current?.click()} className="flex items-center gap-2 rounded-xl border border-violet-300/10 bg-violet-400/[.05] px-3.5 py-2.5 text-xs text-white/65 hover:border-violet-300/25 hover:bg-violet-400/[.09]"><Paperclip size={14}/> PDF / files</button><button type="button" onClick={() => cameraRef.current?.click()} className="flex items-center gap-2 rounded-xl border border-violet-300/10 bg-violet-400/[.05] px-3.5 py-2.5 text-xs text-white/65 hover:border-violet-300/25 hover:bg-violet-400/[.09]"><Camera size={14}/> Camera</button><button type="button" onClick={() => fileRef.current?.click()} className="flex items-center gap-2 rounded-xl border border-violet-300/10 bg-violet-400/[.05] px-3.5 py-2.5 text-xs text-white/65 hover:border-violet-300/25 hover:bg-violet-400/[.09]"><ImagePlus size={14}/> Gallery</button><span className="self-center text-[10px] text-white/20">Up to 4 study materials</span></div>
          {attachments.length > 0 && <Materials files={attachments} remove={removeAttachment}/>} 
          <div className="mt-7"><div className="mb-3 flex items-center gap-2 text-[10px] uppercase tracking-[.18em] text-white/25"><Sparkles size={12} className="text-violet-300/60"/> What do you want to do?</div><div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">{TOOLS.map((tool) => { const Icon = tool.icon; return <button key={tool.label} onClick={() => setInput(tool.prompt)} className="group rounded-2xl border border-white/[.07] bg-white/[.02] p-4 text-left transition hover:-translate-y-0.5 hover:border-violet-300/20 hover:bg-violet-400/[.04]"><Icon size={16} className="text-violet-300/75"/><span className="mt-3 flex items-center justify-between text-xs font-medium text-white/75"><span>{tool.label}</span><span className="text-violet-300/40">→</span></span><span className="mt-1 block text-[10px] leading-5 text-white/25">{tool.prompt.slice(0, 55)}…</span></button>; })}</div></div>
        </div> : <div className="mx-auto grid max-w-6xl gap-5 lg:grid-cols-[1fr_250px]"><div className="min-w-0"><div className="mb-5 flex flex-wrap items-center gap-2"><div className="flex items-center gap-2 rounded-xl border border-violet-300/10 bg-violet-400/[.04] px-3 py-2 text-[10px] uppercase tracking-[.16em] text-white/30"><BookOpen size={12} className="text-violet-300/60"/> Studying <span className="text-violet-300/70">{topic || "Current topic"}</span></div><span className="rounded-xl border border-white/[.06] px-3 py-2 text-[10px] text-white/25">{messages.length} messages</span></div>{messages.map((m,i) => <div key={`${m.role}-${i}`} className={`mb-7 ${m.role === "user" ? "flex justify-end" : "flex gap-3"}`}>{m.role === "ai" && <div className="mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-xl border border-violet-300/15 bg-violet-400/[.06] text-violet-300"><GraduationCap size={15}/></div>}{m.role === "user" ? <div className="max-w-[88%] rounded-2xl rounded-br-md border border-violet-400/20 bg-violet-500/[.12] px-4 py-3 text-sm leading-6">{m.attachments?.length ? <Materials files={m.attachments} remove={() => {}} compact/> : null}{m.text}</div> : <div className="min-w-0 flex-1 rounded-2xl border border-white/[.07] bg-white/[.025] px-4 py-4 sm:px-5"><Answer text={m.text}/></div>}</div>)}{busy && <div className="flex gap-3"><div className="flex h-8 w-8 items-center justify-center rounded-xl border border-violet-300/15 bg-violet-400/[.06] text-violet-300"><GraduationCap size={15}/></div><div className="flex items-center gap-2 rounded-2xl border border-white/[.07] bg-white/[.025] px-4 py-3 text-xs text-white/35"><Loader2 size={14} className="animate-spin"/> Building your lesson…</div></div>}<div ref={bottomRef}/></div><aside className="hidden lg:block"><div className="sticky top-4 rounded-3xl border border-white/[.07] bg-white/[.02] p-4"><div className="flex items-center gap-2 text-xs font-medium"><Target size={14} className="text-violet-300"/> Study tools</div><div className="mt-4 space-y-1.5">{TOOLS.map((tool) => { const Icon = tool.icon; return <button key={tool.label} onClick={() => setInput(tool.prompt)} className="flex w-full items-center gap-2 rounded-xl px-3 py-2.5 text-left text-[11px] text-white/45 hover:bg-violet-400/[.06] hover:text-white"><Icon size={14} className="text-violet-300/60"/>{tool.label}</button>; })}</div><div className="mt-5 border-t border-white/[.06] pt-4"><div className="text-[10px] uppercase tracking-[.16em] text-white/20">Session</div><div className="mt-3 space-y-2 text-[11px] text-white/35"><div className="flex justify-between"><span>Messages</span><span className="text-white/60">{messages.length}</span></div><div className="flex justify-between"><span>Materials</span><span className="text-white/60">{attachments.length}</span></div><div className="flex justify-between"><span>Status</span><span className="text-emerald-300/70">Active</span></div></div></div></div></aside></div>}
      </section>

      <footer className="shrink-0 pb-4 pt-2 sm:pb-6"><form onSubmit={submit} className="mx-auto max-w-4xl rounded-2xl border border-violet-300/10 bg-[#111116]/95 p-2 shadow-[0_-18px_60px_rgba(0,0,0,.4)] backdrop-blur-xl">{attachments.length > 0 && <Materials files={attachments} remove={removeAttachment} compact/>}<div className="flex items-end gap-2"><button type="button" onClick={() => fileRef.current?.click()} className="mb-1 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-white/40 hover:bg-violet-400/[.08] hover:text-white"><Paperclip size={17}/></button><textarea value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); void send(); } }} rows={2} placeholder="Ask Theon about your study material…" className="min-h-[42px] flex-1 resize-none bg-transparent px-2 py-2 text-sm leading-6 outline-none placeholder:text-white/20"/><button type="submit" disabled={busy || reading || (!input.trim() && !attachments.length)} className="mb-1 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-violet-500/80 text-white disabled:opacity-25"><Send size={16}/></button></div></form><input ref={fileRef} type="file" accept="application/pdf,image/jpeg,image/png,image/webp,image/gif" multiple className="hidden" onChange={attach}/><input ref={cameraRef} type="file" accept="image/*" capture="environment" className="hidden" onChange={attach}/></footer>
    </div>
  </main>;
}

function Materials({ files, remove, compact = false }: { files: Attachment[]; remove: (i: number) => void; compact?: boolean }) { return <div className={`flex flex-wrap gap-2 ${compact ? "mb-1" : "mt-3"}`}>{files.map((file,i) => <div key={`${file.name}-${i}`} className="flex items-center gap-2 rounded-xl border border-violet-300/10 bg-violet-400/[.05] px-2.5 py-2 text-[10px] text-white/60">{file.type.startsWith("image/") && file.dataUrl ? <Image src={file.dataUrl} alt="Study material" width={30} height={30} unoptimized className="h-7 w-7 rounded-md object-cover"/> : <FileText size={15} className="text-violet-300"/>}<span className="max-w-[180px] truncate">{file.name}</span>{!compact && <button type="button" onClick={() => remove(i)} className="rounded-md p-0.5 text-white/25 hover:bg-white/10 hover:text-white"><X size={13}/></button>}</div>)}</div>; }

export default function PersistentStudyRoom() {
  return <Suspense fallback={<main className="min-h-[100dvh] bg-[#07070a] text-white flex items-center justify-center text-xs text-white/35"><Loader2 size={17} className="mr-2 animate-spin"/> Opening Study Room…</main>}><PersistentStudyRoomContent /></Suspense>;
}
