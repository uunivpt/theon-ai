"use client";

import { Menu, Settings } from "lucide-react";

type Props = {
  onMenu: () => void;
};

export default function MobileHeader({ onMenu }: Props) {
  return (
    <header className="relative flex items-center justify-between px-5 pt-5">
      <button
        onClick={onMenu}
        aria-label="Open menu"
        className="flex h-11 w-11 items-center justify-center rounded-full border border-white/10 bg-white/[0.025] text-white/65 backdrop-blur-xl transition hover:bg-white/[0.06]"
      >
        <Menu size={22} strokeWidth={1.8} />
      </button>

      <button
        aria-label="Settings"
        className="flex h-11 w-11 items-center justify-center rounded-full border border-white/10 bg-white/[0.025] text-white/65 backdrop-blur-xl transition hover:bg-white/[0.06]"
      >
        <Settings size={20} strokeWidth={1.8} />
      </button>
    </header>
  );
}
