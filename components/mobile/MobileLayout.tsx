"use client";

import { ReactNode } from "react";

type Props = {
  children: ReactNode;
};

export default function MobileLayout({ children }: Props) {
  return (
    <div className="md:hidden relative h-screen w-screen overflow-hidden bg-[#05060B] text-white">
      {/* Background */}
      <div className="absolute inset-0">

        <div className="absolute -top-40 -left-24 h-80 w-80 rounded-full bg-violet-600/30 blur-[120px]" />

        <div className="absolute bottom-0 right-0 h-72 w-72 rounded-full bg-cyan-500/20 blur-[120px]" />

        <div className="absolute top-1/2 left-1/2 h-72 w-72 -translate-x-1/2 -translate-y-1/2 rounded-full bg-violet-500/10 blur-[100px]" />

      </div>

      <div className="relative z-10 flex h-full flex-col">
        {children}
      </div>

    </div>
  );
}