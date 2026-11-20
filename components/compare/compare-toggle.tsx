'use client';

import { ArrowLeftRight, Check } from 'lucide-react';
import { useCompare, type CompareItem } from './compare-context';

export function CompareToggle({
  item,
  label = false,
  className = '',
}: {
  item: CompareItem;
  label?: boolean;
  className?: string;
}) {
  const { has, toggle, isFull } = useCompare();
  const selected = has(item.id);
  const disabled = !selected && isFull;

  return (
    <button
      type="button"
      onClick={() => toggle(item)}
      disabled={disabled}
      title={disabled ? 'Compare list is full (4 phones)' : selected ? 'Remove from compare' : 'Add to compare'}
      className={className || `inline-flex items-center justify-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-[9px] font-bold uppercase tracking-[0.12em] transition-colors ${
        selected
          ? 'border-[#0284c7] bg-[#e0f2fe] text-[#0369a1]'
          : disabled
            ? 'cursor-not-allowed border-line bg-paper text-muted opacity-50'
            : 'border-line bg-white text-muted hover:border-[#0284c7] hover:text-[#0369a1]'
      }`}
    >
      {selected ? <Check className="h-3 w-3" /> : <ArrowLeftRight className="h-3 w-3" />}
      {label ? (selected ? 'Added to compare' : 'Compare') : null}
    </button>
  );
}
