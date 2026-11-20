'use client';

import Image from 'next/image';
import Link from 'next/link';
import { CheckCircle2, Trash2, Zap } from 'lucide-react';
import type { Product } from '@/lib/queries';
import { conditionLabel, formatNaira } from '@/lib/format';
import { firstImage } from '@/lib/storage';
import { useCompare } from '@/components/compare/compare-context';

const specValue = (product: Product, key: string) => product.specs?.[key] ?? '';

export function CompareView({ products }: { products: Product[] }) {
  const { items, remove, clear } = useCompare();
  const selected = items
    .map((item) => products.find((product) => product.id === item.id))
    .filter((product): product is Product => Boolean(product));

  if (!selected.length) {
    return (
      <div className="rounded-2xl border border-line bg-white p-12 text-center">
        <p className="text-sm text-muted">No phones in the comparison yet.</p>
        <p className="mt-1 text-xs text-muted">Add up to four phones from the shop or product pages.</p>
        <Link href="/shop" className="btn-primary mt-5 inline-flex">Browse phones</Link>
      </div>
    );
  }

  const rows: Array<{ label: string; value: (product: Product) => string }> = [
    { label: 'Price', value: (product) => formatNaira(product.price) },
    { label: 'Brand', value: (product) => product.brands?.name ?? '—' },
    { label: 'Category', value: (product) => product.categories?.name ?? '—' },
    { label: 'Condition', value: (product) => conditionLabel(product.condition) },
    { label: 'RAM', value: (product) => specValue(product, 'ram') || 'Ask the store' },
    { label: 'Storage', value: (product) => specValue(product, 'storage') || product.product_variants.map((variant) => variant.label).join(' / ') || 'Ask the store' },
    { label: 'Battery', value: (product) => specValue(product, 'battery') || 'Ask the store' },
    { label: 'Warranty', value: (product) => product.warranty ?? 'Warranty support' },
    { label: 'EasyBuy', value: (product) => (product.easybuy_eligible ? 'Eligible to apply' : 'Not eligible') },
    { label: 'Options', value: (product) => product.product_variants.map((variant) => variant.label).join(', ') || 'Standard' },
  ];

  return (
    <div>
      <div className="mb-4 flex items-center justify-between gap-3">
        <p className="text-xs text-muted">{selected.length} of 4 phones selected.</p>
        <button type="button" onClick={clear} className="text-[10px] font-bold uppercase tracking-[0.12em] text-muted hover:text-signal">Clear all</button>
      </div>

      <div className="overflow-x-auto rounded-2xl border border-line bg-white custom-scrollbar">
        <div className="min-w-[720px]">
          <div className="grid border-b border-line" style={{ gridTemplateColumns: `160px repeat(${selected.length}, minmax(170px, 1fr))` }}>
            <div className="border-r border-line bg-paper p-4">
              <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-muted">Compare</p>
            </div>
            {selected.map((product) => (
              <div key={product.id} className="relative border-r border-line p-4 last:border-r-0">
                <button type="button" onClick={() => remove(product.id)} className="absolute right-3 top-3 grid h-7 w-7 place-items-center rounded-lg text-muted hover:bg-signal-soft hover:text-signal" aria-label={`Remove ${product.name}`}>
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
                <Link href={`/product/${product.slug}`}>
                  <div className="relative mx-auto h-28 w-24">
                    {firstImage(product.product_images) ? (
                      <Image src={firstImage(product.product_images)} alt={product.name} fill sizes="96px" className="object-contain mix-blend-multiply" />
                    ) : (
                      <div className="grid h-full w-full place-items-center rounded-lg bg-paper text-[9px] uppercase tracking-[0.12em] text-muted">Photo on request</div>
                    )}
                  </div>
                  <p className="mt-2 text-xs font-semibold text-ink hover:text-signal">{product.name}</p>
                </Link>
                <p className="price mt-1 text-sm font-semibold text-ink">{formatNaira(product.price)}</p>
                <Link href={`/product/${product.slug}`} className="mt-2 inline-flex text-[9px] font-bold uppercase tracking-[0.12em] text-[#0284c7]">View phone</Link>
              </div>
            ))}
          </div>

          {rows.map((row) => {
            const values = selected.map(row.value);
            const differs = new Set(values).size > 1;
            return (
              <div key={row.label} className="grid border-b border-line last:border-b-0" style={{ gridTemplateColumns: `160px repeat(${selected.length}, minmax(170px, 1fr))` }}>
                <div className="border-r border-line bg-paper p-3 text-[10px] font-bold uppercase tracking-[0.12em] text-muted">{row.label}</div>
                {selected.map((product, index) => (
                  <div key={product.id} className={`border-r border-line p-3 text-xs last:border-r-0 ${differs ? 'bg-[#f8fbff]' : ''}`}>
                    <span className={differs ? 'font-semibold text-ink' : 'text-muted'}>{values[index]}</span>
                  </div>
                ))}
              </div>
            );
          })}

          <div className="grid border-t border-line" style={{ gridTemplateColumns: `160px repeat(${selected.length}, minmax(170px, 1fr))` }}>
            <div className="border-r border-line bg-paper p-3" />
            {selected.map((product) => (
              <div key={product.id} className="border-r border-line p-3 last:border-r-0">
                <Link href={`/product/${product.slug}`} className="btn-primary w-full !min-h-0 !py-2.5 !text-[9px]">View &amp; order</Link>
                {product.easybuy_eligible ? (
                  <Link href={`/easybuy?model=${encodeURIComponent(product.name)}&product=${product.slug}`} className="mt-2 flex items-center justify-center gap-1 text-[9px] font-bold uppercase tracking-[0.1em] text-[#c2410c] hover:text-[#9a3412]">
                    <Zap className="h-3 w-3" /> EasyBuy
                  </Link>
                ) : null}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
