type ChatInputProps = {
  message: string;
  setMessage: (value: string) => void;
  sendMessage: () => void;
};

export default function ChatInput({
  message,
  setMessage,
  sendMessage,
}: ChatInputProps) {
  return (
    <footer className="border-t border-white/10 bg-[#090909]/90 backdrop-blur-xl p-5">
      <div className="flex gap-3">

        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") sendMessage();
          }}
          placeholder="Ask anything..."
          className="flex-1 h-16 rounded-2xl bg-[#1f2937] border border-gray-700 px-6 text-white outline-none focus:border-blue-500 transition-all"
        />

        <button
          onClick={sendMessage}
          className="px-8 rounded-2xl bg-blue-600 hover:bg-blue-700 transition text-white font-medium"
        >
          Send
        </button>

      </div>
    </footer>
  );
}