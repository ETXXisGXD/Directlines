import { getSettings } from '@/lib/queries';
import { requireAdminPage } from '@/lib/admin-auth';
import {
  AdminBanner,
  PageHeader,
  buttonClass,
  cardClass,
  inputClass,
  labelClass,
  secondaryButtonClass,
} from '@/components/admin/ui';
import { ZonesEditor } from '@/components/admin/zones-editor';
import {
  updateBankAnnouncement,
  updateDeliveryZones,
  updateStoreSettings,
} from '../actions';

export const dynamic = 'force-dynamic';

export default async function AdminSettingsPage({
  searchParams,
}: {
  searchParams: Promise<{ saved?: string; err?: string }>;
}) {
  await requireAdminPage();
  const params = await searchParams;
  const settings = await getSettings();
  const zones = settings.shipping_zones.map((zone) => ({
    id: zone.id,
    name: zone.name,
    price: String(zone.price),
    active: zone.active,
    free_over_threshold: zone.free_over_threshold,
  }));

  return (
    <div>
      <PageHeader title="Settings" subtitle="Store identity, hero copy, EasyBuy terms, delivery, bank details and policies." />
      <AdminBanner saved={params.saved === '1'} err={params.err ?? null} />

      <div className="space-y-5">
        <section className={cardClass}>
          <h2 className="text-sm font-semibold text-ink">Store identity and contact</h2>
          <form action={updateStoreSettings} className="mt-4 grid gap-4 sm:grid-cols-2">
            <div>
              <label className={labelClass}>Store name</label>
              <input name="store_name" defaultValue={settings.store_name} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Legal name</label>
              <input name="legal_name" defaultValue={settings.legal_name} className={inputClass} />
            </div>
            <div className="sm:col-span-2">
              <label className={labelClass}>Tagline</label>
              <input name="tagline" defaultValue={settings.tagline} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>WhatsApp number</label>
              <input name="whatsapp_number" defaultValue={settings.whatsapp_number} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Display phone</label>
              <input name="display_phone" defaultValue={settings.display_phone} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Second phone</label>
              <input name="alt_phone" defaultValue={settings.alt_phone} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>EasyBuy WhatsApp</label>
              <input name="easybuy_whatsapp" defaultValue={settings.easybuy_whatsapp} className={inputClass} />
            </div>
            <div className="sm:col-span-2">
              <label className={labelClass}>Email</label>
              <input name="email" type="email" defaultValue={settings.email} className={inputClass} />
            </div>
            <div className="sm:col-span-2">
              <label className={labelClass}>Full address</label>
              <input name="address_full" defaultValue={settings.address_full} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Street</label>
              <input name="address_street" defaultValue={settings.address_street} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Area</label>
              <input name="address_area" defaultValue={settings.address_area} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>City</label>
              <input name="address_city" defaultValue={settings.address_city} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>State</label>
              <input name="address_state" defaultValue={settings.address_state} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Country</label>
              <input name="address_country" defaultValue={settings.address_country} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Hours</label>
              <input name="hours" defaultValue={settings.hours} className={inputClass} />
            </div>
            <div className="sm:col-span-2">
              <label className={labelClass}>CAC / trust note</label>
              <input name="cac_note" defaultValue={settings.cac_note} className={inputClass} />
            </div>
            <div className="sm:col-span-2">
              <label className={labelClass}>Warranty text</label>
              <textarea name="warranty_text" rows={3} defaultValue={settings.warranty_text} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Free delivery threshold (₦)</label>
              <input name="free_shipping_threshold" defaultValue={settings.free_shipping_threshold} inputMode="numeric" className={inputClass} />
            </div>

            <div className="sm:col-span-2 border-t border-line pt-4">
              <h3 className="text-xs font-bold uppercase tracking-[0.14em] text-muted">Home hero</h3>
            </div>
            <div>
              <label className={labelClass}>Hero eyebrow</label>
              <input name="hero_eyebrow" defaultValue={settings.hero_eyebrow} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Hero title</label>
              <input name="hero_title" defaultValue={settings.hero_title} className={inputClass} />
            </div>
            <div className="sm:col-span-2">
              <label className={labelClass}>Hero subtitle</label>
              <textarea name="hero_subtitle" rows={2} defaultValue={settings.hero_subtitle} className={inputClass} />
            </div>

            <div className="sm:col-span-2 border-t border-line pt-4">
              <h3 className="text-xs font-bold uppercase tracking-[0.14em] text-muted">EasyBuy</h3>
            </div>
            <label className="flex items-center gap-2 text-xs font-semibold text-ink"><input type="checkbox" name="easybuy_enabled" defaultChecked={settings.easybuy_enabled} className="accent-[#dc2626]" /> EasyBuy enabled</label>
            <label className="flex items-center gap-2 text-xs font-semibold text-ink"><input type="checkbox" name="repairs_enabled" defaultChecked={settings.repairs_enabled} className="accent-[#dc2626]" /> Repairs enabled</label>
            <div>
              <label className={labelClass}>Down payment percent</label>
              <input name="easybuy_down_payment_percent" defaultValue={settings.easybuy_down_payment_percent} inputMode="numeric" className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Tenures (comma separated months)</label>
              <input name="easybuy_tenures" defaultValue={settings.easybuy_tenures.join(', ')} className={inputClass} />
            </div>

            <div className="sm:col-span-2 border-t border-line pt-4">
              <h3 className="text-xs font-bold uppercase tracking-[0.14em] text-muted">SEO and social</h3>
            </div>
            <div className="sm:col-span-2">
              <label className={labelClass}>SEO title</label>
              <input name="seo_title" defaultValue={settings.seo.title} className={inputClass} />
            </div>
            <div className="sm:col-span-2">
              <label className={labelClass}>SEO description</label>
              <textarea name="seo_description" rows={2} defaultValue={settings.seo.description} className={inputClass} />
            </div>
            <div className="sm:col-span-2">
              <label className={labelClass}>SEO keywords (comma separated)</label>
              <input name="seo_keywords" defaultValue={settings.seo.keywords.join(', ')} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>X / Twitter URL</label>
              <input name="twitter" defaultValue={settings.socials.twitter ?? ''} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Instagram URL</label>
              <input name="instagram" defaultValue={settings.socials.instagram ?? ''} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Facebook URL</label>
              <input name="facebook" defaultValue={settings.socials.facebook ?? ''} className={inputClass} />
            </div>

            <div className="sm:col-span-2">
              <button type="submit" className={buttonClass}>Save store settings</button>
            </div>
          </form>
        </section>

        <section className={cardClass}>
          <h2 className="text-sm font-semibold text-ink">Delivery zones</h2>
          <p className="mt-1 text-[11px] text-muted">The first active zone is preselected at checkout. Free-over applies above the free delivery threshold.</p>
          <form action={updateDeliveryZones} className="mt-4">
            <ZonesEditor initial={zones} />
            <button type="submit" className={`${secondaryButtonClass} mt-4`}>Save delivery zones</button>
          </form>
        </section>

        <section className={cardClass}>
          <h2 className="text-sm font-semibold text-ink">Bank details, announcement and policies</h2>
          <form action={updateBankAnnouncement} className="mt-4 grid gap-4 sm:grid-cols-2">
            <div>
              <label className={labelClass}>Bank name</label>
              <input name="bankName" defaultValue={settings.bank_details.bankName} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Account name</label>
              <input name="accountName" defaultValue={settings.bank_details.accountName} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Account number</label>
              <input name="accountNumber" defaultValue={settings.bank_details.accountNumber} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Payment instructions</label>
              <input name="instructions" defaultValue={settings.bank_details.instructions} className={inputClass} />
            </div>
            <div className="sm:col-span-2 border-t border-line pt-4">
              <label className="flex items-center gap-2 text-xs font-semibold text-ink"><input type="checkbox" name="announcement_active" defaultChecked={settings.announcement.active} className="accent-[#dc2626]" /> Show announcement bar</label>
            </div>
            <div>
              <label className={labelClass}>Animation duration (seconds)</label>
              <input name="announcement_speed" defaultValue={settings.announcement.speedDurationSeconds ?? 40} inputMode="numeric" className={inputClass} />
            </div>
            <div className="sm:col-span-2">
              <label className={labelClass}>Announcements (one per line)</label>
              <textarea name="announcement_items" rows={4} defaultValue={(settings.announcement.items ?? []).join('\n')} className={inputClass} />
            </div>
            <div className="sm:col-span-2">
              <label className={labelClass}>Refund policy</label>
              <textarea name="refunds" rows={2} defaultValue={settings.policies.refunds} className={inputClass} />
            </div>
            <div className="sm:col-span-2">
              <label className={labelClass}>Return rules (one per line)</label>
              <textarea name="returns" rows={3} defaultValue={settings.policies.returns.join('\n')} className={inputClass} />
            </div>
            <div className="sm:col-span-2">
              <label className={labelClass}>Condition rule</label>
              <textarea name="condition" rows={2} defaultValue={settings.policies.condition} className={inputClass} />
            </div>
            <div className="sm:col-span-2">
              <button type="submit" className={buttonClass}>Save bank, banner and policies</button>
            </div>
          </form>
        </section>
      </div>
    </div>
  );
}



