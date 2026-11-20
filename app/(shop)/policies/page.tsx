import type { Metadata } from 'next';
import Link from 'next/link';
import { getSettings } from '@/lib/queries';

export const metadata: Metadata = {
  title: 'Returns, warranty and store policies',
  description:
    'Directlines policies for returns, warranty, defective devices, EasyBuy applications and repairs.',
  alternates: { canonical: '/policies' },
};

export default async function PoliciesPage() {
  const settings = await getSettings();
  return (
    <div className="container-page py-10 sm:py-14">
      <nav className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.14em] text-muted" aria-label="Breadcrumb">
        <Link href="/" className="hover:text-ink">Home</Link>
        <span>/</span>
        <span className="text-ink">Policies</span>
      </nav>
      <div className="mt-6 max-w-3xl">
        <p className="eyebrow text-signal">Store policies</p>
        <h1 className="mt-3 text-4xl font-semibold leading-tight text-ink">Returns, warranty and repairs</h1>
        <p className="mt-4 text-sm leading-relaxed text-muted">
          These are the working policies for Directlines Technologies & Telecoms Ltd. If something is
          unclear, message the store before you pay.
        </p>

        <div className="mt-9 space-y-8">
          <section>
            <h2 className="text-xl font-semibold text-ink">Order confirmation</h2>
            <p className="mt-3 text-sm leading-relaxed text-muted">
              Prices and stock change. An order placed on this website is a request. The store confirms
              the model, colour, storage and final amount on WhatsApp before payment. If the item is not
              available, we will offer an alternative or cancel the request.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-ink">Warranty</h2>
            <p className="mt-3 text-sm leading-relaxed text-muted">{settings.warranty_text}</p>
            <p className="mt-2 text-sm leading-relaxed text-muted">
              Warranty does not cover physical damage, liquid damage, unauthorised repairs or normal
              wear. Keep the invoice and the device serial or IMEI.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-ink">Defective devices and returns</h2>
            <p className="mt-3 text-sm leading-relaxed text-muted">{settings.policies.refunds}</p>
            <ul className="mt-3 space-y-2 text-sm leading-relaxed text-muted">
              {settings.policies.returns.map((item) => (
                <li key={item} className="flex gap-2">
                  <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-signal" />
                  {item}
                </li>
              ))}
            </ul>
            <p className="mt-3 text-sm leading-relaxed text-muted">{settings.policies.condition}</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-ink">EasyBuy</h2>
            <p className="mt-3 text-sm leading-relaxed text-muted">
              The EasyBuy form is an application, not an approval. Final eligibility, deposit, monthly
              amount and tenure are confirmed by the EasyBuy team. Do not pay anyone outside the official
              process shown to you by the store.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-ink">Repairs</h2>
            <p className="mt-3 text-sm leading-relaxed text-muted">
              Repair work starts after a diagnostic and an agreed quote. Parts and labour carry the
              repair warranty stated on the intake note. We are not responsible for data loss. Back up
              your device before drop-off where possible.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-ink">Contact</h2>
            <p className="mt-3 text-sm leading-relaxed text-muted">
              {settings.address_full}. Phone {settings.display_phone} or {settings.alt_phone}. Email{' '}
              <a href={`mailto:${settings.email}`} className="text-signal underline underline-offset-2">{settings.email}</a>.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
