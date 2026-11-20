import Link from 'next/link';

export default function NotFound() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-paper px-6 py-16">
      <div className="max-w-md text-center">
        <p className="eyebrow text-signal">404</p>
        <h1 className="mt-3 text-3xl font-semibold text-ink">That page is not here.</h1>
        <p className="mt-3 text-sm leading-relaxed text-muted">
          The link may be old, or the phone may have moved. The catalogue and current prices are on the shop page.
        </p>
        <div className="mt-6 flex justify-center gap-3">
          <Link href="/shop" className="btn-primary">Shop phones</Link>
          <Link href="/" className="btn-secondary">Go home</Link>
        </div>
      </div>
    </main>
  );
}
