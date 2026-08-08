"use client";

import { Menu, Settings } from "lucide-react";

type Props = {
  onMenu: () => void;
  onSettings: () => void;
};

export default function MobileHeader({ onMenu, onSettings }: Props) {
  const buttonClass = "flex h-10 w-10 items-center justify-center rounded-full border border-white/[0.08] bg-white/[0.025] text-white/55 shadow-[0_8px_25px_rgba(0,0,0,.16)] backdrop-blur-xl transition active:scale-95 hover:bg-white/[0.06] hover:text-white/80";

  return (
    <header className="relative z-20 flex h-[68px] items-center justify-between px-4 pt-2">
      <button onClick={onMenu} aria-label="Open menu" className={buttonClass}>
        <Menu size={20} strokeWidth={1.7} />
      </button>
      <div className="pointer-events-none absolute left-1/2 top-1/2 h-6 w-24 -translate-x-1/2 -translate-y-1/2 rounded-full bg-violet-500/[0.05] blur-xl" />
      <button onClick={onSettings} aria-label="Open settings" className={buttonClass}>
        <Settings size={18} strokeWidth={1.7} />
      </button>
    </header>
  );
}
