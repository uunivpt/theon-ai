"use client";

import { BookOpen, Clock3, MessageSquare, Plus, Search, Settings, Sparkles, UserRound } from "lucide-react";
import { useMemo, useState } from "react";
import type { ChatSummary } from "@/lib/chat-history";

type SidebarProps = { onNewChat: () => void; chats: ChatSummary[]; currentChatId: string | null; onSelectChat: (id: string) => void; onDeleteChat: (id: string) => void };

export default function Sidebar({ onNewChat, chats, currentChatId, onSelectChat }: SidebarProps) {
  const [query, setQuery] = useState("");
  const filtered = useMemo(() => chats.filter((chat) => `${chat.title} ${chat.preview || ""}`.toLowerCase().includes(query.toLowerCase())), [chats, query]);

  function select(chat: ChatSummary) {
    if (chat.kind === "study") { window.location.href = `/study-v2?chat=${encodeURIComponent(chat.id)}`; return; }
    onSelectChat(chat.id);
  }

  return (
    <aside className="relative flex h-full w-[276px] shrink-0 flex-col overflow-hidden border-r border-white/[.07] bg-[color-mix(in_srgb,var(--surface)_72%,transparent)] px-3 py-3 backdrop-blur-2xl">
      <div className="pointer-events-none absolute -left-24 top-20 h-64 w-64 rounded-full bg-violet-500/[.055] blur-[100px]" />
      <div className="relative z-10 flex items-center justify-between px-2 pb-3">
        <div className="flex min-w-0 items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-violet-300/10 bg-violet-300/[.06] text-violet-200"><Sparkles size={16}/></div>
          <div className="min-w-0"><h1 className="truncate text-[14px] font-semibold tracking-[-.02em] text-[var(--foreground)]">Theon AI</h1><p className="mt-0.5 text-[8px] uppercase tracking-[.18em] text-zinc-500">Workspace</p></div>
        </div>
      </div>

      <button onClick={onNewChat} className="theon-primary relative z-10 mb-2.5 flex h-11 w-full items-center justify-center gap-2 rounded-2xl text-[11px] font-semibold"><Plus size={15}/> New conversation</button>

      <div className="relative z-10 mb-3 flex items-center gap-2 rounded-xl border border-[var(--line)] bg-[color-mix(in_srgb,var(--surface-2)_70%,transparent)] px-3 py-2.5 focus-within:border-violet-400/35 focus-within:shadow-[0_0_0_3px_var(--ring)]">
        <Search size={13} className="shrink-0 text-zinc-500"/>
        <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search conversations" aria-label="Search conversations" className="min-w-0 flex-1 bg-transparent text-[11px] text-[var(--foreground)] outline-none placeholder:text-zinc-500"/>
      </div>

      <div className="relative z-10 mb-2 flex items-center justify-between px-2">
        <span className="flex items-center gap-1.5 text-[8px] font-semibold uppercase tracking-[.2em] text-zinc-500"><Clock3 size={10}/> Recent</span>
        <span className="text-[8px] text-zinc-600">{filtered.length}</span>
      </div>

      <div className="relative z-10 min-h-0 flex-1 space-y-1 overflow-y-auto pr-0.5">
        {filtered.length === 0 ? (
          <p className="px-2 py-5 text-[10px] leading-5 text-zinc-500">{query ? "No matching conversations." : "Your recent conversations will appear here."}</p>
        ) : filtered.map((chat) => {
          const active = currentChatId === chat.id;
          return (
            <button key={chat.id} onClick={() => select(chat)} className={`group flex w-full min-w-0 items-center gap-2.5 rounded-xl border px-2.5 py-2.5 text-left ${active ? "border-violet-400/20 bg-violet-500/[.08]" : "border-transparent hover:border-[var(--line)] hover:bg-white/[.025]"}`}>
              <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${chat.kind === "study" ? "bg-cyan-400/[.07] text-cyan-300" : "bg-white/[.035] text-zinc-500"}`}>{chat.kind === "study" ? <BookOpen size={13}/> : <MessageSquare size={13}/>}</div>
              <span className="min-w-0 flex-1">
                <span className={`flex items-center gap-1.5 truncate text-[10px] font-medium ${active ? "text-[var(--foreground)]" : "text-zinc-400"}`}><span className="truncate">{chat.title}</span>{chat.kind === "study" && <span className="shrink-0 rounded-full bg-cyan-400/10 px-1.5 py-0.5 text-[6px] uppercase tracking-wider text-cyan-300">Study</span>}</span>
                {chat.preview && <span className="mt-0.5 block truncate text-[8px] text-zinc-600">{chat.preview}</span>}
              </span>
            </button>
          );
        })}
      </div>

      <div className="relative z-10 mt-2 border-t border-[var(--line)] pt-2">
        <div className="grid grid-cols-2 gap-1">
          <button onClick={() => window.location.href="/profile"} className="flex items-center justify-center gap-1.5 rounded-xl py-2 text-[9px] text-zinc-500 hover:bg-white/[.03] hover:text-[var(--foreground)]"><UserRound size={12}/> Profile</button>
          <button onClick={() => window.location.href="/settings"} className="flex items-center justify-center gap-1.5 rounded-xl py-2 text-[9px] text-zinc-500 hover:bg-white/[.03] hover:text-[var(--foreground)]"><Settings size={12}/> Settings</button>
        </div>
      </div>
    </aside>
  );
}
