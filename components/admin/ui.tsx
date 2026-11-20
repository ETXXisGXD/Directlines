import type { ReactNode } from 'react';

export const inputClass =
  'w-full rounded-xl border border-line bg-white px-3.5 py-2.5 text-sm text-ink placeholder:text-[#9aa3b0] focus:border-ink focus:outline-none focus:ring-2 focus:ring-ink/5';

export const labelClass = 'mb-1.5 block text-[10px] font-bold uppercase tracking-[0.16em] text-muted';

export const buttonClass =
  'inline-flex items-center justify-center gap-2 rounded-xl bg-signal px-5 py-3 text-[10px] font-bold uppercase tracking-[0.15em] text-white transition-colors hover:bg-signal-dark disabled:opacity-50';

export const secondaryButtonClass =
  'inline-flex items-center justify-center gap-2 rounded-xl border border-line bg-white px-4 py-2.5 text-[10px] font-bold uppercase tracking-[0.14em] text-ink-soft transition-colors hover:border-ink hover:text-ink disabled:opacity-50';

export const dangerButtonClass =
  'inline-flex items-center justify-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-2.5 text-[10px] font-bold uppercase tracking-[0.14em] text-red-600 transition-colors hover:bg-red-100';

export const cardClass = 'rounded-2xl border border-line bg-white p-6 sm:p-7';

export function PageHeader({
  title,
  subtitle,
  action,
}: {
  title: string;
  subtitle?: string;
  action?: ReactNode;
}) {
  return (
    <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
      <div>
        <h1 className="text-2xl font-semibold text-ink sm:text-3xl">{title}</h1>
        {subtitle ? <p className="mt-1.5 max-w-2xl text-sm text-muted">{subtitle}</p> : null}
      </div>
      {action}
    </div>
  );
}

export function AdminBanner({ saved, err }: { saved?: boolean; err?: string | null }) {
  if (err) {
    return <p className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-xs text-red-600">Could not save: {err}</p>;
  }
  if (saved) {
    return <p className="mb-6 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-xs text-emerald-700">Saved. The storefront will update.</p>;
  }
  return null;
}

export function StatCard({
  label,
  value,
  hint,
  accent,
}: {
  label: string;
  value: string;
  hint?: string;
  accent?: boolean;
}) {
  return (
    <div className="rounded-2xl border border-line bg-white p-5">
      <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-muted">{label}</p>
      <p className={`mt-2 text-2xl font-semibold ${accent ? 'text-signal' : 'text-ink'}`}>{value}</p>
      {hint ? <p className="mt-1 text-[11px] text-muted">{hint}</p> : null}
    </div>
  );
}

export function EmptyState({ title, text, action }: { title: string; text?: string; action?: ReactNode }) {
  return (
    <div className="rounded-2xl border border-dashed border-line-strong bg-white p-10 text-center">
      <p className="text-sm font-semibold text-ink">{title}</p>
      {text ? <p className="mx-auto mt-2 max-w-md text-xs leading-relaxed text-muted">{text}</p> : null}
      {action ? <div className="mt-5">{action}</div> : null}
    </div>
  );
}

const pillStyles: Record<string, string> = {
  received: 'bg-[#fff6df] text-[#8a6100]',
  confirmed: 'bg-[#eaf2ff] text-[#1a4f9c]',
  processing: 'bg-[#eef0ff] text-[#3d48a8]',
  dispatched: 'bg-[#eaf7ff] text-[#0c678f]',
  delivered: 'bg-[#eaf7ef] text-[#1f7a4a]',
  cancelled: 'bg-signal-soft text-signal',
  paid: 'bg-[#eaf7ef] text-[#1f7a4a]',
  pending: 'bg-[#fff6df] text-[#8a6100]',
  new: 'bg-[#fff6df] text-[#8a6100]',
  contacted: 'bg-[#eaf2ff] text-[#1a4f9c]',
  approved: 'bg-[#eaf7ef] text-[#1f7a4a]',
  declined: 'bg-signal-soft text-signal',
  closed: 'bg-paper-deep text-muted',
  published: 'bg-[#eaf7ef] text-[#1f7a4a]',
  draft: 'bg-paper-deep text-muted',
  scheduled: 'bg-[#eaf2ff] text-[#1a4f9c]',
};

export function StatusPill({ status }: { status: string }) {
  return (
    <span className={`inline-flex rounded-full px-2.5 py-1 text-[9px] font-bold uppercase tracking-[0.1em] ${pillStyles[status] ?? 'bg-paper-deep text-muted'}`}>
      {status.replace(/_/g, ' ')}
    </span>
  );
}

export function BarChart({ data }: { data: Array<{ label: string; value: number }> }) {
  const max = Math.max(...data.map((item) => item.value), 1);
  return (
    <div className="flex h-40 items-end gap-2">
      {data.map((item) => (
        <div key={item.label} className="flex flex-1 flex-col items-center gap-1.5">
          <div className="flex h-28 w-full items-end rounded-md bg-paper-deep">
            <div
              className="w-full rounded-md bg-ink transition-all"
              style={{ height: `${Math.max(4, (item.value / max) * 100)}%` }}
              title={`${item.value}`}
            />
          </div>
          <span className="text-[8px] font-semibold uppercase tracking-[0.08em] text-muted">{item.label}</span>
        </div>
      ))}
    </div>
  );
}
