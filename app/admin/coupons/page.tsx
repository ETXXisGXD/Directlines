import { Trash2 } from 'lucide-react';
import { createAdminClient } from '@/lib/supabase/admin';
import { formatNaira, formatDate } from '@/lib/format';
import {
  AdminBanner,
  PageHeader,
  StatusPill,
  buttonClass,
  cardClass,
  inputClass,
  labelClass,
  secondaryButtonClass,
  dangerButtonClass,
} from '@/components/admin/ui';
import { createCoupon, deleteCoupon, toggleCoupon } from '../actions';
import { requireAdminPage } from '@/lib/admin-auth';

export const dynamic = 'force-dynamic';

export default async function AdminCouponsPage({
  searchParams,
}: {
  searchParams: Promise<{ saved?: string; err?: string }>;
}) {
  await requireAdminPage();
  const params = await searchParams;
  const admin = createAdminClient();
  const { data } = await admin.from('coupons').select('*').order('created_at', { ascending: false });
  const coupons = data ?? [];

  return (
    <div>
      <PageHeader title="Coupons" subtitle="Real promo codes. Percentage or fixed naira amount." />
      <AdminBanner saved={params.saved === '1'} err={params.err ?? null} />

      <div className="grid gap-6 lg:grid-cols-[1fr_340px]">
        <div className={cardClass + ' overflow-x-auto !p-0'}>
          <div className="hidden min-w-[640px] grid-cols-[1fr_1fr_1fr_0.7fr_0.8fr_auto] gap-4 border-b border-line px-5 py-3 text-[9px] font-bold uppercase tracking-[0.14em] text-muted md:grid">
            <span>Code</span><span>Discount</span><span>Minimum</span><span>Used</span><span>Status</span><span />
          </div>
          <div className="divide-y divide-line">
            {coupons.map((coupon) => (
              <div key={coupon.id} className="grid min-w-[640px] grid-cols-[1fr_1fr_1fr_0.7fr_0.8fr_auto] items-center gap-4 px-5 py-4">
                <p className="text-xs font-semibold text-ink">{coupon.code}</p>
                <p className="text-xs text-muted">{coupon.discount_type === 'percentage' ? `${coupon.value}%` : formatNaira(coupon.value)}</p>
                <p className="text-xs text-muted">{formatNaira(coupon.min_order)}</p>
                <p className="text-xs text-muted">{coupon.usage_count}</p>
                <div className="flex flex-col gap-1">
                  <StatusPill status={coupon.active ? 'approved' : 'closed'} />
                  {coupon.expires_at ? <span className="text-[9px] text-muted">{formatDate(coupon.expires_at)}</span> : null}
                </div>
                <div className="flex gap-1.5">
                  <form action={toggleCoupon}>
                    <input type="hidden" name="id" value={coupon.id} />
                    <input type="hidden" name="active" value={String(coupon.active)} />
                    <button type="submit" className={secondaryButtonClass}>{coupon.active ? 'Disable' : 'Enable'}</button>
                  </form>
                  <form action={deleteCoupon}>
                    <input type="hidden" name="id" value={coupon.id} />
                    <button type="submit" className={dangerButtonClass} aria-label="Delete coupon"><Trash2 className="h-3.5 w-3.5" /></button>
                  </form>
                </div>
              </div>
            ))}
          </div>
          {!coupons.length ? <p className="p-8 text-center text-sm text-muted">No coupons yet.</p> : null}
        </div>

        <aside className={cardClass}>
          <p className="text-sm font-semibold text-ink">New coupon</p>
          <form action={createCoupon} className="mt-4 space-y-3">
            <div>
              <label className={labelClass}>Code</label>
              <input name="code" required className={inputClass} placeholder="DIRECT5" />
            </div>
            <div>
              <label className={labelClass}>Type</label>
              <select name="discount_type" className={inputClass}>
                <option value="percentage">Percentage</option>
                <option value="fixed">Fixed naira</option>
              </select>
            </div>
            <div>
              <label className={labelClass}>Value</label>
              <input name="value" required inputMode="numeric" className={inputClass} placeholder="5" />
            </div>
            <div>
              <label className={labelClass}>Minimum order (₦)</label>
              <input name="min_order" inputMode="numeric" defaultValue={0} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Expiry (optional)</label>
              <input name="expires_at" type="date" className={inputClass} />
            </div>
            <button type="submit" className={`${buttonClass} w-full`}>Create coupon</button>
          </form>
        </aside>
      </div>
    </div>
  );
}


