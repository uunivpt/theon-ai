"use client";

import { LogOut, MessageSquare, Plus, Settings, Trash2, User, X } from "lucide-react";
import type { ChatSummary } from "@/lib/chat-history";

type Props = {
  open: boolean;
  onClose: () => void;
  chats: ChatSummary[];
  currentChatId: string | null;
  onNewChat: () => void;
  onSelectChat: (id: string) => void;
  onDeleteChat: (id: string) => void;
  onLogout: () => void;
};

export default function MobileSidebar({
  open,
  onClose,
  chats,
  currentChatId,
  onNewChat,
  onSelectChat,
  onDeleteChat,
  onLogout,
}: Props) {
  return (
    <>
      <div
        onClick={onClose}
        className={`fixed inset-0 z-40 bg-black/70 backdrop-blur-[2px] transition-opacity duration-300 ${open ? "visible opacity-100" : "invisible opacity-0"}`}
      />
      <aside
        aria-hidden={!open}
        className={`fixed left-0 top-0 z-50 flex h-[100dvh] w-[86%] max-w-[340px] flex-col border-r border-white/[0.08] bg-[#080810]/[0.98] shadow-[20px_0_70px_rgba(0,0,0,.35)] backdrop-blur-3xl transition-transform duration-300 ease-out ${open ? "translate-x-0" : "-translate-x-full"}`}
      >
        <div className="flex items-center justify-between border-b border-white/[0.07] px-5 py-5">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/[0.04]">
              <span className="text-sm font-bold tracking-wider text-white">T</span>
            </div>
            <div>
              <h2 className="text-[15px] font-semibold text-white/90">Theon AI</h2>
              <p className="text-[11px] text-white/35">Your personal AI</p>
            </div>
          </div>
          <button onClick={onClose} aria-label="Close menu" className="flex h-9 w-9 items-center justify-center rounded-full text-white/45 hover:bg-white/[0.06] hover:text-white/80">
            <X size={19} />
          </button>
        </div>

        <div className="p-4">
          <button onClick={onNewChat} className="flex h-12 w-full items-center justify-center gap-2.5 rounded-2xl bg-gradient-to-r from-violet-600 to-cyan-500 text-sm font-semibold text-white shadow-[0_8px_30px_rgba(124,58,237,.18)] transition active:scale-[.98]">
            <Plus size={19} /> New chat
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-4">
          <p className="mb-2 px-2 text-[10px] font-medium uppercase tracking-[0.18em] text-white/25">Chat history</p>
          {chats.length === 0 ? (
            <p className="px-2 py-3 text-xs text-white/25">No conversations yet.</p>
          ) : (
            <div className="space-y-1.5">
              {chats.map((chat) => (
                <div
                  key={chat.id}
                  className={`flex items-center gap-1 rounded-xl border transition ${currentChatId === chat.id ? "border-white/[0.08] bg-white/[0.07]" : "border-transparent hover:bg-white/[0.045]"}`}
                >
                  <button onClick={() => onSelectChat(chat.id)} className="flex min-w-0 flex-1 items-center gap-3 rounded-xl px-3.5 py-3 text-left">
                    <MessageSquare size={16} className="shrink-0 text-white/45" />
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-[13px] text-white/75">{chat.title}</span>
                      {chat.preview && <span className="mt-0.5 block truncate text-[10px] text-white/25">{chat.preview}</span>}
                    </span>
                  </button>
                  <button
                    onClick={() => onDeleteChat(chat.id)}
                    aria-label={`Delete ${chat.title}`}
                    className="mr-1 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-white/20 hover:bg-red-500/10 hover:text-red-300"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="space-y-1 border-t border-white/[0.07] p-4">
          <button disabled className="flex w-full cursor-not-allowed items-center gap-3 rounded-xl px-3 py-3 text-sm text-white/25">
            <User size={18} /> Profile
          </button>
          <button disabled className="flex w-full cursor-not-allowed items-center gap-3 rounded-xl px-3 py-3 text-sm text-white/25">
            <Settings size={18} /> Settings
          </button>
          <button onClick={onLogout} className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-sm text-red-400/70 hover:bg-red-500/[0.08] hover:text-red-300">
            <LogOut size={18} /> Logout
          </button>
        </div>
      </aside>
    </>
  );
}
