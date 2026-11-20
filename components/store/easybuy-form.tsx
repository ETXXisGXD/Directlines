'use client';

import { useMemo, useState, useTransition } from 'react';
import { CheckCircle2, Loader2, MessageCircle, Zap } from 'lucide-react';
import type { Product, Settings } from '@/lib/queries';
import { formatNaira } from '@/lib/format';
import { submitEasyBuy } from '@/app/actions/easybuy';
import { trackEvent } from '@/lib/track-client';
import { newEventId, trackPixel, trackServerEvent } from '@/lib/meta-client';

export function EasyBuyForm({
  settings,
  products,
  initialModel,
  initialProduct,
}: {
  settings: Settings;
  products: Product[];
  initialModel?: string;
  initialProduct?: string;
}) {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [model, setModel] = useState(initialModel ?? '');
  const [price, setPrice] = useState(() => {
    const found = products.find((product) => product.slug === initialProduct || product.name === initialModel);
    return found?.price ?? products[0]?.price ?? 0;
  });
  const [tenure, setTenure] = useState(settings.easybuy_tenures[0] ?? 3);

  const deposit = useMemo(
    () => Math.round((price * settings.easybuy_down_payment_percent) / 100),
    [price, settings.easybuy_down_payment_percent]
  );
  const balance = Math.max(price - deposit, 0);
  const monthly = tenure > 0 ? Math.round(balance / tenure) : balance;

  function handleModel(value: string) {
    setModel(value);
    const found = products.find((product) => product.name === value || product.slug === value);
    if (found) setPrice(found.price);
  }

  function handleSubmit(formData: FormData) {
    setError(null);
    const fullName = String(formData.get('full_name') ?? '');
    const phone = String(formData.get('phone') ?? '');
    const product = products.find((item) => item.name === model);
    startTransition(async () => {
      const result = await submitEasyBuy({
        fullName,
        phone,
        targetModel: String(formData.get('target_model') ?? ''),
        guarantor1: String(formData.get('guarantor_1') ?? ''),
        guarantor2: String(formData.get('guarantor_2') ?? ''),
        productId: product?.id,
      });
      if (!result.ok) {
        setError(result.error);
        return;
      }
      setSuccess(result.whatsappUrl);
      trackEvent('easybuy_submit', { model });
      const eventId = newEventId('easybuy');
      trackPixel('Lead', { content_name: model, value: price, currency: 'NGN' }, eventId);
      trackServerEvent('Lead', eventId, { lead_type: 'easybuy', content_name: model, value: price, currency: 'NGN' }, { userData: { fullName, phone, country: 'NG' } });
      window.open(result.whatsappUrl, '_blank', 'noopener,noreferrer');
    });
  }

  if (success) {
    return (
      <div className="rounded-2xl border border-line bg-white p-7 text-center">
        <CheckCircle2 className="mx-auto h-9 w-9 text-[#1f9d55]" />
        <h2 className="mt-4 text-xl font-semibold text-ink">Application saved</h2>
        <p className="mt-2 text-sm leading-relaxed text-muted">
          WhatsApp should open automatically. If it did not, press the button below and send the message to the EasyBuy team.
        </p>
        <a href={success} target="_blank" rel="noopener noreferrer" className="btn-primary mt-5 w-full">
          <MessageCircle className="h-4 w-4" /> Open WhatsApp
        </a>
        <p className="mt-3 text-[10px] text-muted">This is an application, not an approval.</p>
      </div>
    );
  }

  return (
    <form action={handleSubmit} className="rounded-2xl border border-line bg-white p-5 sm:p-7">
      <div className="flex items-center gap-2">
        <Zap className="h-4 w-4 text-signal" />
        <h2 className="text-base font-semibold text-ink">Apply for EasyBuy</h2>
      </div>
      <p className="mt-2 text-xs leading-relaxed text-muted">
        Fill the five fields below. The application is saved, then WhatsApp opens with the details so the EasyBuy team can review it.
      </p>

      <div className="mt-5 grid gap-4">
        <div>
          <label className="label" htmlFor="full_name">1. Full name *</label>
          <input id="full_name" name="full_name" required className="field" autoComplete="name" />
        </div>
        <div>
          <label className="label" htmlFor="phone">2. Phone number *</label>
          <input id="phone" name="phone" required className="field" inputMode="tel" autoComplete="tel" />
        </div>
        <div>
          <label className="label" htmlFor="target_model">3. Target phone model *</label>
          <input
            id="target_model"
            name="target_model"
            required
            list="easybuy-models"
            value={model}
            onChange={(event) => handleModel(event.target.value)}
            className="field"
            placeholder="Start typing or choose a model"
          />
          <datalist id="easybuy-models">
            {products.map((product) => (
              <option key={product.id} value={product.name} />
            ))}
          </datalist>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="label" htmlFor="guarantor_1">4. Guarantor 1 phone *</label>
            <input id="guarantor_1" name="guarantor_1" required className="field" inputMode="tel" />
          </div>
          <div>
            <label className="label" htmlFor="guarantor_2">5. Guarantor 2 phone *</label>
            <input id="guarantor_2" name="guarantor_2" required className="field" inputMode="tel" />
          </div>
        </div>
      </div>

      <div className="mt-5 rounded-xl bg-paper-deep p-4">
        <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-muted">Illustration</p>
        <div className="mt-3 grid grid-cols-3 gap-3">
          <div>
            <label className="text-[9px] font-bold uppercase tracking-[0.1em] text-muted" htmlFor="price">Phone price</label>
            <select
              id="price"
              value={price}
              onChange={(event) => setPrice(Number(event.target.value))}
              className="field mt-1 h-9 min-h-0 py-1 text-[11px]"
            >
              {[...new Set(products.map((product) => product.price))].sort((a, b) => a - b).map((value) => (
                <option key={value} value={value}>{formatNaira(value)}</option>
              ))}
            </select>
          </div>
          <div>
            <p className="text-[9px] font-bold uppercase tracking-[0.1em] text-muted">Deposit ({settings.easybuy_down_payment_percent}%)</p>
            <p className="price mt-2 text-sm font-semibold">{formatNaira(deposit)}</p>
          </div>
          <div>
            <label className="text-[9px] font-bold uppercase tracking-[0.1em] text-muted" htmlFor="tenure">Months</label>
            <select
              id="tenure"
              value={tenure}
              onChange={(event) => setTenure(Number(event.target.value))}
              className="field mt-1 h-9 min-h-0 py-1 text-[11px]"
            >
              {settings.easybuy_tenures.map((value) => (
                <option key={value} value={value}>{value} months</option>
              ))}
            </select>
          </div>
        </div>
        <div className="mt-3 flex items-center justify-between border-t border-line pt-3 text-xs">
          <span className="text-muted">Balance</span>
          <span className="price font-semibold">{formatNaira(balance)}</span>
        </div>
        <div className="mt-1 flex items-center justify-between text-xs">
          <span className="text-muted">Approx. monthly</span>
          <span className="price font-semibold text-signal">{formatNaira(monthly)}</span>
        </div>
        <p className="mt-2 text-[9px] leading-relaxed text-muted">
          Illustration only. Final deposit and monthly amount are set by the EasyBuy provider after review.
        </p>
      </div>

      {error ? <p className="mt-4 rounded-lg bg-signal-soft px-3 py-2 text-[11px] text-signal">{error}</p> : null}

      <button type="submit" disabled={pending} className="btn-primary mt-5 w-full disabled:opacity-50">
        {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : <MessageCircle className="h-4 w-4" />}
        Save and continue on WhatsApp
      </button>
      <p className="mt-2 text-center text-[10px] text-muted">Your details are saved and sent to the EasyBuy line.</p>
    </form>
  );
}

