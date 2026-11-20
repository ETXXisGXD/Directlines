'use client';

import { useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { inputClass, secondaryButtonClass } from './ui';

export interface FaqRow {
  question: string;
  answer: string;
}

export function FaqEditor({ initial }: { initial: FaqRow[] }) {
  const [rows, setRows] = useState<FaqRow[]>(initial.length ? initial : []);

  return (
    <div>
      <input type="hidden" name="faq" value={JSON.stringify(rows)} />
      <div className="space-y-3">
        {rows.map((row, index) => (
          <div key={index} className="rounded-xl border border-line bg-paper p-3">
            <div className="flex items-start gap-2">
              <div className="flex-1 space-y-2">
                <input
                  value={row.question}
                  onChange={(event) => setRows((prev) => prev.map((item, i) => (i === index ? { ...item, question: event.target.value } : item)))}
                  className={inputClass}
                  placeholder="Question"
                />
                <textarea
                  value={row.answer}
                  rows={2}
                  onChange={(event) => setRows((prev) => prev.map((item, i) => (i === index ? { ...item, answer: event.target.value } : item)))}
                  className={inputClass}
                  placeholder="Answer"
                />
              </div>
              <button type="button" onClick={() => setRows((prev) => prev.filter((_, i) => i !== index))} className="grid h-10 w-10 place-items-center rounded-lg border border-line text-muted hover:border-red-200 hover:text-signal" aria-label="Remove FAQ">
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>
      <button type="button" onClick={() => setRows((prev) => [...prev, { question: '', answer: '' }])} className={`${secondaryButtonClass} mt-3`}>
        <Plus className="h-3.5 w-3.5" /> Add FAQ
      </button>
    </div>
  );
}
