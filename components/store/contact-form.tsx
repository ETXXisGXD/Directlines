'use client';

import { useState, useTransition } from 'react';
import { CheckCircle2, Loader2 } from 'lucide-react';
import { submitContact } from '@/app/actions/contact';
import { trackEvent } from '@/lib/track-client';

export function ContactForm() {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);

  function handleSubmit(formData: FormData) {
    setError(null);
    startTransition(async () => {
      const result = await submitContact({
        name: String(formData.get('name') ?? ''),
        phone: String(formData.get('phone') ?? ''),
        email: String(formData.get('email') ?? ''),
        subject: String(formData.get('subject') ?? ''),
        message: String(formData.get('message') ?? ''),
      });
      if (!result.ok) {
        setError(result.error ?? 'Could not send the message.');
        return;
      }
      setSent(true);
      trackEvent('contact_submit', {});
    });
  }

  if (sent) {
    return (
      <div className="rounded-2xl border border-line bg-white p-7 text-center">
        <CheckCircle2 className="mx-auto h-9 w-9 text-[#1f9d55]" />
        <h2 className="mt-4 text-xl font-semibold text-ink">Message saved</h2>
        <p className="mt-2 text-sm leading-relaxed text-muted">
          The store team has it. If you need an answer faster, message the WhatsApp line.
        </p>
      </div>
    );
  }

  return (
    <form action={handleSubmit} className="rounded-2xl border border-line bg-white p-5 sm:p-7">
      <h2 className="text-base font-semibold text-ink">Send a message</h2>
      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <div>
          <label className="label" htmlFor="name">Name *</label>
          <input id="name" name="name" required className="field" />
        </div>
        <div>
          <label className="label" htmlFor="phone">Phone *</label>
          <input id="phone" name="phone" required className="field" inputMode="tel" />
        </div>
        <div>
          <label className="label" htmlFor="email">Email</label>
          <input id="email" name="email" type="email" className="field" />
        </div>
        <div>
          <label className="label" htmlFor="subject">Subject</label>
          <input id="subject" name="subject" className="field" placeholder="Phone enquiry, repair, EasyBuy..." />
        </div>
        <div className="sm:col-span-2">
          <label className="label" htmlFor="message">Message *</label>
          <textarea id="message" name="message" required rows={5} className="field" />
        </div>
      </div>
      {error ? <p className="mt-4 rounded-lg bg-signal-soft px-3 py-2 text-[11px] text-signal">{error}</p> : null}
      <button type="submit" disabled={pending} className="btn-primary mt-5 w-full disabled:opacity-50">
        {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
        Send message
      </button>
    </form>
  );
}
