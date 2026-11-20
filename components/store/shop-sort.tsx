'use client';

import { useRouter, useSearchParams } from 'next/navigation';

export function ShopSort({ value }: { value: string }) {
  const router = useRouter();
  const searchParams = useSearchParams();

  return (
    <label className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.14em] text-muted">
      Sort
      <select
        value={value}
        onChange={(event) => {
          const params = new URLSearchParams(searchParams.toString());
          if (event.target.value === 'featured') params.delete('sort');
          else params.set('sort', event.target.value);
          router.push(`/shop${params.toString() ? `?${params.toString()}` : ''}`);
        }}
        className="field h-9 min-h-0 w-auto py-1.5 text-[11px] font-semibold normal-case tracking-normal"
      >
        <option value="featured">Featured</option>
        <option value="price-asc">Price: low to high</option>
        <option value="price-desc">Price: high to low</option>
        <option value="name">Name A-Z</option>
      </select>
    </label>
  );
}
