import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowRight, Clock, MessageCircle } from 'lucide-react';
import {
  getBlogPostBySlug,
  getBlogPosts,
  getProducts,
  getSettings,
} from '@/lib/queries';
import { formatDate, readingMinutes } from '@/lib/format';
import { siteMediaUrl } from '@/lib/storage';
import { createWhatsAppUrl } from '@/lib/whatsapp';
import { Markdown } from '@/components/blog/markdown';
import { ProductCard } from '@/components/store/product-card';

export const revalidate = 300;

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const post = await getBlogPostBySlug(slug);
  if (!post) return { title: 'Guide not found' };
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000';
  const cover = post.cover_url ? siteMediaUrl(post.cover_url) : null;
  return {
    title: post.seo_title ?? post.title,
    description: post.seo_description ?? post.excerpt ?? undefined,
    alternates: { canonical: `/blog/${post.slug}` },
    openGraph: {
      type: 'article',
      title: post.seo_title ?? post.title,
      description: post.seo_description ?? post.excerpt ?? undefined,
      url: `${siteUrl}/blog/${post.slug}`,
      publishedTime: post.published_at ?? undefined,
      modifiedTime: post.updated_at,
      images: cover ? [{ url: cover.startsWith('http') ? cover : `${siteUrl}${cover}` }] : undefined,
    },
  };
}

export default async function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const [post, settings] = await Promise.all([getBlogPostBySlug(slug), getSettings()]);
  if (!post) notFound();

  const [posts, products] = await Promise.all([getBlogPosts({ kind: 'blog', limit: 4 }), getProducts()]);
  const relatedPosts = posts.filter((item) => item.id !== post.id).slice(0, 3);
  const relatedProducts = products.filter((product) => post.related_product_ids.includes(product.id)).slice(0, 4);
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000';
  const cover = post.cover_url ? siteMediaUrl(post.cover_url) : null;

  return (
    <article className="container-page py-10 sm:py-14">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@graph': [
              {
                '@type': 'Article',
                headline: post.title,
                description: post.excerpt,
                image: cover ? [cover.startsWith('http') ? cover : `${siteUrl}${cover}`] : undefined,
                datePublished: post.published_at,
                dateModified: post.updated_at,
                author: { '@type': 'Organization', name: post.author },
                publisher: {
                  '@type': 'Organization',
                  name: settings.legal_name,
                  url: siteUrl,
                },
                mainEntityOfPage: `${siteUrl}/blog/${post.slug}`,
              },
              ...(post.faq?.length
                ? [
                    {
                      '@type': 'FAQPage',
                      mainEntity: post.faq.map((faq) => ({
                        '@type': 'Question',
                        name: faq.question,
                        acceptedAnswer: { '@type': 'Answer', text: faq.answer },
                      })),
                    },
                  ]
                : []),
              {
                '@type': 'BreadcrumbList',
                itemListElement: [
                  { '@type': 'ListItem', position: 1, name: 'Home', item: siteUrl },
                  { '@type': 'ListItem', position: 2, name: 'Blog', item: `${siteUrl}/blog` },
                  { '@type': 'ListItem', position: 3, name: post.title, item: `${siteUrl}/blog/${post.slug}` },
                ],
              },
            ],
          }),
        }}
      />

      <nav className="flex flex-wrap items-center gap-1.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-muted" aria-label="Breadcrumb">
        <Link href="/" className="hover:text-ink">Home</Link>
        <span>/</span>
        <Link href="/blog" className="hover:text-ink">Blog</Link>
        <span>/</span>
        <span className="text-ink">{post.category}</span>
      </nav>

      <header className="mt-6 max-w-3xl">
        <p className="eyebrow text-signal">{post.category}</p>
        <h1 className="mt-3 text-balance text-4xl font-semibold leading-tight text-ink sm:text-5xl">{post.title}</h1>
        <p className="mt-4 text-pretty text-sm leading-relaxed text-muted sm:text-base">{post.excerpt}</p>
        <div className="mt-5 flex flex-wrap items-center gap-4 border-y border-line py-3 text-[10px] font-semibold uppercase tracking-[0.12em] text-muted">
          <span>{post.author}</span>
          <span>{formatDate(post.published_at ?? post.created_at)}</span>
          <span className="inline-flex items-center gap-1"><Clock className="h-3 w-3" /> {readingMinutes(post.content)} min read</span>
          {post.kind === 'area' && post.area_slug ? (
            <Link href={`/areas/${post.area_slug}`} className="text-signal hover:text-signal-dark">Area guide</Link>
          ) : null}
        </div>
      </header>

      {cover ? (
        <div className="mt-8 overflow-hidden rounded-3xl border border-line">
          <img src={cover} alt="" className="h-auto w-full object-cover" />
        </div>
      ) : null}

      <div className="mt-9 grid gap-10 lg:grid-cols-[minmax(0,1fr)_300px] lg:gap-14">
        <div>
          <Markdown content={post.content} />

          {post.faq?.length ? (
            <section className="mt-10">
              <h2 className="text-2xl font-semibold text-ink">Questions people ask</h2>
              <div className="mt-4 divide-y divide-line rounded-2xl border border-line bg-white">
                {post.faq.map((faq) => (
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

          {relatedProducts.length ? (
            <section className="mt-12">
              <h2 className="text-2xl font-semibold text-ink">Phones mentioned in this guide</h2>
              <div className="mt-5 grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-4">
                {relatedProducts.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            </section>
          ) : null}
        </div>

        <aside className="lg:sticky lg:top-28 lg:self-start">
          <div className="rounded-2xl border border-line bg-[#142b58] p-6 text-white">
            <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#93c5fd]">Talk to the store</p>
            <p className="mt-2 text-lg font-semibold leading-snug">Need a price or stock check?</p>
            <p className="mt-2 text-xs leading-relaxed text-white/60">Send the model you have in mind. We confirm colour, storage and the current price on WhatsApp.</p>
            <a
              href={createWhatsAppUrl(settings.whatsapp_number, `Hello Directlines! I read "${post.title}" and I have a question.`)}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-4 inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-xl bg-white px-4 text-[10px] font-bold uppercase tracking-[0.14em] text-[#142b58] hover:bg-[#eef2f7]"
            >
              <MessageCircle className="h-3.5 w-3.5" />
              WhatsApp the store
            </a>
          </div>
          <div className="mt-4 rounded-2xl border border-line bg-white p-5">
            <p className="text-xs font-semibold text-ink">Browse by budget</p>
            <div className="mt-3 space-y-2 text-[11px]">
              <Link href="/shop?max=99999" className="block text-muted hover:text-signal">Under ₦100,000</Link>
              <Link href="/shop?min=100000&max=150000" className="block text-muted hover:text-signal">₦100,000 to ₦150,000</Link>
              <Link href="/shop?min=150000&max=200000" className="block text-muted hover:text-signal">₦150,000 to ₦200,000</Link>
              <Link href="/shop?min=200000" className="block text-muted hover:text-signal">₦200,000 and above</Link>
            </div>
          </div>
          <Link href="/easybuy" className="mt-4 flex items-center justify-between rounded-2xl border border-line bg-signal-soft p-5 text-xs font-semibold text-signal hover:border-signal/40">
            Apply for EasyBuy
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </aside>
      </div>

      {relatedPosts.length ? (
        <section className="mt-14 border-t border-line pt-10">
          <div className="flex items-end justify-between gap-4">
            <h2 className="text-2xl font-semibold text-ink">Keep reading</h2>
            <Link href="/blog" className="text-[10px] font-bold uppercase tracking-[0.14em] text-ink hover:text-signal">All guides</Link>
          </div>
          <div className="mt-5 grid gap-5 md:grid-cols-3">
            {relatedPosts.map((item) => (
              <Link key={item.id} href={`/blog/${item.slug}`} className="group rounded-2xl border border-line bg-white p-5 hover:border-ink">
                <p className="text-[9px] font-bold uppercase tracking-[0.14em] text-signal">{item.category}</p>
                <h3 className="mt-2 text-base font-semibold leading-snug text-ink group-hover:text-signal">{item.title}</h3>
                <p className="mt-2 line-clamp-2 text-xs leading-relaxed text-muted">{item.excerpt}</p>
              </Link>
            ))}
          </div>
        </section>
      ) : null}
    </article>
  );
}

