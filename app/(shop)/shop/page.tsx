import type { Metadata } from 'next';
import Link from 'next/link';
import { Search, SlidersHorizontal, X } from 'lucide-react';
import { getBrands, getCategories, getProducts } from '@/lib/queries';
import { ProductCard } from '@/components/store/product-card';
import { ShopSort } from '@/components/store/shop-sort';

export const revalidate = 300;

export const metadata: Metadata = {
  title: 'Shop phones in Abuja',
  description:
    'Browse the Directlines phone catalogue in Karu, Abuja. Infinix, TECNO, Samsung, itel and Redmi with current prices and EasyBuy options.',
  alternates: { canonical: '/shop' },
};

interface Params {
  category?: string;
  brand?: string;
  min?: string;
  max?: string;
  q?: string;
  sort?: string;
}

function withParams(params: Params, patch: Partial<Params>): string {
  const next = new URLSearchParams();
  const merged = { ...params, ...patch };
  for (const [key, value] of Object.entries(merged)) {
    if (value !== undefined && value !== '') next.set(key, String(value));
  }
  return next.toString() ? `/shop?${next.toString()}` : '/shop';
}

export default async function ShopPage({ searchParams }: { searchParams: Promise<Params> }) {
  const params = await searchParams;
  const [products, categories, brands] = await Promise.all([getProducts(), getCategories(), getBrands()]);

  const q = (params.q ?? '').trim().toLowerCase();
  const min = params.min ? Number(params.min) : null;
  const max = params.max ? Number(params.max) : null;

  let filtered = products.filter((product) => {
    if (params.category && product.categories?.slug !== params.category) return false;
    if (params.brand && product.brands?.slug !== params.brand) return false;
    if (min !== null && product.price < min) return false;
    if (max !== null && product.price > max) return false;
    if (q) {
      const haystack = [
        product.name,
        product.short_description ?? '',
        product.brands?.name ?? '',
        product.categories?.name ?? '',
        ...(product.tags ?? []),
        ...Object.values(product.specs ?? {}),
        ...product.product_variants.map((variant) => variant.label),
      ]
        .join(' ')
        .toLowerCase();
      if (!haystack.includes(q)) return false;
    }
    return true;
  });

  const sort = params.sort ?? 'featured';
  if (sort === 'price-asc') filtered = [...filtered].sort((a, b) => a.price - b.price);
  else if (sort === 'price-desc') filtered = [...filtered].sort((a, b) => b.price - a.price);
  else if (sort === 'name') filtered = [...filtered].sort((a, b) => a.name.localeCompare(b.name));
  else filtered = [...filtered].sort((a, b) => Number(b.is_featured) - Number(a.is_featured));

  const activeCategory = categories.find((category) => category.slug === params.category);
  const activeBrand = brands.find((brand) => brand.slug === params.brand);
  const hasFilters = Boolean(params.category || params.brand || params.min || params.max || q);

  return (
    <div className="container-page py-10 sm:py-14">
      <nav className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.14em] text-muted" aria-label="Breadcrumb">
        <Link href="/" className="hover:text-ink">Home</Link>
        <span>/</span>
        <span className="text-ink">Shop</span>
      </nav>

      <header className="mt-6 max-w-2xl">
        <p className="eyebrow text-signal">{activeCategory ? activeCategory.name : 'The catalogue'}</p>
        <h1 className="mt-2 text-3xl font-semibold text-ink sm:text-4xl">
          {activeCategory ? activeCategory.name : activeBrand ? `${activeBrand.name} phones` : 'All phones'}
        </h1>
        <p className="mt-3 text-sm leading-relaxed text-muted">
          {activeCategory?.description ??
            (activeBrand
              ? `Every ${activeBrand.name} model currently listed by Directlines in Karu, Abuja.`
              : 'Brand-new phones with current store prices. Confirm colour, storage and stock on WhatsApp before paying.')}
        </p>
      </header>

      <form action="/shop" className="mt-7 flex flex-col gap-3 sm:flex-row">
        {params.category ? <input type="hidden" name="category" value={params.category} /> : null}
        {params.brand ? <input type="hidden" name="brand" value={params.brand} /> : null}
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
          <input
            name="q"
            defaultValue={params.q ?? ''}
            placeholder="Search model, storage or brand"
            className="field pl-9"
          />
        </div>
        <button type="submit" className="btn-primary sm:w-auto">Search</button>
      </form>

      <div className="mt-7 flex flex-wrap items-center gap-2">
        <Link
          href={withParams(params, { category: undefined, brand: undefined, min: undefined, max: undefined, q: undefined })}
          className={`rounded-full border px-3.5 py-1.5 text-[10px] font-bold uppercase tracking-[0.13em] ${
            !params.category && !params.brand ? 'border-ink bg-ink text-white' : 'border-line bg-white text-ink-soft hover:border-ink'
          }`}
        >
          All
        </Link>
        {categories.map((category) => (
          <Link
            key={category.slug}
            href={withParams(params, { category: params.category === category.slug ? undefined : category.slug })}
            className={`rounded-full border px-3.5 py-1.5 text-[10px] font-bold uppercase tracking-[0.13em] ${
              params.category === category.slug ? 'border-ink bg-ink text-white' : 'border-line bg-white text-ink-soft hover:border-ink'
            }`}
          >
            {category.name}
          </Link>
        ))}
        <span className="mx-1 hidden h-5 w-px bg-line sm:block" />
        {brands.map((brand) => (
          <Link
            key={brand.slug}
            href={withParams(params, { brand: params.brand === brand.slug ? undefined : brand.slug })}
            className={`rounded-full border px-3.5 py-1.5 text-[10px] font-bold uppercase tracking-[0.13em] ${
              params.brand === brand.slug ? 'border-signal bg-signal-soft text-signal' : 'border-line bg-white text-ink-soft hover:border-ink'
            }`}
          >
            {brand.name}
          </Link>
        ))}
      </div>

      <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-y border-line py-3">
        <div className="flex items-center gap-2">
          <SlidersHorizontal className="h-3.5 w-3.5 text-muted" />
          <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-muted">
            {filtered.length} {filtered.length === 1 ? 'phone' : 'phones'}
            {q ? ` for “${params.q}”` : ''}
          </p>
          {hasFilters ? (
            <Link href="/shop" className="inline-flex items-center gap-1 rounded-full bg-paper-deep px-2.5 py-1 text-[9px] font-bold uppercase tracking-[0.12em] text-muted hover:text-ink">
              <X className="h-2.5 w-2.5" /> Clear
            </Link>
          ) : null}
        </div>
        <ShopSort value={sort} />
      </div>

      {filtered.length === 0 ? (
        <div className="mt-12 rounded-2xl border border-line bg-white p-12 text-center">
          <p className="text-sm text-muted">No phones match this search.</p>
          <Link href="/shop" className="btn-primary mt-5 inline-flex">Clear filters</Link>
        </div>
      ) : (
        <div className="mt-8 grid grid-cols-2 gap-x-4 gap-y-9 sm:grid-cols-3 lg:grid-cols-4 lg:gap-x-6">
          {filtered.map((product, index) => (
            <ProductCard key={product.id} product={product} priority={index < 4} />
          ))}
        </div>
      )}

      <div className="mt-14 rounded-2xl border border-line bg-white p-6 sm:flex sm:items-center sm:justify-between sm:gap-6">
        <div>
          <p className="text-sm font-semibold text-ink">Looking for a model that is not listed?</p>
          <p className="mt-1 text-xs text-muted">Send us the model and storage you want. We will confirm availability and price.</p>
        </div>
        <Link href="/contact" className="btn-secondary mt-4 shrink-0 sm:mt-0">Ask the store</Link>
      </div>
    </div>
  );
}
