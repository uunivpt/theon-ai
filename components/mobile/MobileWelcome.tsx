"use client";

import Image from "next/image";
import { ArrowRight, BookOpen, Brain, FileText, Globe2 } from "lucide-react";
import type { SelectedFeature } from "./FeatureInput";

type Props = { onFeatureSelect?: (feature: SelectedFeature) => void; onStudyRoom?: () => void };
const features: Array<SelectedFeature & { icon: typeof Brain }> = [
  { id: "complex", label: "Explain anything", hint: "Break difficult ideas into clear steps", icon: Brain },
  { id: "explore", label: "Explore & research", hint: "Discover sources and useful context", icon: Globe2 },
  { id: "write", label: "Write & transform", hint: "Summarize, rewrite, organize or create", icon: FileText },
];

export default function MobileWelcome({ onFeatureSelect, onStudyRoom }: Props) {
  return (
    <section className="relative flex h-full min-h-0 flex-1 items-center justify-center overflow-hidden px-5 py-8">
      <div className="pointer-events-none absolute left-1/2 top-[18%] h-[360px] w-[360px] -translate-x-1/2 rounded-full bg-violet-500/[.055] blur-[115px]" />
      <div className="relative w-full max-w-[820px]">
        <div className="mx-auto flex max-w-[620px] flex-col items-center text-center">
          <div className="relative mb-7 flex h-20 w-20 items-center justify-center rounded-[26px] border border-white/[.10] bg-white/[.035] shadow-[0_20px_70px_rgba(0,0,0,.35)] backdrop-blur-xl">
            <div className="absolute inset-[-18px] rounded-full bg-violet-500/[.06] blur-2xl" />
            <Image src="/logo.png" alt="Theon AI" width={80} height={80} priority className="relative z-10 h-14 w-14 object-contain" />
          </div>
          <p className="mb-2 text-[10px] font-medium uppercase tracking-[.28em] text-white/30">THEON AI</p>
          <h1 className="text-[34px] font-semibold tracking-[-.045em] text-white sm:text-[42px]">What can I help you with?</h1>
          <p className="mt-3 max-w-[500px] text-[13px] leading-6 text-white/35">One focused workspace for thinking, learning, research and creation.</p>
        </div>
        <div className="mx-auto mt-9 grid max-w-[760px] gap-3 sm:grid-cols-3">
          {features.map(({ icon: Icon, ...feature }) => (
            <button key={feature.id} type="button" onClick={() => onFeatureSelect?.(feature)} className="group rounded-[22px] border border-white/[.085] bg-white/[.025] p-4 text-left shadow-[0_14px_45px_rgba(0,0,0,.18)] backdrop-blur-xl hover:-translate-y-0.5 hover:border-violet-300/20 hover:bg-white/[.045]">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl border border-violet-300/[.12] bg-violet-400/[.055] text-violet-200/80"><Icon size={17} strokeWidth={1.6} /></span>
              <span className="mt-4 block text-[13px] font-medium text-white/85">{feature.label}</span>
              <span className="mt-1 block text-[10px] leading-5 text-white/30">{feature.hint}</span>
            </button>
          ))}
        </div>
        <button type="button" onClick={onStudyRoom} className="mx-auto mt-3 flex w-full max-w-[760px] items-center justify-between rounded-[22px] border border-white/[.085] bg-white/[.025] px-5 py-4 text-left backdrop-blur-xl hover:border-cyan-300/20 hover:bg-cyan-300/[.035]">
          <span className="flex items-center gap-3">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl border border-cyan-300/[.13] bg-cyan-300/[.05] text-cyan-200/80"><BookOpen size={17} /></span>
            <span><span className="block text-[13px] font-medium text-white/85">Study Room</span><span className="block text-[10px] text-white/30">A focused workspace for serious study</span></span>
          </span>
          <ArrowRight size={15} className="text-white/25" />
        </button>
      </div>
    </section>
  );
}
