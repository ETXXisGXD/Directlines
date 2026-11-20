import type { Metadata } from 'next';
import Link from 'next/link';
import { getSettings } from '@/lib/queries';

export const metadata: Metadata = {
  title: 'Privacy',
  description: 'How Directlines handles order details, WhatsApp messages, analytics and Meta Pixel consent.',
  alternates: { canonical: '/privacy' },
};

export default async function PrivacyPage() {
  const settings = await getSettings();
  return (
    <div className="container-page py-10 sm:py-14">
      <nav className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.14em] text-muted" aria-label="Breadcrumb">
        <Link href="/" className="hover:text-ink">Home</Link>
        <span>/</span>
        <span className="text-ink">Privacy</span>
      </nav>
      <div className="mt-6 max-w-3xl prose-directlines">
        <p className="eyebrow text-signal">Privacy</p>
        <h1 className="mt-3 text-4xl font-semibold leading-tight text-ink">What we collect and why</h1>
        <p className="mt-4">
          This notice explains the information Directlines Technologies & Telecoms Ltd collects when you
          use this website, place an order, apply for EasyBuy or book a repair.
        </p>

        <h2>Order and contact details</h2>
        <p>
          We collect the name, phone number, optional email, delivery address, order items and payment
          choice you submit. We use these to confirm your order, arrange delivery, handle warranty
          claims and keep a record of the transaction.
        </p>

        <h2>EasyBuy and repair forms</h2>
        <p>
          EasyBuy applications collect your full name, phone number, target phone model and two guarantor
          phone numbers. Repair bookings collect the device, fault and contact details. These are used to
          review and respond to the request.
        </p>

        <h2>Analytics</h2>
        <p>
          With your permission, we use first-party analytics to understand which pages and products people
          visit. We store a daily visitor hash and event data such as page path, referrer, device type and
          country. We do not sell this data.
        </p>

        <h2>Meta Pixel and ads</h2>
        <p>
          If you accept analytics and the store has a Meta Pixel configured, the Meta Pixel and the Meta
          Conversions API may receive event data such as a page view, product view, add to cart, checkout
          start and, when an order is marked paid, a purchase. Customer identifiers are hashed before
          they are sent through the Conversions API. You can choose “Essential only” in the consent banner
          and the Meta Pixel will not load.
        </p>

        <h2>WhatsApp</h2>
        <p>
          When you press a WhatsApp button, you leave this website and continue in WhatsApp. WhatsApp’s own
          privacy terms apply to that conversation.
        </p>

        <h2>How long we keep data</h2>
        <p>
          Order and warranty records are kept for as long as needed to support the sale and any warranty
          claim. Analytics events are kept for reporting and are not used to identify you personally.
        </p>

        <h2>Your choices</h2>
        <p>
          You can ask us to correct or delete contact details that are not needed for an active order or
          a legal record. Email {settings.email} or message the store on WhatsApp.
        </p>

        <h2>Contact</h2>
        <p>
          Directlines Technologies & Telecoms Ltd, {settings.address_full}. Email{' '}
          <a href={`mailto:${settings.email}`}>{settings.email}</a>. Phone {settings.display_phone}.
        </p>
      </div>
    </div>
  );
}
