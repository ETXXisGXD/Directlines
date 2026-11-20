import { createAdminClient } from '@/lib/supabase/admin';
import { formatDate } from '@/lib/format';
import { AdminBanner, PageHeader, buttonClass, cardClass, inputClass, labelClass } from '@/components/admin/ui';
import { updateLoyaltySettings } from '../actions';
import { requireAdminPage } from '@/lib/admin-auth';

export const dynamic = 'force-dynamic';

export default async function AdminLoyaltyPage({
  searchParams,
}: {
  searchParams: Promise<{ saved?: string; err?: string }>;
}) {
  await requireAdminPage();
  const params = await searchParams;
  const admin = createAdminClient();
  const [settingsResult, ledgerResult] = await Promise.all([
    admin.from('loyalty_settings').select('*').single(),
    admin.from('loyalty_ledger').select('*, profiles(full_name, email)').order('created_at', { ascending: false }).limit(50),
  ]);
  const settings = settingsResult.data;
  const ledger = ledgerResult.data ?? [];

  return (
    <div>
      <PageHeader title="Loyalty" subtitle="Optional points engine. Points are added when an order is marked paid." />
      <AdminBanner saved={params.saved === '1'} err={params.err ?? null} />

      <div className="grid gap-6 lg:grid-cols-[360px_1fr]">
        <section className={cardClass}>
          <form action={updateLoyaltySettings} className="space-y-4">
            <label className="flex items-center gap-2 text-xs font-semibold text-ink">
              <input type="checkbox" name="enabled" defaultChecked={settings?.enabled ?? false} className="accent-[#dc2626]" />
              Loyalty enabled
            </label>
            <div>
              <label className={labelClass}>Points per ₦1,000</label>
              <input name="points_per_1000" defaultValue={settings?.points_per_1000 ?? 1} className={inputClass} inputMode="decimal" />
            </div>
            <div>
              <label className={labelClass}>Naira value per point</label>
              <input name="naira_per_point" defaultValue={settings?.naira_per_point ?? 10} className={inputClass} inputMode="decimal" />
            </div>
            <div>
              <label className={labelClass}>Minimum redeem points</label>
              <input name="min_redeem_points" defaultValue={settings?.min_redeem_points ?? 500} className={inputClass} inputMode="numeric" />
            </div>
            <button type="submit" className={`${buttonClass} w-full`}>Save loyalty settings</button>
            <p className="text-[10px] leading-relaxed text-muted">Redemption is confirmed by the store on WhatsApp. The checkout does not automatically spend points yet.</p>
          </form>
        </section>

        <section className={cardClass + ' overflow-x-auto !p-0'}>
          <div className="border-b border-line px-5 py-3"><p className="text-sm font-semibold text-ink">Recent ledger</p></div>
          <div className="divide-y divide-line">
            {ledger.map((entry) => (
              <div key={entry.id} className="flex items-center justify-between gap-4 px-5 py-3">
                <div>
                  <p className="text-xs font-semibold text-ink">{entry.profiles ? (entry.profiles as unknown as { full_name: string }).full_name : 'Customer'}</p>
                  <p className="mt-0.5 text-[10px] text-muted">{entry.reason} · {formatDate(entry.created_at)} {entry.note ? `· ${entry.note}` : ''}</p>
                </div>
                <p className={`text-xs font-semibold ${entry.delta > 0 ? 'text-emerald-600' : 'text-signal'}`}>{entry.delta > 0 ? '+' : ''}{entry.delta}</p>
              </div>
            ))}
          </div>
          {!ledger.length ? <p className="p-8 text-center text-sm text-muted">No points activity yet.</p> : null}
        </section>
      </div>
    </div>
  );
}



