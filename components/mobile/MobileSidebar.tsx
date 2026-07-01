"use client";

import {
  X,
  Plus,
  MessageSquare,
  User,
  Settings,
  LogOut,
} from "lucide-react";

type Props = {
  open: boolean;
  onClose: () => void;
};

export default function MobileSidebar({
  open,
  onClose,
}: Props) {
  return (
    <>
      {/* Overlay */}
      <div
        onClick={onClose}
        className={`fixed inset-0 z-40 bg-black/60 transition-all duration-300 ${
          open
            ? "opacity-100 visible"
            : "opacity-0 invisible"
        }`}
      />

      {/* Sidebar */}
      <aside
        className={`fixed left-0 top-0 z-50 flex h-screen w-[85%] max-w-[340px] flex-col border-r border-white/10 bg-[#0A0B10]/95 backdrop-blur-3xl transition-all duration-300 ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 p-6">

          <div>

            <h2 className="text-2xl font-bold text-white">
              Theon AI
            </h2>

            <p className="mt-1 text-sm text-gray-400">
              Your personal AI
            </p>

          </div>

          <button
            onClick={onClose}
            className="rounded-full p-2 hover:bg-white/10"
          >
            <X size={22} />
          </button>

        </div>

        {/* New Chat */}
        <div className="p-5">

          <button className="flex w-full items-center justify-center gap-3 rounded-2xl bg-gradient-to-r from-violet-600 to-cyan-500 py-4 font-semibold text-white transition hover:scale-[1.02]">

            <Plus size={22} />

            New Chat

          </button>

        </div>

        {/* History */}
        <div className="flex-1 overflow-y-auto px-5">

          <p className="mb-3 text-xs uppercase tracking-widest text-gray-500">
            Recent Chats
          </p>

          <div className="space-y-3">

            {[1,2,3].map((i)=>(
              <button
                key={i}
                className="flex w-full items-center gap-3 rounded-2xl border border-white/5 bg-white/5 p-4 text-left transition hover:bg-white/10"
              >
                <MessageSquare size={18}/>
                <span className="truncate text-sm text-gray-300">
                  New Conversation
                </span>
              </button>
            ))}

          </div>

        </div>

        {/* Bottom */}
        <div className="space-y-2 border-t border-white/10 p-5">

          <button className="flex w-full items-center gap-3 rounded-xl p-3 hover:bg-white/10">
            <User size={20}/>
            Profile
          </button>

          <button className="flex w-full items-center gap-3 rounded-xl p-3 hover:bg-white/10">
            <Settings size={20}/>
            Settings
          </button>

          <button className="flex w-full items-center gap-3 rounded-xl p-3 text-red-400 hover:bg-red-500/10">
            <LogOut size={20}/>
            Logout
          </button>

        </div>

      </aside>
    </>
  );
}