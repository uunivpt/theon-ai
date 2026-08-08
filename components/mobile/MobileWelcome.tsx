"use client";

import Image from "next/image";
import { Code2, FileText, GraduationCap, Sparkles } from "lucide-react";

const prompts = [
  { icon: Sparkles, label: "Explore", text: "Explain something simply" },
  { icon: FileText, label: "Create", text: "Write or summarize for me" },
  { icon: Code2, label: "Build", text: "Help me with code" },
  { icon: GraduationCap, label: "Learn", text: "Create a study plan" },
];

export default function MobileWelcome() {
  return (
    <section className="flex min-h-0 flex-1 flex-col items-center overflow-hidden bg-black px-5 pt-4">
      <div className="flex w-full max-w-[760px] flex-1 flex-col items-center justify-center text-center py-6 sm:py-8 lg:py-10">
        <div className="relative flex items-center justify-center">
          <div className="absolute h-44 w-44 rounded-full bg-violet-600/[0.07] blur-[65px]" />
          <Image src="/logo.png" alt="Theon AI" width={180} height={180} priority className="relative z-10 h-[122px] w-[122px] object-contain drop-shadow-[0_0_26px_rgba(139,92,246,.28)] sm:h-[138px] sm:w-[138px] lg:h-[148px] lg:w-[148px]" />
        </div>
        <div className="mt-4 text-[29px] font-semibold leading-none tracking-[0.18em] text-white sm:text-[32px] lg:text-[34px]">THEON <span className="bg-gradient-to-r from-violet-400 to-cyan-300 bg-clip-text text-transparent">AI</span></div>
        <h2 className="mt-6 text-[18px] font-medium tracking-[-0.015em] text-white/90 sm:text-[20px] lg:text-[21px]">What can I help you with?</h2>
        <p className="mt-2 max-w-[430px] text-[12px] leading-5 text-white/35 sm:text-[13px]">Ask a question, create something, learn a topic, or build with Theon.</p>
        <div className="mt-7 grid w-full max-w-[620px] grid-cols-2 gap-3 sm:mt-8 sm:gap-3.5 lg:grid-cols-4">
          {prompts.map(({ icon: Icon, label, text }) => (
            <button key={label} type="button" className="group min-h-[78px] rounded-[18px] border border-white/[0.1] bg-white/[0.025] px-3.5 py-3 text-left transition duration-150 hover:border-violet-400/30 hover:bg-white/[0.045] active:scale-[0.985]">
              <Icon size={19} strokeWidth={1.5} className="mb-2 text-violet-400/90 transition group-hover:text-violet-300" />
              <span className="block text-[10px] font-medium uppercase tracking-[0.12em] text-white/30">{label}</span>
              <span className="mt-1 block text-[11px] leading-[1.35] text-white/70">{text}</span>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
