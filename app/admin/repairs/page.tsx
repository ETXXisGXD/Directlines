import { MessageCircle } from 'lucide-react';
import { createAdminClient } from '@/lib/supabase/admin';
import { formatDate } from '@/lib/format';
import { createWhatsAppUrl } from '@/lib/whatsapp';
import { AdminBanner, PageHeader, StatusPill, cardClass, inputClass, labelClass, secondaryButtonClass } from '@/components/admin/ui';
import { updateRepairStatus } from '../actions';

export const dynamic = 'force-dynamic';

export default async function AdminRepairsPage({
  searchParams,
}: {
  searchParams: Promise<{ saved?: string; err?: string; status?: string }>;
}) {
  const params = await searchParams;
  const admin = createAdminClient();
  let query = admin.from('repair_bookings').select('*').order('created_at', { ascending: false }).limit(200);
  if (params.status) query = query.eq('status', params.status);
  const { data } = await query;
  const rows = data ?? [];

  return (
    <div>
      <PageHeader title="Repair bookings" subtitle="Website repair requests. Contact the customer, diagnose, then update the status." />
      <AdminBanner saved={params.saved === '1'} err={params.err ?? null} />

      <div className="mb-4 flex flex-wrap gap-2">
        {['', 'new', 'contacted', 'scheduled', 'in_progress', 'completed', 'cancelled'].map((status) => (
          <a key={status || 'all'} href={status ? `/admin/repairs?status=${status}` : '/admin/repairs'} className={`rounded-full border px-3.5 py-1.5 text-[10px] font-bold uppercase tracking-[0.12em] ${params.status === status || (!params.status && !status) ? 'border-ink bg-ink text-white' : 'border-line bg-white text-muted hover:border-ink hover:text-ink'}`}>
            {status ? status.replace(/_/g, ' ') : 'All'}
          </a>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        {rows.map((booking) => (
          <div key={booking.id} className={cardClass}>
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-sm font-semibold text-ink">{booking.customer_name}</p>
                <p className="mt-0.5 text-[11px] text-muted">{booking.phone} · {formatDate(booking.created_at)}</p>
              </div>
              <StatusPill status={booking.status} />
            </div>
            <p className="mt-3 text-xs font-semibold text-ink">{booking.device_brand ? `${booking.device_brand} ` : ''}{booking.device_model}</p>
            <p className="mt-1.5 text-xs leading-relaxed text-muted">{booking.issue}</p>
            <div className="mt-3">
              <a href={createWhatsAppUrl(booking.phone, `Hello ${booking.customer_name}, this is Directlines about your repair booking for ${booking.device_model}.`)} target="_blank" rel="noopener noreferrer" className={secondaryButtonClass}>
                <MessageCircle className="h-3.5 w-3.5" /> WhatsApp
              </a>
            </div>
            <form action={updateRepairStatus} className="mt-4 grid gap-3 border-t border-line pt-4 sm:grid-cols-[1fr_1fr_auto] sm:items-end">
              <input type="hidden" name="id" value={booking.id} />
              <div>
                <label className={labelClass}>Status</label>
                <select name="status" defaultValue={booking.status} className={inputClass}>
                  {['new', 'contacted', 'scheduled', 'in_progress', 'completed', 'cancelled'].map((status) => <option key={status} value={status}>{status.replace(/_/g, ' ')}</option>)}
                </select>
              </div>
              <div>
                <label className={labelClass}>Note</label>
                <input name="admin_notes" defaultValue={booking.admin_notes ?? ''} className={inputClass} />
              </div>
              <button type="submit" className={secondaryButtonClass}>Save</button>
            </form>
          </div>
        ))}
      </div>
      {!rows.length ? <div className={cardClass}><p className="text-center text-sm text-muted">No repair bookings yet.</p></div> : null}
    </div>
  );
}
