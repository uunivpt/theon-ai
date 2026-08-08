"use client";

import { ArrowLeft, Mail, UserRound } from "lucide-react";
import { useRouter } from "next/navigation";
import { auth } from "@/lib/firebase";

export default function ProfilePage() {
  const router = useRouter();
  const user = auth.currentUser;

  return (
    <main className="min-h-screen bg-[#05050a] px-5 py-8 text-white">
      <div className="mx-auto max-w-2xl">
        <button onClick={() => router.push("/")} className="mb-8 flex items-center gap-2 text-sm text-white/50 hover:text-white">
          <ArrowLeft size={17} /> Back to Theon
        </button>
        <h1 className="text-3xl font-semibold">Profile</h1>
        <div className="mt-8 rounded-3xl border border-white/10 bg-white/[0.04] p-6">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-violet-600 to-cyan-500 text-xl font-semibold">
              {(user?.displayName?.[0] || user?.email?.[0] || "T").toUpperCase()}
            </div>
            <div>
              <p className="text-lg font-medium">{user?.displayName || "Theon user"}</p>
              <p className="mt-1 flex items-center gap-1.5 text-sm text-white/40"><Mail size={14} /> {user?.email || "Signed-in account"}</p>
            </div>
          </div>
          <div className="mt-7 border-t border-white/10 pt-5 text-sm text-white/35">
            <p className="flex items-center gap-2"><UserRound size={15} /> Account profile is managed through your authentication provider.</p>
          </div>
        </div>
      </div>
    </main>
  );
}
