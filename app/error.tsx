'use client';

import Link from 'next/link';

export default function ErrorPage({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <main className="flex min-h-screen items-center justify-center bg-paper px-6 py-16">
      <div className="max-w-md text-center">
        <p className="eyebrow text-signal">Something went wrong</p>
        <h1 className="mt-3 text-3xl font-semibold text-ink">The page could not load.</h1>
        <p className="mt-3 text-sm leading-relaxed text-muted">
          Try again. If it keeps happening, message the store on WhatsApp.
        </p>
        <div className="mt-6 flex justify-center gap-3">
          <button onClick={reset} className="btn-primary">Try again</button>
          <Link href="/" className="btn-secondary">Go home</Link>
        </div>
      </div>
    </main>
  );
}
