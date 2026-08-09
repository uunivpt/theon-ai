"use client";

import Image from "next/image";
import { Brain, FileText, GraduationCap, Sparkles } from "lucide-react";
import type { SelectedFeature } from "./FeatureInput";

const features: SelectedFeature[] = [
  { id: "complex", label: "Explain complex concept", hint: "Add the concept, text, image, or PDF" },
  { id: "explore", label: "Explore something simply", hint: "Tell Theon what you want to explore" },
  { id: "write", label: "Write or summarize for me", hint: "Add your text, image, or PDF" },
  { id: "study", label: "Create a study plan", hint: "Add your subject, goals, or notes" },
];

const icons = [Brain, Sparkles, FileText, GraduationCap];
type Props = { onFeatureSelect?: (feature: SelectedFeature) => void };

export default function MobileWelcome({ onFeatureSelect }: Props) {
  return (
    <section className="relative flex h-full min-h-0 flex-1 flex-col items-center overflow-hidden bg-black px-5 pt-4">
      <div className="pointer-events-none absolute left-1/2 top-1/2 h-[520px] w-[520px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(circle,rgba(124,58,237,.075),transparent_62%)]" />
      <div className="relative flex h-full w-full max-w-[820px] flex-col items-center justify-center py-4 text-center sm:py-6 lg:py-8">
        <div className="relative flex shrink-0 items-center justify-center">
          <div className="absolute h-48 w-48 rounded-full bg-violet-600/[0.08] blur-[70px]" />
          <div className="absolute h-32 w-32 rounded-full border border-white/[0.045]" />
          <Image src="/logo.png" alt="Theon AI" width={180} height={180} priority className="relative z-10 h-[112px] w-[112px] object-contain drop-shadow-[0_0_32px_rgba(139,92,246,.32)] sm:h-[126px] sm:w-[126px] lg:h-[138px] lg:w-[138px]" />
        </div>

        <div className="mt-4 shrink-0 text-[27px] font-semibold leading-none tracking-[0.19em] text-white sm:text-[30px] lg:text-[32px]">
          THEON <span className="bg-gradient-to-r from-violet-300 via-purple-200 to-cyan-300 bg-clip-text text-transparent">AI</span>
        </div>
        <div className="mt-3 flex shrink-0 items-center gap-2 rounded-full border border-white/[0.07] bg-white/[0.025] px-3 py-1.5 shadow-[0_8px_30px_rgba(0,0,0,.25)] backdrop-blur-xl">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-400/80 shadow-[0_0_10px_rgba(52,211,153,.35)]" />
          <span className="text-[9px] font-medium tracking-[0.12em] text-white/40">READY TO HELP</span>
        </div>

        <h2 className="mt-5 shrink-0 text-[19px] font-medium tracking-[-0.02em] text-white/95 sm:text-[21px] lg:text-[23px]">What can I help you with?</h2>
        <p className="mt-1.5 max-w-[470px] shrink-0 text-[11px] leading-5 text-white/35 sm:text-[12px]">Start with an idea, a question, or one of the options below.</p>

        <div className="mt-5 grid w-full max-w-[700px] shrink-0 grid-cols-2 gap-2.5 sm:mt-6 sm:gap-3 lg:grid-cols-4">
          {features.map((feature, index) => {
            const Icon = icons[index];
            return (
              <button key={feature.id} type="button" onClick={() => onFeatureSelect?.(feature)} className="group relative min-h-[82px] overflow-hidden rounded-[19px] border border-white/[0.09] bg-white/[0.025] px-3.5 py-3 text-left shadow-[0_10px_35px_rgba(0,0,0,.18)] backdrop-blur-xl transition-all duration-150 hover:-translate-y-0.5 hover:border-violet-300/25 hover:bg-white/[0.045] hover:shadow-[0_14px_38px_rgba(0,0,0,.3)] active:translate-y-0 active:scale-[0.985]">
                <div className="pointer-events-none absolute -right-6 -top-6 h-16 w-16 rounded-full bg-violet-500/[0.06] blur-2xl transition group-hover:bg-violet-400/[0.12]" />
                <div className="relative flex h-7 w-7 items-center justify-center rounded-lg border border-violet-300/[0.12] bg-violet-400/[0.055] text-violet-300/90">
                  <Icon size={16} strokeWidth={1.5} />
                </div>
                <span className="relative mt-2 block text-[10px] font-medium leading-[1.3] text-white/75 sm:text-[11px]">{feature.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
}
