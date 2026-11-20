import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight, Headphones, Lightbulb, Package, Plug, BatteryCharging, ShieldCheck, Laptop, MessageCircle } from 'lucide-react';
import { getCategories, getProducts, getSettings } from '@/lib/queries';
import { firstImage, siteMediaUrl } from '@/lib/storage';
import { createWhatsAppUrl } from '@/lib/whatsapp';

export const metadata: Metadata = {
  title: 'Accessories and extras in Abuja',
  description:
    'Chargers, power banks, ring lights, speakers, cases and more at Directlines in Karu, Abuja. Stock is updated by the store team.',
  alternates: { canonical: '/accessories' },
};

export const revalidate = 300;

const icons: Record<string, typeof Plug> = {
  'chargers-cables': Plug,
  'power-banks': BatteryCharging,
  'ring-lights': Lightbulb,
  'speakers-audio': Headphones,
  'cases-protection': ShieldCheck,
  'laptops-tablets': Laptop,
};

export default async function AccessoriesPage() {
  const [categories, products, settings] = await Promise.all([getCategories(), getProducts(), getSettings()]);
  const extras = categories.filter((category) => category.group_name === 'Accessories' || category.group_name === 'Other');
  const extraProducts = products.filter((product) => extras.some((category) => category.slug === product.categories?.slug));

  return (
    <div className="container-page py-10 sm:py-14">
      <nav className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.14em] text-muted" aria-label="Breadcrumb">
        <Link href="/" className="hover:text-ink">Home</Link>
        <span>/</span>
        <span className="text-ink">Accessories</span>
      </nav>

      <header className="mt-6 max-w-3xl">
        <p className="eyebrow text-signal">More than phones</p>
        <h1 className="mt-2 text-3xl font-semibold text-ink sm:text-4xl">Accessories and extras</h1>
        <p className="mt-3 text-sm leading-relaxed text-muted">
          Chargers, power banks, ring lights, speakers, cases and other useful extras. The categories are live;
          Faith adds the current stock and prices from the dashboard.
        </p>
      </header>

      <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        {extras.map((category) => {
          const Icon = icons[category.slug] ?? Package;
          const count = products.filter((product) => product.categories?.slug === category.slug).length;
          const cover = category.image_url ? siteMediaUrl(category.image_url) : null;
          return (
            <Link key={category.id} href={`/shop?category=${category.slug}`} className="group overflow-hidden rounded-2xl border border-line bg-white hover:border-ink">
              <div className="relative aspect-[4/3] bg-paper-deep">
                {cover ? (
                  <img src={cover} alt="" className="h-full w-full object-cover" />
                ) : (
                  <div className="grid h-full w-full place-items-center text-[#0284c7]">
                    <Icon className="h-8 w-8" />
                  </div>
                )}
                <span className={`absolute right-3 top-3 rounded-full px-2.5 py-1 text-[8px] font-bold uppercase tracking-[0.1em] ${count ? 'bg-white text-ink' : 'bg-[#142b58] text-white'}`}>
                  {count ? `${count} items` : 'Coming soon'}
                </span>
              </div>
              <div className="p-4">
                <h2 className="text-sm font-semibold text-ink group-hover:text-signal">{category.name}</h2>
                <p className="mt-1 line-clamp-2 text-[11px] leading-relaxed text-muted">{category.description}</p>
                <span className="mt-3 inline-flex items-center gap-1 text-[9px] font-bold uppercase tracking-[0.12em] text-[#0284c7]">
                  View category <ArrowRight className="h-3 w-3" />
                </span>
              </div>
            </Link>
          );
        })}
      </div>

      {extraProducts.length ? (
        <section className="mt-14">
          <div className="flex items-end justify-between gap-4">
            <div>
              <p className="eyebrow text-signal">In stock</p>
              <h2 className="mt-2 text-2xl font-semibold text-ink">Accessories and extras</h2>
            </div>
            <Link href="/shop" className="text-[10px] font-bold uppercase tracking-[0.14em] text-ink hover:text-signal">All products</Link>
          </div>
          <div className="mt-6 grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 lg:grid-cols-4">
            {extraProducts.slice(0, 8).map((product) => (
              <Link key={product.id} href={`/product/${product.slug}`} className="group">
                <div className="relative aspect-[4/5] overflow-hidden rounded-2xl border border-line bg-white">
                  {firstImage(product.product_images) ? (
                    <img src={firstImage(product.product_images)} alt={product.name} className="h-full w-full object-contain p-4" />
                  ) : (
                    <div className="grid h-full place-items-center bg-paper-deep text-[9px] uppercase tracking-[0.14em] text-muted">Photo on request</div>
                  )}
                </div>
                <p className="mt-3 text-[9px] font-bold uppercase tracking-[0.16em] text-muted">{product.brands?.name}</p>
                <h3 className="mt-1 text-sm font-semibold text-ink group-hover:text-signal">{product.name}</h3>
              </Link>
            ))}
          </div>
        </section>
      ) : null}

      <div className="mt-14 rounded-2xl border border-line bg-[#142b58] p-7 text-white sm:flex sm:items-center sm:justify-between sm:gap-6">
        <div>
          <p className="text-sm font-semibold">Looking for something not listed?</p>
          <p className="mt-1.5 text-xs leading-relaxed text-white/60">
            Send Faith the item name on WhatsApp. Stock, brands and prices are confirmed before you pay.
          </p>
        </div>
        <a
          href={createWhatsAppUrl(settings.whatsapp_number, 'Hello Directlines! I am looking for an accessory. Do you have it in stock?')}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-4 inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-white px-5 text-[10px] font-bold uppercase tracking-[0.14em] text-[#142b58] sm:mt-0"
        >
          <MessageCircle className="h-4 w-4" /> Ask on WhatsApp
        </a>
      </div>
    </div>
  );
}
