import type { Metadata } from 'next';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { Package, Star, UserRound } from 'lucide-react';
import { createClient } from '@/lib/supabase/server';
import { formatNaira, formatDate } from '@/lib/format';
import { updateProfile } from '@/app/actions/account';
import { SignOutButton } from './sign-out-button';
import { PasswordForm } from '@/components/account/password-form';

export const metadata: Metadata = {
  title: 'My account',
  robots: { index: false, follow: false },
};

export const dynamic = 'force-dynamic';

const statusStyles: Record<string, string> = {
  received: 'bg-[#fff6df] text-[#8a6100]',
  confirmed: 'bg-[#eaf2ff] text-[#1a4f9c]',
  processing: 'bg-[#eef0ff] text-[#3d48a8]',
  dispatched: 'bg-[#eaf7ff] text-[#0c678f]',
  delivered: 'bg-[#eaf7ef] text-[#1f7a4a]',
  cancelled: 'bg-signal-soft text-signal',
};

export default async function AccountPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string }>;
}) {
  const { tab } = await searchParams;
  const activeTab = tab === 'profile' || tab === 'loyalty' ? tab : 'orders';
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect('/login?next=/account');

  const [profileResult, ordersResult, wishlistResult, loyaltySettingsResult, balanceResult] = await Promise.all([
    supabase.from('profiles').select('full_name, email, phone, role').eq('id', user.id).single(),
    supabase.from('orders').select('id, order_number, total, status, payment_status, created_at').order('created_at', { ascending: false }),
    supabase.from('wishlists').select('product_id', { count: 'exact', head: true }),
    supabase.from('loyalty_settings').select('enabled, naira_per_point').single(),
    supabase.rpc('loyalty_balance'),
  ]);

  const profile = profileResult.data;
  const orders = ordersResult.data ?? [];
  const wishlistCount = wishlistResult.count ?? 0;
  const loyalty = loyaltySettingsResult.data;
  const balance = typeof balanceResult.data === 'number' ? balanceResult.data : 0;
  const isAdmin = profile?.role === 'admin';

  return (
    <div className="container-page py-10 sm:py-14">
      <header className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <p className="eyebrow text-signal">My account</p>
          <h1 className="mt-2 text-3xl font-semibold text-ink">{profile?.full_name || 'Welcome'}</h1>
          <p className="mt-1 text-xs text-muted">{profile?.email ?? user.email}</p>
        </div>
        <div className="flex items-center gap-2">
          {isAdmin ? <Link href="/admin" className="btn-primary">Admin</Link> : null}
          <SignOutButton />
        </div>
      </header>

      <div className="mt-7 grid grid-cols-3 gap-3">
        <div className="rounded-2xl border border-line bg-white p-5">
          <Package className="h-4 w-4 text-signal" />
          <p className="mt-3 text-2xl font-semibold text-ink">{orders.length}</p>
          <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-muted">Orders</p>
        </div>
        <Link href="/wishlist" className="rounded-2xl border border-line bg-white p-5 hover:border-ink">
          <Star className="h-4 w-4 text-signal" />
          <p className="mt-3 text-2xl font-semibold text-ink">{wishlistCount}</p>
          <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-muted">Saved</p>
        </Link>
        <div className="rounded-2xl border border-line bg-white p-5">
          <UserRound className="h-4 w-4 text-signal" />
          <p className="mt-3 text-2xl font-semibold text-ink">{loyalty?.enabled ? balance.toLocaleString() : '"”'}</p>
          <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-muted">Points</p>
        </div>
      </div>

      <nav className="mt-7 flex flex-wrap gap-2">
        {[
          { key: 'orders', label: 'Orders' },
          { key: 'profile', label: 'My details' },
          ...(loyalty?.enabled ? [{ key: 'loyalty', label: 'Loyalty' }] : []),
        ].map((item) => (
          <Link
            key={item.key}
            href={item.key === 'orders' ? '/account' : `/account?tab=${item.key}`}
            className={`rounded-full border px-4 py-2 text-[10px] font-bold uppercase tracking-[0.13em] ${
              activeTab === item.key ? 'border-ink bg-ink text-white' : 'border-line bg-white text-muted hover:border-ink hover:text-ink'
            }`}
          >
            {item.label}
          </Link>
        ))}
      </nav>

      {activeTab === 'orders' ? (
        <section className="mt-6">
          {orders.length === 0 ? (
            <div className="rounded-2xl border border-line bg-white p-10 text-center">
              <p className="text-sm text-muted">You have no orders yet.</p>
              <Link href="/shop" className="btn-primary mt-5 inline-flex">Browse phones</Link>
            </div>
          ) : (
            <div className="overflow-hidden rounded-2xl border border-line bg-white">
              <div className="divide-y divide-line">
                {orders.map((order) => (
                  <div key={order.id} className="flex flex-col gap-3 p-5 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <p className="text-sm font-semibold text-ink">#{order.order_number}</p>
                      <p className="mt-0.5 text-[11px] text-muted">{formatDate(order.created_at)} · {order.payment_status.replace(/_/g, ' ')}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className={`rounded-full px-2.5 py-1 text-[9px] font-bold uppercase tracking-[0.12em] ${statusStyles[order.status] ?? 'bg-paper-deep text-muted'}`}>
                        {order.status}
                      </span>
                      <span className="price text-sm font-semibold">{formatNaira(order.total)}</span>
                      <Link href={`/track?order=${encodeURIComponent(order.order_number)}&phone=${encodeURIComponent(profile?.phone ?? '')}`} className="text-[10px] font-bold uppercase tracking-[0.12em] text-signal hover:text-signal-dark">
                        Track
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </section>
      ) : null}

      {activeTab === 'profile' ? (
        <section className="mt-6 max-w-xl rounded-2xl border border-line bg-white p-5 sm:p-6">
          <h2 className="text-base font-semibold text-ink">My details</h2>
          <form action={updateProfile} className="mt-4 space-y-4">
            <div>
              <label className="label" htmlFor="full_name">Full name</label>
              <input id="full_name" name="full_name" defaultValue={profile?.full_name ?? ''} className="field" />
            </div>
            <div>
              <label className="label" htmlFor="phone">Phone</label>
              <input id="phone" name="phone" defaultValue={profile?.phone ?? ''} className="field" inputMode="tel" />
            </div>
            <div>
              <label className="label">Email</label>
              <input value={profile?.email ?? user.email ?? ''} className="field bg-paper" readOnly />
            </div>
            <button type="submit" className="btn-primary">Save details</button>
          </form>
          <PasswordForm />
        </section>
      ) : null}

      {activeTab === 'loyalty' && loyalty?.enabled ? (
        <section className="mt-6 max-w-xl rounded-2xl border border-line bg-white p-5 sm:p-6">
          <h2 className="text-base font-semibold text-ink">Loyalty points</h2>
          <p className="mt-2 text-sm text-muted">Your balance is <span className="font-semibold text-ink">{balance.toLocaleString()} points</span>. The store confirms redemption on WhatsApp.</p>
          <p className="mt-3 text-xs leading-relaxed text-muted">1 point is worth about {formatNaira(loyalty.naira_per_point)} when redemption is enabled by the store.</p>
          <Link href="/shop" className="btn-secondary mt-5">Shop and earn</Link>
        </section>
      ) : null}
    </div>
  );
}

