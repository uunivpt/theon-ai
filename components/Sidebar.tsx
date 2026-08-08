import { MessageSquare, Plus, Trash2 } from "lucide-react";
import type { ChatSummary } from "@/lib/chat-history";

type SidebarProps = {
  onNewChat: () => void;
  chats: ChatSummary[];
  currentChatId: string | null;
  onSelectChat: (id: string) => void;
  onDeleteChat: (id: string) => void;
};

export default function Sidebar({
  onNewChat,
  chats,
  currentChatId,
  onSelectChat,
  onDeleteChat,
}: SidebarProps) {
  return (
    <aside className="flex w-72 shrink-0 flex-col border-r border-white/[0.08] bg-black/30 p-4 backdrop-blur-2xl">
      <div className="mb-5 px-2">
        <h1 className="text-lg font-semibold tracking-tight text-white">Theon AI</h1>
        <p className="mt-0.5 text-[11px] text-white/30">Your personal AI</p>
      </div>

      <button
        onClick={onNewChat}
        className="mb-5 flex h-11 w-full items-center justify-center gap-2 rounded-xl border border-white/[0.1] bg-white/[0.055] text-sm font-medium text-white/85 transition hover:bg-white/[0.09] active:scale-[.99]"
      >
        <Plus size={17} /> New chat
      </button>

      <div className="mb-2 px-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-white/25">History</div>
      <div className="flex-1 space-y-1 overflow-y-auto pr-1">
        {chats.length === 0 ? (
          <p className="px-2 py-4 text-xs text-white/25">Your conversations will appear here.</p>
        ) : (
          chats.map((chat) => (
            <div
              key={chat.id}
              className={`group flex w-full items-center gap-2 rounded-xl transition ${currentChatId === chat.id ? "bg-white/[0.09]" : "hover:bg-white/[0.05]"}`}
            >
              <button
                onClick={() => onSelectChat(chat.id)}
                className={`flex min-w-0 flex-1 items-center gap-3 rounded-xl px-3 py-3 text-left ${currentChatId === chat.id ? "text-white" : "text-white/55 hover:text-white/80"}`}
              >
                <MessageSquare size={16} className="shrink-0 opacity-50" />
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-[13px] font-medium">{chat.title}</span>
                  {chat.preview && <span className="mt-0.5 block truncate text-[10px] text-white/25">{chat.preview}</span>}
                </span>
              </button>
              <button
                onClick={() => onDeleteChat(chat.id)}
                aria-label={`Delete ${chat.title}`}
                className="mr-2 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-white/20 opacity-0 transition hover:bg-red-500/10 hover:text-red-300 group-hover:opacity-100"
              >
                <Trash2 size={14} />
              </button>
            </div>
          ))
        )}
      </div>
    </aside>
  );
}
