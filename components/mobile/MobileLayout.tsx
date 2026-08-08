"use client";

import { ReactNode } from "react";

type Props = { children: ReactNode };

export default function MobileLayout({ children }: Props) {
  return (
    <div className="md:hidden relative h-[100dvh] w-screen overflow-hidden bg-black text-white">
      <div className="relative z-10 flex h-full min-h-0 flex-col bg-black">
        {children}
      </div>
    </div>
  );
}
