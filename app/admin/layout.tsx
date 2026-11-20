import type { Metadata } from 'next';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import {
  BarChart3,
  BookOpen,
  Boxes,
  CreditCard,
  Gauge,
  Heart,
  LayoutDashboard,
  MessageSquare,
  Settings,
  ShoppingBag,
  Star,
  Tags,
  Users,
  Wrench,
  Zap,
} from 'lucide-react';
import { createClient } from '@/lib/supabase/server';
import { AdminSignOutButton } from '@/components/admin/sign-out-button';
import { OfficialLogo } from '@/components/layout/official-logo';

export const metadata: Metadata = {
  title: 'Admin',
  robots: { index: false, follow: false },
};

const tabs = [
  { href: '/admin', label: 'Dashboard', icon: LayoutDashboard, adminOnly: false },
  { href: '/admin/products', label: 'Products', icon: Boxes, adminOnly: false },
  { href: '/admin/categories', label: 'Categories', icon: Tags, adminOnly: false },
  { href: '/admin/orders', label: 'Orders', icon: ShoppingBag, adminOnly: false },
  { href: '/admin/customers', label: 'Customers', icon: Users, adminOnly: false },
  { href: '/admin/easybuy', label: 'EasyBuy', icon: Zap, adminOnly: false },
  { href: '/admin/repairs', label: 'Repairs', icon: Wrench, adminOnly: false },
  { href: '/admin/blog', label: 'Blog', icon: BookOpen, adminOnly: false },
  { href: '/admin/reviews', label: 'Reviews', icon: Star, adminOnly: false },
  { href: '/admin/coupons', label: 'Coupons', icon: CreditCard, adminOnly: true },
  { href: '/admin/loyalty', label: 'Loyalty', icon: Heart, adminOnly: true },
  { href: '/admin/analytics', label: 'Analytics', icon: BarChart3, adminOnly: true },
  { href: '/admin/meta', label: 'Meta', icon: MessageSquare, adminOnly: true },
  { href: '/admin/settings', label: 'Settings', icon: Settings, adminOnly: true },
];

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect('/login?next=/admin');

  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name, role')
    .eq('id', user.id)
    .single();
  if (!profile || (profile.role !== 'admin' && profile.role !== 'staff')) redirect('/account');
  const visibleTabs = tabs.filter((tab) => !tab.adminOnly || profile.role === 'admin');

  return (
    <div className="min-h-screen bg-paper lg:flex">
      <aside className="hidden w-64 shrink-0 flex-col bg-[#142b58] px-4 py-6 text-white lg:flex">
        <Link href="/admin" className="px-2"><OfficialLogo theme="dark" size="sm" /></Link>
        <p className="mt-3 px-2 text-[9px] font-bold uppercase tracking-[0.22em] text-white/35">Store admin</p>

        <nav className="mt-7 flex-1 space-y-0.5 overflow-y-auto custom-scrollbar">
          {visibleTabs.map((tab) => (
            <Link
              key={tab.href}
              href={tab.href}
              className="flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-[11px] font-semibold text-white/60 transition-colors hover:bg-white/10 hover:text-white"
            >
              <tab.icon className="h-3.5 w-3.5" />
              {tab.label}
            </Link>
          ))}
        </nav>

        <div className="mt-5 border-t border-white/10 pt-4">
          <Link href="/" className="flex items-center gap-2 px-3 py-2 text-[10px] font-bold uppercase tracking-[0.12em] text-white/50 hover:text-white">
            <Gauge className="h-3.5 w-3.5" /> View store
          </Link>
          <div className="mt-3 rounded-xl bg-white/5 p-3">
            <p className="truncate text-[11px] font-semibold">
              {profile.full_name || 'Admin'}{' '}
              <span className="ml-1 rounded-full bg-white/10 px-1.5 py-0.5 text-[8px] uppercase tracking-[0.1em] text-white/50">
                {profile.role}
              </span>
            </p>
            <p className="mt-0.5 truncate text-[9px] text-white/40">{user.email}</p>
            <div className="mt-3"><AdminSignOutButton /></div>
          </div>
        </div>
      </aside>

      <div className="min-w-0 flex-1">
        <header className="sticky top-0 z-30 border-b border-line bg-white/95 backdrop-blur lg:hidden">
          <div className="flex items-center justify-between px-4 py-3">
            <Link href="/admin"><OfficialLogo size="sm" /></Link>
            <div className="flex items-center gap-2">
              <Link href="/" className="rounded-lg border border-line px-3 py-2 text-[9px] font-bold uppercase tracking-[0.12em] text-muted">Store</Link>
              <AdminSignOutButton />
            </div>
          </div>
          <nav className="flex gap-1 overflow-x-auto px-3 pb-2 hide-scrollbar">
          {visibleTabs.map((tab) => (
              <Link key={tab.href} href={tab.href} className="whitespace-nowrap rounded-lg px-3 py-2 text-[10px] font-semibold text-muted hover:bg-paper hover:text-ink">
                {tab.label}
              </Link>
            ))}
          </nav>
        </header>

        <main className="mx-auto max-w-6xl px-4 py-8 sm:px-7 lg:px-10 lg:py-10">{children}</main>
      </div>
    </div>
  );
}



