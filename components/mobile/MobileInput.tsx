"use client";

import { ArrowUp, Plus } from "lucide-react";

type Props = {
  value: string;
  onChange: (value: string) => void;
  onSend: () => void;
  disabled?: boolean;
};

export default function MobileInput({ value, onChange, onSend, disabled = false }: Props) {
  return (
    <div className="fixed bottom-[max(10px,env(safe-area-inset-bottom))] left-3 right-3 z-30 md:hidden">
      <div className="relative flex min-h-[60px] items-center gap-2 rounded-[28px] border border-white/[0.12] bg-black px-1.5 py-1.5 shadow-[0_12px_40px_rgba(0,0,0,.65)]">
        <button type="button" aria-label="More input options" className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-white/[0.10] bg-white/[0.035] text-white/75 transition active:scale-95">
          <Plus size={22} strokeWidth={1.7} />
        </button>
        <input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              onSend();
            }
          }}
          placeholder="Ask Theon anything..."
          disabled={disabled}
          className="h-11 min-w-0 flex-1 bg-transparent px-1 text-[15px] text-white outline-none placeholder:text-white/30 disabled:opacity-50"
        />
        <button
          onClick={onSend}
          disabled={disabled || !value.trim()}
          aria-label="Send message"
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-violet-600 via-purple-500 to-cyan-400 text-black shadow-[0_0_22px_rgba(124,58,237,.28)] transition active:scale-95 disabled:cursor-not-allowed disabled:opacity-35"
        >
          <ArrowUp size={21} strokeWidth={2.4} />
        </button>
      </div>
    </div>
  );
}
