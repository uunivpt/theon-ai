type ChatBubbleProps = {
  role: "user" | "ai";
  text: string;
};

export default function ChatBubble({
  role,
  text,
}: ChatBubbleProps) {
  const isUser = role === "user";

  return (
    <div
      className={`flex items-end gap-3 ${
        isUser ? "justify-end" : "justify-start"
      }`}
    >
      {!isUser && (
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-violet-500 to-cyan-500 flex items-center justify-center text-white shadow-lg">
          ✨
        </div>
      )}

      <div
        className={`max-w-[75%] rounded-3xl px-5 py-4 border shadow-xl transition-all duration-300 hover:scale-[1.01] ${
          isUser
            ? "bg-blue-600 border-blue-500 text-white"
            : "bg-white/10 border-white/10 text-white backdrop-blur-xl"
        }`}
      >
        <p className="whitespace-pre-wrap break-words">
          {text}
        </p>
      </div>

      {isUser && (
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-cyan-400 flex items-center justify-center text-white shadow-lg">
          👤
        </div>
      )}
    </div>
  );
}