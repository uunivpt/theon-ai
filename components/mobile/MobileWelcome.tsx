"use client";

import Image from "next/image";
import { ArrowRight, BookOpen, Brain, FileText, Globe2, Sparkles, Zap } from "lucide-react";
import type { SelectedFeature } from "./FeatureInput";

const features: SelectedFeature[] = [
  { id: "complex", label: "Learn anything", hint: "Break difficult ideas into clear steps" },
  { id: "explore", label: "Explore & research", hint: "Discover sources, context and insights" },
  { id: "write", label: "Write & transform", hint: "Summarize, rewrite, organize or create" },
];
const icons = [Brain, Globe2, FileText];
type Props = { onFeatureSelect?: (feature: SelectedFeature) => void; onStudyRoom?: () => void };

export default function MobileWelcome({ onFeatureSelect, onStudyRoom }: Props) {
  return <section className="relative flex h-full min-h-0 flex-1 flex-col overflow-hidden px-4 pb-3 pt-3 sm:px-6">
    <div className="pointer-events-none absolute -left-28 top-0 h-80 w-80 rounded-full bg-cyan-400/[.08] blur-[100px]"/>
    <div className="pointer-events-none absolute -right-32 bottom-0 h-96 w-96 rounded-full bg-blue-500/[.10] blur-[110px]"/>
    <div className="relative mx-auto flex h-full w-full max-w-[900px] flex-col justify-center py-4 sm:py-8">
      <div className="mb-6 flex items-center justify-between px-1 sm:mb-8">
        <div><p className="text-[9px] font-semibold uppercase tracking-[.24em] text-cyan-300/70">THEON / WORKSPACE</p><p className="mt-1 text-[11px] text-white/35">Think clearer. Learn faster. Create better.</p></div>
        <div className="flex items-center gap-1.5 rounded-full border border-emerald-300/15 bg-emerald-300/[.05] px-2.5 py-1.5"><span className="h-1.5 w-1.5 rounded-full bg-emerald-300 shadow-[0_0_12px_rgba(57,231,196,.8)]"/><span className="text-[8px] font-semibold tracking-[.16em] text-emerald-200/75">ONLINE</span></div>
      </div>

      <div className="grid items-center gap-7 lg:grid-cols-[.85fr_1.15fr] lg:gap-10">
        <div className="text-left">
          <div className="mb-5 flex items-center gap-3">
            <div className="relative flex h-14 w-14 items-center justify-center rounded-[18px] border border-cyan-200/15 bg-white/[.04] shadow-[0_20px_60px_rgba(0,0,0,.25)]"><div className="absolute inset-0 rounded-[18px] bg-cyan-300/[.05] blur-xl"/><Image src="/logo.png" alt="Theon AI" width={54} height={54} priority className="relative h-11 w-11 object-contain"/></div>
            <div><p className="text-[11px] font-semibold tracking-[.18em] text-white/55">THEON <span className="text-cyan-300">AI</span></p><p className="mt-1 text-[9px] text-white/25">Your intelligent workspace</p></div>
          </div>
          <h1 className="max-w-[540px] text-[38px] font-semibold leading-[1.02] tracking-[-.045em] text-white sm:text-[48px] lg:text-[54px]">One workspace.<br/><span className="bg-gradient-to-r from-cyan-200 via-cyan-300 to-blue-300 bg-clip-text text-transparent">Every way to think.</span></h1>
          <p className="mt-5 max-w-[500px] text-[13px] leading-6 text-white/42 sm:text-[14px]">Chat, research, code, vision, writing and focused study tools — all in one clean AI workspace.</p>
          <button type="button" onClick={() => onFeatureSelect?.(features[0])} className="mt-6 inline-flex items-center gap-2 rounded-full border border-cyan-200/20 bg-cyan-300/[.08] px-4 py-2.5 text-[11px] font-semibold text-cyan-100 hover:bg-cyan-300/[.13]">Start exploring <ArrowRight size={14}/></button>
        </div>

        <div className="grid grid-cols-2 gap-2.5 sm:gap-3">
          {features.map((feature, index) => { const Icon = icons[index]; return <button key={feature.id} type="button" onClick={() => onFeatureSelect?.(feature)} className="group relative min-h-[128px] overflow-hidden rounded-[22px] border border-white/[.09] bg-white/[.035] p-4 text-left backdrop-blur-2xl sm:min-h-[145px] sm:p-5">
            <div className="absolute -right-8 -top-8 h-28 w-28 rounded-full bg-cyan-300/[.06] blur-3xl transition group-hover:bg-cyan-300/[.11]"/><div className="relative flex h-9 w-9 items-center justify-center rounded-xl border border-cyan-200/15 bg-cyan-300/[.06] text-cyan-200"><Icon size={18} strokeWidth={1.6}/></div><span className="relative mt-4 block text-[12px] font-semibold text-white/85 sm:text-[13px]">{feature.label}</span><span className="relative mt-1 block max-w-[190px] text-[9px] leading-4 text-white/30 sm:text-[10px]">{feature.hint}</span><Zap size={13} className="absolute bottom-4 right-4 text-white/15 group-hover:text-cyan-300/60"/>
          </button>; })}
          <button type="button" onClick={onStudyRoom} className="group relative col-span-2 min-h-[106px] overflow-hidden rounded-[22px] border border-blue-300/15 bg-gradient-to-r from-blue-400/[.10] to-cyan-300/[.06] p-4 text-left backdrop-blur-2xl sm:min-h-[120px] sm:p-5"><div className="flex items-center gap-4"><div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-blue-200/15 bg-blue-300/[.08] text-blue-200"><BookOpen size={20}/></div><div className="min-w-0 flex-1"><span className="block text-[13px] font-semibold text-white/90">Study Room</span><span className="mt-1 block text-[9px] leading-4 text-white/35 sm:text-[10px]">A dedicated space for notes, learning sessions, revision and focused study.</span></div><ArrowRight size={17} className="shrink-0 text-white/25 transition group-hover:translate-x-1 group-hover:text-cyan-200"/></div></button>
        </div>
      </div>
    </div>
  </section>;
}
