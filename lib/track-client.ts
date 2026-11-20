'use client';

export function trackEvent(name: string, metadata: Record<string, unknown> = {}) {
  if (typeof window === 'undefined') return;
  if (localStorage.getItem('dl-consent') === 'essential') return;
  const payload = {
    name,
    path: window.location.pathname,
    referrer: document.referrer || '',
    metadata,
  };
  const blob = new Blob([JSON.stringify(payload)], { type: 'application/json' });
  navigator.sendBeacon('/api/track', blob);
}
