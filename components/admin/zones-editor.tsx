'use client';

import { useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { inputClass, secondaryButtonClass } from './ui';

export interface ZoneRow {
  id: string;
  name: string;
  price: string;
  active: boolean;
  free_over_threshold: boolean;
}

export function ZonesEditor({ initial }: { initial: ZoneRow[] }) {
  const [rows, setRows] = useState<ZoneRow[]>(initial);

  function update(index: number, patch: Partial<ZoneRow>) {
    setRows((prev) => prev.map((row, rowIndex) => (rowIndex === index ? { ...row, ...patch } : row)));
  }

  return (
    <div>
      <input type="hidden" name="zones" value={JSON.stringify(rows)} />
      <div className="space-y-2">
        {rows.map((row, index) => (
          <div key={row.id || index} className="grid gap-2 rounded-xl border border-line bg-paper p-3 sm:grid-cols-[1.3fr_0.8fr_auto_auto_auto] sm:items-center">
            <input value={row.name} onChange={(event) => update(index, { name: event.target.value })} className={inputClass} placeholder="Zone name" />
            <input value={row.price} onChange={(event) => update(index, { price: event.target.value })} className={inputClass} inputMode="numeric" placeholder="Price" />
            <label className="flex items-center gap-1.5 text-[10px] font-semibold text-muted"><input type="checkbox" checked={row.active} onChange={(event) => update(index, { active: event.target.checked })} className="accent-[#dc2626]" /> Active</label>
            <label className="flex items-center gap-1.5 text-[10px] font-semibold text-muted"><input type="checkbox" checked={row.free_over_threshold} onChange={(event) => update(index, { free_over_threshold: event.target.checked })} className="accent-[#dc2626]" /> Free over</label>
            <button type="button" onClick={() => setRows((prev) => prev.filter((_, rowIndex) => rowIndex !== index))} className="grid h-9 w-9 place-items-center rounded-lg border border-line text-muted hover:border-red-200 hover:text-signal" aria-label="Remove zone">
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          </div>
        ))}
      </div>
      <button type="button" onClick={() => setRows((prev) => [...prev, { id: `zone-${Date.now()}`, name: '', price: '0', active: true, free_over_threshold: false }])} className={`${secondaryButtonClass} mt-3`}>
        <Plus className="h-3.5 w-3.5" /> Add zone
      </button>
    </div>
  );
}

