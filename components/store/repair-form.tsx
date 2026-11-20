'use client';

import { useState, useTransition } from 'react';
import { CheckCircle2, Loader2, MessageCircle, Wrench } from 'lucide-react';
import { submitRepair } from '@/app/actions/repair';
import { trackEvent } from '@/lib/track-client';
import { newEventId, trackPixel, trackServerEvent } from '@/lib/meta-client';

export function RepairForm() {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  function handleSubmit(formData: FormData) {
    setError(null);
    const model = String(formData.get('device_model') ?? '');
    const customerName = String(formData.get('customer_name') ?? '');
    const phone = String(formData.get('phone') ?? '');
    startTransition(async () => {
      const result = await submitRepair({
        customerName,
        phone,
        email: String(formData.get('email') ?? ''),
        deviceBrand: String(formData.get('device_brand') ?? ''),
        deviceModel: model,
        issue: String(formData.get('issue') ?? ''),
        preferredContact: String(formData.get('preferred_contact') ?? 'whatsapp'),
      });
      if (!result.ok) {
        setError(result.error);
        return;
      }
      setSuccess(result.whatsappUrl);
      trackEvent('repair_submit', { model });
      const eventId = newEventId('repair');
      trackPixel('Lead', { content_name: model }, eventId);
      trackServerEvent('Lead', eventId, { lead_type: 'repair', content_name: model }, { userData: { fullName: customerName, phone, country: 'NG' } });
      window.open(result.whatsappUrl, '_blank', 'noopener,noreferrer');
    });
  }

  if (success) {
    return (
      <div className="rounded-2xl border border-line bg-white p-7 text-center">
        <CheckCircle2 className="mx-auto h-9 w-9 text-[#1f9d55]" />
        <h2 className="mt-4 text-xl font-semibold text-ink">Repair booking saved</h2>
        <p className="mt-2 text-sm leading-relaxed text-muted">
          WhatsApp should open automatically. If it did not, press the button below to send the booking to the repair desk.
        </p>
        <a href={success} target="_blank" rel="noopener noreferrer" className="btn-primary mt-5 w-full">
          <MessageCircle className="h-4 w-4" /> Open WhatsApp
        </a>
      </div>
    );
  }

  return (
    <form action={handleSubmit} className="rounded-2xl border border-line bg-white p-5 sm:p-7">
      <div className="flex items-center gap-2">
        <Wrench className="h-4 w-4 text-signal" />
        <h2 className="text-base font-semibold text-ink">Book a diagnostic</h2>
      </div>
      <p className="mt-2 text-xs leading-relaxed text-muted">
        Tell us the device and the fault. We confirm the diagnostic fee and part price before any repair starts.
      </p>
      <div className="mt-5 grid gap-4 sm:grid-cols-2">
        <div>
          <label className="label" htmlFor="customer_name">Your name *</label>
          <input id="customer_name" name="customer_name" required className="field" />
        </div>
        <div>
          <label className="label" htmlFor="phone">Phone number *</label>
          <input id="phone" name="phone" required className="field" inputMode="tel" />
        </div>
        <div>
          <label className="label" htmlFor="device_brand">Brand</label>
          <input id="device_brand" name="device_brand" className="field" placeholder="TECNO, Samsung, iPhone..." />
        </div>
        <div>
          <label className="label" htmlFor="device_model">Device model *</label>
          <input id="device_model" name="device_model" required className="field" />
        </div>
        <div className="sm:col-span-2">
          <label className="label" htmlFor="email">Email (optional)</label>
          <input id="email" name="email" type="email" className="field" />
        </div>
        <div className="sm:col-span-2">
          <label className="label" htmlFor="issue">What is wrong? *</label>
          <textarea id="issue" name="issue" required rows={4} className="field" placeholder="Cracked screen, battery drains fast, charging port, water damage..." />
        </div>
        <div className="sm:col-span-2">
          <label className="label" htmlFor="preferred_contact">Preferred contact</label>
          <select id="preferred_contact" name="preferred_contact" className="field">
            <option value="whatsapp">WhatsApp</option>
            <option value="call">Phone call</option>
            <option value="email">Email</option>
          </select>
        </div>
      </div>
      {error ? <p className="mt-4 rounded-lg bg-signal-soft px-3 py-2 text-[11px] text-signal">{error}</p> : null}
      <button type="submit" disabled={pending} className="btn-primary mt-5 w-full disabled:opacity-50">
        {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : <MessageCircle className="h-4 w-4" />}
        Save and continue on WhatsApp
      </button>
    </form>
  );
}

