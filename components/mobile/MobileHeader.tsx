"use client";

import { Menu, Crown, Bell } from "lucide-react";

type Props = {
  onMenu: () => void;
};

export default function MobileHeader({
  onMenu,
}: Props) {
  return (
    <header className="flex items-center justify-between px-5 pt-5">

      {/* Left */}
      <button
        onClick={onMenu}
        className="flex h-12 w-12 items-center justify-center rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl transition hover:bg-white/10"
      >
        <Menu size={23} />
      </button>

      {/* Center */}
      <div className="text-center">

        <h1 className="bg-gradient-to-r from-violet-400 via-fuchsia-300 to-cyan-300 bg-clip-text text-2xl font-extrabold text-transparent">
          Theon AI
        </h1>

        <p className="text-xs text-gray-400">
          AI Assistant
        </p>

      </div>

      {/* Right */}
      <button className="relative flex h-12 w-12 items-center justify-center rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl transition hover:bg-white/10">

        <Bell size={21} />

        <span className="absolute right-3 top-3 h-2 w-2 rounded-full bg-violet-500" />

      </button>

    </header>
  );
}