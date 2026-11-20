import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowRight, Clock, MapPin, MessageCircle, Truck } from 'lucide-react';
import {
  getAreaBySlug,
  getAreas,
  getBlogPosts,
  getProducts,
  getSettings,
} from '@/lib/queries';
import { formatDate } from '@/lib/format';
import { createWhatsAppUrl } from '@/lib/whatsapp';
import { ProductCard } from '@/components/store/product-card';

export const revalidate = 300;

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const area = await getAreaBySlug(slug);
  if (!area) return { title: 'Area not found' };
  return {
    title: `Phones in ${area.name} | Directlines`,
    description: `${area.intro} ${area.delivery_note}`.slice(0, 170),
    alternates: { canonical: `/areas/${area.slug}` },
  };
}

export default async function AreaPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const [area, areas, settings] = await Promise.all([getAreaBySlug(slug), getAreas(), getSettings()]);
  if (!area) notFound();

  const [areaPosts, products] = await Promise.all([
    getBlogPosts({ kind: 'area', areaSlug: area.slug }),
    getProducts(),
  ]);
  const picks = products.filter((product) => product.is_featured).slice(0, 4);
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000';

  return (
    <div className="container-page py-10 sm:py-14">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@graph': [
              {
                '@type': 'LocalBusiness',
                name: settings.store_name,
                description: area.intro,
                url: `${siteUrl}/areas/${area.slug}`,
                telephone: settings.whatsapp_number,
                address: {
                  '@type': 'PostalAddress',
                  streetAddress: settings.address_street,
                  addressLocality: `${settings.address_area}, ${settings.address_city}`,
                  addressRegion: settings.address_state,
                  addressCountry: 'NG',
                },
                areaServed: { '@type': 'Place', name: area.name },
                openingHoursSpecification: [
                  {
                    '@type': 'OpeningHoursSpecification',
                    dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
                    opens: '00:00',
                    closes: '23:59',
                  },
                ],
              },
              ...(area.faq?.length
                ? [
                    {
                      '@type': 'FAQPage',
                      mainEntity: area.faq.map((faq) => ({
                        '@type': 'Question',
                        name: faq.question,
                        acceptedAnswer: { '@type': 'Answer', text: faq.answer },
                      })),
                    },
                  ]
                : []),
            ],
          }),
        }}
      />

      <nav className="flex flex-wrap items-center gap-1.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-muted" aria-label="Breadcrumb">
        <Link href="/" className="hover:text-ink">Home</Link>
        <span>/</span>
        <Link href="/delivery" className="hover:text-ink">Areas</Link>
        <span>/</span>
        <span className="text-ink">{area.name}</span>
      </nav>

      <div className="mt-6 grid gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:gap-16">
        <div>
          <p className="eyebrow text-signal">Directlines in {area.name}</p>
          <h1 className="mt-3 text-4xl font-semibold leading-tight text-ink sm:text-5xl">
            Buy a phone in {area.name}.
          </h1>
          <p className="mt-5 text-sm leading-relaxed text-muted sm:text-base">{area.intro}</p>
          <p className="mt-4 text-sm leading-relaxed text-muted">{area.delivery_note}</p>

          <div className="mt-7 grid gap-3 sm:grid-cols-2">
            <div className="rounded-2xl border border-line bg-white p-5">
              <Truck className="h-4 w-4 text-signal" />
              <p className="mt-3 text-xs font-semibold text-ink">Delivery to {area.name}</p>
              <p className="mt-1.5 text-[11px] leading-relaxed text-muted">{area.delivery_note}</p>
            </div>
            <div className="rounded-2xl border border-line bg-white p-5">
              <Clock className="h-4 w-4 text-signal" />
              <p className="mt-3 text-xs font-semibold text-ink">Showroom hours</p>
              <p className="mt-1.5 text-[11px] leading-relaxed text-muted">{settings.hours}</p>
            </div>
            {area.landmarks ? (
              <div className="rounded-2xl border border-line bg-white p-5 sm:col-span-2">
                <MapPin className="h-4 w-4 text-signal" />
                <p className="mt-3 text-xs font-semibold text-ink">Landmarks</p>
                <p className="mt-1.5 text-[11px] leading-relaxed text-muted">{area.landmarks}</p>
              </div>
            ) : null}
          </div>

          <div className="mt-7 flex flex-wrap gap-3">
            <Link href="/shop" className="btn-primary">Shop phones</Link>
            <a
              href={createWhatsAppUrl(settings.whatsapp_number, `Hello Directlines! I am in ${area.name} and I want to ask about a phone.`)}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-secondary"
            >
              <MessageCircle className="h-4 w-4" /> WhatsApp the store
            </a>
          </div>
        </div>

        <div className="rounded-3xl border border-line bg-white p-6">
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-ink">Before you order</p>
          <ul className="mt-4 space-y-3 text-xs leading-relaxed text-muted">
            <li>Confirm the model, colour and storage on WhatsApp.</li>
            <li>Delivery timing depends on the address and the courier.</li>
            <li>Showroom pickup is free and available 24/7.</li>
            <li>EasyBuy applications are reviewed, not automatically approved.</li>
          </ul>
          <div className="mt-5 rounded-xl bg-paper-deep p-4 text-[10px] leading-relaxed text-muted">
            Showroom: {settings.address_full}
          </div>
        </div>
      </div>

      {picks.length ? (
        <section className="mt-14">
          <div className="flex items-end justify-between gap-4">
            <div>
              <p className="eyebrow text-signal">Popular in the store</p>
              <h2 className="mt-2 text-2xl font-semibold text-ink">Phones {area.name} buyers ask about</h2>
            </div>
            <Link href="/shop" className="text-[10px] font-bold uppercase tracking-[0.14em] text-ink hover:text-signal">All phones</Link>
          </div>
          <div className="mt-6 grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-4">
            {picks.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </section>
      ) : null}

      {areaPosts.length ? (
        <section className="mt-14">
          <h2 className="text-2xl font-semibold text-ink">{area.name} buying guides</h2>
          <div className="mt-5 grid gap-5 md:grid-cols-3">
            {areaPosts.map((post) => (
              <Link key={post.id} href={`/blog/${post.slug}`} className="group rounded-2xl border border-line bg-white p-5 hover:border-ink">
                <p className="text-[9px] font-bold uppercase tracking-[0.14em] text-signal">Local guide</p>
                <h3 className="mt-2 text-base font-semibold leading-snug text-ink group-hover:text-signal">{post.title}</h3>
                <p className="mt-2 line-clamp-3 text-xs leading-relaxed text-muted">{post.excerpt}</p>
                <p className="mt-3 text-[9px] uppercase tracking-[0.12em] text-muted">{formatDate(post.published_at)}</p>
              </Link>
            ))}
          </div>
        </section>
      ) : null}

      {area.faq?.length ? (
        <section className="mt-12 max-w-3xl">
          <h2 className="text-2xl font-semibold text-ink">{area.name} questions</h2>
          <div className="mt-4 divide-y divide-line rounded-2xl border border-line bg-white">
            {area.faq.map((faq) => (
              <details key={faq.question} className="group p-5">
                <summary className="cursor-pointer list-none text-sm font-semibold text-ink">
                  {faq.question}
                  <span className="float-right text-muted group-open:rotate-45">+</span>
                </summary>
                <p className="mt-2 text-xs leading-relaxed text-muted">{faq.answer}</p>
              </details>
            ))}
          </div>
        </section>
      ) : null}

      <section className="mt-12 border-t border-line pt-8">
        <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-muted">Other areas</p>
        <div className="mt-4 flex flex-wrap gap-2">
          {areas.filter((item) => item.slug !== area.slug).map((item) => (
            <Link key={item.slug} href={`/areas/${item.slug}`} className="rounded-full border border-line bg-white px-3.5 py-1.5 text-[10px] font-bold uppercase tracking-[0.12em] text-muted hover:border-ink hover:text-ink">
              {item.name}
            </Link>
          ))}
          <Link href="/delivery" className="inline-flex items-center gap-1 rounded-full bg-ink px-3.5 py-1.5 text-[10px] font-bold uppercase tracking-[0.12em] text-white">
            Delivery <ArrowRight className="h-3 w-3" />
          </Link>
        </div>
      </section>
    </div>
  );
}
