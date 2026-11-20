import type { Metadata } from 'next';
import Link from 'next/link';
import { getSettings } from '@/lib/queries';

export const metadata: Metadata = {
  title: 'Terms of use',
  description: 'Terms for using the Directlines website, placing orders and booking repairs.',
  alternates: { canonical: '/terms' },
};

export default async function TermsPage() {
  const settings = await getSettings();
  return (
    <div className="container-page py-10 sm:py-14">
      <nav className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.14em] text-muted" aria-label="Breadcrumb">
        <Link href="/" className="hover:text-ink">Home</Link>
        <span>/</span>
        <span className="text-ink">Terms</span>
      </nav>
      <div className="mt-6 max-w-3xl prose-directlines">
        <p className="eyebrow text-signal">Terms</p>
        <h1 className="mt-3 text-4xl font-semibold leading-tight text-ink">Using this website</h1>
        <p className="mt-4">
          By using this website you agree to these terms. The store is operated by {settings.legal_name}.
        </p>

        <h2>Prices and availability</h2>
        <p>
          Prices are shown in Nigerian Naira and can change. An order is not final until the store
          confirms stock, colour, storage and the amount on WhatsApp. We may cancel an order if an item
          is unavailable or a price was listed incorrectly.
        </p>

        <h2>Payment</h2>
        <p>
          This website does not charge cards. Payment is arranged by bank transfer, at the showroom or by
          an agreed pay-on-delivery option. Only pay to the account details confirmed by the store.
          Directlines is not responsible for payments made to a different account without confirmation.
        </p>

        <h2>EasyBuy</h2>
        <p>
          EasyBuy is an application process. Submitting the form does not approve credit. The provider’s
          terms and the store’s confirmation apply.
        </p>

        <h2>Repairs</h2>
        <p>
          Repair work is subject to diagnostic findings and an agreed quote. We are not responsible for
          data loss. Back up your device where possible.
        </p>

        <h2>Website use</h2>
        <p>
          Do not misuse the site, attempt to access admin areas, scrape it at scale or submit false
          applications. We may restrict access or cancel orders that appear fraudulent.
        </p>

        <h2>Contact</h2>
        <p>
          {settings.address_full}. Email <a href={`mailto:${settings.email}`}>{settings.email}</a>. Phone{' '}
          {settings.display_phone}.
        </p>
      </div>
    </div>
  );
}
