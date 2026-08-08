"use client";

import Image from "next/image";

export default function MobileWelcome() {
  return (
    <section className="relative flex min-h-0 flex-1 flex-col items-center justify-center overflow-hidden px-5 pb-32">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-1/2 top-[35%] h-64 w-64 -translate-x-1/2 rounded-full bg-violet-600/[0.07] blur-[90px]" />
        <div className="absolute left-[12%] top-[18%] h-40 w-40 rounded-full bg-cyan-500/[0.035] blur-[80px]" />
      </div>

      <div className="relative -mt-10 flex w-full max-w-[330px] flex-col items-center text-center">
        <div className="relative flex items-center justify-center">
          <div className="absolute h-32 w-32 rounded-full bg-violet-600/[0.12] blur-[55px]" />
          <Image
            src="/logo.png"
            alt="Theon AI"
            width={112}
            height={112}
            priority
            className="relative z-10 h-[96px] w-[96px] object-contain drop-shadow-[0_0_24px_rgba(139,92,246,.42)] sm:h-[104px] sm:w-[104px]"
          />
        </div>

        <div className="mt-4 flex items-center justify-center gap-[7px] text-[30px] font-semibold leading-none tracking-[0.19em] text-white/[0.94] sm:text-[32px]">
          <span>THEON</span>
        </div>

        <div className="mt-3 flex items-center gap-2.5">
          <span className="h-px w-10 bg-gradient-to-r from-transparent to-violet-500/70" />
          <span className="text-[14px] font-semibold tracking-[0.28em] text-violet-300">AI</span>
          <span className="h-px w-10 bg-gradient-to-l from-transparent to-cyan-400/60" />
        </div>

        <p className="mt-5 max-w-[250px] text-[12px] leading-5 tracking-[0.02em] text-white/40">
          Where intelligence meets simplicity.
        </p>
      </div>

      <div className="pointer-events-none absolute bottom-20 left-[-10%] h-32 w-[120%] opacity-80">
        <svg viewBox="0 0 500 120" className="h-full w-full" preserveAspectRatio="none" aria-hidden="true">
          <defs>
            <linearGradient id="theon-wave" x1="0" x2="1">
              <stop offset="0" stopColor="#6d28d9" stopOpacity="0" />
              <stop offset="0.45" stopColor="#8b5cf6" stopOpacity="0.58" />
              <stop offset="0.7" stopColor="#a855f7" stopOpacity="0.78" />
              <stop offset="1" stopColor="#7c3aed" stopOpacity="0" />
            </linearGradient>
            <filter id="theon-glow" x="-20%" y="-100%" width="140%" height="300%">
              <feGaussianBlur stdDeviation="5" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>
          <path d="M0 88 C75 25 120 22 190 58 C250 89 295 108 350 82 C410 54 445 34 500 15" fill="none" stroke="url(#theon-wave)" strokeWidth="1.8" filter="url(#theon-glow)" />
        </svg>
      </div>
    </section>
  );
}
