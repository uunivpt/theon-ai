"use client";

import { Suspense } from "react";
import { Loader2 } from "lucide-react";
import StudyWorkspace from "@/components/StudyWorkspace";

export default function StudyRoomPage() {
  return <Suspense fallback={<main className="min-h-[100dvh] bg-[#07070a] text-white flex items-center justify-center text-xs text-white/35"><Loader2 size={17} className="mr-2 animate-spin"/> Opening Study Room…</main>}><StudyWorkspace /></Suspense>;
}
