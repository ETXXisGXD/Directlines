import Link from 'next/link';
import type { ReactNode } from 'react';
import { ArrowRight } from 'lucide-react';

export function SectionHeading({
  eyebrow,
  title,
  description,
  action,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  action?: { label: string; href: string } | ReactNode;
}) {
  return (
    <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
      <div className="max-w-2xl">
        {eyebrow ? <p className="eyebrow text-signal">{eyebrow}</p> : null}
        <h2 className="mt-2 text-2xl font-semibold text-ink sm:text-3xl">{title}</h2>
        {description ? <p className="mt-3 text-sm leading-relaxed text-muted">{description}</p> : null}
      </div>
      {action && typeof action === 'object' && 'label' in action ? (
        <Link
          href={action.href}
          className="inline-flex shrink-0 items-center gap-2 text-[10px] font-bold uppercase tracking-[0.16em] text-ink hover:text-signal"
        >
          {action.label}
          <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      ) : (
        action
      )}
    </div>
  );
}
