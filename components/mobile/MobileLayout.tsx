"use client";

import { ReactNode } from "react";

type Props = {
  children: ReactNode;
};

export default function MobileLayout({ children }: Props) {
  return (
    <div className="md:hidden relative h-[100dvh] w-screen overflow-hidden bg-[#03030a] text-white">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -left-24 -top-28 h-72 w-72 rounded-full bg-violet-700/25 blur-[110px]" />
        <div className="absolute -right-24 top-1/3 h-64 w-64 rounded-full bg-cyan-600/10 blur-[120px]" />
        <div className="absolute bottom-[-10%] left-1/3 h-80 w-80 -translate-x-1/2 rounded-full bg-violet-700/10 blur-[120px]" />
      </div>

      <div className="relative z-10 flex h-full min-h-0 flex-col">
        {children}
      </div>
    </div>
  );
}
