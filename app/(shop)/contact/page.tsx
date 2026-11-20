import type { Metadata } from 'next';
import Link from 'next/link';
import { Clock, Mail, MapPin, MessageCircle, Phone } from 'lucide-react';
import { getSettings } from '@/lib/queries';
import { ContactForm } from '@/components/store/contact-form';
import { createWhatsAppUrl } from '@/lib/whatsapp';

export const metadata: Metadata = {
  title: 'Contact Directlines in Karu, Abuja',
  description:
    'Call, WhatsApp or visit Directlines Technologies at Bolfash Plaza, Karu Housing Estate, Abuja. Open 24/7.',
  alternates: { canonical: '/contact' },
};

export default async function ContactPage() {
  const settings = await getSettings();
  const mapUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(settings.address_full)}`;

  return (
    <div className="container-page py-10 sm:py-14">
      <nav className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.14em] text-muted" aria-label="Breadcrumb">
        <Link href="/" className="hover:text-ink">Home</Link>
        <span>/</span>
        <span className="text-ink">Contact</span>
      </nav>

      <div className="mt-6 grid gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:gap-16">
        <div>
          <p className="eyebrow text-signal">Talk to a human</p>
          <h1 className="mt-3 text-4xl font-semibold leading-tight text-ink sm:text-5xl">
            The showroom is open. WhatsApp is faster.
          </h1>
          <p className="mt-5 max-w-lg text-sm leading-relaxed text-muted">
            Ask about a model, confirm a price, book a repair or start an EasyBuy application. We answer
            on WhatsApp and at the Karu showroom.
          </p>

          <div className="mt-7 flex flex-wrap gap-3">
            <a
              href={createWhatsAppUrl(settings.whatsapp_number, 'Hello Directlines! I have a question.')}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-primary"
            >
              <MessageCircle className="h-4 w-4" /> WhatsApp {settings.display_phone}
            </a>
            <a href={`tel:${settings.whatsapp_number}`} className="btn-secondary">
              <Phone className="h-4 w-4" /> Call the store
            </a>
          </div>

          <div className="mt-8 space-y-4 rounded-2xl border border-line bg-white p-5">
            <div className="flex gap-3">
              <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-signal" />
              <div>
                <p className="text-xs font-semibold text-ink">Showroom</p>
                <a href={mapUrl} target="_blank" rel="noopener noreferrer" className="mt-1 block text-xs leading-relaxed text-muted hover:text-ink">
                  {settings.address_full}
                </a>
              </div>
            </div>
            <div className="flex gap-3">
              <Phone className="mt-0.5 h-4 w-4 shrink-0 text-signal" />
              <div>
                <p className="text-xs font-semibold text-ink">Phone</p>
                <p className="mt-1 text-xs text-muted">{settings.display_phone} / {settings.alt_phone}</p>
              </div>
            </div>
            <div className="flex gap-3">
              <Mail className="mt-0.5 h-4 w-4 shrink-0 text-signal" />
              <div>
                <p className="text-xs font-semibold text-ink">Email</p>
                <a href={`mailto:${settings.email}`} className="mt-1 block text-xs text-muted hover:text-ink">{settings.email}</a>
              </div>
            </div>
            <div className="flex gap-3">
              <Clock className="mt-0.5 h-4 w-4 shrink-0 text-signal" />
              <div>
                <p className="text-xs font-semibold text-ink">Hours</p>
                <p className="mt-1 text-xs text-muted">{settings.hours}</p>
              </div>
            </div>
          </div>

          <div className="mt-5 rounded-2xl border border-line bg-paper-deep p-5">
            <p className="text-xs font-semibold text-ink">EasyBuy applications</p>
            <p className="mt-1 text-xs leading-relaxed text-muted">
              Use the EasyBuy form so the five required details are saved before WhatsApp opens.
            </p>
            <Link href="/easybuy" className="mt-3 inline-flex text-[10px] font-bold uppercase tracking-[0.14em] text-signal hover:text-signal-dark">
              Go to EasyBuy
            </Link>
          </div>
        </div>

        <ContactForm />
      </div>
    </div>
  );
}
