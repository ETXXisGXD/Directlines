'use client';

import { useEffect } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import { useConsent } from '@/components/consent/consent-provider';
import { trackEvent } from '@/lib/track-client';

export function AnalyticsTracker({ enabled }: { enabled: boolean }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { analyticsAllowed, ready } = useConsent();

  useEffect(() => {
    if (!enabled || !ready || !analyticsAllowed || pathname.startsWith('/admin')) return;
    trackEvent('page_view', {
      search: searchParams.toString(),
      title: document.title,
    });
  }, [pathname, searchParams, enabled, ready, analyticsAllowed]);

  return null;
}
