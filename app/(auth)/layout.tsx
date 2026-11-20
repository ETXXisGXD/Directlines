import Link from 'next/link';
import { OfficialLogo } from '@/components/layout/official-logo';

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-paper">
      <header className="border-b border-line bg-white">
        <div className="container-page flex h-18 items-center justify-between">
          <Link href="/" aria-label="Directlines home"><OfficialLogo size="sm" /></Link>
          <Link href="/shop" className="text-[10px] font-bold uppercase tracking-[0.14em] text-muted hover:text-ink">
            Back to shop
          </Link>
        </div>
      </header>
      <main className="container-page flex min-h-[calc(100vh-4.5rem)] items-center justify-center py-12">
        {children}
      </main>
    </div>
  );
}

