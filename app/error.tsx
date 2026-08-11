"use client";

import { useEffect } from "react";

export default function GlobalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => { console.error("Theon UI error", error); }, [error]);
  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 px-5">
      <section className="w-full max-w-md rounded-3xl bg-white p-7 text-center shadow-xl ring-1 ring-slate-200">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-900 text-white">!</div>
        <h1 className="text-xl font-semibold text-slate-900">Theon hit a temporary problem</h1>
        <p className="mt-2 text-sm leading-6 text-slate-500">Your conversation is safe. Try the page again, or return to the home screen.</p>
        <div className="mt-5 flex justify-center gap-3">
          <button onClick={() => reset()} className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white">Try again</button>
          <a href="/" className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700">Home</a>
        </div>
      </section>
    </main>
  );
}
