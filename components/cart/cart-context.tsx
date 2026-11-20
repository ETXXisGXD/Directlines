'use client';

import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { trackEvent } from '@/lib/track-client';
import { trackPixel } from '@/lib/meta-client';

export interface CartLine {
  variantId: string;
  productId: string;
  slug: string;
  name: string;
  price: number;
  label: string;
  color: string | null;
  image: string;
  quantity: number;
}

interface CartContextValue {
  items: CartLine[];
  count: number;
  subtotal: number;
  isOpen: boolean;
  setOpen: (open: boolean) => void;
  add: (line: CartLine) => void;
  remove: (variantId: string) => void;
  setQuantity: (variantId: string, quantity: number) => void;
  clear: () => void;
}

const CartContext = createContext<CartContextValue | null>(null);
const STORAGE_KEY = 'dl-cart-v1';

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartLine[]>([]);
  const [isOpen, setOpen] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) setItems(JSON.parse(saved));
    } catch {
      // ignore corrupted storage
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch {
      // private mode
    }
  }, [items, hydrated]);

  const add = (line: CartLine) => {
    setItems((prev) => {
      const existing = prev.find((item) => item.variantId === line.variantId);
      if (existing) {
        return prev.map((item) =>
          item.variantId === line.variantId
            ? { ...item, quantity: Math.min(item.quantity + line.quantity, 20) }
            : item
        );
      }
      return [...prev, line];
    });
    setOpen(true);
    trackEvent('add_to_cart', { product: line.slug, value: line.price * line.quantity });
    trackPixel('AddToCart', {
      content_ids: [line.variantId],
      content_name: line.name,
      content_type: 'product',
      value: line.price * line.quantity,
      currency: 'NGN',
    });
  };

  const remove = (variantId: string) => {
    setItems((prev) => prev.filter((item) => item.variantId !== variantId));
  };

  const setQuantity = (variantId: string, quantity: number) => {
    setItems((prev) =>
      quantity <= 0
        ? prev.filter((item) => item.variantId !== variantId)
        : prev.map((item) =>
            item.variantId === variantId ? { ...item, quantity: Math.min(quantity, 20) } : item
          )
    );
  };

  const clear = () => setItems([]);

  const { count, subtotal } = useMemo(
    () => ({
      count: items.reduce((sum, item) => sum + item.quantity, 0),
      subtotal: items.reduce((sum, item) => sum + item.price * item.quantity, 0),
    }),
    [items]
  );

  return (
    <CartContext.Provider value={{ items, count, subtotal, isOpen, setOpen, add, remove, setQuantity, clear }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) throw new Error('useCart must be used inside CartProvider');
  return context;
}
