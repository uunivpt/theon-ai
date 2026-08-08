"use client";

import { X, Plus, MessageSquare, User, Settings, LogOut } from "lucide-react";

type Props = { open: boolean; onClose: () => void };

export default function MobileSidebar({ open, onClose }: Props) {
  return (
    <>
      <div onClick={onClose} className={`fixed inset-0 z-40 bg-black/70 backdrop-blur-[2px] transition-opacity duration-300 ${open ? "visible opacity-100" : "invisible opacity-0"}`} />
      <aside className={`fixed left-0 top-0 z-50 flex h-[100dvh] w-[86%] max-w-[340px] flex-col border-r border-white/[0.08] bg-[#080810]/[0.98] shadow-[20px_0_70px_rgba(0,0,0,.35)] backdrop-blur-3xl transition-transform duration-300 ease-out ${open ? "translate-x-0" : "-translate-x-full"}`}>
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
          <button onClick={onClose} aria-label="Close menu" className="flex h-9 w-9 items-center justify-center rounded-full text-white/45 hover:bg-white/[0.06] hover:text-white/80"><X size={19} /></button>
        </div>

        <div className="p-4">
          <button className="flex h-12 w-full items-center justify-center gap-2.5 rounded-2xl bg-gradient-to-r from-violet-600 to-cyan-500 text-sm font-semibold text-white shadow-[0_8px_30px_rgba(124,58,237,.18)] transition active:scale-[.98]">
            <Plus size={19} /> New chat
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-4">
          <p className="mb-2 px-2 text-[10px] font-medium uppercase tracking-[0.18em] text-white/25">Recent chats</p>
          <div className="space-y-1.5">
            {[1, 2, 3].map((i) => (
              <button key={i} className="flex w-full items-center gap-3 rounded-xl border border-transparent px-3.5 py-3 text-left transition hover:border-white/[0.06] hover:bg-white/[0.045]">
                <MessageSquare size={16} className="text-white/30" />
                <span className="truncate text-[13px] text-white/55">New conversation</span>
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-1 border-t border-white/[0.07] p-4">
          <button className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-sm text-white/50 hover:bg-white/[0.045] hover:text-white/80"><User size={18} /> Profile</button>
          <button className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-sm text-white/50 hover:bg-white/[0.045] hover:text-white/80"><Settings size={18} /> Settings</button>
          <button className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-sm text-red-400/70 hover:bg-red-500/[0.08] hover:text-red-300"><LogOut size={18} /> Logout</button>
        </div>
      </aside>
    </>
  );
}
