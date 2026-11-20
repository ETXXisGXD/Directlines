import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import {
  BadgeCheck,
  CheckCircle2,
  ChevronRight,
  Clock,
  MessageCircle,
  ShieldCheck,
  Truck,
} from 'lucide-react';
import {
  getApprovedReviews,
  getProductBySlug,
  getRelatedProducts,
  getSettings,
} from '@/lib/queries';
import { ProductGallery } from '@/components/store/product-gallery';
import { ProductPurchase } from '@/components/store/product-purchase';
import { ProductCard } from '@/components/store/product-card';
import { ProductViewTracker } from '@/components/store/product-view-tracker';
import { WishlistButton } from '@/components/store/wishlist-button';
import { CompareToggle } from '@/components/compare/compare-toggle';
import { SectionHeading } from '@/components/ui/section-heading';
import { createClient } from '@/lib/supabase/server';
import { formatNaira, conditionLabel } from '@/lib/format';
import { firstImage, siteMediaUrl } from '@/lib/storage';
import { createWhatsAppUrl } from '@/lib/whatsapp';

export const revalidate = 300;

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) return { title: 'Phone not found' };
  const image = firstImage(product.product_images);
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000';
  const imageUrl = image ? (image.startsWith('http') ? image : `${siteUrl}${image}`) : undefined;

  return {
    title: product.seo_title ?? `${product.name} price in Abuja`,
    description:
      product.seo_description ??
      `${product.name} at Directlines Technologies, Karu, Abuja. ${product.short_description ?? ''} Confirm price and stock on WhatsApp.`,
    alternates: { canonical: `/product/${product.slug}` },
    openGraph: {
      type: 'website',
      title: product.seo_title ?? `${product.name} price in Abuja`,
      description: product.seo_description ?? product.short_description ?? undefined,
      url: `${siteUrl}/product/${product.slug}`,
      images: imageUrl ? [{ url: imageUrl, alt: product.name }] : undefined,
    },
  };
}

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const [product, settings] = await Promise.all([getProductBySlug(slug), getSettings()]);
  if (!product) notFound();

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const [related, reviews, savedRow] = await Promise.all([
    getRelatedProducts(product.categories?.slug ?? null, product.id, 4),
    getApprovedReviews(product.id),
    user
      ? supabase
          .from('wishlists')
          .select('product_id')
          .eq('user_id', user.id)
          .eq('product_id', product.id)
          .maybeSingle()
      : Promise.resolve({ data: null }),
  ]);

  const images = product.product_images.map((image) => ({ url: siteMediaUrl(image.url), alt: image.alt }));
  const image = images[0]?.url ?? '';
  const prices = product.product_variants.map((variant) => Number(variant.price));
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000';
  const firstVariant = product.product_variants[0];

  const specs = Object.entries(product.specs ?? {}).filter(([, value]) => Boolean(value));

  return (
    <>
      <ProductViewTracker
        slug={product.slug}
        name={product.name}
        price={product.price}
        variantId={firstVariant?.id ?? null}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@graph': [
              {
                '@type': 'Product',
                name: product.name,
                description: product.description ?? product.short_description,
                image: images.map((item) => item.url),
                sku: firstVariant?.sku ?? product.slug,
                brand: { '@type': 'Brand', name: product.brands?.name ?? 'Directlines' },
                category: product.categories?.name,
                offers: {
                  '@type': 'AggregateOffer',
                  priceCurrency: 'NGN',
                  lowPrice: Math.min(...prices),
                  highPrice: Math.max(...prices),
                  offerCount: prices.length,
                  availability: 'https://schema.org/InStock',
                  seller: { '@type': 'Organization', name: 'Directlines Technologies & Telecoms Ltd' },
                  url: `${siteUrl}/product/${product.slug}`,
                },
              },
              {
                '@type': 'BreadcrumbList',
                itemListElement: [
                  { '@type': 'ListItem', position: 1, name: 'Home', item: siteUrl },
                  { '@type': 'ListItem', position: 2, name: 'Shop', item: `${siteUrl}/shop` },
                  { '@type': 'ListItem', position: 3, name: product.name, item: `${siteUrl}/product/${product.slug}` },
                ],
              },
            ],
          }),
        }}
      />

      <div className="container-page py-8 sm:py-12">
        <nav className="flex flex-wrap items-center gap-1.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-muted" aria-label="Breadcrumb">
          <Link href="/" className="hover:text-ink">Home</Link>
          <ChevronRight className="h-3 w-3" />
          <Link href="/shop" className="hover:text-ink">Shop</Link>
          {product.categories ? (
            <>
              <ChevronRight className="h-3 w-3" />
              <Link href={`/shop?category=${product.categories.slug}`} className="hover:text-ink">{product.categories.name}</Link>
            </>
          ) : null}
          <ChevronRight className="h-3 w-3" />
          <span className="text-ink">{product.name}</span>
        </nav>

        <div className="mt-7 grid gap-9 lg:grid-cols-[1.02fr_0.98fr] lg:gap-14">
          <ProductGallery images={images} name={product.name} brand={product.brands?.name} />

          <div>
            <div className="flex flex-wrap items-center gap-2">
              <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-signal">{product.brands?.name}</p>
              {product.badge ? (
                <span className="rounded-full bg-ink px-2.5 py-1 text-[8px] font-bold uppercase tracking-[0.14em] text-white">{product.badge}</span>
              ) : null}
              <span className="rounded-full border border-line bg-white px-2.5 py-1 text-[8px] font-bold uppercase tracking-[0.14em] text-muted">
                {conditionLabel(product.condition)}
              </span>
            </div>
            <div className="mt-3 flex flex-wrap items-start justify-between gap-3">
              <h1 className="text-3xl font-semibold leading-tight text-ink sm:text-4xl">{product.name}</h1>
              <div className="flex items-center gap-2">
                <CompareToggle item={{ id: product.id, slug: product.slug, name: product.name, price: product.price, image }} label />
                <WishlistButton productId={product.id} initialSaved={Boolean(savedRow.data)} />
              </div>
            </div>
            <p className="mt-3 text-sm leading-relaxed text-muted">{product.short_description}</p>

            <div className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-2 border-y border-line py-3 text-[10px] font-semibold uppercase tracking-[0.11em] text-muted">
              <span className="inline-flex items-center gap-1.5"><ShieldCheck className="h-3.5 w-3.5 text-signal" /> {product.warranty ?? 'Warranty support'}</span>
              <span className="inline-flex items-center gap-1.5"><Truck className="h-3.5 w-3.5 text-signal" /> Delivery in Abuja</span>
              <span className="inline-flex items-center gap-1.5"><Clock className="h-3.5 w-3.5 text-signal" /> Open 24/7</span>
            </div>

            <div className="mt-6">
              <ProductPurchase
                product={product}
                image={image}
                whatsappNumber={settings.whatsapp_number}
                easybuyEnabled={settings.easybuy_enabled}
              />
            </div>

            <div className="mt-6 rounded-2xl border border-line bg-white p-5">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="flex gap-2.5">
                  <BadgeCheck className="mt-0.5 h-4 w-4 shrink-0 text-signal" />
                  <div>
                    <p className="text-xs font-semibold text-ink">Showroom pickup</p>
                    <p className="mt-0.5 text-[11px] leading-relaxed text-muted">{settings.address_full}</p>
                  </div>
                </div>
                <div className="flex gap-2.5">
                  <MessageCircle className="mt-0.5 h-4 w-4 shrink-0 text-signal" />
                  <div>
                    <p className="text-xs font-semibold text-ink">Need a colour or spec check?</p>
                    <a
                      href={createWhatsAppUrl(settings.whatsapp_number, `Hello Directlines! Please confirm the colour and full specification for ${product.name}.`)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-1 inline-flex text-[10px] font-bold uppercase tracking-[0.12em] text-signal hover:text-signal-dark"
                    >
                      Ask on WhatsApp
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-16 grid gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:gap-16">
          <div className="rounded-2xl border border-line bg-white p-6 sm:p-8">
            <h2 className="text-xl font-semibold text-ink">Key details</h2>
            <dl className="mt-5 divide-y divide-line">
              {specs.length ? (
                specs.map(([key, value]) => (
                  <div key={key} className="flex items-start justify-between gap-5 py-3 text-sm">
                    <dt className="capitalize text-muted">{key.replace(/([A-Z])/g, ' $1')}</dt>
                    <dd className="text-right font-medium text-ink">{value}</dd>
                  </div>
                ))
              ) : (
                <p className="py-3 text-sm text-muted">Ask us for the full specification on WhatsApp.</p>
              )}
              <div className="flex items-start justify-between gap-5 py-3 text-sm">
                <dt className="text-muted">Condition</dt>
                <dd className="text-right font-medium text-ink">{conditionLabel(product.condition)}</dd>
              </div>
              <div className="flex items-start justify-between gap-5 py-3 text-sm">
                <dt className="text-muted">Price</dt>
                <dd className="price text-right font-semibold text-ink">{formatNaira(product.price)}</dd>
              </div>
            </dl>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-ink">About this phone</h2>
            <p className="mt-4 text-sm leading-relaxed text-muted">{product.description}</p>
            {product.highlights.length ? (
              <ul className="mt-6 grid gap-2.5 sm:grid-cols-2">
                {product.highlights.map((highlight) => (
                  <li key={highlight} className="flex items-start gap-2 text-sm text-ink-soft">
                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-signal" />
                    {highlight}
                  </li>
                ))}
              </ul>
            ) : null}

            <div className="mt-8 rounded-2xl bg-paper-deep p-5">
              <p className="text-xs font-semibold text-ink">Before you pay</p>
              <p className="mt-1.5 text-xs leading-relaxed text-muted">
                Prices and stock change. Confirm the exact model, colour and storage on WhatsApp. If a
                device is defective on arrival, contact us immediately so we can inspect it and follow the
                warranty process.
              </p>
            </div>
          </div>
        </div>

        {reviews.length ? (
          <section className="mt-16">
            <SectionHeading eyebrow="Customer notes" title="What buyers said" />
            <div className="mt-7 grid gap-4 md:grid-cols-3">
              {reviews.map((review) => (
                <div key={review.id} className="rounded-2xl border border-line bg-white p-5">
                  <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-signal">{review.rating}/5</p>
                  {review.title ? <p className="mt-2 text-sm font-semibold text-ink">{review.title}</p> : null}
                  <p className="mt-2 text-xs leading-relaxed text-muted">{review.body}</p>
                  <p className="mt-3 text-[10px] font-semibold text-ink">{review.customer_name}{review.location ? ` · ${review.location}` : ''}</p>
                </div>
              ))}
            </div>
          </section>
        ) : null}

        {related.length ? (
          <section className="mt-16">
            <SectionHeading eyebrow="Keep looking" title="Similar phones" action={{ label: 'All phones', href: '/shop' }} />
            <div className="mt-7 grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-4">
              {related.map((item) => (
                <ProductCard key={item.id} product={item} />
              ))}
            </div>
          </section>
        ) : null}
      </div>
    </>
  );
}
