'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { Check, Minus, Plus, ShoppingBag, Zap } from 'lucide-react';
import type { Product } from '@/lib/queries';
import { formatNaira } from '@/lib/format';
import { createWhatsAppUrl } from '@/lib/whatsapp';
import { useCart } from '@/components/cart/cart-context';
import { trackEvent } from '@/lib/track-client';

export function ProductPurchase({
  product,
  image,
  whatsappNumber,
  easybuyEnabled,
}: {
  product: Product;
  image: string;
  whatsappNumber: string;
  easybuyEnabled: boolean;
}) {
  const variants = product.product_variants;
  const [variantId, setVariantId] = useState(variants[0]?.id ?? '');
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);
  const { add } = useCart();

  const variant = useMemo(() => variants.find((item) => item.id === variantId) ?? variants[0], [variants, variantId]);
  const outOfStock = variant ? variant.stock === 0 : true;
  const price = Number(variant?.price ?? product.price);

  function handleAdd() {
    if (!variant || outOfStock) return;
    add({
      variantId: variant.id,
      productId: product.id,
      slug: product.slug,
      name: product.name,
      price,
      label: variant.label,
      color: variant.color,
      image,
      quantity,
    });
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  }

  function handleWhatsApp() {
    if (!variant) return;
    trackEvent('whatsapp_click', { source: 'product_page', product: product.slug });
    const message = `Hello Directlines! I want to order:\n\n${product.name}\n${variant.label}${variant.color ? `, ${variant.color}` : ''}\nQuantity: ${quantity}\nPrice: ${formatNaira(price * quantity)}\n\nLink: ${window.location.href}\n\nPlease confirm availability and payment details.`;
    window.open(createWhatsAppUrl(whatsappNumber, message), '_blank', 'noopener,noreferrer');
  }

  if (!variant) {
    return (
      <div className="rounded-xl border border-signal/20 bg-signal-soft p-4 text-sm text-signal">
        This phone is not available right now. Message us on WhatsApp to check the next restock.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center justify-between">
          <p className="label mb-0">Choose option</p>
          {outOfStock ? <span className="text-[10px] font-bold uppercase tracking-[0.14em] text-signal">Out of stock</span> : null}
        </div>
        <div className="mt-2.5 flex flex-wrap gap-2">
          {variants.map((option) => {
            const disabled = option.stock === 0;
            return (
              <button
                key={option.id}
                type="button"
                onClick={() => setVariantId(option.id)}
                disabled={disabled}
                className={`rounded-xl border px-4 py-2.5 text-left text-xs font-semibold transition-colors ${
                  variantId === option.id
                    ? 'border-ink bg-ink text-white'
                    : disabled
                      ? 'cursor-not-allowed border-line bg-paper text-muted line-through'
                      : 'border-line bg-white text-ink hover:border-line-strong'
                }`}
              >
                <span className="block">{option.label}</span>
                <span className={`price mt-0.5 block text-[10px] font-normal ${variantId === option.id ? 'text-white/65' : 'text-muted'}`}>
                  {formatNaira(option.price)}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="flex items-end justify-between gap-4">
        <div>
          <p className="price text-3xl font-semibold text-ink">{formatNaira(price * quantity)}</p>
          <p className="mt-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-muted">
            {variant.stock === null ? 'Available to order' : variant.stock > 0 ? `${variant.stock} in stock` : 'Out of stock'}
          </p>
        </div>
        <div className="flex items-center rounded-xl border border-line bg-white">
          <button
            type="button"
            onClick={() => setQuantity((value) => Math.max(1, value - 1))}
            className="p-3 text-muted hover:text-ink disabled:opacity-30"
            disabled={quantity <= 1}
            aria-label="Decrease quantity"
          >
            <Minus className="h-3.5 w-3.5" />
          </button>
          <span className="min-w-8 text-center text-sm font-semibold">{quantity}</span>
          <button
            type="button"
            onClick={() => setQuantity((value) => Math.min(20, value + 1))}
            className="p-3 text-muted hover:text-ink"
            aria-label="Increase quantity"
          >
            <Plus className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      <div className="grid gap-2.5">
        <button type="button" onClick={handleAdd} disabled={outOfStock} className="btn-primary w-full disabled:cursor-not-allowed disabled:opacity-40">
          {added ? <Check className="h-4 w-4" /> : <ShoppingBag className="h-4 w-4" />}
          {added ? 'Added to cart' : 'Add to cart'}
        </button>
        <button type="button" onClick={handleWhatsApp} disabled={outOfStock} className="btn-secondary w-full disabled:opacity-40">
          Order on WhatsApp
        </button>
        {easybuyEnabled && product.easybuy_eligible ? (
          <Link
            href={`/easybuy?model=${encodeURIComponent(product.name)}&product=${product.slug}`}
            className="flex min-h-11 items-center justify-center gap-2 rounded-xl border border-signal/20 bg-signal-soft text-[10px] font-bold uppercase tracking-[0.15em] text-signal hover:bg-[#fee2e2]"
          >
            <Zap className="h-3.5 w-3.5" />
            Apply for EasyBuy
          </Link>
        ) : null}
      </div>

      <p className="text-[10px] leading-relaxed text-muted">
        Price shown is the current store price. Confirm colour, full specification and stock on WhatsApp
        before paying. No card is charged on this website.
      </p>
    </div>
  );
}

