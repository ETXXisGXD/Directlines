import type { Metadata } from 'next';
import Link from 'next/link';
import { getProducts } from '@/lib/queries';
import { CompareView } from './compare-view';

export const metadata: Metadata = {
  title: 'Compare phones',
  description: 'Compare Directlines phones side by side: price, storage, battery, warranty and EasyBuy.',
  robots: { index: false, follow: false },
};

export const revalidate = 300;

export default async function ComparePage() {
  const products = await getProducts();

  return (
    <div className="container-page py-10 sm:py-14">
      <nav className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.14em] text-muted" aria-label="Breadcrumb">
        <Link href="/" className="hover:text-ink">Home</Link>
        <span>/</span>
        <span className="text-ink">Compare</span>
      </nav>
      <header className="mt-6 max-w-2xl">
        <p className="eyebrow text-signal">Side by side</p>
        <h1 className="mt-2 text-3xl font-semibold text-ink sm:text-4xl">Compare phones</h1>
        <p className="mt-3 text-sm leading-relaxed text-muted">
          Price, storage, battery, warranty and EasyBuy at a glance. Add up to four phones from the shop.
        </p>
      </header>
      <div className="mt-8">
        <CompareView products={products} />
      </div>
    </div>
  );
}
