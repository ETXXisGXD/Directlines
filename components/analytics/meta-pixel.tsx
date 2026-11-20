'use client';

import { useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';
import { useConsent } from '@/components/consent/consent-provider';

export function MetaPixel({ pixelId }: { pixelId: string | null }) {
  const { analyticsAllowed, ready } = useConsent();
  const pathname = usePathname();
  const loaded = useRef(false);

  useEffect(() => {
    if (!ready || !analyticsAllowed || !pixelId || loaded.current) return;
    if (pathname.startsWith('/admin')) return;
    loaded.current = true;

    if (!window.fbq) {
      const fbq = function (...args: unknown[]) {
        (fbq as unknown as { queue: unknown[] }).queue.push(args);
      } as unknown as ((...args: unknown[]) => void) & { queue: unknown[]; loaded: boolean; version: string; push: (...args: unknown[]) => void };
      fbq.queue = [];
      fbq.loaded = true;
      fbq.version = '2.0';
      fbq.push = (...args: unknown[]) => {
        (fbq as unknown as { queue: unknown[] }).queue.push(args);
      };
      window.fbq = fbq;
      window._fbq = fbq;

      const script = document.createElement('script');
      script.async = true;
      script.src = 'https://connect.facebook.net/en_US/fbevents.js';
      document.head.appendChild(script);
    }

    window.fbq?.('init', pixelId);
    window.fbq?.('track', 'PageView');
  }, [analyticsAllowed, pixelId, ready, pathname]);

  useEffect(() => {
    if (!loaded.current || !analyticsAllowed || !pixelId) return;
    if (pathname.startsWith('/admin')) return;
    window.fbq?.('track', 'PageView');
  }, [pathname, analyticsAllowed, pixelId]);

  return null;
}
