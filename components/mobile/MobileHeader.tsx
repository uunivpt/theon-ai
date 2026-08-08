"use client";

import { Menu, UserRound } from "lucide-react";

type Props = {
  onMenu: () => void;
  onSettings: () => void;
};

export default function MobileHeader({ onMenu, onSettings }: Props) {
  const buttonClass = "flex h-10 w-10 items-center justify-center rounded-full text-white/85 transition active:scale-95 hover:bg-white/[0.05]";

  return (
    <header className="relative z-20 flex h-[64px] shrink-0 items-center justify-between bg-black px-4 pt-1">
      <button onClick={onMenu} aria-label="Open menu" className={buttonClass}>
        <Menu size={27} strokeWidth={1.45} />
      </button>
      <button onClick={onSettings} aria-label="Open profile" className={buttonClass}>
        <UserRound size={24} strokeWidth={1.45} />
      </button>
    </header>
  );
}
