import { createAdminClient } from '@/lib/supabase/admin';
import { formatNaira } from '@/lib/format';
import { BarChart, PageHeader, StatCard, cardClass } from '@/components/admin/ui';
import { requireAdminPage } from '@/lib/admin-auth';

export const dynamic = 'force-dynamic';

export default async function AdminAnalyticsPage() {
  await requireAdminPage();
  const admin = createAdminClient();
  const since = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();

  const [eventsResult, ordersResult, metaResult] = await Promise.all([
    admin.from('analytics_events').select('name, path, referrer, visitor_hash, device, country, metadata, created_at').gte('created_at', since),
    admin.from('orders').select('total, payment_status, created_at').gte('created_at', since),
    admin.from('meta_events').select('event_name, status, created_at').gte('created_at', since),
  ]);

  const events = eventsResult.data ?? [];
  const pageviews = events.filter((event) => event.name === 'page_view');
  const visitors = new Set(pageviews.map((event) => event.visitor_hash).filter(Boolean)).size;
  const orders = ordersResult.data ?? [];
  const paidOrders = orders.filter((order) => order.payment_status === 'paid');
  const paidRevenue = paidOrders.reduce((sum, order) => sum + Number(order.total), 0);
  const conversion = pageviews.length ? (orders.length / pageviews.length) * 100 : 0;

  const days = Array.from({ length: 14 }, (_, index) => {
    const date = new Date();
    date.setDate(date.getDate() - (13 - index));
    const key = date.toISOString().slice(0, 10);
    return { label: date.toLocaleDateString('en-NG', { day: 'numeric' }), value: pageviews.filter((event) => event.created_at.slice(0, 10) === key).length };
  });

  function countBy(key: 'path' | 'referrer' | 'device' | 'country') {
    const map = new Map<string, number>();
    for (const event of events) {
      const raw = event[key] || (key === 'referrer' ? 'Direct' : 'Unknown');
      map.set(raw, (map.get(raw) ?? 0) + 1);
    }
    return Array.from(map.entries()).sort((a, b) => b[1] - a[1]).slice(0, 8);
  }

  const productViews = new Map<string, number>();
  for (const event of events.filter((item) => item.name === 'product_view')) {
    const slug = String((event.metadata as Record<string, unknown>)?.product ?? 'Unknown');
    productViews.set(slug, (productViews.get(slug) ?? 0) + 1);
  }
  const topProducts = Array.from(productViews.entries()).sort((a, b) => b[1] - a[1]).slice(0, 8);

  const funnel = [
    { label: 'Page views', value: pageviews.length },
    { label: 'Product views', value: events.filter((event) => event.name === 'product_view').length },
    { label: 'Add to cart', value: events.filter((event) => event.name === 'add_to_cart').length },
    { label: 'Checkout', value: events.filter((event) => event.name === 'begin_checkout').length },
    { label: 'Orders', value: orders.length },
    { label: 'Paid orders', value: paidOrders.length },
  ];

  return (
    <div>
      <PageHeader title="Analytics" subtitle="First-party traffic and order data for the last 30 days. No third-party analytics script." />

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard label="Pageviews" value={String(pageviews.length)} />
        <StatCard label="Unique visitors" value={String(visitors)} hint="Daily hashed visitors" />
        <StatCard label="Orders" value={String(orders.length)} hint={`${conversion.toFixed(2)}% of pageviews`} />
        <StatCard label="Paid revenue" value={formatNaira(paidRevenue)} accent />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        <section className={cardClass}>
          <p className="text-sm font-semibold text-ink">Pageviews, last 14 days</p>
          <div className="mt-5"><BarChart data={days} /></div>
        </section>
        <section className={cardClass}>
          <p className="text-sm font-semibold text-ink">Funnel, last 30 days</p>
          <div className="mt-4 space-y-2">
            {funnel.map((step) => (
              <div key={step.label}>
                <div className="flex items-center justify-between text-xs"><span className="text-muted">{step.label}</span><span className="font-semibold">{step.value}</span></div>
                <div className="mt-1 h-2 rounded-full bg-paper-deep"><div className="h-2 rounded-full bg-ink" style={{ width: `${Math.min(100, (step.value / Math.max(funnel[0].value, 1)) * 100)}%` }} /></div>
              </div>
            ))}
          </div>
        </section>
      </div>

      <div className="mt-6 grid gap-6 md:grid-cols-2">
        <section className={cardClass}>
          <p className="text-sm font-semibold text-ink">Top pages</p>
          <div className="mt-4 divide-y divide-line">
            {countBy('path').map(([path, count]) => (
              <div key={path} className="flex items-center justify-between gap-3 py-2 text-xs"><span className="truncate text-muted">{path}</span><span className="font-semibold">{count}</span></div>
            ))}
          </div>
        </section>
        <section className={cardClass}>
          <p className="text-sm font-semibold text-ink">Products viewed</p>
          <div className="mt-4 divide-y divide-line">
            {topProducts.map(([slug, count]) => (
              <div key={slug} className="flex items-center justify-between gap-3 py-2 text-xs"><span className="truncate text-muted">{slug}</span><span className="font-semibold">{count}</span></div>
            ))}
            {!topProducts.length ? <p className="py-3 text-xs text-muted">No product views recorded yet.</p> : null}
          </div>
        </section>
        <section className={cardClass}>
          <p className="text-sm font-semibold text-ink">Referrers</p>
          <div className="mt-4 divide-y divide-line">
            {countBy('referrer').map(([referrer, count]) => (
              <div key={referrer} className="flex items-center justify-between gap-3 py-2 text-xs"><span className="truncate text-muted">{referrer}</span><span className="font-semibold">{count}</span></div>
            ))}
          </div>
        </section>
        <section className={cardClass}>
          <p className="text-sm font-semibold text-ink">Devices and Meta</p>
          <div className="mt-4 divide-y divide-line">
            {countBy('device').map(([device, count]) => (
              <div key={device} className="flex items-center justify-between gap-3 py-2 text-xs"><span className="capitalize text-muted">{device}</span><span className="font-semibold">{count}</span></div>
            ))}
            <div className="flex items-center justify-between gap-3 py-2 text-xs"><span className="text-muted">Meta events sent</span><span className="font-semibold">{metaResult.data?.filter((event) => event.status === 'sent').length ?? 0}</span></div>
          </div>
        </section>
      </div>
    </div>
  );
}


