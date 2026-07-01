"use client";

import { MessageSquare, User, Sparkles } from "lucide-react";

type Props = {
  active: "home" | "chat" | "profile";
};

export default function MobileBottomNav({
  active,
}: Props) {
  return (
    <div className="fixed bottom-5 left-5 right-5 z-50 md:hidden">

      <div className="relative h-20 rounded-full border border-white/10 bg-[#11131A]/90 backdrop-blur-3xl shadow-[0_0_40px_rgba(139,92,246,.12)]">

        <div className="flex h-full items-center justify-between px-9">

          {/* Chat */}
          <button className="flex flex-col items-center gap-1">

            <MessageSquare
              size={24}
              className={
                active === "chat"
                  ? "text-violet-400"
                  : "text-gray-500"
              }
            />

            <span
              className={
                active === "chat"
                  ? "text-xs text-violet-300"
                  : "text-xs text-gray-500"
              }
            >
              Chat
            </span>

          </button>

          <div className="w-14" />

          {/* Profile */}
          <button className="flex flex-col items-center gap-1">

            <User
              size={24}
              className={
                active === "profile"
                  ? "text-violet-400"
                  : "text-gray-500"
              }
            />

            <span
              className={
                active === "profile"
                  ? "text-xs text-violet-300"
                  : "text-xs text-gray-500"
              }
            >
              Profile
            </span>

          </button>

        </div>

        {/* Center Floating Button */}
        <div className="absolute left-1/2 top-0 -translate-x-1/2 -translate-y-1/2">

          <button className="flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-violet-600 via-fuchsia-500 to-cyan-500 shadow-[0_0_45px_rgba(139,92,246,.55)] active:scale-95 transition">

            <Sparkles
              size={34}
              className="text-white"
            />

          </button>

        </div>

      </div>

    </div>
  );
}