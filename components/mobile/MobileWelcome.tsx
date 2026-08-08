"use client";

import Image from "next/image";

export default function MobileWelcome() {
  return (
    <section className="relative flex min-h-0 flex-1 flex-col items-center justify-center overflow-hidden px-6 pb-32">
      {/* Logo mark */}
      <div className="relative -mt-8 flex flex-col items-center">
        <div className="absolute top-8 h-44 w-44 rounded-full bg-violet-600/10 blur-[70px]" />
        <div className="absolute top-12 h-32 w-32 rounded-full bg-cyan-500/10 blur-[55px]" />

        <Image
          src="/logo.png"
          alt="Theon AI logo"
          width={132}
          height={132}
          priority
          className="relative z-10 h-[132px] w-[132px] object-contain drop-shadow-[0_0_30px_rgba(139,92,246,.5)]"
        />

        {/* THEON wordmark */}
        <div className="mt-2 flex items-center gap-[8px] text-[34px] font-medium tracking-[0.23em] text-white/90">
          <span>T</span>
          <span>H</span>
          <span className="relative flex h-8 w-7 items-center justify-center tracking-normal">
            <span className="absolute h-[3px] w-6 -translate-y-[7px] rounded-full bg-gradient-to-r from-violet-500 to-cyan-400" />
            <span className="absolute h-[3px] w-6 rounded-full bg-gradient-to-r from-violet-500 to-cyan-400" />
            <span className="absolute h-[3px] w-6 translate-y-[7px] rounded-full bg-gradient-to-r from-violet-500 to-cyan-400" />
          </span>
          <span>O</span>
          <span>N</span>
        </div>

        <div className="mt-0.5 flex items-center gap-3">
          <span className="h-px w-12 bg-gradient-to-r from-transparent to-violet-500" />
          <span className="text-[20px] font-semibold tracking-[0.18em] text-violet-400">AI</span>
          <span className="h-px w-12 bg-gradient-to-l from-transparent to-cyan-400" />
        </div>

        <p className="mt-5 text-center text-[13px] tracking-wide text-white/45">
          Where Intelligence Meets Simplicity
        </p>
      </div>

      {/* Soft flowing accent from the reference design */}
      <div className="pointer-events-none absolute bottom-20 left-[-12%] h-36 w-[124%] opacity-90">
        <svg viewBox="0 0 500 120" className="h-full w-full" preserveAspectRatio="none" aria-hidden="true">
          <defs>
            <linearGradient id="theon-wave" x1="0" x2="1">
              <stop offset="0" stopColor="#6d28d9" stopOpacity="0" />
              <stop offset="0.42" stopColor="#8b5cf6" stopOpacity="0.75" />
              <stop offset="0.68" stopColor="#a855f7" stopOpacity="0.95" />
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
          <path
            d="M0 88 C75 25 120 22 190 58 C250 89 295 108 350 82 C410 54 445 34 500 15"
            fill="none"
            stroke="url(#theon-wave)"
            strokeWidth="2"
            filter="url(#theon-glow)"
          />
        </svg>
      </div>
    </section>
  );
}
