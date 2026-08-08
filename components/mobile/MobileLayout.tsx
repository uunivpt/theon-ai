"use client";

import { ReactNode } from "react";

type Props = { children: ReactNode };

export default function MobileLayout({ children }: Props) {
  return (
    <div className="theon-mobile-shell md:hidden relative h-[100dvh] w-screen overflow-hidden bg-black text-white">
      <div className="theon-tablet-ambient pointer-events-none absolute inset-0 opacity-0" aria-hidden="true" />
      <div className="relative z-10 flex h-full min-h-0 flex-col bg-transparent">
        {children}
      </div>
      <style jsx>{`@media (min-width: 768px) and (max-width: 1023px) { .theon-tablet-ambient { opacity: 1; background: radial-gradient(circle at 72% 12%, rgba(124,58,237,.09), transparent 34%), radial-gradient(circle at 18% 88%, rgba(34,211,238,.055), transparent 30%); } .theon-mobile-shell > :global(.theon-tablet-ambient) { display:block; } }`}</style>
    </div>
  );
}
