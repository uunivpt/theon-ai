"use client";

import { Menu, UserRound } from "lucide-react";
import { useState } from "react";

type Props = {
  onMenu: () => void;
  onSettings: () => void;
};

export default function MobileHeader({ onMenu, onSettings }: Props) {
  const [profileOpening, setProfileOpening] = useState(false);
  const buttonClass = "flex h-10 w-10 items-center justify-center rounded-full text-white/85 transition duration-100 active:scale-95 hover:bg-white/[0.05]";

  function openProfile() {
    if (profileOpening) return;
    setProfileOpening(true);
    window.setTimeout(() => onSettings(), 100);
  }

  return (
    <header className="relative z-20 flex h-[64px] shrink-0 items-center justify-between bg-black px-4 pt-1">
      <button onClick={onMenu} aria-label="Open menu" className={buttonClass}>
        <Menu size={27} strokeWidth={1.45} />
      </button>
      <button onClick={openProfile} aria-label="Open profile" className={`${buttonClass} ${profileOpening ? "scale-90 opacity-70" : ""}`}>
        <UserRound size={24} strokeWidth={1.45} />
      </button>
    </header>
  );
}
