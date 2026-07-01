"use client";

import Image from "next/image";

export default function MobileWelcome() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center px-8 pb-36">

      {/* Logo */}
      <div className="relative">

        {/* Glow */}
        <div className="absolute inset-0 scale-[2.4] rounded-full bg-violet-600/20 blur-[80px]" />
        <div className="absolute inset-0 scale-[1.8] rounded-full bg-cyan-500/20 blur-[60px]" />

        <div className="relative flex h-36 w-36 items-center justify-center rounded-full border border-white/10 bg-white/5 backdrop-blur-3xl">

          <Image
            src="/logo.png"
            alt="Theon AI"
            width={95}
            height={95}
            priority
            className="drop-shadow-[0_0_40px_rgba(139,92,246,.9)]"
          />

        </div>

      </div>

      {/* Heading */}

      <h1 className="mt-12 bg-gradient-to-r from-violet-400 via-fuchsia-300 to-cyan-300 bg-clip-text text-center text-4xl font-extrabold text-transparent">

        Welcome to Theon AI

      </h1>

      {/* Subtitle */}

      <p className="mt-5 max-w-xs text-center text-[15px] leading-7 text-gray-400">

        Your intelligent AI assistant.

        Chat faster, solve smarter,
        and create anything instantly.

      </p>

    </div>
  );
}