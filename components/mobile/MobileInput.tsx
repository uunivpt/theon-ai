"use client";

import { ImagePlus, ArrowUp } from "lucide-react";

type Props = {
  value: string;
  onChange: (value: string) => void;
  onSend: () => void;
};

export default function MobileInput({ value, onChange, onSend }: Props) {
  return (
    <div className="fixed bottom-5 left-4 right-4 z-30 md:hidden">
      <div className="pointer-events-none absolute inset-0 rounded-full bg-violet-600/15 blur-2xl" />

      <div className="relative flex h-[66px] items-center rounded-full border border-white/[0.11] bg-[#0b0b13]/95 pl-5 pr-2 shadow-[0_8px_35px_rgba(0,0,0,.45),0_0_35px_rgba(124,58,237,.12)] backdrop-blur-2xl">
        <input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") onSend();
          }}
          placeholder="Ask anything..."
          className="h-full min-w-0 flex-1 bg-transparent pr-3 text-[15px] text-white outline-none placeholder:text-white/35"
        />

        <button
          type="button"
          aria-label="Add image"
          className="mr-2 flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-white/45 transition hover:bg-white/5 hover:text-white/70"
        >
          <ImagePlus size={21} strokeWidth={1.8} />
        </button>

        <button
          onClick={onSend}
          aria-label="Send message"
          className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-violet-600 via-purple-500 to-cyan-400 text-white shadow-[0_0_25px_rgba(124,58,237,.45)] transition active:scale-95"
        >
          <ArrowUp size={22} strokeWidth={2.2} />
        </button>
      </div>
    </div>
  );
}
