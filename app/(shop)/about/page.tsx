import type { Metadata } from 'next';
import Link from 'next/link';
import { BadgeCheck, Clock, MapPin, ShieldCheck, Truck, Zap } from 'lucide-react';
import { getSettings } from '@/lib/queries';
import { createWhatsAppUrl } from '@/lib/whatsapp';

export const metadata: Metadata = {
  title: 'About Directlines Technologies & Telecoms',
  description:
    'Directlines is a CAC-certified phone store at Bolfash Plaza, Karu Housing Estate, Abuja. Brand-new devices, EasyBuy, repairs and 24/7 service.',
  alternates: { canonical: '/about' },
};

export default async function AboutPage() {
  const settings = await getSettings();

  return (
    <div className="container-page py-10 sm:py-14">
      <nav className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.14em] text-muted" aria-label="Breadcrumb">
        <Link href="/" className="hover:text-ink">Home</Link>
        <span>/</span>
        <span className="text-ink">About</span>
      </nav>

      <div className="mt-6 grid gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:gap-16">
        <div>
          <p className="eyebrow text-signal">Directlines Technologies & Telecoms Ltd</p>
          <h1 className="mt-3 text-4xl font-semibold leading-tight text-ink sm:text-5xl">
            A real store in Karu. Not a page that disappears after payment.
          </h1>
          <div className="mt-6 space-y-4 text-sm leading-relaxed text-muted">
            <p>
              Directlines is a telecoms and technology retailer at Bolfash Plaza, House 12, Road K-N,
              Phase 1, Karu Housing Estate, opposite De Classic Hotel, along the Nyanya Jikwoyi
              Expressway.
            </p>
            <p>
              We sell brand-new Infinix, TECNO, Samsung, itel and Redmi phones with manufacturer
              warranty support. We also help eligible customers apply for EasyBuy and run a repair desk
              for screens, batteries, charging faults and board-level checks.
            </p>
            <p>
              The showroom is open 24 hours, seven days a week. You can call, message on WhatsApp, or
              walk in. The website catalogue is here so you can see the range and current prices before
              you make the trip.
            </p>
          </div>

          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/shop" className="btn-primary">Shop phones</Link>
            <a
              href={createWhatsAppUrl(settings.whatsapp_number, 'Hello Directlines! I would like to visit the showroom.')}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-secondary"
            >
              Message the showroom
            </a>
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          {[
            { icon: MapPin, title: 'Karu, Abuja', text: settings.address_full },
            { icon: Clock, title: 'Open 24/7', text: settings.hours },
            { icon: BadgeCheck, title: settings.cac_note, text: 'A registered business you can visit.' },
            { icon: ShieldCheck, title: 'Warranty support', text: settings.warranty_text },
            { icon: Zap, title: 'EasyBuy', text: 'Apply with two guarantors. Approval is not automatic.' },
            { icon: Truck, title: 'Delivery', text: 'Same-day around Karu and Nyanya. Nationwide courier available.' },
          ].map((item) => (
            <div key={item.title} className="rounded-2xl border border-line bg-white p-5">
              <item.icon className="h-4 w-4 text-signal" />
              <p className="mt-3 text-sm font-semibold text-ink">{item.title}</p>
              <p className="mt-1.5 text-xs leading-relaxed text-muted">{item.text}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-14 rounded-3xl border border-line bg-white p-7 sm:p-10">
        <h2 className="text-2xl font-semibold text-ink">What you can expect</h2>
        <div className="mt-6 grid gap-6 md:grid-cols-3">
          {[
            ['Confirm before pay', 'Stock, colour and the exact amount are confirmed on WhatsApp before payment.'],
            ['A record of the order', 'Every website order gets an order number. Keep it for tracking and warranty.'],
            ['A place to return to', 'The showroom is fixed and open every day. You know where to find us.'],
          ].map(([title, text]) => (
            <div key={title}>
              <p className="text-sm font-semibold text-ink">{title}</p>
              <p className="mt-2 text-xs leading-relaxed text-muted">{text}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
