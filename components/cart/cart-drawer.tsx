'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Minus, Plus, ShoppingBag, Trash2, X } from 'lucide-react';
import { useCart } from './cart-context';
import { formatNaira } from '@/lib/format';

export function CartDrawer() {
  const { items, isOpen, setOpen, subtotal, setQuantity, remove } = useCart();
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[70]">
      <button
        aria-label="Close cart"
        onClick={() => setOpen(false)}
        className="absolute inset-0 bg-[#142b58]/40 backdrop-blur-[2px]"
      />
      <aside className="absolute right-0 top-0 flex h-full w-full max-w-md flex-col border-l border-line bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-line px-5 py-4">
          <div className="flex items-center gap-2">
            <ShoppingBag className="h-4 w-4 text-signal" />
            <p className="text-xs font-bold uppercase tracking-[0.18em]">Your cart</p>
          </div>
          <button
            onClick={() => setOpen(false)}
            className="rounded-lg p-2 text-muted hover:bg-paper hover:text-ink"
            aria-label="Close cart"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {items.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-3 px-8 text-center">
            <p className="text-sm text-muted">Your cart is empty.</p>
            <Link href="/shop" onClick={() => setOpen(false)} className="btn-primary">
              Browse phones
            </Link>
          </div>
        ) : (
          <>
            <div className="flex-1 overflow-y-auto px-5 py-4 custom-scrollbar">
              <div className="divide-y divide-line">
                {items.map((item) => (
                  <div key={item.variantId} className="flex gap-3 py-4">
                    <div className="relative h-20 w-16 shrink-0 overflow-hidden rounded-lg border border-line bg-paper">
                      {item.image ? (
                        <Image src={item.image} alt={item.name} fill sizes="64px" className="object-contain p-1" />
                      ) : null}
                    </div>
                    <div className="min-w-0 flex-1">
                      <Link
                        href={`/product/${item.slug}`}
                        onClick={() => setOpen(false)}
                        className="text-sm font-semibold leading-snug hover:text-signal"
                      >
                        {item.name}
                      </Link>
                      <p className="mt-0.5 text-[11px] text-muted">
                        {item.label}
                        {item.color ? ` · ${item.color}` : ''}
                      </p>
                      <p className="mt-1.5 price text-sm font-semibold">{formatNaira(item.price * item.quantity)}</p>
                      <div className="mt-2 flex items-center gap-2">
                        <div className="flex items-center rounded-lg border border-line">
                          <button
                            onClick={() => setQuantity(item.variantId, item.quantity - 1)}
                            className="p-1.5 text-muted hover:text-ink"
                            aria-label="Decrease quantity"
                          >
                            <Minus className="h-3 w-3" />
                          </button>
                          <span className="min-w-6 text-center text-xs font-semibold">{item.quantity}</span>
                          <button
                            onClick={() => setQuantity(item.variantId, item.quantity + 1)}
                            className="p-1.5 text-muted hover:text-ink"
                            aria-label="Increase quantity"
                          >
                            <Plus className="h-3 w-3" />
                          </button>
                        </div>
                        <button
                          onClick={() => remove(item.variantId)}
                          className="ml-auto rounded-lg p-1.5 text-muted hover:bg-signal-soft hover:text-signal"
                          aria-label="Remove item"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="border-t border-line px-5 py-5">
              <div className="mb-4 flex items-center justify-between text-sm">
                <span className="text-muted">Subtotal</span>
                <span className="price text-lg font-semibold">{formatNaira(subtotal)}</span>
              </div>
              <Link href="/checkout" onClick={() => setOpen(false)} className="btn-primary w-full">
                Checkout
              </Link>
              <Link
                href="/cart"
                onClick={() => setOpen(false)}
                className="mt-2 flex justify-center text-[11px] font-semibold uppercase tracking-[0.14em] text-muted hover:text-ink"
              >
                View cart
              </Link>
              <p className="mt-3 text-center text-[10px] leading-relaxed text-muted">
                Delivery is added at checkout. No online card charge.
              </p>
            </div>
          </>
        )}
      </aside>
    </div>
  );
}

