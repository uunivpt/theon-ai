import Image from "next/image";

export default function TypingIndicator() {
  return (
    <div className="flex w-full items-start gap-3" role="status" aria-label="Theon is thinking">
      <div className="mt-1 flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-white/10 bg-black">
        <Image
          src="/logo.png"
          alt="Theon AI"
          width={36}
          height={36}
          className="h-8 w-8 object-contain [image-rendering:pixelated]"
        />
      </div>
      <div className="rounded-[20px] rounded-bl-[7px] border border-white/[0.12] bg-[#0b0b0b] px-4 py-3.5">
        <div className="flex items-center gap-1.5 px-0.5 py-1">
          <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-white/70 [animation-delay:0ms]" />
          <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-white/70 [animation-delay:160ms]" />
          <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-white/70 [animation-delay:320ms]" />
        </div>
      </div>
    </div>
  );
}
