'use client';

import { MessageCircle } from 'lucide-react';
import { createWhatsAppUrl } from '@/lib/whatsapp';
import { trackEvent } from '@/lib/track-client';

export function WhatsAppFloat({ number, storeName }: { number: string; storeName: string }) {
  const url = createWhatsAppUrl(
    number,
    `Hello ${storeName}! I found you on your website and I would like to ask about a phone.`
  );
  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      onClick={() => trackEvent('whatsapp_click', { source: 'floating_button' })}
      className="fixed bottom-5 right-5 z-[60] grid h-14 w-14 place-items-center rounded-full bg-[#1f9d55] text-white shadow-[0_16px_40px_-12px_rgba(31,157,85,0.65)] transition-transform hover:scale-105"
      aria-label="Chat on WhatsApp"
    >
      <MessageCircle className="h-6 w-6" />
    </a>
  );
}
