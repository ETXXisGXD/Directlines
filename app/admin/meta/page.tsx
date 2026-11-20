import { CheckCircle2, Copy, XCircle } from 'lucide-react';
import { createAdminClient } from '@/lib/supabase/admin';
import { getSettings } from '@/lib/queries';
import { formatDate } from '@/lib/format';
import {
  AdminBanner,
  PageHeader,
  StatusPill,
  buttonClass,
  cardClass,
  inputClass,
  labelClass,
  secondaryButtonClass,
} from '@/components/admin/ui';
import { sendTestCapiEvent, updateMetaSettings } from '../actions';
import { requireAdminPage } from '@/lib/admin-auth';

export const dynamic = 'force-dynamic';

export default async function AdminMetaPage({
  searchParams,
}: {
  searchParams: Promise<{ saved?: string; err?: string }>;
}) {
  await requireAdminPage();
  const params = await searchParams;
  const [settings, admin] = await Promise.all([getSettings(), Promise.resolve(createAdminClient())]);
  const { data: events } = await admin
    .from('meta_events')
    .select('event_name, event_id, status, http_status, created_at, value')
    .order('created_at', { ascending: false })
    .limit(30);

  const base = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://directlines-technologies.vercel.app';
  const feedUrl = `${base}/api/meta/catalog?key=${process.env.META_CATALOG_SECRET ?? ''}`;
  const capiConfigured = Boolean(process.env.META_CAPI_ACCESS_TOKEN);

  return (
    <div>
      <PageHeader title="Meta" subtitle="Pixel, Conversions API, catalog feed and consent. Add the IDs here; the access token stays in Vercel environment variables." />
      <AdminBanner saved={params.saved === '1'} err={params.err ?? null} />

      <div className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
        <div className="space-y-5">
          <section className={cardClass}>
            <h2 className="text-sm font-semibold text-ink">Connection</h2>
            <div className="mt-4 space-y-3">
              <div className="flex items-center justify-between gap-3 rounded-xl border border-line p-4">
                <div><p className="text-xs font-semibold text-ink">Browser Pixel</p><p className="mt-0.5 text-[10px] text-muted">{settings.meta_pixel_id ? `Pixel ID ${settings.meta_pixel_id}` : 'No Pixel ID saved'}</p></div>
                {settings.meta_pixel_id ? <CheckCircle2 className="h-4 w-4 text-emerald-600" /> : <XCircle className="h-4 w-4 text-muted" />}
              </div>
              <div className="flex items-center justify-between gap-3 rounded-xl border border-line p-4">
                <div><p className="text-xs font-semibold text-ink">Conversions API</p><p className="mt-0.5 text-[10px] text-muted">{capiConfigured ? 'META_CAPI_ACCESS_TOKEN is set' : 'Add META_CAPI_ACCESS_TOKEN in Vercel'}</p></div>
                {capiConfigured ? <CheckCircle2 className="h-4 w-4 text-emerald-600" /> : <XCircle className="h-4 w-4 text-muted" />}
              </div>
              <div className="flex items-center justify-between gap-3 rounded-xl border border-line p-4">
                <div><p className="text-xs font-semibold text-ink">Catalog feed</p><p className="mt-0.5 break-all text-[10px] text-muted">{feedUrl}</p></div>
                <span className="text-[9px] font-bold uppercase tracking-[0.1em] text-muted">CSV</span>
              </div>
              <form action={sendTestCapiEvent}>
                <button type="submit" className={secondaryButtonClass} disabled={!settings.meta_pixel_id || !capiConfigured}>Send test Lead event</button>
              </form>
            </div>
          </section>

          <section className={cardClass}>
            <h2 className="text-sm font-semibold text-ink">Pixel settings</h2>
            <form action={updateMetaSettings} className="mt-4 space-y-4">
              <div>
                <label className={labelClass}>Meta Pixel ID</label>
                <input name="meta_pixel_id" defaultValue={settings.meta_pixel_id ?? ''} className={inputClass} placeholder="123456789012345" />
              </div>
              <div>
                <label className={labelClass}>Test event code</label>
                <input name="meta_test_event_code" defaultValue={settings.meta_test_event_code ?? ''} className={inputClass} placeholder="TEST12345" />
              </div>
              <div>
                <label className={labelClass}>Domain verification string</label>
                <input name="meta_domain_verification" defaultValue={settings.meta_domain_verification ?? ''} className={inputClass} placeholder="From Meta Business Settings" />
              </div>
              <label className="flex items-center gap-2 text-xs font-semibold text-ink"><input type="checkbox" name="analytics_enabled" defaultChecked={settings.analytics_enabled} className="accent-[#dc2626]" /> First-party analytics</label>
              <label className="flex items-center gap-2 text-xs font-semibold text-ink"><input type="checkbox" name="consent_enabled" defaultChecked={settings.consent_enabled} className="accent-[#dc2626]" /> Show consent banner</label>
              <label className="flex items-center gap-2 text-xs font-semibold text-ink"><input type="checkbox" name="meta_catalog_enabled" defaultChecked={settings.meta_catalog_enabled} className="accent-[#dc2626]" /> Catalog feed enabled</label>
              <button type="submit" className={`${buttonClass} w-full`}>Save Meta settings</button>
            </form>
          </section>
        </div>

        <div className="space-y-5">
          <section className={cardClass}>
            <h2 className="text-sm font-semibold text-ink">Events</h2>
            <p className="mt-1 text-[10px] text-muted">Purchase is sent when an order is marked paid. Leads are sent for EasyBuy, repairs and checkout.</p>
            <div className="mt-4 divide-y divide-line">
              {(events ?? []).map((event) => (
                <div key={event.event_id} className="flex items-center justify-between gap-3 py-2.5">
                  <div className="min-w-0">
                    <p className="truncate text-xs font-semibold text-ink">{event.event_name}</p>
                    <p className="mt-0.5 truncate text-[9px] text-muted">{formatDate(event.created_at)} · {event.event_id}</p>
                  </div>
                  <div className="flex shrink-0 items-center gap-2">
                    <StatusPill status={event.status === 'sent' ? 'published' : 'declined'} />
                    <span className="text-[9px] text-muted">{event.http_status ?? ''}</span>
                  </div>
                </div>
              ))}
            </div>
            {!events?.length ? <p className="mt-4 text-xs text-muted">No events logged yet.</p> : null}
          </section>

          <section className={cardClass}>
            <h2 className="text-sm font-semibold text-ink">Setup checklist</h2>
            <ol className="mt-4 space-y-2 text-[11px] leading-relaxed text-muted">
              <li>1. Add the Pixel ID above.</li>
              <li>2. Add `META_CAPI_ACCESS_TOKEN` to Vercel Production and Preview.</li>
              <li>3. Put the domain verification string above and redeploy.</li>
              <li>4. Add the catalog feed URL in Meta Commerce Manager.</li>
              <li>5. Send a test event and check Events Manager with the test code.</li>
              <li>6. Mark a test order as paid to verify Purchase.</li>
            </ol>
            <div className="mt-4 rounded-xl bg-paper-deep p-3 text-[10px] leading-relaxed text-muted">
              The access token is never stored in the database. Only the Pixel ID, test code and verification string are editable here.
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}



