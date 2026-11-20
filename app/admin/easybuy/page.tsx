import { MessageCircle } from 'lucide-react';
import { createAdminClient } from '@/lib/supabase/admin';
import { formatDate } from '@/lib/format';
import { createWhatsAppUrl } from '@/lib/whatsapp';
import { AdminBanner, PageHeader, StatusPill, cardClass, inputClass, labelClass, secondaryButtonClass } from '@/components/admin/ui';
import { updateEasyBuyStatus } from '../actions';

export const dynamic = 'force-dynamic';

export default async function AdminEasyBuyPage({
  searchParams,
}: {
  searchParams: Promise<{ saved?: string; err?: string; status?: string }>;
}) {
  const params = await searchParams;
  const admin = createAdminClient();
  let query = admin
    .from('easybuy_applications')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(200);
  if (params.status) query = query.eq('status', params.status);
  const { data } = await query;
  const rows = data ?? [];

  return (
    <div>
      <PageHeader title="EasyBuy applications" subtitle="Applications submitted from the website. Review, contact and update each one." />
      <AdminBanner saved={params.saved === '1'} err={params.err ?? null} />

      <div className="mb-4 flex flex-wrap gap-2">
        {['', 'new', 'contacted', 'approved', 'declined', 'closed'].map((status) => (
          <a key={status || 'all'} href={status ? `/admin/easybuy?status=${status}` : '/admin/easybuy'} className={`rounded-full border px-3.5 py-1.5 text-[10px] font-bold uppercase tracking-[0.12em] ${params.status === status || (!params.status && !status) ? 'border-ink bg-ink text-white' : 'border-line bg-white text-muted hover:border-ink hover:text-ink'}`}>
            {status || 'All'}
          </a>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        {rows.map((application) => (
          <div key={application.id} className={cardClass}>
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-sm font-semibold text-ink">{application.full_name}</p>
                <p className="mt-0.5 text-[11px] text-muted">{application.phone} · {formatDate(application.created_at)}</p>
              </div>
              <StatusPill status={application.status} />
            </div>
            <dl className="mt-4 grid gap-2 text-xs">
              <div className="flex justify-between gap-4"><dt className="text-muted">Target model</dt><dd className="text-right font-semibold text-ink">{application.target_model}</dd></div>
              <div className="flex justify-between gap-4"><dt className="text-muted">Guarantor 1</dt><dd className="text-right text-ink">{application.guarantor_1_phone}</dd></div>
              <div className="flex justify-between gap-4"><dt className="text-muted">Guarantor 2</dt><dd className="text-right text-ink">{application.guarantor_2_phone}</dd></div>
            </dl>
            <div className="mt-4 flex flex-wrap gap-2">
              <a href={createWhatsAppUrl(application.phone, `Hello ${application.full_name}, this is Directlines about your EasyBuy application for ${application.target_model}.`)} target="_blank" rel="noopener noreferrer" className={secondaryButtonClass}>
                <MessageCircle className="h-3.5 w-3.5" /> WhatsApp
              </a>
            </div>
            <form action={updateEasyBuyStatus} className="mt-4 grid gap-3 border-t border-line pt-4 sm:grid-cols-[1fr_1fr_auto] sm:items-end">
              <input type="hidden" name="id" value={application.id} />
              <div>
                <label className={labelClass}>Status</label>
                <select name="status" defaultValue={application.status} className={inputClass}>
                  {['new', 'contacted', 'approved', 'declined', 'closed'].map((status) => <option key={status} value={status}>{status}</option>)}
                </select>
              </div>
              <div>
                <label className={labelClass}>Note</label>
                <input name="admin_notes" defaultValue={application.admin_notes ?? ''} className={inputClass} />
              </div>
              <button type="submit" className={secondaryButtonClass}>Save</button>
            </form>
          </div>
        ))}
      </div>
      {!rows.length ? <div className={cardClass}><p className="text-center text-sm text-muted">No applications yet.</p></div> : null}
    </div>
  );
}
