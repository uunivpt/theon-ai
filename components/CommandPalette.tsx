"use client";

import { useEffect, useMemo, useState } from "react";
import { ArrowRight, BookOpen, Command, MessageSquarePlus, Search, Settings, Sparkles } from "lucide-react";

type Action = { id: string; label: string; hint: string; icon: typeof Sparkles; run: () => void };

type Props = {
  open: boolean;
  onClose: () => void;
  onNewChat: () => void;
  onStudy: () => void;
  onResearch: () => void;
  onSettings: () => void;
};

export default function CommandPalette({ open, onClose, onNewChat, onStudy, onResearch, onSettings }: Props) {
  const [query, setQuery] = useState("");

  useEffect(() => {
    if (!open) return;
    setQuery("");
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  const actions = useMemo<Action[]>(() => [
    { id: "new", label: "New conversation", hint: "Start fresh", icon: MessageSquarePlus, run: onNewChat },
    { id: "study", label: "Open Study Room", hint: "Learn, revise and quiz", icon: BookOpen, run: onStudy },
    { id: "research", label: "Deep Research mode", hint: "Compare multiple sources", icon: Search, run: onResearch },
    { id: "settings", label: "Open settings", hint: "Preferences and controls", icon: Settings, run: onSettings },
  ], [onNewChat, onResearch, onSettings, onStudy]);

  const filtered = actions.filter((item) => `${item.label} ${item.hint}`.toLowerCase().includes(query.toLowerCase()));
  if (!open) return null;

  return <div className="fixed inset-0 z-[100] flex items-start justify-center bg-black/65 px-4 pt-[12vh] backdrop-blur-md" role="dialog" aria-modal="true" aria-label="Theon command palette" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}>
    <div className="w-full max-w-xl overflow-hidden rounded-[28px] border border-white/[.12] bg-[#101015]/95 shadow-[0_30px_100px_rgba(0,0,0,.7)]">
      <div className="flex items-center gap-3 border-b border-white/[.08] px-5 py-4">
        <Command size={18} className="text-violet-300" />
        <input autoFocus value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Jump anywhere in Theon…" className="min-w-0 flex-1 bg-transparent text-[15px] text-white outline-none placeholder:text-white/30" />
        <kbd className="rounded-lg border border-white/10 bg-white/[.04] px-2 py-1 text-[9px] text-white/35">ESC</kbd>
      </div>
      <div className="p-2">
        <p className="px-3 py-2 text-[9px] font-semibold uppercase tracking-[.18em] text-white/25">Quick actions</p>
        {filtered.length === 0 ? <p className="px-3 py-7 text-center text-[11px] text-white/30">No matching actions.</p> : filtered.map((item) => { const Icon = item.icon; return <button key={item.id} type="button" onClick={() => { item.run(); onClose(); }} className="group flex w-full items-center gap-3 rounded-2xl px-3 py-3 text-left hover:bg-white/[.055]"><span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-white/[.08] bg-white/[.035] text-white/55 group-hover:border-violet-300/20 group-hover:text-violet-200"><Icon size={16}/></span><span className="min-w-0 flex-1"><span className="block text-[12px] font-medium text-white/85">{item.label}</span><span className="mt-0.5 block text-[9px] text-white/30">{item.hint}</span></span><ArrowRight size={14} className="text-white/20 group-hover:text-white/50" /></button>; })}
      </div>
      <div className="flex items-center justify-between border-t border-white/[.07] px-5 py-3 text-[9px] text-white/20"><span>THEON COMMAND</span><span className="flex items-center gap-1"><Sparkles size={10}/> Premium workspace</span></div>
    </div>
  </div>;
}
