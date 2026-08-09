"use client";

import Image from "next/image";
import { memo, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import { Check, Copy, Download, FileText, ExternalLink, Sparkles } from "lucide-react";
import "katex/dist/katex.min.css";

type Attachment = { name: string; type: string; dataUrl: string };
type Source = { title: string; url: string; domain: string };
type ChatBubbleProps = { role: "user" | "ai"; text: string; attachments?: Attachment[]; sources?: Source[]; onQuickAction?: (text: string) => void };
function favicon(domain: string) { return `https://www.google.com/s2/favicons?domain=${encodeURIComponent(domain)}&sz=32`; }

function ChatBubble({ role, text, attachments = [], sources = [], onQuickAction }: ChatBubbleProps) {
  const isUser = role === "user"; const [copied, setCopied] = useState(false);
  async function copyMessage() { try { await navigator.clipboard.writeText(text); setCopied(true); window.setTimeout(() => setCopied(false), 1800); } catch { setCopied(false); } }
  return <div className={`flex w-full items-start gap-3 ${isUser ? "justify-end" : "justify-start"}`}>
    {!isUser && <div className="mt-1 flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-white/10 bg-black"><Image src="/logo.png" alt="Theon AI" width={36} height={36} className="h-8 w-8 object-contain [image-rendering:pixelated]"/></div>}
    <div className={`relative max-w-[84%] overflow-hidden rounded-[20px] border px-4 py-4 shadow-none ${isUser ? "rounded-br-[7px] border-violet-500/55 bg-[#35116f] text-white" : "rounded-bl-[7px] border-white/[0.12] bg-[#0b0b0b] text-white"}`}>
      {!isUser && text && <button onClick={copyMessage} aria-label="Copy response" className="absolute right-2.5 top-2.5 rounded-lg p-1.5 text-white/40 transition hover:bg-white/10 hover:text-white/75">{copied ? <Check size={15}/> : <Copy size={15}/>}</button>}
      {attachments.length > 0 && <div className={`mb-2 flex flex-wrap gap-2 ${text ? "" : "pr-1"}`}>{attachments.map((file, index) => { const isImage = file.type.startsWith("image/"); const label = isImage ? "Image" : "PDF"; return <div key={`${file.name}-${index}`} className="flex items-center gap-1.5 rounded-xl border border-white/15 bg-white/[0.06] px-2.5 py-2 text-xs text-white/85"><a href={file.dataUrl} target="_blank" rel="noreferrer" aria-label={`Open ${label}`} className="flex items-center gap-1.5 transition hover:text-white hover:underline">{isImage ? <Image src={file.dataUrl} alt="Attached image" width={28} height={28} unoptimized className="h-7 w-7 rounded-md object-cover"/> : <FileText size={16}/>}<span>{label}</span></a>{file.dataUrl && <a href={file.dataUrl} download={file.name} aria-label={`Download ${label}`} className="rounded-md p-1 text-white/45 transition hover:bg-white/10 hover:text-white"><Download size={14}/></a>}</div>; })}</div>}
      {text && <div className="theon-markdown prose prose-invert max-w-none overflow-x-auto break-words pr-7 text-[15px] leading-[1.7] prose-headings:font-semibold prose-headings:tracking-tight prose-h1:mb-4 prose-h1:mt-1 prose-h2:mb-3 prose-h2:mt-6 prose-h3:mb-2 prose-h3:mt-5 prose-p:my-3 prose-p:leading-[1.75] prose-ul:my-3 prose-ol:my-3 prose-li:my-1.5 prose-li:leading-[1.7] prose-blockquote:my-4 prose-blockquote:py-1 prose-hr:my-5 prose-pre:my-4 prose-pre:overflow-x-auto prose-code:break-all prose-strong:text-white"><ReactMarkdown remarkPlugins={[remarkGfm, remarkMath]} rehypePlugins={[rehypeKatex]}>{text}</ReactMarkdown></div>}
      {!isUser && text && <div className="mt-4 flex flex-wrap gap-1.5 pr-1"><button onClick={() => onQuickAction?.("Explain that more simply.")} className="flex items-center gap-1 rounded-full border border-white/[.08] bg-white/[.025] px-2.5 py-1.5 text-[9px] text-white/35 hover:text-white/70"><Sparkles size={11}/> Simpler</button><button onClick={() => onQuickAction?.("Go deeper and explain the reasoning.")} className="rounded-full border border-white/[.08] bg-white/[.025] px-2.5 py-1.5 text-[9px] text-white/35 hover:text-white/70">Go deeper</button><button onClick={() => onQuickAction?.("Give me a practical example.")} className="rounded-full border border-white/[.08] bg-white/[.025] px-2.5 py-1.5 text-[9px] text-white/35 hover:text-white/70">Example</button><button onClick={() => onQuickAction?.("Turn this into concise notes.")} className="rounded-full border border-white/[.08] bg-white/[.025] px-2.5 py-1.5 text-[9px] text-white/35 hover:text-white/70">Make notes</button></div>}
      {!isUser && sources.length > 0 && <div className="mt-4 border-t border-white/[.07] pt-3"><p className="mb-2 text-[9px] font-medium uppercase tracking-[.15em] text-white/25">Sources</p><div className="flex flex-wrap gap-1.5">{sources.slice(0, 8).map((source, index) => <a key={`${source.url}-${index}`} href={source.url} target="_blank" rel="noreferrer" title={source.title} className="flex h-7 w-7 items-center justify-center rounded-full border border-white/[.08] bg-white/[.035] transition hover:bg-white/[.09]"><img src={favicon(source.domain)} alt={source.domain} className="h-4 w-4 rounded-sm"/></a>)}</div></div>}
    </div>
  </div>;
}
export default memo(ChatBubble);
