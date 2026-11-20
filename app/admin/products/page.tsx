import Link from 'next/link';
import { ArrowUpRight, Pencil, Plus, Search } from 'lucide-react';
import { createAdminClient } from '@/lib/supabase/admin';
import { formatNaira } from '@/lib/format';
import { siteMediaUrl } from '@/lib/storage';
import {
  AdminBanner,
  PageHeader,
  buttonClass,
  cardClass,
  inputClass,
  secondaryButtonClass,
} from '@/components/admin/ui';
import { bulkUpdatePrices } from '../actions';

export const dynamic = 'force-dynamic';

export default async function AdminProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; category?: string; saved?: string; err?: string }>;
}) {
  const params = await searchParams;
  const admin = createAdminClient();
  const [productsResult, categoriesResult] = await Promise.all([
    admin
      .from('products')
      .select('id, slug, name, price, is_active, is_featured, badge, created_at, categories(name), brands(name), product_images(url, sort_order), product_variants(id, price, stock, is_active)')
      .order('sort_order', { ascending: true })
      .order('created_at', { ascending: false }),
    admin.from('categories').select('id, name').order('sort_order'),
  ]);
  const categories = categoriesResult.data ?? [];
  let rows = productsResult.data ?? [];

  if (params.q) {
    const q = params.q.toLowerCase();
    rows = rows.filter((row) => `${row.name} ${row.slug}`.toLowerCase().includes(q));
  }
  if (params.category) {
    rows = rows.filter((row) => (row.categories as unknown as { name: string } | null)?.name === params.category);
  }

  return (
    <div>
      <PageHeader
        title="Products"
        subtitle="Prices, stock, photos and product pages."
        action={
          <Link href="/admin/products/new" className={buttonClass}>
            <Plus className="h-4 w-4" /> New product
          </Link>
        }
      />
      <AdminBanner saved={params.saved === '1'} err={params.err ?? null} />

      <div className="grid gap-6 lg:grid-cols-[1fr_300px]">
        <div>
          <form className="mb-4 flex flex-col gap-2 sm:flex-row">
            <div className="relative flex-1">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
              <input name="q" defaultValue={params.q ?? ''} placeholder="Search products" className={`${inputClass} pl-9`} />
            </div>
            <select name="category" defaultValue={params.category ?? ''} className={inputClass + ' sm:w-48'}>
              <option value="">All categories</option>
              {categories.map((category) => (
                <option key={category.id} value={category.name}>{category.name}</option>
              ))}
            </select>
            <button type="submit" className={secondaryButtonClass}>Filter</button>
          </form>

          <div className={cardClass + ' !p-0'}>
            <div className="hidden grid-cols-[2.2fr_1fr_0.8fr_1fr_auto] gap-4 border-b border-line px-5 py-3 text-[9px] font-bold uppercase tracking-[0.14em] text-muted md:grid">
              <span>Product</span>
              <span>Category</span>
              <span>Options</span>
              <span>Price</span>
              <span />
            </div>
            <div className="divide-y divide-line">
              {rows.map((product) => {
                const images = [...(product.product_images ?? [])].sort((a, b) => a.sort_order - b.sort_order);
                const variants = product.product_variants ?? [];
                const stock = variants.reduce((sum, variant) => sum + (variant.stock ?? 0), 0);
                return (
                  <div key={product.id} className="grid grid-cols-1 gap-3 px-5 py-4 md:grid-cols-[2.2fr_1fr_0.8fr_1fr_auto] md:items-center md:gap-4">
                    <div className="flex min-w-0 items-center gap-3">
                      <div className="relative h-14 w-12 shrink-0 overflow-hidden rounded-lg border border-line bg-paper">
                        {images[0]?.url ? <img src={siteMediaUrl(images[0].url)} alt="" className="h-full w-full object-contain p-1" /> : null}
                      </div>
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold text-ink">{product.name}</p>
                        <div className="mt-1 flex flex-wrap items-center gap-1.5">
                          {product.is_active ? <span className="text-[9px] font-bold uppercase tracking-[0.1em] text-emerald-600">Live</span> : <span className="text-[9px] font-bold uppercase tracking-[0.1em] text-muted">Hidden</span>}
                          {product.is_featured ? <span className="text-[9px] font-bold uppercase tracking-[0.1em] text-signal">Featured</span> : null}
                          {product.badge ? <span className="rounded-full bg-paper-deep px-2 py-0.5 text-[8px] font-bold uppercase tracking-[0.08em] text-muted">{product.badge}</span> : null}
                        </div>
                      </div>
                    </div>
                    <p className="text-xs text-muted">{(product.categories as unknown as { name: string } | null)?.name ?? '—'}</p>
                    <p className="text-xs text-muted">{variants.length} {variants.length === 1 ? 'option' : 'options'}{stock > 0 ? ` · ${stock} units` : ''}</p>
                    <p className="price text-sm font-semibold">{formatNaira(product.price)}</p>
                    <div className="flex items-center gap-1.5">
                      <Link href={`/admin/products/${product.id}`} className="grid h-9 w-9 place-items-center rounded-lg border border-line text-muted hover:border-ink hover:text-ink" aria-label={`Edit ${product.name}`}>
                        <Pencil className="h-3.5 w-3.5" />
                      </Link>
                      <Link href={`/product/${product.slug}`} target="_blank" className="grid h-9 w-9 place-items-center rounded-lg border border-line text-muted hover:border-ink hover:text-ink" aria-label="View product">
                        <ArrowUpRight className="h-3.5 w-3.5" />
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
            {!rows.length ? <p className="p-8 text-center text-sm text-muted">No products match this filter.</p> : null}
          </div>
        </div>

        <aside className="space-y-4">
          <div className={cardClass}>
            <p className="text-sm font-semibold text-ink">Bulk price update</p>
            <p className="mt-1 text-[11px] leading-relaxed text-muted">Apply to all products or one category. Use a negative amount to reduce.</p>
            <form action={bulkUpdatePrices} className="mt-4 space-y-3">
              <select name="mode" className={inputClass}>
                <option value="increase_percent">Increase by percent</option>
                <option value="decrease_percent">Decrease by percent</option>
                <option value="increase_amount">Increase by ₦ amount</option>
                <option value="decrease_amount">Decrease by ₦ amount</option>
              </select>
              <input name="value" className={inputClass} inputMode="numeric" placeholder="Value, e.g. 5" required />
              <select name="category_id" className={inputClass}>
                <option value="">All categories</option>
                {categories.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}
              </select>
              <button type="submit" className={`${secondaryButtonClass} w-full`}>Update prices</button>
            </form>
            <p className="mt-3 text-[10px] leading-relaxed text-muted">This changes the base price only. Variant prices are edited on each product.</p>
          </div>

          <div className={cardClass}>
            <p className="text-sm font-semibold text-ink">Catalogue health</p>
            <div className="mt-3 space-y-2 text-xs">
              <div className="flex justify-between"><span className="text-muted">Live products</span><span className="font-semibold">{rows.filter((row) => row.is_active).length}</span></div>
              <div className="flex justify-between"><span className="text-muted">Hidden</span><span className="font-semibold">{rows.filter((row) => !row.is_active).length}</span></div>
              <div className="flex justify-between"><span className="text-muted">Featured</span><span className="font-semibold">{rows.filter((row) => row.is_featured).length}</span></div>
              <div className="flex justify-between"><span className="text-muted">With stock count</span><span className="font-semibold">{rows.filter((row) => row.product_variants?.some((variant) => variant.stock !== null)).length}</span></div>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
