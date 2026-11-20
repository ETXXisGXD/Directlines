import { createAdminClient } from '@/lib/supabase/admin';
import { formatNaira, formatDate } from '@/lib/format';
import { PageHeader, cardClass } from '@/components/admin/ui';

export const dynamic = 'force-dynamic';

export default async function AdminCustomersPage() {
  const admin = createAdminClient();
  const [profilesResult, ordersResult, ledgerResult] = await Promise.all([
    admin.from('profiles').select('id, email, full_name, phone, role, created_at').order('created_at', { ascending: false }),
    admin.from('orders').select('user_id, total'),
    admin.from('loyalty_ledger').select('user_id, delta'),
  ]);

  const stats = new Map<string, { orders: number; value: number }>();
  for (const order of ordersResult.data ?? []) {
    if (!order.user_id) continue;
    const current = stats.get(order.user_id) ?? { orders: 0, value: 0 };
    current.orders += 1;
    current.value += Number(order.total);
    stats.set(order.user_id, current);
  }

  const points = new Map<string, number>();
  for (const entry of ledgerResult.data ?? []) {
    points.set(entry.user_id, (points.get(entry.user_id) ?? 0) + entry.delta);
  }

  const rows = profilesResult.data ?? [];

  return (
    <div>
      <PageHeader title="Customers" subtitle={`${rows.length} customer accounts. Guest orders appear under Orders.`} />
      <div className={cardClass + ' overflow-x-auto !p-0'}>
        <div className="hidden min-w-[760px] grid-cols-[1.5fr_1.6fr_0.6fr_1fr_0.6fr] gap-4 border-b border-line px-5 py-3 text-[9px] font-bold uppercase tracking-[0.14em] text-muted md:grid">
          <span>Customer</span><span>Contact</span><span>Orders</span><span>Lifetime value</span><span>Points</span>
        </div>
        <div className="divide-y divide-line">
          {rows.map((profile) => {
            const stat = stats.get(profile.id);
            return (
              <div key={profile.id} className="grid min-w-[760px] grid-cols-[1.5fr_1.6fr_0.6fr_1fr_0.6fr] items-center gap-4 px-5 py-4">
                <div>
                  <p className="text-xs font-semibold text-ink">{profile.full_name || 'Unnamed'} {profile.role === 'admin' ? <span className="ml-1 text-[8px] font-bold uppercase tracking-[0.1em] text-signal">admin</span> : null}</p>
                  <p className="mt-0.5 text-[10px] text-muted">Joined {formatDate(profile.created_at)}</p>
                </div>
                <div className="text-[11px] text-muted"><p>{profile.email}</p>{profile.phone ? <p>{profile.phone}</p> : null}</div>
                <p className="text-xs font-semibold">{stat?.orders ?? 0}</p>
                <p className="price text-xs font-semibold">{formatNaira(stat?.value ?? 0)}</p>
                <p className="text-xs font-semibold text-signal">{points.get(profile.id) ?? 0}</p>
              </div>
            );
          })}
        </div>
        {!rows.length ? <p className="p-8 text-center text-sm text-muted">No customer accounts yet.</p> : null}
      </div>
    </div>
  );
}
