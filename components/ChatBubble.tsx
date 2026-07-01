"use client";

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

export default function ChatBubble({
  role,
  text,
}: ChatBubbleProps) {
  const isUser = role === "user";
  const [copied, setCopied] = useState(false);

  async function copyMessage() {
    await navigator.clipboard.writeText(text);
    setCopied(true);

    setTimeout(() => {
      setCopied(false);
    }, 1800);
  }

  return (
    <div
      className={`flex w-full items-end gap-3 ${
        isUser ? "justify-end" : "justify-start"
      }`}
    >
      {!isUser && (
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-violet-600 to-cyan-500 text-lg text-white shadow-lg">
          ✨
        </div>
      )}

      <div
        className={`relative max-w-[85%] overflow-hidden rounded-3xl border px-5 py-4 shadow-xl ${
          isUser
            ? "border-blue-500 bg-blue-600 text-white"
            : "border-white/10 bg-white/10 text-white backdrop-blur-2xl"
        }`}
      >
        {!isUser && (
          <button
            onClick={copyMessage}
            className="absolute right-3 top-3 rounded-lg bg-white/10 p-2 transition hover:bg-white/20"
          >
            {copied ? (
              <Check size={16} />
            ) : (
              <Copy size={16} />
            )}
          </button>
        )}

        <div className="prose prose-invert max-w-none overflow-x-auto break-words pr-10 prose-pre:overflow-x-auto prose-code:break-all">
          <ReactMarkdown
            remarkPlugins={[remarkGfm, remarkMath]}
            rehypePlugins={[rehypeKatex]}
          >
            {text}
          </ReactMarkdown>
        </div>
      </div>

      {isUser && (
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-cyan-400 text-lg text-white shadow-lg">
          👤
        </div>
      )}
    </div>
  );
}