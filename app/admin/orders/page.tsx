import Link from 'next/link';
import { Search } from 'lucide-react';
import { createAdminClient } from '@/lib/supabase/admin';
import { formatNaira } from '@/lib/format';
import { AdminBanner, PageHeader, StatusPill, cardClass, inputClass, secondaryButtonClass } from '@/components/admin/ui';

export const dynamic = 'force-dynamic';

export default async function AdminOrdersPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; q?: string; saved?: string; err?: string }>;
}) {
  const params = await searchParams;
  const admin = createAdminClient();
  let query = admin
    .from('orders')
    .select('id, order_number, customer_name, customer_phone, total, status, payment_status, payment_method, created_at')
    .order('created_at', { ascending: false })
    .limit(200);

  if (params.status) query = query.eq('status', params.status);
  if (params.q) {
    const q = params.q.replace(/[%,]/g, '');
    query = query.or(`order_number.ilike.%${q}%,customer_name.ilike.%${q}%,customer_phone.ilike.%${q}%`);
  }

  const { data } = await query;
  const orders = data ?? [];
  const statuses = ['received', 'confirmed', 'processing', 'dispatched', 'delivered', 'cancelled'];

  return (
    <div>
      <PageHeader title="Orders" subtitle={`${orders.length} orders shown. Newest first.`} />
      <AdminBanner saved={params.saved === '1'} err={params.err ?? null} />

      <form className="mb-4 flex flex-col gap-2 sm:flex-row">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
          <input name="q" defaultValue={params.q ?? ''} placeholder="Order number, name or phone" className={`${inputClass} pl-9`} />
        </div>
        <select name="status" defaultValue={params.status ?? ''} className={inputClass + ' sm:w-44'}>
          <option value="">All statuses</option>
          {statuses.map((status) => <option key={status} value={status}>{status}</option>)}
        </select>
        <button type="submit" className={secondaryButtonClass}>Filter</button>
      </form>

      <div className={cardClass + ' !p-0 overflow-hidden'}>
        <div className="hidden grid-cols-[1.2fr_1.4fr_1fr_0.9fr_0.6fr] gap-4 border-b border-line px-5 py-3 text-[9px] font-bold uppercase tracking-[0.14em] text-muted md:grid">
          <span>Order</span>
          <span>Customer</span>
          <span>Total</span>
          <span>Status</span>
          <span>Payment</span>
        </div>
        <div className="divide-y divide-line">
          {orders.map((order) => (
            <Link key={order.id} href={`/admin/orders/${order.id}`} className="grid grid-cols-1 gap-2 px-5 py-4 hover:bg-paper md:grid-cols-[1.2fr_1.4fr_1fr_0.9fr_0.6fr] md:items-center md:gap-4">
              <div>
                <p className="text-xs font-semibold text-ink">#{order.order_number}</p>
                <p className="mt-0.5 text-[10px] text-muted">{new Date(order.created_at).toLocaleDateString('en-NG')}</p>
              </div>
              <div>
                <p className="text-xs font-semibold text-ink">{order.customer_name}</p>
                <p className="mt-0.5 text-[10px] text-muted">{order.customer_phone}</p>
              </div>
              <p className="price text-xs font-semibold">{formatNaira(order.total)}</p>
              <StatusPill status={order.status} />
              <StatusPill status={order.payment_status} />
            </Link>
          ))}
        </div>
        {!orders.length ? <p className="p-8 text-center text-sm text-muted">No orders match this filter.</p> : null}
      </div>
    </div>
  );
}
