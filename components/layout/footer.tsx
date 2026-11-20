import Link from 'next/link';
import { MapPin, MessageCircle, Phone, Mail, Clock } from 'lucide-react';
import type { Area, Settings } from '@/lib/queries';
import { createWhatsAppUrl } from '@/lib/whatsapp';
import { OfficialLogo } from '@/components/layout/official-logo';

export function Footer({ settings, areas }: { settings: Settings; areas: Area[] }) {
  const mapUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(settings.address_full)}`;
  return (
    <footer className="border-t border-line bg-white">
      <div className="container-page grid gap-10 py-14 md:grid-cols-2 lg:grid-cols-4 lg:py-16">
        <div>
          <Link href="/" aria-label="Directlines home"><OfficialLogo size="md" /></Link>
          <p className="mt-4 max-w-xs text-xs leading-relaxed text-muted">
            {settings.tagline}. Brand-new phones, EasyBuy support, certified repairs and a showroom
            that stays open 24/7 in Karu, Abuja.
          </p>
          <div className="mt-5 flex items-center gap-3">
            <a
              href={createWhatsAppUrl(settings.whatsapp_number, 'Hello Directlines! I have a question.')}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-lg border border-line p-2 text-ink-soft hover:border-ink hover:text-ink"
              aria-label="WhatsApp"
            >
              <MessageCircle className="h-4 w-4" />
            </a>
            <a
              href={settings.socials.twitter || '#'}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-lg border border-line px-3 py-2 text-[10px] font-bold uppercase tracking-[0.12em] text-ink-soft hover:border-ink hover:text-ink"
            >
              X
            </a>
          </div>
        </div>

        <div>
          <p className="eyebrow">Shop</p>
          <ul className="mt-4 space-y-2.5 text-sm text-muted">
            <li><Link href="/shop" className="hover:text-ink">All phones</Link></li>
            <li><Link href="/shop?category=smartphones" className="hover:text-ink">Smartphones</Link></li>
            <li><Link href="/shop?category=feature-phones" className="hover:text-ink">Feature phones</Link></li>
            <li><Link href="/accessories" className="hover:text-ink">Accessories &amp; extras</Link></li>
            <li><Link href="/easybuy" className="hover:text-ink">EasyBuy financing</Link></li>
            <li><Link href="/repairs" className="hover:text-ink">Repairs and diagnostics</Link></li>
            <li><Link href="/blog" className="hover:text-ink">Buying guides</Link></li>
            <li><Link href="/track" className="hover:text-ink">Track an order</Link></li>
          </ul>
        </div>

        <div>
          <p className="eyebrow">Areas we serve</p>
          <ul className="mt-4 space-y-2.5 text-sm text-muted">
            {areas.slice(0, 8).map((area) => (
              <li key={area.slug}>
                <Link href={`/areas/${area.slug}`} className="hover:text-ink">
                  Phones in {area.name}
                </Link>
              </li>
            ))}
            <li><Link href="/delivery" className="font-semibold text-ink hover:text-signal">Delivery details</Link></li>
          </ul>
        </div>

        <div>
          <p className="eyebrow">Visit or call</p>
          <ul className="mt-4 space-y-3 text-sm text-muted">
            <li className="flex gap-2.5">
              <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-signal" />
              <a href={mapUrl} target="_blank" rel="noopener noreferrer" className="hover:text-ink">
                {settings.address_full}
              </a>
            </li>
            <li className="flex gap-2.5">
              <Phone className="mt-0.5 h-4 w-4 shrink-0 text-signal" />
              <span>
                <a href={`tel:${settings.whatsapp_number}`} className="block hover:text-ink">{settings.display_phone}</a>
                <a href={`tel:${settings.alt_phone}`} className="block hover:text-ink">{settings.alt_phone}</a>
              </span>
            </li>
            <li className="flex gap-2.5">
              <Mail className="mt-0.5 h-4 w-4 shrink-0 text-signal" />
              <a href={`mailto:${settings.email}`} className="hover:text-ink">{settings.email}</a>
            </li>
            <li className="flex gap-2.5">
              <Clock className="mt-0.5 h-4 w-4 shrink-0 text-signal" />
              <span>{settings.hours}</span>
            </li>
          </ul>
        </div>
      </div>

      <div className="border-t border-line">
        <div className="container-page flex flex-col gap-3 py-5 text-[10px] uppercase tracking-[0.14em] text-muted sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} {settings.legal_name}. All rights reserved.</p>
          <div className="flex flex-wrap items-center gap-4">
            <Link href="/policies" className="hover:text-ink">Policies</Link>
            <Link href="/privacy" className="hover:text-ink">Privacy</Link>
            <Link href="/terms" className="hover:text-ink">Terms</Link>
            <Link href="/admin" className="hover:text-ink">Staff</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

