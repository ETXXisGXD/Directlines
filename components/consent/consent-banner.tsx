'use client';

import Link from 'next/link';
import { useConsent } from './consent-provider';

export function ConsentBanner({ enabled }: { enabled: boolean }) {
  const { consent, ready, setConsent } = useConsent();

  if (!enabled || !ready || consent) return null;

  return (
    <div className="fixed inset-x-4 bottom-4 z-[80] mx-auto max-w-2xl rounded-2xl border border-[#d8dee7] bg-white p-4 shadow-[0_24px_60px_-20px_rgba(20,43,88,0.35)] sm:p-5">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
        <p className="text-xs leading-relaxed text-[#5c6676]">
          We use first-party analytics to understand what people browse. If you allow it, we also use the Meta Pixel to measure ads. You can say no and still use the full site.{' '}
          <Link href="/privacy" className="font-semibold text-[#142b58] underline underline-offset-2">
            Privacy
          </Link>
        </p>
        <div className="flex shrink-0 gap-2">
          <button
            type="button"
            onClick={() => setConsent('essential')}
            className="rounded-lg border border-[#d8dee7] px-3 py-2 text-[10px] font-bold uppercase tracking-[0.14em] text-[#5c6676] hover:border-[#142b58] hover:text-[#142b58]"
          >
            Essential only
          </button>
          <button
            type="button"
            onClick={() => setConsent('all')}
            className="rounded-lg bg-[#142b58] px-3 py-2 text-[10px] font-bold uppercase tracking-[0.14em] text-white hover:bg-[#162846]"
          >
            Accept analytics
          </button>
        </div>
      </div>
    </div>
  );
}

