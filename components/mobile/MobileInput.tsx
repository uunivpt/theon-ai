"use client";

import { ArrowUp, ImagePlus } from "lucide-react";

type Props = {
  value: string;
  onChange: (value: string) => void;
  onSend: () => void;
  disabled?: boolean;
};

export default function MobileInput({ value, onChange, onSend, disabled = false }: Props) {
  return (
    <div className="fixed bottom-[max(12px,env(safe-area-inset-bottom))] left-3 right-3 z-30 md:hidden">
      <div className="pointer-events-none absolute inset-1 rounded-[28px] bg-violet-600/[0.11] blur-2xl" />
      <div className="relative flex min-h-[62px] items-center rounded-[24px] border border-white/[0.10] bg-[#0a0a12]/[0.97] pl-4 pr-1.5 shadow-[0_12px_45px_rgba(0,0,0,.48),0_0_28px_rgba(124,58,237,.10)] backdrop-blur-2xl">
        <input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              onSend();
            }
          }}
          placeholder="Ask anything..."
          disabled={disabled}
          className="h-[58px] min-w-0 flex-1 bg-transparent pr-2 text-[15px] text-white outline-none placeholder:text-white/30 disabled:opacity-50"
        />
        <button
          type="button"
          aria-label="Add image"
          disabled
          title="Image input coming soon"
          className="mr-1 flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-white/25 disabled:cursor-not-allowed"
        >
          <ImagePlus size={19} strokeWidth={1.7} />
        </button>
        <button
          onClick={onSend}
          disabled={disabled || !value.trim()}
          aria-label="Send message"
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[18px] bg-gradient-to-br from-violet-600 via-purple-500 to-cyan-400 text-white shadow-[0_0_24px_rgba(124,58,237,.35)] transition active:scale-95 disabled:cursor-not-allowed disabled:opacity-35"
        >
          <ArrowUp size={20} strokeWidth={2.2} />
        </button>
      </div>
    </div>
  );
}
