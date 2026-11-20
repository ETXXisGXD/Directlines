import type { Metadata } from 'next';
import Link from 'next/link';
import {
  ArrowRight,
  BadgeCheck,
  BatteryCharging,
  CheckCircle2,
  Clock,
  Headphones,
  Laptop,
  Lightbulb,
  MessageCircle,
  Package,
  Plug,
  ShieldCheck,
  Smartphone,
  Truck,
  Wrench,
  Zap,
} from 'lucide-react';
import { getAreas, getBlogPosts, getBrands, getCategories, getProducts, getSettings } from '@/lib/queries';
import { Hero } from '@/components/store/hero';
import { TrustStrip } from '@/components/store/trust-strip';
import { ProductCard } from '@/components/store/product-card';
import { SectionHeading } from '@/components/ui/section-heading';
import { formatNaira } from '@/lib/format';
import { createWhatsAppUrl } from '@/lib/whatsapp';

export const revalidate = 300;

export const metadata: Metadata = {
  title: 'Phones in Karu, Abuja | Directlines Technologies',
  description:
    'Shop brand-new Infinix, TECNO, Samsung, itel and Redmi phones in Karu, Abuja. EasyBuy, warranty support, 24/7 showroom and nationwide delivery.',
  alternates: { canonical: '/' },
};

const steps = [
  { title: 'Pick your phone', text: 'Compare prices and storage options, then add to cart or ask us on WhatsApp.' },
  { title: 'Confirm on WhatsApp', text: 'We confirm stock, colour and the exact amount before you pay.' },
  { title: 'Pay and receive', text: 'Bank transfer or pay on delivery, then pick up in Karu or get it delivered.' },
];

const budgets = [
  { title: 'Under ₦100,000', text: 'Feature phones and the lowest-priced smartphones.', href: '/shop?max=99999' },
  { title: '₦100,000 to ₦150,000', text: 'itel, Redmi and Infinix entry smartphones.', href: '/shop?min=100000&max=150000' },
  { title: '₦150,000 to ₦200,000', text: 'Everyday phones with more storage and battery.', href: '/shop?min=150000&max=200000' },
  { title: '₦200,000 and above', text: 'TECNO Spark, Infinix Hot and Samsung Galaxy A.', href: '/shop?min=200000' },
];

export default async function HomePage() {
  const [settings, products, categories, brands, posts, areas] = await Promise.all([
    getSettings(),
    getProducts(),
    getCategories(),
    getBrands(),
    getBlogPosts({ kind: 'blog', limit: 3 }),
    getAreas(),
  ]);

  const featured = products.filter((product) => product.is_featured).slice(0, 8);
  const fallbackFeatured = products.slice(0, 8);
  const shown = featured.length >= 4 ? featured : fallbackFeatured;
  const cheapest = products.length ? Math.min(...products.map((product) => Number(product.price))) : 0;
  const highest = products.length ? Math.max(...products.map((product) => Number(product.price))) : 0;
  const extraCategories = categories.filter((category) => category.group_name === 'Accessories' || category.group_name === 'Other');

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@graph': [
              {
                '@type': 'Organization',
                '@id': `${process.env.NEXT_PUBLIC_SITE_URL ?? ''}/#organization`,
                name: settings.legal_name,
                url: process.env.NEXT_PUBLIC_SITE_URL ?? '',
                email: settings.email,
                telephone: settings.whatsapp_number,
              },
              {
                '@type': 'ElectronicsStore',
                '@id': `${process.env.NEXT_PUBLIC_SITE_URL ?? ''}/#store`,
                name: settings.store_name,
                description: settings.seo?.description,
                url: process.env.NEXT_PUBLIC_SITE_URL ?? '',
                telephone: settings.whatsapp_number,
                email: settings.email,
                priceRange: `${formatNaira(cheapest)} to ${formatNaira(highest)}`,
                currenciesAccepted: 'NGN',
                paymentAccepted: 'Bank transfer, pay on delivery, cash, EasyBuy',
                address: {
                  '@type': 'PostalAddress',
                  streetAddress: settings.address_street,
                  addressLocality: `${settings.address_area}, ${settings.address_city}`,
                  addressRegion: settings.address_state,
                  addressCountry: 'NG',
                },
                openingHoursSpecification: [
                  {
                    '@type': 'OpeningHoursSpecification',
                    dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
                    opens: '00:00',
                    closes: '23:59',
                  },
                ],
                areaServed: areas.map((area) => area.name),
              },
            ],
          }),
        }}
      />

      <Hero settings={settings} products={products} />
      <TrustStrip />

      <section className="container-page py-16 sm:py-20 lg:py-24">
        <SectionHeading
          eyebrow="Available now"
          title="Phones people are asking for"
          description="Sealed devices from the brands we actually stock. Prices are updated by the store team. Confirm colour and stock on WhatsApp before paying."
          action={{ label: 'See all phones', href: '/shop' }}
        />
        <div className="mt-9 grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 lg:grid-cols-4 lg:gap-x-6">
          {shown.map((product, index) => (
            <ProductCard key={product.id} product={product} priority={index < 4} />
          ))}
        </div>
      </section>

      <section className="border-y border-line bg-white">
        <div className="container-page py-14 sm:py-16">
          <div className="grid gap-10 lg:grid-cols-[0.7fr_1.3fr] lg:items-start">
            <SectionHeading
              eyebrow="By budget"
              title="Start with what you want to spend"
              description={`The catalogue starts at ${formatNaira(cheapest)}. Pick a range and compare what is available.`}
            />
            <div className="grid gap-3 sm:grid-cols-2">
              {budgets.map((budget) => (
                <Link
                  key={budget.title}
                  href={budget.href}
                  className="group rounded-2xl border border-line p-5 transition-colors hover:border-ink hover:bg-paper"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="price text-lg font-semibold text-ink">{budget.title}</p>
                      <p className="mt-2 text-xs leading-relaxed text-muted">{budget.text}</p>
                    </div>
                    <ArrowRight className="h-4 w-4 text-muted transition-transform group-hover:translate-x-0.5 group-hover:text-signal" />
                  </div>
                </Link>
              ))}
            </div>
          </div>

          <div className="mt-10 flex flex-wrap items-center gap-2 border-t border-line pt-7">
            <span className="mr-2 text-[10px] font-bold uppercase tracking-[0.16em] text-muted">Brands:</span>
            {brands.map((brand) => (
              <Link
                key={brand.slug}
                href={`/shop?brand=${brand.slug}`}
                className="rounded-full border border-line px-3.5 py-1.5 text-[10px] font-bold uppercase tracking-[0.14em] text-ink-soft hover:border-ink hover:text-ink"
              >
                {brand.name}
              </Link>
            ))}
            {categories.map((category) => (
              <Link
                key={category.slug}
                href={`/shop?category=${category.slug}`}
                className="rounded-full bg-paper-deep px-3.5 py-1.5 text-[10px] font-bold uppercase tracking-[0.14em] text-ink-soft hover:bg-ink hover:text-white"
              >
                {category.name}
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="border-y border-line bg-white">
        <div className="container-page py-16 sm:py-20">
          <SectionHeading
            eyebrow="More than phones"
            title="Accessories and extras"
            description="Chargers, power banks, ring lights, speakers, cases and other useful extras. Faith adds current stock and prices from the dashboard."
            action={{ label: 'View accessories', href: '/accessories' }}
          />
          <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
            {extraCategories.map((category) => {
              const Icon =
                category.slug === 'power-banks'
                  ? BatteryCharging
                  : category.slug === 'ring-lights'
                    ? Lightbulb
                    : category.slug === 'speakers-audio'
                      ? Headphones
                      : category.slug === 'laptops-tablets'
                        ? Laptop
                        : category.slug === 'chargers-cables'
                          ? Plug
                          : Package;
              return (
                <Link key={category.slug} href={`/shop?category=${category.slug}`} className="group rounded-2xl border border-line p-5 hover:border-[#0284c7] hover:bg-[#f8fbff]">
                  <Icon className="h-5 w-5 text-[#0284c7]" />
                  <p className="mt-4 text-sm font-semibold text-ink group-hover:text-[#0284c7]">{category.name}</p>
                  <p className="mt-1 line-clamp-2 text-[10px] leading-relaxed text-muted">{category.description}</p>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      <section className="container-page py-16 sm:py-20 lg:py-24">
        <div className="grid overflow-hidden rounded-3xl border border-[#1e3a8a] bg-[#142b58] text-white lg:grid-cols-[1.08fr_0.92fr]">
          <div className="p-8 sm:p-12 lg:p-14">
            <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-[#93c5fd]">EasyBuy</p>
            <h2 className="mt-3 max-w-lg text-3xl font-semibold leading-tight sm:text-4xl">
              Get the phone now. Pay small-small.
            </h2>
            <p className="mt-4 max-w-lg text-sm leading-relaxed text-white/65">
              Apply with your full name, phone number, target model and two guarantors. The EasyBuy team
              reviews your details on WhatsApp before anything is approved.
            </p>
            <ul className="mt-6 grid gap-2.5 text-sm text-white/75 sm:grid-cols-2">
              {['30% initial down payment', 'Flexible 3 to 6 months', 'Two guarantors required', 'Showroom or delivery'].map((item) => (
                <li key={item} className="flex items-center gap-2">
                  <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-[#93c5fd]" />
                  {item}
                </li>
              ))}
            </ul>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/easybuy" className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-white px-5 text-[10px] font-bold uppercase tracking-[0.16em] text-[#142b58] hover:bg-[#eef2f7]">
                How EasyBuy works
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
              <a
                href={createWhatsAppUrl(
                  settings.easybuy_whatsapp,
                  'Hello EasyBuy team. I want to apply for a phone from Directlines.'
                )}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl border border-white/20 px-5 text-[10px] font-bold uppercase tracking-[0.16em] text-white hover:bg-white/10"
              >
                <MessageCircle className="h-3.5 w-3.5" />
                Talk to EasyBuy
              </a>
            </div>
          </div>
          <div className="relative hidden border-l border-white/10 bg-white/[0.03] p-10 lg:block">
            <div className="rounded-2xl border border-white/10 bg-[#142b58] p-6">
              <div className="flex items-center gap-3 border-b border-white/10 pb-5">
                <span className="grid h-10 w-10 place-items-center rounded-full bg-[#93c5fd]/10 text-[#93c5fd]"><Zap className="h-4 w-4" /></span>
                <div>
                  <p className="text-xs font-semibold">Example on a ₦180,000 phone</p>
                  <p className="mt-0.5 text-[10px] text-white/45">Illustration only. Approval required.</p>
                </div>
              </div>
              <dl className="mt-5 space-y-3 text-xs">
                <div className="flex justify-between"><dt className="text-white/50">Down payment (30%)</dt><dd className="price text-white">{formatNaira(54000)}</dd></div>
                <div className="flex justify-between"><dt className="text-white/50">Balance</dt><dd className="price text-white">{formatNaira(126000)}</dd></div>
                <div className="flex justify-between"><dt className="text-white/50">Over 6 months</dt><dd className="price text-[#93c5fd]">{formatNaira(21000)} / month</dd></div>
              </dl>
              <p className="mt-5 border-t border-white/10 pt-4 text-[10px] leading-relaxed text-white/35">
                Final terms depend on the EasyBuy provider. Directlines does not approve applications on this page.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="border-y border-line bg-white">
        <div className="container-page py-16 sm:py-20">
          <div className="grid gap-10 lg:grid-cols-2 lg:gap-16">
            <div>
              <p className="eyebrow text-signal">Repairs and diagnostics</p>
              <h2 className="mt-2 text-3xl font-semibold text-ink">Screen, battery or charging port problem?</h2>
              <p className="mt-4 text-sm leading-relaxed text-muted">
                Tell us the device and the fault. We book a diagnostic, confirm the part and price, and only
                then start the repair. No blind quotes.
              </p>
              <div className="mt-6 flex flex-wrap gap-3">
                <Link href="/repairs" className="btn-primary">
                  Book a repair
                  <Wrench className="h-3.5 w-3.5" />
                </Link>
                <a
                  href={createWhatsAppUrl(settings.whatsapp_number, 'Hello Directlines. My phone needs a repair.')}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-secondary"
                >
                  Ask on WhatsApp
                </a>
              </div>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              {[
                { icon: Smartphone, title: 'Screens and glass', text: 'Cracked glass, dead touch and display faults.' },
                { icon: Zap, title: 'Batteries and charging', text: 'Fast drain, weak battery and charging port issues.' },
                { icon: ShieldCheck, title: 'Diagnostics first', text: 'We confirm the fault before quoting.' },
                { icon: Clock, title: '24/7 drop-off', text: 'Leave the device at the Karu showroom any time.' },
              ].map((item) => (
                <div key={item.title} className="rounded-2xl border border-line p-5">
                  <item.icon className="h-4 w-4 text-signal" />
                  <p className="mt-3 text-sm font-semibold text-ink">{item.title}</p>
                  <p className="mt-1.5 text-xs leading-relaxed text-muted">{item.text}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="container-page py-16 sm:py-20">
        <SectionHeading
          eyebrow="Simple process"
          title="No guessing. Confirm before you pay."
          description="Directlines is a real showroom in Karu. The website is the catalogue, WhatsApp is the counter, and the invoice is the record."
        />
        <div className="mt-9 grid gap-5 md:grid-cols-3">
          {steps.map((step, index) => (
            <div key={step.title} className="rounded-2xl border border-line bg-white p-6">
              <span className="grid h-9 w-9 place-items-center rounded-full bg-paper-deep text-xs font-bold text-ink">{index + 1}</span>
              <h3 className="mt-4 text-base font-semibold text-ink">{step.title}</h3>
              <p className="mt-2 text-xs leading-relaxed text-muted">{step.text}</p>
            </div>
          ))}
        </div>
      </section>

      {posts.length ? (
        <section className="border-y border-line bg-white">
          <div className="container-page py-16 sm:py-20">
            <SectionHeading
              eyebrow="Buying guides"
              title="Know what you are buying"
              description="Straight answers on prices, models, EasyBuy and buying a phone around Abuja."
              action={{ label: 'Read the blog', href: '/blog' }}
            />
            <div className="mt-9 grid gap-5 md:grid-cols-3">
              {posts.map((post) => (
                <Link key={post.id} href={`/blog/${post.slug}`} className="group rounded-2xl border border-line p-6 hover:border-ink">
                  <p className="text-[9px] font-bold uppercase tracking-[0.16em] text-signal">{post.category}</p>
                  <h3 className="mt-3 text-lg font-semibold leading-snug text-ink group-hover:text-signal">{post.title}</h3>
                  <p className="mt-3 line-clamp-3 text-xs leading-relaxed text-muted">{post.excerpt}</p>
                  <span className="mt-5 inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.14em] text-ink">
                    Read guide <ArrowRight className="h-3 w-3" />
                  </span>
                </Link>
              ))}
            </div>
          </div>
        </section>
      ) : null}

      <section className="container-page py-16 sm:py-20">
        <SectionHeading
          eyebrow="Delivery around Abuja"
          title="Karu today. Abuja central in 24 to 48 hours."
          description="We deliver around Karu and Nyanya the same day. Nationwide courier takes 1 to 3 business days. Showroom pickup is free."
          action={{ label: 'Delivery details', href: '/delivery' }}
        />
        <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {areas.slice(0, 8).map((area) => (
            <Link key={area.slug} href={`/areas/${area.slug}`} className="rounded-xl border border-line bg-white px-4 py-3 text-xs font-semibold text-ink-soft hover:border-ink hover:text-ink">
              {area.name}
            </Link>
          ))}
        </div>
      </section>

      <section className="container-page pb-20">
        <div className="rounded-3xl border border-line bg-white p-8 text-center sm:p-12">
          <BadgeCheck className="mx-auto h-6 w-6 text-signal" />
          <h2 className="mx-auto mt-4 max-w-2xl text-2xl font-semibold text-ink sm:text-3xl">
            Not sure which phone is right for you?
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-sm leading-relaxed text-muted">
            Tell us your budget and what you use your phone for. We will narrow it down to two or three
            options and confirm what is in stock.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <a
              href={createWhatsAppUrl(settings.whatsapp_number, 'Hello Directlines! Please help me choose a phone. My budget is:')}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-primary"
            >
              <MessageCircle className="h-4 w-4" />
              Chat with the store
            </a>
            <a href={`tel:${settings.whatsapp_number}`} className="btn-secondary">
              <Truck className="h-4 w-4" />
              Call {settings.display_phone}
            </a>
          </div>
        </div>
      </section>
    </>
  );
}

