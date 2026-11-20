import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight, Clock } from 'lucide-react';
import { getBlogPosts } from '@/lib/queries';
import { formatDate, readingMinutes } from '@/lib/format';
import { siteMediaUrl } from '@/lib/storage';

export const revalidate = 300;

export const metadata: Metadata = {
  title: 'Phone buying guides for Abuja',
  description:
    'Directlines guides on phone prices, EasyBuy, repairs, feature phones and buying a device around Karu, Nyanya and Abuja.',
  alternates: { canonical: '/blog' },
};

export default async function BlogPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string }>;
}) {
  const params = await searchParams;
  const posts = await getBlogPosts({ kind: 'blog' });
  const categories = Array.from(new Set(posts.map((post) => post.category))).sort();
  const filtered = params.category ? posts.filter((post) => post.category === params.category) : posts;
  const [featured, ...rest] = filtered;

  return (
    <div className="container-page py-10 sm:py-14">
      <nav className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.14em] text-muted" aria-label="Breadcrumb">
        <Link href="/" className="hover:text-ink">Home</Link>
        <span>/</span>
        <span className="text-ink">Blog</span>
      </nav>

      <header className="mt-6 max-w-3xl">
        <p className="eyebrow text-signal">Directlines guides</p>
        <h1 className="mt-3 text-4xl font-semibold leading-tight text-ink sm:text-5xl">
          Straight answers before you buy.
        </h1>
        <p className="mt-4 text-sm leading-relaxed text-muted sm:text-base">
          Prices, model comparisons, EasyBuy requirements, repairs and where to buy a phone around Karu,
          Nyanya and Abuja. Written for people who want the facts, not a sales pitch.
        </p>
      </header>

      <div className="mt-7 flex flex-wrap gap-2">
        <Link
          href="/blog"
          className={`rounded-full border px-3.5 py-1.5 text-[10px] font-bold uppercase tracking-[0.13em] ${!params.category ? 'border-ink bg-ink text-white' : 'border-line bg-white text-muted hover:border-ink hover:text-ink'}`}
        >
          All guides
        </Link>
        {categories.map((category) => (
          <Link
            key={category}
            href={`/blog?category=${encodeURIComponent(category)}`}
            className={`rounded-full border px-3.5 py-1.5 text-[10px] font-bold uppercase tracking-[0.13em] ${params.category === category ? 'border-ink bg-ink text-white' : 'border-line bg-white text-muted hover:border-ink hover:text-ink'}`}
          >
            {category}
          </Link>
        ))}
      </div>

      {featured ? (
        <Link href={`/blog/${featured.slug}`} className="group mt-8 grid overflow-hidden rounded-3xl border border-line bg-white lg:grid-cols-[1.05fr_0.95fr]">
          <div className="relative min-h-64 overflow-hidden bg-[radial-gradient(circle_at_30%_20%,#ffffff,#eef2f7_60%,#e3e9f1)] lg:min-h-96">
            {featured.cover_url ? (
              <img src={siteMediaUrl(featured.cover_url)} alt="" className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.02]" />
            ) : (
              <div className="absolute inset-0 flex items-end p-8">
                <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-ink/40">Directlines guide</p>
              </div>
            )}
          </div>
          <div className="p-7 sm:p-10">
            <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-signal">{featured.category}</p>
            <h2 className="mt-3 text-2xl font-semibold leading-tight text-ink group-hover:text-signal sm:text-3xl">{featured.title}</h2>
            <p className="mt-3 line-clamp-4 text-sm leading-relaxed text-muted">{featured.excerpt}</p>
            <div className="mt-5 flex items-center gap-4 text-[10px] font-semibold uppercase tracking-[0.12em] text-muted">
              <span>{formatDate(featured.published_at)}</span>
              <span className="inline-flex items-center gap-1"><Clock className="h-3 w-3" /> {readingMinutes(featured.content)} min</span>
            </div>
            <span className="mt-6 inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.14em] text-ink">
              Read guide <ArrowRight className="h-3 w-3" />
            </span>
          </div>
        </Link>
      ) : (
        <div className="mt-8 rounded-2xl border border-line bg-white p-10 text-center text-sm text-muted">
          No guides published yet.
        </div>
      )}

      {rest.length ? (
        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {rest.map((post) => (
            <Link key={post.id} href={`/blog/${post.slug}`} className="group flex flex-col rounded-2xl border border-line bg-white p-6 hover:border-ink">
              <p className="text-[9px] font-bold uppercase tracking-[0.16em] text-signal">{post.category}</p>
              <h2 className="mt-3 text-lg font-semibold leading-snug text-ink group-hover:text-signal">{post.title}</h2>
              <p className="mt-3 line-clamp-3 text-xs leading-relaxed text-muted">{post.excerpt}</p>
              <div className="mt-auto flex items-center gap-3 pt-5 text-[9px] font-semibold uppercase tracking-[0.12em] text-muted">
                <span>{formatDate(post.published_at)}</span>
                <span className="inline-flex items-center gap-1"><Clock className="h-2.5 w-2.5" /> {readingMinutes(post.content)} min</span>
              </div>
            </Link>
          ))}
        </div>
      ) : null}
    </div>
  );
}
