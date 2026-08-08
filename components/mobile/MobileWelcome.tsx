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
    <section className="flex h-full min-h-0 flex-1 flex-col items-center overflow-hidden bg-black px-5 pt-4">
      <div className="flex h-full w-full max-w-[760px] flex-col items-center justify-center text-center py-4 sm:py-6 lg:py-8">
        <div className="relative flex shrink-0 items-center justify-center">
          <div className="absolute h-44 w-44 rounded-full bg-violet-600/[0.07] blur-[65px]" />
          <Image src="/logo.png" alt="Theon AI" width={180} height={180} priority className="relative z-10 h-[118px] w-[118px] object-contain drop-shadow-[0_0_26px_rgba(139,92,246,.28)] sm:h-[134px] sm:w-[134px] lg:h-[144px] lg:w-[144px]" />
        </div>
        <div className="mt-3 shrink-0 text-[28px] font-semibold leading-none tracking-[0.18em] text-white sm:text-[31px] lg:text-[33px]">THEON <span className="bg-gradient-to-r from-violet-400 to-cyan-300 bg-clip-text text-transparent">AI</span></div>
        <h2 className="mt-5 shrink-0 text-[18px] font-medium tracking-[-0.015em] text-white/90 sm:text-[20px] lg:text-[21px]">What can I help you with?</h2>
        <p className="mt-1.5 max-w-[430px] shrink-0 text-[11px] leading-5 text-white/35 sm:text-[12px]">Choose a starting point, then add your own context.</p>
        <div className="mt-5 grid w-full max-w-[620px] shrink-0 grid-cols-2 gap-2.5 sm:mt-6 sm:gap-3 lg:grid-cols-4">
          {features.map((feature, index) => {
            const Icon = icons[index];
            return <button key={feature.id} type="button" onClick={() => onFeatureSelect?.(feature)} className="group min-h-[74px] rounded-[17px] border border-white/[0.1] bg-white/[0.025] px-3 py-2.5 text-left transition duration-150 hover:border-violet-400/30 hover:bg-white/[0.045] active:scale-[0.985]">
              <Icon size={18} strokeWidth={1.5} className="mb-1.5 text-violet-400/90 transition group-hover:text-violet-300" />
              <span className="block text-[10px] font-medium leading-[1.25] text-white/75">{feature.label}</span>
            </button>;
          })}
        </div>
      </div>
    </section>
  );
}
