'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Menu, Search, ShoppingBag, UserRound, X } from 'lucide-react';
import { useCart } from '@/components/cart/cart-context';
import { OfficialLogo } from '@/components/layout/official-logo';

const links = [
  { label: 'Shop all', href: '/shop' },
  { label: 'Smartphones', href: '/shop?category=smartphones' },
  { label: 'Feature phones', href: '/shop?category=feature-phones' },
  { label: 'Accessories', href: '/accessories' },
  { label: 'EasyBuy', href: '/easybuy' },
  { label: 'Repairs', href: '/repairs' },
  { label: 'Blog', href: '/blog' },
  { label: 'Contact', href: '/contact' },
];

export function Navbar({
  phone,
  hours,
  storeName,
}: {
  phone: string;
  hours: string;
  storeName: string;
}) {
  const pathname = usePathname();
  const { count, setOpen } = useCart();
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  useEffect(() => {
    setMenuOpen(false);
    setSearchOpen(false);
  }, [pathname]);

  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [menuOpen]);

  return (
    <>
      <div className="hidden border-b border-line bg-paper-deep md:block">
        <div className="container-page flex h-9 items-center justify-between text-[10px] font-semibold uppercase tracking-[0.16em] text-muted">
          <p>{storeName}</p>
          <div className="flex items-center gap-5">
            <span>{hours}</span>
            <a href={`tel:${phone.replace(/\s/g, '')}`} className="hover:text-ink">
              {phone}
            </a>
          </div>
        </div>
      </div>

      <header className="sticky top-0 z-50 border-b border-line bg-white/95 backdrop-blur-lg">
        <div className="container-page flex h-18 items-center justify-between gap-4 py-3">
          <Link href="/" aria-label="Directlines home"><OfficialLogo size="sm" /></Link>

          <nav className="hidden items-center gap-6 lg:flex" aria-label="Primary">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`text-[11px] font-bold uppercase tracking-[0.12em] transition-colors ${
                  pathname === link.href.split('?')[0] ? 'text-signal' : 'text-ink-soft hover:text-signal'
                }`}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => setSearchOpen((value) => !value)}
              className="rounded-lg p-2.5 text-ink-soft hover:bg-paper hover:text-ink"
              aria-label="Search"
            >
              <Search className="h-4 w-4" />
            </button>
            <Link
              href="/account"
              className="hidden rounded-lg p-2.5 text-ink-soft hover:bg-paper hover:text-ink sm:block"
              aria-label="Account"
            >
              <UserRound className="h-4 w-4" />
            </Link>
            <button
              type="button"
              onClick={() => setOpen(true)}
              className="relative rounded-lg p-2.5 text-ink-soft hover:bg-paper hover:text-ink"
              aria-label="Open cart"
            >
              <ShoppingBag className="h-4 w-4" />
              {count > 0 ? (
                <span className="absolute -right-0.5 -top-0.5 grid h-4 min-w-4 place-items-center rounded-full bg-signal px-1 text-[9px] font-bold text-white">
                  {count}
                </span>
              ) : null}
            </button>
            <button
              type="button"
              onClick={() => setMenuOpen(true)}
              className="rounded-lg p-2.5 text-ink-soft hover:bg-paper hover:text-ink lg:hidden"
              aria-label="Open menu"
            >
              <Menu className="h-5 w-5" />
            </button>
          </div>
        </div>

        {searchOpen ? (
          <div className="border-t border-line bg-white">
            <form action="/shop" className="container-page flex gap-2 py-3">
              <input
                name="q"
                autoFocus
                placeholder="Search Infinix, TECNO, Samsung, itel, Redmi..."
                className="field flex-1"
              />
              <button type="submit" className="btn-primary">
                Search
              </button>
            </form>
          </div>
        ) : null}
      </header>

      {menuOpen ? (
        <div className="fixed inset-0 z-[60] lg:hidden">
          <button
            aria-label="Close menu"
            onClick={() => setMenuOpen(false)}
            className="absolute inset-0 bg-[#142b58]/40 backdrop-blur-sm"
          />
          <div className="absolute right-0 top-0 flex h-full w-[86%] max-w-sm flex-col bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-line px-5 py-4">
              <OfficialLogo size="sm" />
              <button
                onClick={() => setMenuOpen(false)}
                className="rounded-lg p-2 text-muted hover:bg-paper"
                aria-label="Close menu"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <nav className="flex-1 overflow-y-auto px-5 py-5" aria-label="Mobile">
              <div className="space-y-1">
                {links.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="flex items-center justify-between rounded-xl px-3 py-3.5 text-sm font-semibold text-ink hover:bg-paper"
                  >
                    {link.label}
                    <span className="text-muted">›</span>
                  </Link>
                ))}
              </div>
              <div className="mt-6 space-y-1 border-t border-line pt-4">
                <Link href="/about" className="block rounded-xl px-3 py-3 text-sm text-muted hover:bg-paper">
                  About Directlines
                </Link>
                <Link href="/delivery" className="block rounded-xl px-3 py-3 text-sm text-muted hover:bg-paper">
                  Delivery
                </Link>
                <Link href="/track" className="block rounded-xl px-3 py-3 text-sm text-muted hover:bg-paper">
                  Track an order
                </Link>
                <Link href="/account" className="block rounded-xl px-3 py-3 text-sm text-muted hover:bg-paper">
                  My account
                </Link>
              </div>
            </nav>
            <div className="border-t border-line px-5 py-5">
              <a href={`tel:${phone.replace(/\s/g, '')}`} className="btn-primary w-full">
                Call {phone}
              </a>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}


