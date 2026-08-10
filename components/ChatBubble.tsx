"use client";

import Image from "next/image";
import { memo, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import { Check, Copy, Download, FileText } from "lucide-react";
import "katex/dist/katex.min.css";

type Attachment = { name: string; type: string; dataUrl: string };
type Source = { title: string; url: string; domain: string };
type ChatBubbleProps = { role: "user" | "ai"; text: string; attachments?: Attachment[]; sources?: Source[]; onQuickAction?: (text: string) => void };
function favicon(domain: string) { return `https://www.google.com/s2/favicons?domain=${encodeURIComponent(domain)}&sz=32`; }
function displayAnswer(text: string) {
  return text
    .replace(/\n{0,2}(?:#{1,4}\s*)?Sources\s*:\s*[\s\S]*$/i, "")
    .replace(/\[(?:\d+\s*(?:,\s*\d+)*|\d+\s*[-–]\s*\d+)\]/g, "")
    .replace(/[ \t]{2,}/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

function ChatBubble({ role, text, attachments = [], sources = [] }: ChatBubbleProps) {
  const isUser = role === "user";
  const [copied, setCopied] = useState(false);
  const visibleText = isUser ? text : displayAnswer(text);
  async function copyMessage() {
    try { await navigator.clipboard.writeText(visibleText); setCopied(true); window.setTimeout(() => setCopied(false), 1800); } catch { setCopied(false); }
  }
  return <div className={`flex w-full items-start gap-3 ${isUser ? "justify-end" : "justify-start"}`}>
    {!isUser && <div className="mt-1 flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-white/10 bg-black"><Image src="/logo.png" alt="Theon AI" width={36} height={36} className="h-8 w-8 object-contain [image-rendering:pixelated]"/></div>}
    <div className={`relative max-w-[88%] overflow-hidden rounded-[20px] border px-4 py-4 shadow-[0_12px_40px_rgba(0,0,0,.18)] sm:max-w-[82%] ${isUser ? "rounded-br-[7px] border-violet-500/55 bg-[#35116f] text-white" : "rounded-bl-[7px] border-white/[0.11] bg-[#0b0b0b] text-white"}`}>
      {!isUser && visibleText && <button onClick={copyMessage} aria-label="Copy response" className="absolute right-2.5 top-2.5 z-10 rounded-lg p-1.5 text-white/35 transition hover:bg-white/10 hover:text-white/75">{copied ? <Check size={15}/> : <Copy size={15}/>}</button>}
      {attachments.length > 0 && <div className={`mb-3 flex flex-wrap gap-2 ${visibleText ? "" : "pr-1"}`}>{attachments.map((file, index) => {
        const isImage = file.type.startsWith("image/");
        const label = isImage ? "Image" : "PDF";
        return <div key={`${file.name}-${index}`} className="flex items-center gap-1.5 rounded-xl border border-white/15 bg-white/[0.06] px-2.5 py-2 text-xs text-white/85"><a href={file.dataUrl} target="_blank" rel="noreferrer" aria-label={`Open ${label}`} className="flex items-center gap-1.5 transition hover:text-white hover:underline">{isImage ? <Image src={file.dataUrl} alt="Attached image" width={28} height={28} unoptimized className="h-7 w-7 rounded-md object-cover"/> : <FileText size={16}/>}<span>{label}</span></a>{file.dataUrl && <a href={file.dataUrl} download={file.name} aria-label={`Download ${label}`} className="rounded-md p-1 text-white/45 transition hover:bg-white/10 hover:text-white"><Download size={14}/></a>}</div>;
      })}</div>}
      {visibleText && <div className="theon-markdown prose prose-invert max-w-none break-words pr-7 text-[15px] leading-[1.78] prose-headings:font-semibold prose-headings:tracking-[-0.02em] prose-h1:mb-4 prose-h1:mt-1 prose-h1:text-[20px] prose-h2:mb-3 prose-h2:mt-7 prose-h2:text-[18px] prose-h3:mb-2 prose-h3:mt-5 prose-h3:text-[16px] prose-p:my-3.5 prose-p:leading-[1.8] prose-ul:my-3.5 prose-ol:my-3.5 prose-li:my-2 prose-li:leading-[1.75] prose-blockquote:my-5 prose-blockquote:rounded-r-xl prose-blockquote:border-violet-400/30 prose-blockquote:bg-violet-400/[.035] prose-blockquote:px-4 prose-blockquote:py-2 prose-hr:my-6 prose-pre:my-5 prose-pre:overflow-x-auto prose-code:break-all prose-strong:text-white prose-a:text-violet-300"><ReactMarkdown remarkPlugins={[remarkGfm, remarkMath]} rehypePlugins={[rehypeKatex]}>{visibleText}</ReactMarkdown></div>}
      {!isUser && sources.length > 0 && <div className="mt-3 flex items-center gap-2 border-t border-white/[.06] pt-3"><div className="flex flex-wrap gap-1.5" aria-label="Sources">{sources.slice(0, 8).map((source, index) => <a key={`${source.url}-${index}`} href={source.url} target="_blank" rel="noreferrer" title={source.title} aria-label={source.title} className="flex h-7 w-7 items-center justify-center rounded-full border border-white/[.08] bg-white/[.035] transition hover:bg-white/[.09]"><img src={favicon(source.domain)} alt="" className="h-4 w-4 rounded-sm"/></a>)}</div></div>}
    </div>
  </div>;
}
export default memo(ChatBubble);
