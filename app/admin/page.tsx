import Link from 'next/link';
import { ArrowRight, MessageCircle, Package, ShoppingBag, Wrench, Zap } from 'lucide-react';
import { createAdminClient } from '@/lib/supabase/admin';
import { formatNaira } from '@/lib/format';
import { BarChart, PageHeader, StatCard, StatusPill, cardClass } from '@/components/admin/ui';

export const dynamic = 'force-dynamic';

export default async function AdminDashboardPage() {
  const admin = createAdminClient();
  const since = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();

  const [
    productsResult,
    ordersResult,
    customersResult,
    easybuyResult,
    repairsResult,
    postsResult,
    analyticsResult,
    metaResult,
    recentResult,
    itemsResult,
  ] = await Promise.all([
    admin.from('products').select('id, is_active').eq('is_active', true),
    admin
      .from('orders')
      .select('id, order_number, customer_name, total, status, payment_status, created_at')
      .order('created_at', { ascending: false })
      .limit(300),
    admin.from('profiles').select('id', { count: 'exact', head: true }).eq('role', 'customer'),
    admin.from('easybuy_applications').select('id', { count: 'exact', head: true }).eq('status', 'new'),
    admin.from('repair_bookings').select('id', { count: 'exact', head: true }).eq('status', 'new'),
    admin.from('blog_posts').select('id', { count: 'exact', head: true }).eq('status', 'published'),
    admin.from('analytics_events').select('name, created_at, visitor_hash').gte('created_at', since),
    admin.from('meta_events').select('id, status').gte('created_at', since),
    admin
      .from('orders')
      .select('id, order_number, customer_name, total, status, payment_status, created_at')
      .order('created_at', { ascending: false })
      .limit(8),
    admin.from('order_items').select('product_name, quantity, line_total, created_at').gte('created_at', since),
  ]);

  const products = productsResult.data ?? [];
  const orders = ordersResult.data ?? [];
  const paidRevenue = orders.filter((order) => order.payment_status === 'paid').reduce((sum, order) => sum + Number(order.total), 0);
  const pendingValue = orders.filter((order) => order.payment_status === 'pending').reduce((sum, order) => sum + Number(order.total), 0);
  const newOrders = orders.filter((order) => order.status === 'received').length;
  const analytics = analyticsResult.data ?? [];
  const pageviews = analytics.filter((event) => event.name === 'page_view');
  const visitors = new Set(pageviews.map((event) => event.visitor_hash).filter(Boolean)).size;

  const days = Array.from({ length: 7 }, (_, index) => {
    const date = new Date();
    date.setDate(date.getDate() - (6 - index));
    const key = date.toISOString().slice(0, 10);
    return {
      key,
      label: date.toLocaleDateString('en-NG', { weekday: 'short' }),
      value: pageviews.filter((event) => event.created_at.slice(0, 10) === key).length,
    };
  });

  const productTotals = new Map<string, { units: number; revenue: number }>();
  for (const item of itemsResult.data ?? []) {
    const current = productTotals.get(item.product_name) ?? { units: 0, revenue: 0 };
    current.units += item.quantity;
    current.revenue += Number(item.line_total);
    productTotals.set(item.product_name, current);
  }
  const topProducts = Array.from(productTotals.entries())
    .sort((a, b) => b[1].revenue - a[1].revenue)
    .slice(0, 5);

  return (
    <div>
      <PageHeader
        title="Dashboard"
        subtitle="Live store numbers, orders, leads and traffic at a glance."
        action={
          <Link href="/admin/products/new" className="inline-flex items-center gap-2 rounded-xl bg-signal px-4 py-2.5 text-[10px] font-bold uppercase tracking-[0.14em] text-white hover:bg-signal-dark">
            <Package className="h-3.5 w-3.5" /> New product
          </Link>
        }
      />

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard label="Paid revenue" value={formatNaira(paidRevenue)} accent hint="Across the last 300 orders" />
        <StatCard label="Pending value" value={formatNaira(pendingValue)} hint="Awaiting payment" />
        <StatCard label="New orders" value={String(newOrders)} hint="Status: received" />
        <StatCard label="Live products" value={String(products.length)} hint={`${postsResult.count ?? 0} published guides`} />
      </div>

      <div className="mt-4 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard label="Customers" value={String(customersResult.count ?? 0)} />
        <StatCard label="New EasyBuy" value={String(easybuyResult.count ?? 0)} hint="Awaiting review" />
        <StatCard label="New repairs" value={String(repairsResult.count ?? 0)} hint="Awaiting contact" />
        <StatCard label="Meta events / 7d" value={String(metaResult.data?.length ?? 0)} hint={`${metaResult.data?.filter((event) => event.status === 'sent').length ?? 0} sent`} />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
        <section className={cardClass}>
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-sm font-semibold text-ink">Pageviews, last 7 days</p>
              <p className="mt-1 text-[11px] text-muted">{pageviews.length} pageviews · about {visitors} daily unique visitors</p>
            </div>
            <Link href="/admin/analytics" className="text-[10px] font-bold uppercase tracking-[0.12em] text-signal hover:text-signal-dark">Analytics</Link>
          </div>
          <div className="mt-5">
            <BarChart data={days.map(({ label, value }) => ({ label, value }))} />
          </div>
          <div className="mt-5 grid grid-cols-3 gap-3 border-t border-line pt-4">
            <div><p className="text-[9px] font-bold uppercase tracking-[0.12em] text-muted">Add to cart</p><p className="mt-1 text-lg font-semibold">{analytics.filter((event) => event.name === 'add_to_cart').length}</p></div>
            <div><p className="text-[9px] font-bold uppercase tracking-[0.12em] text-muted">Checkouts</p><p className="mt-1 text-lg font-semibold">{analytics.filter((event) => event.name === 'begin_checkout').length}</p></div>
            <div><p className="text-[9px] font-bold uppercase tracking-[0.12em] text-muted">Orders placed</p><p className="mt-1 text-lg font-semibold">{analytics.filter((event) => event.name === 'order_placed').length}</p></div>
          </div>
        </section>

        <section className={cardClass}>
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-sm font-semibold text-ink">Top products, last 7 days</p>
              <p className="mt-1 text-[11px] text-muted">By order value.</p>
            </div>
            <Link href="/admin/products" className="text-[10px] font-bold uppercase tracking-[0.12em] text-signal hover:text-signal-dark">Products</Link>
          </div>
          {topProducts.length ? (
            <div className="mt-4 divide-y divide-line">
              {topProducts.map(([name, data]) => (
                <div key={name} className="flex items-center justify-between gap-3 py-3">
                  <div className="min-w-0">
                    <p className="truncate text-xs font-semibold text-ink">{name}</p>
                    <p className="mt-0.5 text-[10px] text-muted">{data.units} sold</p>
                  </div>
                  <p className="price shrink-0 text-xs font-semibold">{formatNaira(data.revenue)}</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="mt-6 text-xs text-muted">No order items in the last 7 days.</p>
          )}
        </section>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        <section className={cardClass}>
          <div className="flex items-center justify-between gap-3">
            <p className="text-sm font-semibold text-ink">Recent orders</p>
            <Link href="/admin/orders" className="text-[10px] font-bold uppercase tracking-[0.12em] text-signal hover:text-signal-dark">View all</Link>
          </div>
          {(recentResult.data ?? []).length ? (
            <div className="mt-3 divide-y divide-line">
              {(recentResult.data ?? []).map((order) => (
                <Link key={order.id} href={`/admin/orders/${order.id}`} className="-mx-2 flex items-center justify-between gap-3 rounded-lg px-2 py-3 hover:bg-paper">
                  <div className="min-w-0">
                    <p className="text-xs font-semibold text-ink">#{order.order_number}</p>
                    <p className="mt-0.5 truncate text-[10px] text-muted">{order.customer_name} · {new Date(order.created_at).toLocaleDateString('en-NG')}</p>
                  </div>
                  <div className="flex shrink-0 items-center gap-2">
                    <StatusPill status={order.status} />
                    <span className="price text-xs font-semibold">{formatNaira(order.total)}</span>
                    <ArrowRight className="h-3 w-3 text-muted" />
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <p className="mt-6 text-xs text-muted">No orders yet.</p>
          )}
        </section>

        <section className={cardClass}>
          <p className="text-sm font-semibold text-ink">Today&apos;s queue</p>
          <div className="mt-4 space-y-3">
            <Link href="/admin/orders?status=received" className="flex items-center gap-3 rounded-xl border border-line p-4 hover:border-ink">
              <ShoppingBag className="h-4 w-4 text-signal" />
              <div className="flex-1"><p className="text-xs font-semibold">New orders</p><p className="text-[10px] text-muted">{newOrders} waiting</p></div>
              <ArrowRight className="h-3.5 w-3.5 text-muted" />
            </Link>
            <Link href="/admin/easybuy" className="flex items-center gap-3 rounded-xl border border-line p-4 hover:border-ink">
              <Zap className="h-4 w-4 text-signal" />
              <div className="flex-1"><p className="text-xs font-semibold">EasyBuy applications</p><p className="text-[10px] text-muted">{easybuyResult.count ?? 0} new</p></div>
              <ArrowRight className="h-3.5 w-3.5 text-muted" />
            </Link>
            <Link href="/admin/repairs" className="flex items-center gap-3 rounded-xl border border-line p-4 hover:border-ink">
              <Wrench className="h-4 w-4 text-signal" />
              <div className="flex-1"><p className="text-xs font-semibold">Repair bookings</p><p className="text-[10px] text-muted">{repairsResult.count ?? 0} new</p></div>
              <ArrowRight className="h-3.5 w-3.5 text-muted" />
            </Link>
            <a href="https://wa.me/2349033834939" target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 rounded-xl border border-line p-4 hover:border-ink">
              <MessageCircle className="h-4 w-4 text-[#1f9d55]" />
              <div className="flex-1"><p className="text-xs font-semibold">Open store WhatsApp</p><p className="text-[10px] text-muted">+234 903 383 4939</p></div>
              <ArrowRight className="h-3.5 w-3.5 text-muted" />
            </a>
          </div>
        </section>
      </div>
    </div>
  );
}
