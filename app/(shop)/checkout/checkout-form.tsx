'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useMemo, useState, useTransition } from 'react';
import { CheckCircle2, Loader2, MessageCircle } from 'lucide-react';
import { useCart } from '@/components/cart/cart-context';
import type { Settings } from '@/lib/queries';
import { formatNaira } from '@/lib/format';
import { createOrder } from '@/app/actions/order';
import { previewCoupon } from '@/app/actions/coupon';
import { getFbc, getFbp, readUtm, trackPixel } from '@/lib/meta-client';
import { trackEvent } from '@/lib/track-client';

type PaymentMethod = 'bank_transfer' | 'pay_on_delivery' | 'store_pickup';

export function CheckoutForm({ settings }: { settings: Settings }) {
  const { items, subtotal, clear } = useCart();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<{ orderNumber: string; total: number; whatsappUrl: string } | null>(null);
  const [shippingOption, setShippingOption] = useState(settings.shipping_zones[0]?.id ?? 'karu-nyanya');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('bank_transfer');
  const [coupon, setCoupon] = useState('');
  const [couponState, setCouponState] = useState<{ applied: boolean; discount: number; message: string }>({
    applied: false,
    discount: 0,
    message: '',
  });

  const zones = settings.shipping_zones.filter((zone) => zone.active);
  const zone = zones.find((item) => item.id === shippingOption);
  const shipping = zone ? (zone.free_over_threshold && subtotal >= settings.free_shipping_threshold ? 0 : Number(zone.price)) : 0;
  const total = Math.max(subtotal - (couponState.applied ? couponState.discount : 0) + shipping, 0);
  const count = items.reduce((sum, item) => sum + item.quantity, 0);

  useEffect(() => {
    trackEvent('begin_checkout', { items: count, value: subtotal });
    trackPixel('InitiateCheckout', {
      content_type: 'product',
      value: subtotal,
      currency: 'NGN',
      num_items: count,
    });
  }, [count, subtotal]);

  const methods = useMemo(
    () =>
      [
        { id: 'bank_transfer' as const, label: 'Bank transfer', text: 'We confirm the account details on WhatsApp.' },
        { id: 'pay_on_delivery' as const, label: 'Pay on delivery', text: 'Available within Abuja. Confirm first on WhatsApp.' },
        { id: 'store_pickup' as const, label: 'Pay at the showroom', text: 'Pick up at Bolfash Plaza, Karu. Open 24/7.' },
      ],
    []
  );

  function applyCoupon() {
    const code = coupon.trim();
    if (!code) return;
    const subtotalValue = subtotal;
    void previewCoupon(code, subtotalValue).then((result) => {
      setCouponState({ applied: result.ok, discount: result.discount, message: result.message });
    });
  }

  function handleSubmit(formData: FormData) {
    setError(null);
    if (!items.length) {
      setError('Your cart is empty.');
      return;
    }
    if (formData.get('terms') !== 'on') {
      setError('Please accept the order terms.');
      return;
    }

    const payload = {
      items: items.map((item) => ({ variantId: item.variantId, quantity: item.quantity })),
      customerName: String(formData.get('customer_name') ?? '').trim(),
      customerPhone: String(formData.get('customer_phone') ?? '').trim(),
      customerEmail: String(formData.get('customer_email') ?? '').trim(),
      street: String(formData.get('street') ?? '').trim(),
      city: String(formData.get('city') ?? '').trim(),
      state: String(formData.get('state') ?? '').trim(),
      country: 'Nigeria',
      landmark: String(formData.get('landmark') ?? '').trim(),
      shippingOption: paymentMethod === 'store_pickup' ? 'pickup' : shippingOption,
      paymentMethod,
      couponCode: couponState.applied ? coupon.trim().toUpperCase() : undefined,
      notes: String(formData.get('notes') ?? '').trim(),
      fbp: getFbp() ?? undefined,
      fbc: getFbc() ?? undefined,
      utm: readUtm(),
    };

    startTransition(async () => {
      const result = await createOrder(payload);
      if (!result.ok) {
        setError(result.error);
        return;
      }
      setSuccess(result);
      clear();
      trackEvent('order_placed', { order: result.orderNumber, value: result.total });
    });
  }

  if (success) {
    return (
      <div className="mx-auto max-w-xl rounded-3xl border border-line bg-white p-8 text-center sm:p-12">
        <CheckCircle2 className="mx-auto h-10 w-10 text-[#1f9d55]" />
        <h1 className="mt-4 text-2xl font-semibold text-ink">Order received</h1>
        <p className="mt-2 text-sm text-muted">
          Your order number is <span className="font-semibold text-ink">#{success.orderNumber}</span>. The total is{' '}
          <span className="font-semibold text-ink">{formatNaira(success.total)}</span>.
        </p>
        <p className="mt-3 text-xs leading-relaxed text-muted">
          Send the order to WhatsApp so the store can confirm stock and payment details. Your order is already saved.
        </p>
        <a href={success.whatsappUrl} target="_blank" rel="noopener noreferrer" className="btn-primary mt-6 w-full">
          <MessageCircle className="h-4 w-4" />
          Open WhatsApp with the order
        </a>
        <Link href="/shop" className="mt-4 flex justify-center text-[10px] font-bold uppercase tracking-[0.14em] text-muted hover:text-ink">
          Continue shopping
        </Link>
      </div>
    );
  }

  if (!items.length) {
    return (
      <div className="mx-auto max-w-xl rounded-3xl border border-line bg-white p-10 text-center">
        <p className="text-sm text-muted">Your cart is empty. Add a phone before checkout.</p>
        <Link href="/shop" className="btn-primary mt-5 inline-flex">Browse phones</Link>
      </div>
    );
  }

  return (
    <form action={handleSubmit} className="grid gap-8 lg:grid-cols-[1.25fr_0.75fr] lg:items-start">
      <div className="space-y-5">
        <section className="rounded-2xl border border-line bg-white p-5 sm:p-6">
          <h2 className="text-base font-semibold text-ink">Contact</h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <div>
              <label className="label" htmlFor="customer_name">Full name *</label>
              <input id="customer_name" name="customer_name" required className="field" autoComplete="name" />
            </div>
            <div>
              <label className="label" htmlFor="customer_phone">Phone number *</label>
              <input id="customer_phone" name="customer_phone" required className="field" inputMode="tel" autoComplete="tel" placeholder="0801 234 5678" />
            </div>
            <div className="sm:col-span-2">
              <label className="label" htmlFor="customer_email">Email (optional, for the receipt)</label>
              <input id="customer_email" name="customer_email" type="email" className="field" autoComplete="email" />
            </div>
          </div>
        </section>

        <section className="rounded-2xl border border-line bg-white p-5 sm:p-6">
          <h2 className="text-base font-semibold text-ink">Delivery</h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label className="label" htmlFor="street">Street address *</label>
              <input id="street" name="street" required className="field" autoComplete="street-address" />
            </div>
            <div>
              <label className="label" htmlFor="city">Town / city *</label>
              <input id="city" name="city" required className="field" defaultValue="Abuja" autoComplete="address-level2" />
            </div>
            <div>
              <label className="label" htmlFor="state">State *</label>
              <input id="state" name="state" required className="field" defaultValue="FCT" autoComplete="address-level1" />
            </div>
            <div className="sm:col-span-2">
              <label className="label" htmlFor="landmark">Landmark (optional)</label>
              <input id="landmark" name="landmark" className="field" placeholder="Opposite De Classic Hotel" />
            </div>
          </div>

          <div className="mt-5">
            <p className="label">Delivery option</p>
            <div className="grid gap-2">
              {zones.map((option) => {
                const price = option.free_over_threshold && subtotal >= settings.free_shipping_threshold ? 0 : Number(option.price);
                return (
                  <label
                    key={option.id}
                    className={`flex cursor-pointer items-center justify-between rounded-xl border px-4 py-3 text-xs ${
                      shippingOption === option.id ? 'border-ink bg-paper' : 'border-line hover:border-line-strong'
                    }`}
                  >
                    <span className="flex items-center gap-2.5">
                      <input
                        type="radio"
                        name="shipping_option"
                        value={option.id}
                        checked={shippingOption === option.id}
                        onChange={() => setShippingOption(option.id)}
                        className="accent-[#dc2626]"
                      />
                      <span className="font-semibold text-ink">{option.name}</span>
                    </span>
                    <span className="price text-muted">{price === 0 ? 'Free' : formatNaira(price)}</span>
                  </label>
                );
              })}
            </div>
          </div>
        </section>

        <section className="rounded-2xl border border-line bg-white p-5 sm:p-6">
          <h2 className="text-base font-semibold text-ink">Payment</h2>
          <div className="mt-4 grid gap-2">
            {methods.map((method) => (
              <label
                key={method.id}
                className={`flex cursor-pointer items-start gap-3 rounded-xl border px-4 py-3 ${
                  paymentMethod === method.id ? 'border-ink bg-paper' : 'border-line hover:border-line-strong'
                }`}
              >
                <input
                  type="radio"
                  name="payment_method"
                  value={method.id}
                  checked={paymentMethod === method.id}
                  onChange={() => setPaymentMethod(method.id)}
                  className="mt-0.5 accent-[#dc2626]"
                />
                <span>
                  <span className="block text-xs font-semibold text-ink">{method.label}</span>
                  <span className="mt-0.5 block text-[11px] leading-relaxed text-muted">{method.text}</span>
                </span>
              </label>
            ))}
          </div>
          <div className="mt-4">
            <label className="label" htmlFor="notes">Order note (optional)</label>
            <textarea id="notes" name="notes" rows={3} className="field" placeholder="Colour preference, delivery time, anything else." />
          </div>
        </section>
      </div>

      <aside className="rounded-2xl border border-line bg-white p-5 sm:p-6 lg:sticky lg:top-28">
        <p className="text-xs font-bold uppercase tracking-[0.16em] text-ink">Your order</p>
        <div className="mt-4 divide-y divide-line">
          {items.map((item) => (
            <div key={item.variantId} className="flex gap-3 py-3">
              <div className="relative h-14 w-12 shrink-0 overflow-hidden rounded-lg border border-line bg-paper">
                {item.image ? <Image src={item.image} alt={item.name} fill sizes="48px" className="object-contain p-1" /> : null}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-xs font-semibold text-ink">{item.name}</p>
                <p className="mt-0.5 text-[10px] text-muted">{item.label} · Qty {item.quantity}</p>
              </div>
              <p className="price shrink-0 text-xs font-semibold">{formatNaira(item.price * item.quantity)}</p>
            </div>
          ))}
        </div>

        <div className="mt-4 space-y-2 border-t border-line pt-4">
          <div className="flex justify-between text-xs"><span className="text-muted">Subtotal</span><span className="price">{formatNaira(subtotal)}</span></div>
          <div className="flex justify-between text-xs"><span className="text-muted">Delivery</span><span className="price">{shipping === 0 ? 'Free' : formatNaira(shipping)}</span></div>
          {couponState.applied ? (
            <div className="flex justify-between text-xs text-[#1f9d55]"><span>Coupon</span><span className="price">-{formatNaira(couponState.discount)}</span></div>
          ) : null}
          <div className="flex justify-between border-t border-line pt-2 text-sm font-semibold"><span>Total</span><span className="price text-signal">{formatNaira(total)}</span></div>
          {!couponState.applied && shipping > 0 && subtotal < settings.free_shipping_threshold ? (
            <p className="text-[10px] leading-relaxed text-muted">Add {formatNaira(settings.free_shipping_threshold - subtotal)} more for free delivery where eligible.</p>
          ) : null}
        </div>

        <div className="mt-4">
          <label className="label" htmlFor="coupon">Coupon code</label>
          <div className="flex gap-2">
            <input id="coupon" value={coupon} onChange={(event) => setCoupon(event.target.value)} className="field" placeholder="Optional" />
            <button type="button" onClick={applyCoupon} className="btn-secondary px-3">Apply</button>
          </div>
          {couponState.message ? (
            <p className={`mt-1.5 text-[10px] ${couponState.applied ? 'text-[#1f9d55]' : 'text-signal'}`}>{couponState.message}</p>
          ) : null}
        </div>

        <label className="mt-4 flex items-start gap-2 text-[10px] leading-relaxed text-muted">
          <input type="checkbox" name="terms" className="mt-0.5 accent-[#dc2626]" />
          I understand that stock, colour and final price are confirmed by the store on WhatsApp before payment.
        </label>

        {error ? <p className="mt-3 rounded-lg bg-signal-soft px-3 py-2 text-[11px] text-signal">{error}</p> : null}

        <button type="submit" disabled={pending} className="btn-primary mt-4 w-full disabled:opacity-50">
          {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
          Place order
        </button>
        <p className="mt-2 text-center text-[10px] leading-relaxed text-muted">No card is charged here. You pay after confirmation.</p>
      </aside>
    </form>
  );
}

