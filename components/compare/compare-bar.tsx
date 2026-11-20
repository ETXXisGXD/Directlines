'use client';

import Image from 'next/image';
import Link from 'next/link';
import { ArrowLeftRight, Trash2, X } from 'lucide-react';
import { useCompare } from './compare-context';
import { formatNaira } from '@/lib/format';

export function CompareBar() {
  const { items, count, remove, clear } = useCompare();
  if (!count) return null;

  return (
    <div className="fixed bottom-20 left-4 right-20 z-40 sm:bottom-6 sm:left-6 sm:right-auto sm:w-[520px]">
      <div className="rounded-2xl border border-line bg-white/95 p-3 shadow-[0_24px_60px_-24px_rgba(20,43,88,0.45)] backdrop-blur-lg">
        <div className="flex items-center gap-3">
          <span className="relative grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-[#e0f2fe] text-[#0284c7]">
            <ArrowLeftRight className="h-4 w-4" />
            <span className="absolute -right-1 -top-1 grid h-5 w-5 place-items-center rounded-full bg-[#142b58] text-[9px] font-bold text-white">{count}</span>
          </span>
          <div className="hidden min-w-0 flex-1 gap-2 sm:flex">
            {items.map((item) => (
              <div key={item.id} className="flex min-w-0 items-center gap-1.5 rounded-lg border border-line bg-paper px-1.5 py-1">
                {item.image ? <Image src={item.image} alt="" width={26} height={26} className="h-6 w-6 rounded object-contain" /> : null}
                <span className="max-w-[72px] truncate text-[10px] font-semibold text-ink">{item.name}</span>
                <button type="button" onClick={() => remove(item.id)} className="text-muted hover:text-signal" aria-label={`Remove ${item.name}`}>
                  <X className="h-3 w-3" />
                </button>
              </div>
            ))}
          </div>
          <p className="min-w-0 flex-1 text-xs font-semibold text-ink sm:hidden">{count} phone{count > 1 ? 's' : ''} selected</p>
          <div className="flex shrink-0 items-center gap-1.5">
            <button type="button" onClick={clear} className="grid h-9 w-9 place-items-center rounded-lg border border-line text-muted hover:border-signal/40 hover:text-signal" aria-label="Clear comparison">
              <Trash2 className="h-3.5 w-3.5" />
            </button>
            <Link href="/compare" className="inline-flex h-9 items-center justify-center rounded-lg bg-[#142b58] px-3 text-[10px] font-bold uppercase tracking-[0.12em] text-white hover:bg-[#1e3a8a]">
              Compare
            </Link>
          </div>
        </div>
        <p className="mt-1.5 hidden text-[9px] text-muted sm:block">Prices from {items.length === 1 ? formatNaira(items[0].price) : 'the selected phones'}.</p>
      </div>
    </div>
  );
}
