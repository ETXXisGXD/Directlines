import Link from 'next/link';
import { ArrowUpRight, Zap } from 'lucide-react';
import type { Product } from '@/lib/queries';
import { formatNaira } from '@/lib/format';
import { firstImage } from '@/lib/storage';
import { ProductVisual } from './product-visual';
import { CompareToggle } from '@/components/compare/compare-toggle';

export function ProductCard({ product, priority = false }: { product: Product; priority?: boolean }) {
  const variants = product.product_variants;
  const minPrice = variants.length ? Math.min(...variants.map((variant) => Number(variant.price))) : Number(product.price);
  const hasMultiple = variants.length > 1;
  const label = variants.length === 1 ? variants[0].label : null;
  const image = firstImage(product.product_images);

  return (
    <article className="group relative">
      <div className="absolute right-3 top-3 z-10">
        <CompareToggle item={{ id: product.id, slug: product.slug, name: product.name, price: minPrice, image }} />
      </div>
      <Link href={`/product/${product.slug}`} className="block">
        <div className="relative aspect-[4/5] overflow-hidden rounded-2xl border border-line bg-white transition-shadow group-hover:shadow-[0_24px_50px_-30px_rgba(20,43,88,0.45)]">
          <ProductVisual
            image={image}
            name={product.name}
            brand={product.brands?.name}
            priority={priority}
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
          />
          <div className="absolute left-3 top-3 flex flex-col items-start gap-1.5">
            {product.badge ? (
              <span className="rounded-full bg-[#142b58] px-2.5 py-1 text-[8px] font-bold uppercase tracking-[0.16em] text-white">
                {product.badge}
              </span>
            ) : null}
            {product.easybuy_eligible ? (
              <span className="inline-flex items-center gap-1 rounded-full bg-white/90 px-2.5 py-1 text-[8px] font-bold uppercase tracking-[0.14em] text-[#142b58] shadow-sm backdrop-blur">
                <Zap className="h-2.5 w-2.5 text-signal" />
                EasyBuy
              </span>
            ) : null}
          </div>
          <span className="absolute bottom-3 right-3 grid h-8 w-8 place-items-center rounded-full bg-white text-ink shadow-sm opacity-0 transition-opacity group-hover:opacity-100">
            <ArrowUpRight className="h-3.5 w-3.5" />
          </span>
        </div>
      </Link>

      <div className="mt-3.5 px-0.5">
        <p className="text-[9px] font-bold uppercase tracking-[0.18em] text-muted">
          {product.brands?.name ?? 'Directlines'}
        </p>
        <Link href={`/product/${product.slug}`} className="mt-1 block">
          <h3 className="text-sm font-semibold leading-snug text-ink hover:text-signal">{product.name}</h3>
        </Link>
        <p className="mt-1 text-[11px] text-muted">
          {label ?? `${variants.length} options`}
        </p>
        <div className="mt-2 flex items-baseline gap-2">
          <p className="price text-[15px] font-semibold text-ink">
            {hasMultiple ? `from ${formatNaira(minPrice)}` : formatNaira(minPrice)}
          </p>
        </div>
      </div>
    </article>
  );
}

