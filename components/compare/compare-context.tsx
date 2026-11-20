'use client';

import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';

export interface CompareItem {
  id: string;
  slug: string;
  name: string;
  price: number;
  image: string;
}

interface CompareContextValue {
  items: CompareItem[];
  count: number;
  isFull: boolean;
  has: (id: string) => boolean;
  toggle: (item: CompareItem) => boolean;
  remove: (id: string) => void;
  clear: () => void;
}

const CompareContext = createContext<CompareContextValue | null>(null);
const STORAGE_KEY = 'dl-compare-v1';
const MAX = 4;

export function CompareProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CompareItem[]>([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) setItems(JSON.parse(saved));
    } catch {
      // ignore corrupt storage
    }
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready) return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }, [items, ready]);

  function toggle(item: CompareItem) {
    let added = false;
    setItems((prev) => {
      if (prev.some((entry) => entry.id === item.id)) return prev.filter((entry) => entry.id !== item.id);
      if (prev.length >= MAX) return prev;
      added = true;
      return [...prev, item];
    });
    return added;
  }

  const value = useMemo(
    () => ({
      items,
      count: items.length,
      isFull: items.length >= MAX,
      has: (id: string) => items.some((item) => item.id === id),
      toggle,
      remove: (id: string) => setItems((prev) => prev.filter((item) => item.id !== id)),
      clear: () => setItems([]),
    }),
    [items]
  );

  return <CompareContext.Provider value={value}>{children}</CompareContext.Provider>;
}

export function useCompare() {
  const context = useContext(CompareContext);
  if (!context) throw new Error('useCompare must be used inside CompareProvider');
  return context;
}
