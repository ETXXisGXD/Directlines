import Link from 'next/link';
import { ArrowRight, Check, MapPin, Zap } from 'lucide-react';
import type { Product, Settings } from '@/lib/queries';
import { formatNaira } from '@/lib/format';
import { createWhatsAppUrl } from '@/lib/whatsapp';

const budgets = [
  { label: 'Under ₦100,000', href: '/shop?max=99999' },
  { label: '₦100,000 to ₦150,000', href: '/shop?min=100000&max=150000' },
  { label: '₦150,000 to ₦200,000', href: '/shop?min=150000&max=200000' },
  { label: '₦200,000 and above', href: '/shop?min=200000' },
];

export function Hero({ settings, products }: { settings: Settings; products: Product[] }) {
  const cheapest = products.length ? Math.min(...products.map((product) => Number(product.price))) : 0;
  const picks = products.filter((product) => product.is_featured).slice(0, 3);

  return (
    <section className="relative overflow-hidden border-b border-line bg-paper">
      <div className="pointer-events-none absolute -right-40 -top-40 h-[32rem] w-[32rem] rounded-full border-[54px] border-signal/10" aria-hidden />
      <div className="pointer-events-none absolute bottom-0 left-1/2 h-36 w-px bg-line" aria-hidden />

      <div className="container-page relative grid gap-12 py-14 sm:py-20 lg:grid-cols-[1.12fr_0.88fr] lg:items-center lg:gap-16 lg:py-24">
        <div>
          <div className="flex flex-wrap items-center gap-3 text-[10px] font-bold uppercase tracking-[0.18em] text-muted">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-line bg-white px-3 py-1.5">
              <MapPin className="h-3 w-3 text-signal" />
              {settings.hero_eyebrow}
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-[#142b58] px-3 py-1.5 text-white">
              <Zap className="h-3 w-3 text-[#60a5fa]" />
              EasyBuy available
            </span>
          </div>

          <h1 className="mt-6 max-w-3xl text-balance text-4xl font-semibold leading-[1.02] text-ink sm:text-5xl lg:text-6xl">
            {settings.hero_title}
          </h1>
          <p className="mt-5 max-w-xl text-pretty text-sm leading-relaxed text-muted sm:text-base">
            {settings.hero_subtitle}
          </p>

          <div className="mt-8 flex flex-wrap items-center gap-3">
            <Link href="/shop" className="btn-primary">
              Shop phones
              <ArrowRight className="h-4 w-4" />
            </Link>
            <a
              href={createWhatsAppUrl(
                settings.whatsapp_number,
                'Hello Directlines! I want help choosing a phone from your website.'
              )}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-secondary"
            >
              Ask on WhatsApp
            </a>
          </div>

          <div className="mt-9 grid max-w-lg grid-cols-3 gap-5 border-t border-line pt-5">
            <div>
              <p className="price text-lg font-semibold text-ink">{formatNaira(cheapest)}</p>
              <p className="mt-0.5 text-[9px] font-bold uppercase tracking-[0.14em] text-muted">Entry price</p>
            </div>
            <div>
              <p className="text-lg font-semibold text-ink">25</p>
              <p className="mt-0.5 text-[9px] font-bold uppercase tracking-[0.14em] text-muted">Phone options</p>
            </div>
            <div>
              <p className="text-lg font-semibold text-ink">24/7</p>
              <p className="mt-0.5 text-[9px] font-bold uppercase tracking-[0.14em] text-muted">Showroom</p>
            </div>
          </div>
        </div>

        <div className="relative">
          <div className="rounded-3xl border border-line bg-white p-5 shadow-[0_28px_70px_-48px_rgba(20,43,88,0.45)] sm:p-7">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="eyebrow text-signal">Start with your budget</p>
                <h2 className="mt-2 text-xl font-semibold text-ink">Pick a range, see what fits.</h2>
              </div>
              <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-signal-soft text-signal">
                <Zap className="h-4 w-4" />
              </span>
            </div>

            <div className="mt-5 grid gap-2">
              {budgets.map((budget) => (
                <Link
                  key={budget.href}
                  href={budget.href}
                  className="flex items-center justify-between rounded-xl border border-line px-4 py-3 text-xs font-semibold text-ink transition-colors hover:border-ink hover:bg-paper"
                >
                  {budget.label}
                  <ArrowRight className="h-3.5 w-3.5 text-muted" />
                </Link>
              ))}
            </div>

            {picks.length ? (
              <div className="mt-5 border-t border-line pt-5">
                <p className="text-[9px] font-bold uppercase tracking-[0.18em] text-muted">Popular right now</p>
                <div className="mt-3 space-y-2.5">
                  {picks.map((product) => (
                    <Link
                      key={product.id}
                      href={`/product/${product.slug}`}
                      className="flex items-center justify-between gap-3 text-xs text-ink-soft hover:text-signal"
                    >
                      <span className="truncate">{product.name}</span>
                      <span className="price shrink-0 font-semibold text-ink">{formatNaira(product.price)}</span>
                    </Link>
                  ))}
                </div>
              </div>
            ) : null}
          </div>

          <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2 px-1 text-[10px] font-semibold text-muted">
            <span className="inline-flex items-center gap-1.5"><Check className="h-3 w-3 text-signal" /> Sealed devices</span>
            <span className="inline-flex items-center gap-1.5"><Check className="h-3 w-3 text-signal" /> Warranty support</span>
            <span className="inline-flex items-center gap-1.5"><Check className="h-3 w-3 text-signal" /> Nationwide delivery</span>
          </div>
        </div>
      </div>
    </section>
  );
}

