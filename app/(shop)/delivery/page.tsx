import type { Metadata } from 'next';
import Link from 'next/link';
import { Clock, MapPin, PackageCheck, Truck } from 'lucide-react';
import { getAreas, getSettings } from '@/lib/queries';
import { formatNaira } from '@/lib/format';

export const metadata: Metadata = {
  title: 'Delivery in Abuja and nationwide',
  description:
    'Directlines delivery options: same-day around Karu and Nyanya, Abuja central in 24 to 48 hours, nationwide courier in 1 to 3 business days, free showroom pickup.',
  alternates: { canonical: '/delivery' },
};

export default async function DeliveryPage() {
  const [settings, areas] = await Promise.all([getSettings(), getAreas()]);
  const zones = settings.shipping_zones.filter((zone) => zone.active);

  return (
    <div className="container-page py-10 sm:py-14">
      <nav className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.14em] text-muted" aria-label="Breadcrumb">
        <Link href="/" className="hover:text-ink">Home</Link>
        <span>/</span>
        <span className="text-ink">Delivery</span>
      </nav>

      <div className="mt-6 max-w-3xl">
        <p className="eyebrow text-signal">Delivery</p>
        <h1 className="mt-3 text-4xl font-semibold leading-tight text-ink sm:text-5xl">
          Karu today. Abuja in 24 to 48 hours.
        </h1>
        <p className="mt-5 text-sm leading-relaxed text-muted sm:text-base">
          Delivery is confirmed on WhatsApp before dispatch. If your address is outside the areas below,
          message us and we will quote the courier.
        </p>
      </div>

      <div className="mt-9 grid gap-4 md:grid-cols-2">
        <div className="rounded-2xl border border-line bg-white p-5 sm:p-6">
          <Truck className="h-5 w-5 text-signal" />
          <h2 className="mt-3 text-lg font-semibold text-ink">Delivery options</h2>
          <div className="mt-4 divide-y divide-line">
            {zones.map((zone) => (
              <div key={zone.id} className="flex items-center justify-between gap-4 py-3">
                <div>
                  <p className="text-xs font-semibold text-ink">{zone.name}</p>
                  {zone.free_over_threshold ? (
                    <p className="mt-0.5 text-[10px] text-muted">Free above {formatNaira(settings.free_shipping_threshold)}</p>
                  ) : null}
                </div>
                <p className="price shrink-0 text-xs font-semibold">{Number(zone.price) === 0 ? 'Free' : formatNaira(zone.price)}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-2xl border border-line bg-white p-5 sm:p-6">
          <PackageCheck className="h-5 w-5 text-signal" />
          <h2 className="mt-3 text-lg font-semibold text-ink">How dispatch works</h2>
          <ol className="mt-4 space-y-3 text-xs leading-relaxed text-muted">
            <li>1. You place the order and send it to WhatsApp.</li>
            <li>2. We confirm stock, colour and the final amount.</li>
            <li>3. You pay or choose pay on delivery where supported.</li>
            <li>4. We dispatch or set the device aside for pickup.</li>
            <li>5. You receive the device and the invoice.</li>
          </ol>
          <div className="mt-5 rounded-xl bg-paper-deep p-4 text-[11px] leading-relaxed text-muted">
            <span className="inline-flex items-center gap-1.5 font-semibold text-ink"><Clock className="h-3.5 w-3.5 text-signal" /> Open 24/7</span>
            <br />
            Courier pickup times can vary on Sundays. Showroom pickup is always available.
          </div>
        </div>
      </div>

      <div className="mt-10">
        <h2 className="text-xl font-semibold text-ink">Areas we deliver to</h2>
        <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
          {areas.map((area) => (
            <Link key={area.slug} href={`/areas/${area.slug}`} className="rounded-xl border border-line bg-white px-4 py-3 text-xs font-semibold text-ink-soft hover:border-ink hover:text-ink">
              {area.name}
            </Link>
          ))}
        </div>
        <div className="mt-5 flex items-start gap-3 rounded-xl border border-line bg-white p-4 text-xs text-muted">
          <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-signal" />
          <p>Showroom pickup: {settings.address_full}. Open 24 hours.</p>
        </div>
      </div>
    </div>
  );
}
