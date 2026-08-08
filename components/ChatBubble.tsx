"use client";

import Image from "next/image";
import { useState } from "react";
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

export default function ChatBubble({ role, text }: ChatBubbleProps) {
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
    <div className={`flex w-full items-end gap-3 ${isUser ? "justify-end" : "justify-start"}`}>
      {!isUser && (
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-white/10 bg-white/[0.045] shadow-[0_0_22px_rgba(139,92,246,.18)]">
          <Image
            src="/logo.png"
            alt="Theon AI"
            width={36}
            height={36}
            className="h-8 w-8 object-contain [image-rendering:pixelated]"
          />
        </div>
      )}

      <div
        className={`relative max-w-[85%] overflow-hidden rounded-3xl border px-5 py-4 shadow-xl ${
          isUser
            ? "border-blue-500/60 bg-blue-600 text-white"
            : "border-white/10 bg-white/10 text-white backdrop-blur-2xl"
        }`}
      >
        {!isUser && text && (
          <button
            onClick={copyMessage}
            aria-label="Copy response"
            className="absolute right-3 top-3 rounded-lg bg-white/10 p-2 transition hover:bg-white/20"
          >
            {copied ? <Check size={16} /> : <Copy size={16} />}
          </button>
        )}

        <div className="prose prose-invert max-w-none overflow-x-auto break-words pr-9 prose-pre:overflow-x-auto prose-code:break-all">
          <ReactMarkdown remarkPlugins={[remarkGfm, remarkMath]} rehypePlugins={[rehypeKatex]}>
            {text}
          </ReactMarkdown>
        </div>
      </div>

      {isUser && (
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white/[0.07] text-sm text-white/75">
          You
        </div>
      )}
    </div>
  );
}
