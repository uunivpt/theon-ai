import { MessageSquare, Plus } from "lucide-react";
import type { ChatSummary } from "@/lib/chat-history";

type SidebarProps = {
  onNewChat: () => void;
  chats: ChatSummary[];
  currentChatId: string | null;
  onSelectChat: (id: string) => void;
  onDeleteChat: (id: string) => void;
};

export default function Sidebar({ onNewChat, chats, currentChatId }: SidebarProps) {
  return (
    <aside className="flex h-full w-[264px] shrink-0 flex-col border-r border-white/[0.08] bg-black p-4">
      <div className="mb-5 px-2">
        <h1 className="text-[17px] font-semibold tracking-[-0.02em] text-white">Theon AI</h1>
        <p className="mt-1 text-[10px] tracking-wide text-white/30">Chat history</p>
      </div>

      <button
        onClick={onNewChat}
        className="mb-5 flex h-11 w-full items-center justify-center gap-2 rounded-2xl border border-white/[0.11] bg-white/[0.045] text-sm font-medium text-white/85 transition hover:border-white/[0.16] hover:bg-white/[0.07] active:scale-[0.985]"
      >
        <Plus size={17} strokeWidth={1.8} /> New chat
      </button>

      <div className="mb-2 px-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-white/25">History</div>
      <div className="min-h-0 flex-1 space-y-1 overflow-y-auto pr-1">
        {chats.length === 0 ? (
          <p className="px-2 py-4 text-xs leading-5 text-white/25">Your conversations will appear here.</p>
        ) : (
          chats.map((chat) => (
            <button
              key={chat.id}
              onClick={() => onSelectChat(chat.id)}
              className={`flex w-full min-w-0 items-center gap-3 rounded-2xl border px-3.5 py-3 text-left transition duration-100 ${currentChatId === chat.id ? "border-white/[0.09] bg-white/[0.07] text-white" : "border-transparent text-white/55 hover:bg-white/[0.045] hover:text-white/80"}`}
            >
              <MessageSquare size={16} strokeWidth={1.6} className="shrink-0 opacity-55" />
              <span className="min-w-0 flex-1">
                <span className="block truncate text-[13px] font-medium">{chat.title}</span>
                {chat.preview && <span className="mt-0.5 block truncate text-[10px] text-white/25">{chat.preview}</span>}
              </span>
            </button>
          ))
        )}
      </div>
    </aside>
  );
}
