'use client';

declare global {
  interface Window {
    fbq?: (...args: unknown[]) => void;
    _fbq?: unknown;
  }
}

export function readCookie(name: string): string | null {
  if (typeof document === 'undefined') return null;
  const match = document.cookie.match(new RegExp(`(?:^|; )${name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}=([^;]*)`));
  return match ? decodeURIComponent(match[1]) : null;
}

export function getFbc(): string | null {
  const cookie = readCookie('_fbc');
  if (cookie) return cookie;
  if (typeof window === 'undefined') return null;
  const fbclid = new URLSearchParams(window.location.search).get('fbclid');
  if (!fbclid) return null;
  return `fb.1.${Date.now()}.${fbclid}`;
}

export function getFbp(): string | null {
  return readCookie('_fbp');
}

export function newEventId(prefix = 'evt'): string {
  const random = typeof crypto !== 'undefined' && 'randomUUID' in crypto
    ? crypto.randomUUID()
    : Math.random().toString(36).slice(2);
  return `${prefix}.${Date.now()}.${random}`;
}

export function trackPixel(eventName: string, params: Record<string, unknown> = {}, eventId?: string) {
  if (typeof window === 'undefined' || !window.fbq) return;
  const options = eventId ? { eventID: eventId } : undefined;
  window.fbq('track', eventName, params, options);
}

export function readUtm(): Record<string, string> {
  if (typeof window === 'undefined') return {};
  const params = new URLSearchParams(window.location.search);
  const keys = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term'];
  return Object.fromEntries(keys.map((key) => [key, params.get(key) ?? '']).filter(([, value]) => value));
}

export function trackServerEvent(
  eventName: string,
  eventId: string,
  customData: Record<string, unknown>,
  options: { userData?: Record<string, unknown>; sourceUrl?: string } = {}
) {
  if (typeof window === 'undefined') return;
  if (localStorage.getItem('dl-consent') !== 'all') return;
  const payload = {
    eventName,
    eventId,
    sourceUrl: options.sourceUrl ?? window.location.href,
    customData,
    userData: options.userData ?? {},
    fbp: getFbp(),
    fbc: getFbc(),
  };
  const blob = new Blob([JSON.stringify(payload)], { type: 'application/json' });
  navigator.sendBeacon('/api/meta/capi', blob);
}


