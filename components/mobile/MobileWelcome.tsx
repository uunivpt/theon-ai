"use client";

import Image from "next/image";
import { Code2, FileText, GraduationCap, Sparkles } from "lucide-react";

const prompts = [
  { icon: Sparkles, text: "Explain quantum computing in simple terms" },
  { icon: FileText, text: "Summarize this article for me" },
  { icon: Code2, text: "Write a Python code to sort a list" },
  { icon: GraduationCap, text: "Give me a study plan for 30 days" },
];

export default function MobileWelcome() {
  return (
    <section className="flex min-h-0 flex-1 flex-col items-center overflow-y-auto bg-black px-5 pb-28 pt-4">
      <div className="flex w-full max-w-[350px] flex-1 flex-col items-center justify-center text-center">
        <div className="relative flex items-center justify-center">
          <div className="absolute h-40 w-40 rounded-full bg-violet-600/[0.08] blur-[60px]" />
          <Image
            src="/logo.png"
            alt="Theon AI"
            width={180}
            height={180}
            priority
            className="relative z-10 h-[154px] w-[154px] object-contain drop-shadow-[0_0_30px_rgba(139,92,246,.38)]"
          />
        </div>

        <div className="mt-5 text-[31px] font-semibold leading-none tracking-[0.18em] text-white">
          THEON <span className="bg-gradient-to-r from-violet-400 to-cyan-300 bg-clip-text text-transparent">AI</span>
        </div>
        <p className="mt-4 text-[13px] leading-5 text-white/45">Your intelligent partner for anything.</p>

        <div className="mt-10 grid w-full grid-cols-2 gap-3">
          {prompts.map(({ icon: Icon, text }) => (
            <button
              key={text}
              type="button"
              className="min-h-[86px] rounded-[18px] border border-white/[0.12] bg-black px-3.5 py-3 text-left transition active:scale-[0.98] hover:border-violet-400/40 hover:bg-white/[0.025]"
            >
              <Icon size={21} strokeWidth={1.5} className="mb-2 text-violet-400" />
              <span className="block text-[12px] leading-[1.35] text-white/75">{text}</span>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
