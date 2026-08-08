"use client";

import { LogOut, MessageSquare, Pencil, Plus, Settings, User, X, Trash2 } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import type { ChatSummary } from "@/lib/chat-history";

type Props = {
  open: boolean;
  onClose: () => void;
  chats: ChatSummary[];
  currentChatId: string | null;
  onNewChat: () => void;
  onSelectChat: (id: string) => void;
  onDeleteChat: (id: string) => void;
  onRenameChat: (id: string, title: string) => void;
  onProfile?: () => void;
  onSettings?: () => void;
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
  onRenameChat,
  onProfile = () => { window.location.href = "/profile"; },
  onSettings = () => { window.location.href = "/settings"; },
  onLogout,
}: Props) {
  const [managedChat, setManagedChat] = useState<ChatSummary | null>(null);
  const longPressTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => () => {
    if (longPressTimer.current) clearTimeout(longPressTimer.current);
  }, []);

  function startLongPress(chat: ChatSummary) {
    if (longPressTimer.current) clearTimeout(longPressTimer.current);
    longPressTimer.current = setTimeout(() => setManagedChat(chat), 520);
  }

  function cancelLongPress() {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }
  }

  function handleRename() {
    if (!managedChat) return;
    const nextTitle = window.prompt("Rename conversation", managedChat.title);
    if (nextTitle?.trim()) onRenameChat(managedChat.id, nextTitle.trim());
    setManagedChat(null);
  }

  function handleDelete() {
    if (!managedChat) return;
    const confirmed = window.confirm(`Delete “${managedChat.title}”? This cannot be undone.`);
    if (confirmed) onDeleteChat(managedChat.id);
    setManagedChat(null);
  }

  return (
    <>
      <div onClick={onClose} className={`fixed inset-0 z-40 bg-black/70 backdrop-blur-[2px] transition-opacity duration-100 ${open ? "visible opacity-100" : "invisible opacity-0"}`} />
      <aside aria-hidden={!open} className={`fixed left-0 top-0 z-50 flex h-[100dvh] w-[86%] max-w-[340px] flex-col border-r border-white/[0.08] bg-[#080810]/[0.98] shadow-[20px_0_70px_rgba(0,0,0,.35)] backdrop-blur-3xl transition-transform duration-100 ease-out ${open ? "translate-x-0" : "-translate-x-full"}`}>
        <div className="flex items-center justify-end border-b border-white/[0.07] px-4 py-4">
          <button onClick={onClose} aria-label="Close menu" className="flex h-9 w-9 items-center justify-center rounded-full text-white/45 transition duration-100 hover:bg-white/[0.06] hover:text-white/80"><X size={19} /></button>
        </div>

        <div className="p-4">
          <button onClick={onNewChat} className="flex h-12 w-full items-center justify-center gap-2.5 rounded-2xl bg-gradient-to-r from-violet-600 to-cyan-500 text-sm font-semibold text-white shadow-[0_8px_30px_rgba(124,58,237,.18)] transition active:scale-[.98]"><Plus size={19} /> New chat</button>
        </div>

        <div className="flex-1 overflow-y-auto px-4">
          <p className="mb-2 px-2 text-[10px] font-medium uppercase tracking-[0.18em] text-white/25">Chat history</p>
          {chats.length === 0 ? (
            <p className="px-2 py-3 text-xs text-white/25">No conversations yet.</p>
          ) : (
            <div className="space-y-1.5">
              {chats.map((chat) => (
                <button
                  key={chat.id}
                  type="button"
                  onClick={() => onSelectChat(chat.id)}
                  onContextMenu={(event) => { event.preventDefault(); setManagedChat(chat); }}
                  onTouchStart={() => startLongPress(chat)}
                  onTouchEnd={cancelLongPress}
                  onTouchMove={cancelLongPress}
                  className={`group flex w-full min-w-0 items-center gap-3 rounded-xl border px-3.5 py-3 text-left transition duration-100 ${currentChatId === chat.id ? "border-white/[0.08] bg-white/[0.07]" : "border-transparent hover:bg-white/[0.045]"}`}
                >
                  <MessageSquare size={16} className="shrink-0 text-white/45" />
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-[13px] text-white/75">{chat.title}</span>
                    {chat.preview && <span className="mt-0.5 block truncate text-[10px] text-white/25">{chat.preview}</span>}
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="space-y-1 border-t border-white/[0.07] p-4">
          <button onClick={onProfile} className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-sm text-white/50 transition duration-100 hover:bg-white/[0.045] hover:text-white/80"><User size={18} /> Profile</button>
          <button onClick={onSettings} className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-sm text-white/50 transition duration-100 hover:bg-white/[0.045] hover:text-white/80"><Settings size={18} /> Settings</button>
          <button onClick={onLogout} className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-sm text-red-400/70 transition duration-100 hover:bg-red-500/[0.08] hover:text-red-300"><LogOut size={18} /> Logout</button>
        </div>
      </aside>

      {managedChat && (
        <div className="fixed inset-0 z-[70] flex items-end justify-center bg-black/65 px-3 pb-4 backdrop-blur-sm sm:items-center" onClick={() => setManagedChat(null)}>
          <div className="w-full max-w-sm rounded-3xl border border-white/10 bg-[#101016] p-4 shadow-[0_20px_80px_rgba(0,0,0,.65)]" onClick={(event) => event.stopPropagation()}>
            <div className="mb-4 px-2">
              <p className="text-[11px] uppercase tracking-[0.16em] text-white/30">Manage conversation</p>
              <p className="mt-1 truncate text-sm font-medium text-white/85">{managedChat.title}</p>
            </div>
            <button onClick={handleRename} className="flex w-full items-center gap-3 rounded-2xl px-4 py-3.5 text-left text-sm text-white/75 transition hover:bg-white/[0.06]"><Pencil size={17} /> Rename</button>
            <button onClick={handleDelete} className="flex w-full items-center gap-3 rounded-2xl px-4 py-3.5 text-left text-sm text-red-300 transition hover:bg-red-500/[0.08]"><Trash2 size={17} /> Delete conversation</button>
            <button onClick={() => setManagedChat(null)} className="mt-1 w-full rounded-2xl px-4 py-3 text-sm text-white/40 hover:bg-white/[0.04]">Cancel</button>
          </div>
        </div>
      )}
    </>
  );
}
