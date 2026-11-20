import type { Metadata } from 'next';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { getProducts } from '@/lib/queries';
import { ProductCard } from '@/components/store/product-card';

export const metadata: Metadata = {
  title: 'Saved phones',
  robots: { index: false, follow: false },
};

export const dynamic = 'force-dynamic';

export default async function WishlistPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect('/login?next=/wishlist');

  const [{ data: saved }, products] = await Promise.all([
    supabase.from('wishlists').select('product_id').eq('user_id', user.id),
    getProducts(),
  ]);
  const ids = new Set((saved ?? []).map((row) => row.product_id));
  const items = products.filter((product) => ids.has(product.id));

  return (
    <div className="container-page py-10 sm:py-14">
      <p className="eyebrow text-signal">Your list</p>
      <h1 className="mt-2 text-3xl font-semibold text-ink">Saved phones</h1>
      <p className="mt-2 text-sm text-muted">{items.length} saved.</p>

      {items.length === 0 ? (
        <div className="mt-7 rounded-2xl border border-line bg-white p-10 text-center">
          <p className="text-sm text-muted">You have not saved any phones yet.</p>
          <Link href="/shop" className="btn-primary mt-5 inline-flex">Browse phones</Link>
        </div>
      ) : (
        <div className="mt-7 grid grid-cols-2 gap-x-4 gap-y-9 sm:grid-cols-3 lg:grid-cols-4 lg:gap-x-6">
          {items.map((product, index) => (
            <ProductCard key={product.id} product={product} priority={index < 4} />
          ))}
        </div>
      )}
    </div>
  );
}
