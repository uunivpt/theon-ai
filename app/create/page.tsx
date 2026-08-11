"use client";

import { useState } from "react";
import { FileDown, Image as ImageIcon, Sparkles, Wand2 } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import "katex/dist/katex.min.css";

export default function CreateStudio() {
  const [tab, setTab] = useState<"image" | "document">("image");
  const [prompt, setPrompt] = useState("");
  const [content, setContent] = useState("");
  const [image, setImage] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function generateImage() {
    if (!prompt.trim() || busy) return;
    setBusy(true); setError(""); setImage("");
    try {
      const res = await fetch("/api/generate-image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Image generation failed.");
      setImage(data.image);
    } catch (e) { setError(e instanceof Error ? e.message : "Something went wrong."); }
    finally { setBusy(false); }
  }

  async function generateDocument() {
    if (!prompt.trim() || busy) return;
    setBusy(true); setError(""); setContent("");
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: `Create a polished, export-ready document about: ${prompt}. Use a clear title, short sections, useful tables when appropriate, bullets, examples, and a concise conclusion. Do not mention this instruction.`,
          history: [], mode: "default", featureId: "create-studio",
          preferences: { style: "detailed", explanation: "simple", language: "auto" },
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Document generation failed.");
      setContent(data.reply || "");
    } catch (e) { setError(e instanceof Error ? e.message : "Something went wrong."); }
    finally { setBusy(false); }
  }

  function printPdf() {
    if (!content) return;
    window.print();
  }

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,#e8f0ff,transparent_45%),#f8fafc] px-4 py-8 text-slate-900 sm:px-8">
      <div className="mx-auto max-w-5xl">
        <div className="mb-8 flex items-center gap-3">
          <div className="rounded-2xl bg-white/80 p-3 shadow-sm ring-1 ring-slate-200"><Sparkles className="h-6 w-6" /></div>
          <div><p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">Theon AI</p><h1 className="text-3xl font-semibold tracking-tight">Create Studio</h1></div>
        </div>

        <div className="mb-5 grid grid-cols-2 rounded-2xl bg-white/70 p-1 shadow-sm ring-1 ring-slate-200">
          <button onClick={() => setTab("image")} className={`rounded-xl px-4 py-3 text-sm font-semibold ${tab === "image" ? "bg-slate-900 text-white" : "text-slate-600"}`}><ImageIcon className="mr-2 inline h-4 w-4" />Generate Image</button>
          <button onClick={() => setTab("document")} className={`rounded-xl px-4 py-3 text-sm font-semibold ${tab === "document" ? "bg-slate-900 text-white" : "text-slate-600"}`}><FileDown className="mr-2 inline h-4 w-4" />Create Document / PDF</button>
        </div>

        <section className="rounded-3xl bg-white/80 p-5 shadow-xl shadow-slate-200/40 ring-1 ring-slate-200 backdrop-blur-xl sm:p-7">
          <label className="mb-2 block text-sm font-semibold">What do you want to create?</label>
          <textarea value={prompt} onChange={e => setPrompt(e.target.value)} placeholder={tab === "image" ? "Describe the image you want…" : "Describe the document, notes, report or study sheet…"} className="min-h-32 w-full resize-y rounded-2xl border border-slate-200 bg-slate-50 p-4 outline-none transition focus:border-slate-400" />
          <button disabled={busy || !prompt.trim()} onClick={tab === "image" ? generateImage : generateDocument} className="mt-4 inline-flex items-center gap-2 rounded-2xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white disabled:opacity-50"><Wand2 className="h-4 w-4" />{busy ? "Creating…" : tab === "image" ? "Generate image" : "Create document"}</button>
          {error && <p className="mt-4 rounded-xl bg-red-50 p-3 text-sm text-red-700">{error}</p>}
        </section>

        {image && <section className="mt-6 overflow-hidden rounded-3xl bg-white p-4 shadow-xl ring-1 ring-slate-200"><img src={image} alt={prompt} className="mx-auto max-h-[70vh] rounded-2xl object-contain" /><a href={image} download="theon-generated-image.png" className="mt-4 inline-flex rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white">Download image</a></section>}

        {content && <section className="mt-6 rounded-3xl bg-white p-6 shadow-xl ring-1 ring-slate-200 print:shadow-none print:ring-0"><div className="mb-5 flex items-center justify-between gap-3 print:hidden"><span className="text-sm font-semibold text-slate-500">Document preview</span><button onClick={printPdf} className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white"><FileDown className="h-4 w-4" />Print / Save as PDF</button></div><article className="prose prose-slate max-w-none"><ReactMarkdown remarkPlugins={[remarkGfm, remarkMath]} rehypePlugins={[rehypeKatex]}>{content}</ReactMarkdown></article></section>}
      </div>
      <style jsx global>{`@media print { body { background: white !important; } main { padding: 0 !important; background: white !important; } }`}</style>
    </main>
  );
}
