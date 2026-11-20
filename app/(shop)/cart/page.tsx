'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Minus, Plus, ShoppingBag, Trash2 } from 'lucide-react';
import { useCart } from '@/components/cart/cart-context';
import { formatNaira } from '@/lib/format';

export default function CartPage() {
  const { items, subtotal, setQuantity, remove } = useCart();

  return (
    <div className="container-page py-10 sm:py-14">
      <p className="eyebrow text-signal">Your cart</p>
      <h1 className="mt-2 text-3xl font-semibold text-ink sm:text-4xl">Review your phones</h1>

      {items.length === 0 ? (
        <div className="mt-8 rounded-2xl border border-line bg-white p-12 text-center">
          <ShoppingBag className="mx-auto h-7 w-7 text-muted" />
          <p className="mt-4 text-sm text-muted">Your cart is empty.</p>
          <Link href="/shop" className="btn-primary mt-5 inline-flex">Browse phones</Link>
        </div>
      ) : (
        <div className="mt-8 grid gap-8 lg:grid-cols-[1.4fr_0.6fr] lg:items-start">
          <div className="rounded-2xl border border-line bg-white">
            <div className="divide-y divide-line">
              {items.map((item) => (
                <div key={item.variantId} className="flex gap-4 p-4 sm:p-5">
                  <Link href={`/product/${item.slug}`} className="relative h-24 w-20 shrink-0 overflow-hidden rounded-xl border border-line bg-paper">
                    {item.image ? <Image src={item.image} alt={item.name} fill sizes="80px" className="object-contain p-2" /> : null}
                  </Link>
                  <div className="flex min-w-0 flex-1 flex-col">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <Link href={`/product/${item.slug}`} className="text-sm font-semibold text-ink hover:text-signal">{item.name}</Link>
                        <p className="mt-1 text-[11px] text-muted">{item.label}{item.color ? ` · ${item.color}` : ''}</p>
                      </div>
                      <p className="price shrink-0 text-sm font-semibold">{formatNaira(item.price * item.quantity)}</p>
                    </div>
                    <div className="mt-auto flex items-center gap-2 pt-3">
                      <div className="flex items-center rounded-lg border border-line">
                        <button onClick={() => setQuantity(item.variantId, item.quantity - 1)} className="p-2 text-muted hover:text-ink" aria-label="Decrease quantity"><Minus className="h-3 w-3" /></button>
                        <span className="min-w-7 text-center text-xs font-semibold">{item.quantity}</span>
                        <button onClick={() => setQuantity(item.variantId, item.quantity + 1)} className="p-2 text-muted hover:text-ink" aria-label="Increase quantity"><Plus className="h-3 w-3" /></button>
                      </div>
                      <button onClick={() => remove(item.variantId)} className="ml-auto inline-flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-muted hover:text-signal">
                        <Trash2 className="h-3 w-3" /> Remove
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <aside className="rounded-2xl border border-line bg-white p-5 sm:p-6 lg:sticky lg:top-28">
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-ink">Summary</p>
            <div className="mt-4 flex items-center justify-between text-sm">
              <span className="text-muted">Subtotal</span>
              <span className="price font-semibold">{formatNaira(subtotal)}</span>
            </div>
            <p className="mt-1 text-[11px] text-muted">Delivery is calculated at checkout.</p>
            <Link href="/checkout" className="btn-primary mt-5 w-full">Continue to checkout</Link>
            <Link href="/shop" className="mt-3 flex justify-center text-[10px] font-bold uppercase tracking-[0.14em] text-muted hover:text-ink">Keep shopping</Link>
          </aside>
        </div>
      )}
    </div>
  );
}
