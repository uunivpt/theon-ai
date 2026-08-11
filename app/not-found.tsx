import Link from "next/link";

export default function NotFound() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 px-5">
      <section className="w-full max-w-md rounded-3xl bg-white p-8 text-center shadow-xl ring-1 ring-slate-200">
        <p className="text-5xl font-bold tracking-tight text-slate-900">404</p>
        <h1 className="mt-3 text-xl font-semibold">That page isn't here.</h1>
        <p className="mt-2 text-sm text-slate-500">The link may be outdated or the page may have moved.</p>
        <Link href="/" className="mt-6 inline-flex rounded-xl bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white">Back to Theon</Link>
      </section>
    </main>
  );
}
