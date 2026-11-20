'use client';

import { useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { inputClass, secondaryButtonClass } from './ui';

export interface VariantRow {
  id?: string;
  label: string;
  color: string;
  price: string;
  stock: string;
  sku: string;
}

export function VariantsEditor({ initial, defaultPrice }: { initial: VariantRow[]; defaultPrice: number }) {
  const [rows, setRows] = useState<VariantRow[]>(
    initial.length ? initial : [{ label: '', color: '', price: String(defaultPrice || ''), stock: '', sku: '' }]
  );

  function update(index: number, key: keyof VariantRow, value: string) {
    setRows((prev) => prev.map((row, rowIndex) => (rowIndex === index ? { ...row, [key]: value } : row)));
  }

  return (
    <div>
      <input type="hidden" name="variants" value={JSON.stringify(rows)} />
      <div className="space-y-3">
        {rows.map((row, index) => (
          <div key={row.id ?? index} className="grid gap-2 rounded-xl border border-line bg-paper p-3 sm:grid-cols-[1.2fr_1fr_0.8fr_0.6fr_1fr_auto] sm:items-end">
            <div>
              <label className="label">Label</label>
              <input value={row.label} onChange={(event) => update(index, 'label', event.target.value)} className={inputClass} placeholder="4GB / 128GB" />
            </div>
            <div>
              <label className="label">Colour</label>
              <input value={row.color} onChange={(event) => update(index, 'color', event.target.value)} className={inputClass} placeholder="Optional" />
            </div>
            <div>
              <label className="label">Price</label>
              <input value={row.price} onChange={(event) => update(index, 'price', event.target.value)} className={inputClass} inputMode="numeric" />
            </div>
            <div>
              <label className="label">Stock</label>
              <input value={row.stock} onChange={(event) => update(index, 'stock', event.target.value)} className={inputClass} inputMode="numeric" placeholder="Blank" />
            </div>
            <div>
              <label className="label">SKU</label>
              <input value={row.sku} onChange={(event) => update(index, 'sku', event.target.value)} className={inputClass} placeholder="Optional" />
            </div>
            <button type="button" onClick={() => setRows((prev) => prev.filter((_, rowIndex) => rowIndex !== index))} className="grid h-10 w-10 place-items-center rounded-lg border border-line text-muted hover:border-red-200 hover:text-signal" aria-label="Remove option">
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          </div>
        ))}
      </div>
      <button
        type="button"
        onClick={() => setRows((prev) => [...prev, { label: '', color: '', price: String(defaultPrice || ''), stock: '', sku: '' }])}
        className={`${secondaryButtonClass} mt-3`}
      >
        <Plus className="h-3.5 w-3.5" /> Add option
      </button>
      <p className="mt-2 text-[11px] text-muted">Leave stock blank if you are not tracking exact units. A number will auto-decrement on orders.</p>
    </div>
  );
}
