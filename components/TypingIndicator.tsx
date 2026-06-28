export default function TypingIndicator() {
  return (
    <div className="flex items-end gap-3">

      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-violet-500 to-cyan-500 flex items-center justify-center text-white shadow-lg">
        ✨
      </div>

      <div className="bg-white/10 border border-white/10 rounded-3xl px-5 py-4">

        <div className="flex gap-2">

          <span
            className="w-2 h-2 rounded-full bg-white animate-bounce"
            style={{ animationDelay: "0ms" }}
          />

          <span
            className="w-2 h-2 rounded-full bg-white animate-bounce"
            style={{ animationDelay: "200ms" }}
          />

          <span
            className="w-2 h-2 rounded-full bg-white animate-bounce"
            style={{ animationDelay: "400ms" }}
          />

        </div>

      </div>

    </div>
  );
}