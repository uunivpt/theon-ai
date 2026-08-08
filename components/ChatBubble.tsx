"use client";

import Image from "next/image";
import { memo, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import { Copy, Check } from "lucide-react";

import "katex/dist/katex.min.css";

type ChatBubbleProps = {
  role: "user" | "ai";
  text: string;
};

function ChatBubble({ role, text }: ChatBubbleProps) {
  const isUser = role === "user";
  const [copied, setCopied] = useState(false);

  async function copyMessage() {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      setCopied(false);
    }
  }

  return (
    <div className={`flex w-full items-start gap-3 ${isUser ? "justify-end" : "justify-start"}`}>
      {!isUser && (
        <div className="mt-1 flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-white/10 bg-black">
          <Image src="/logo.png" alt="Theon AI" width={36} height={36} className="h-8 w-8 object-contain [image-rendering:pixelated]" />
        </div>
      )}

      <div className={`relative max-w-[84%] overflow-hidden rounded-[20px] border px-4 py-3.5 shadow-none ${isUser ? "rounded-br-[7px] border-violet-500/55 bg-[#35116f] text-white" : "rounded-bl-[7px] border-white/[0.12] bg-[#0b0b0b] text-white"}`}>
        {!isUser && text && (
          <button onClick={copyMessage} aria-label="Copy response" className="absolute right-2.5 top-2.5 rounded-lg p-1.5 text-white/40 transition hover:bg-white/10 hover:text-white/75">
            {copied ? <Check size={15} /> : <Copy size={15} />}
          </button>
        )}
        <div className="prose prose-invert max-w-none overflow-x-auto break-words pr-7 text-[15px] leading-[1.55] prose-p:my-0 prose-pre:overflow-x-auto prose-code:break-all">
          <ReactMarkdown remarkPlugins={[remarkGfm, remarkMath]} rehypePlugins={[rehypeKatex]}>{text}</ReactMarkdown>
        </div>
      </div>
    </div>
  );
}

export default memo(ChatBubble);
