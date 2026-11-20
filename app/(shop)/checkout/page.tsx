import type { Metadata } from 'next';
import { getSettings } from '@/lib/queries';
import { CheckoutForm } from './checkout-form';

export const metadata: Metadata = {
  title: 'Checkout',
  robots: { index: false, follow: false },
};

export default async function CheckoutPage() {
  const settings = await getSettings();
  return (
    <div className="container-page py-10 sm:py-14">
      <p className="eyebrow text-signal">Checkout</p>
      <h1 className="mt-2 text-3xl font-semibold text-ink sm:text-4xl">Confirm your order</h1>
      <p className="mt-3 max-w-2xl text-sm leading-relaxed text-muted">
        Place the order and the store will confirm stock, colour and payment on WhatsApp. No card is charged on this website.
      </p>
      <div className="mt-8">
        <CheckoutForm settings={settings} />
      </div>
    </div>
  );
}
