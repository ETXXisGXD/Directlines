'use client';

export default function GlobalError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <html lang="en">
      <body style={{ background: '#f6f7f9', color: '#142b58', fontFamily: 'Arial, sans-serif' }}>
        <main style={{ minHeight: '100vh', display: 'grid', placeItems: 'center', padding: 24 }}>
          <div style={{ maxWidth: 420, textAlign: 'center' }}>
            <p style={{ color: '#dc2626', fontSize: 11, letterSpacing: 3, textTransform: 'uppercase', fontWeight: 700 }}>Directlines</p>
            <h1 style={{ fontSize: 28, marginTop: 12 }}>The page could not load.</h1>
            <p style={{ color: '#5c6676', fontSize: 14, lineHeight: 1.7 }}>Try again. If it keeps happening, message the store on WhatsApp.</p>
            <button onClick={reset} style={{ marginTop: 20, background: '#dc2626', color: 'white', border: 0, borderRadius: 10, padding: '14px 22px', fontWeight: 700, letterSpacing: 1.5, textTransform: 'uppercase', fontSize: 11 }}>Try again</button>
          </div>
        </main>
      </body>
    </html>
  );
}

