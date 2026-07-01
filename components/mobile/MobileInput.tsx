"use client";

type Props = {
  value: string;
  onChange: (value: string) => void;
  onSend: () => void;
};

export default function MobileInput({
  value,
  onChange,
  onSend,
}: Props) {
  return (
    <div className="fixed bottom-10 left-5 right-5 z-30 md:hidden">

      {/* Glow */}
      <div className="absolute inset-0 rounded-full bg-violet-600/20 blur-3xl" />

      {/* Input */}
      <div className="relative flex items-center rounded-full border border-white/10 bg-[#12141C]/90 backdrop-blur-3xl shadow-[0_0_40px_rgba(139,92,246,0.18)]">

        <input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              onSend();
            }
          }}
          placeholder="Ask Theon AI..."
          className="h-16 flex-1 bg-transparent px-6 text-white text-[16px] placeholder:text-gray-500 outline-none"
        />

        <button
          onClick={onSend}
          className="mr-2 flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-violet-600 via-fuchsia-500 to-cyan-500 text-2xl text-white shadow-[0_0_35px_rgba(139,92,246,.55)] active:scale-95 transition"
        >
          →
        </button>

      </div>

    </div>
  );
}