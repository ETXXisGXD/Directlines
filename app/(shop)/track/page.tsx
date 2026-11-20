import type { Metadata } from 'next';
import Link from 'next/link';
import { CheckCircle2, PackageSearch } from 'lucide-react';
import { createAdminClient } from '@/lib/supabase/admin';
import { formatNaira } from '@/lib/format';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Track an order',
  robots: { index: false, follow: false },
};

const statusLabel: Record<string, string> = {
  received: 'Received',
  confirmed: 'Confirmed',
  processing: 'Processing',
  dispatched: 'Dispatched',
  delivered: 'Delivered',
  cancelled: 'Cancelled',
};

export default async function TrackPage({
  searchParams,
}: {
  searchParams: Promise<{ order?: string; phone?: string }>;
}) {
  const params = await searchParams;
  interface TrackedOrder {
    order_number: string;
    customer_name: string;
    status: string;
    payment_status: string;
    total: number;
    courier: string | null;
    tracking_number: string | null;
    created_at: string;
    order_items: Array<{ product_name: string; variant_label: string | null; quantity: number; line_total: number }>;
  }
  let order: TrackedOrder | null = null;
  let searched = false;
  let error: string | null = null;

  if (params.order && params.phone) {
    searched = true;
    const admin = createAdminClient();
    const digits = params.phone.replace(/[^0-9]/g, '');
    const { data } = await admin
      .from('orders')
      .select('order_number, customer_name, status, payment_status, total, courier, tracking_number, created_at, order_items(product_name, variant_label, quantity, line_total)')
      .eq('order_number', params.order.trim().toUpperCase())
      .order('created_at', { ascending: false })
      .limit(1);
    const found = data?.[0];
    if (found) {
      const phoneMatches = String(params.phone).replace(/[^0-9]/g, '').slice(-10) === digits.slice(-10);
      if (phoneMatches) order = found as unknown as TrackedOrder;
    }
    if (!order) error = 'No order matches that number and phone. Check the order number and try again.';
  }

  return (
    <div className="container-page py-10 sm:py-14">
      <div className="max-w-2xl">
        <p className="eyebrow text-signal">Order tracking</p>
        <h1 className="mt-2 text-3xl font-semibold text-ink sm:text-4xl">Where is my order?</h1>
        <p className="mt-3 text-sm leading-relaxed text-muted">
          Enter the order number from checkout and the phone number used on the order.
        </p>
        <form className="mt-6 grid gap-3 rounded-2xl border border-line bg-white p-5 sm:grid-cols-[1fr_1fr_auto] sm:items-end">
          <div>
            <label className="label" htmlFor="order">Order number</label>
            <input id="order" name="order" defaultValue={params.order ?? ''} required className="field" placeholder="DL-2026-01001" />
          </div>
          <div>
            <label className="label" htmlFor="phone">Phone number</label>
            <input id="phone" name="phone" defaultValue={params.phone ?? ''} required className="field" inputMode="tel" />
          </div>
          <button type="submit" className="btn-primary">Track</button>
        </form>

        {error ? (
          <p className="mt-4 rounded-xl bg-signal-soft px-4 py-3 text-xs text-signal">{error}</p>
        ) : null}

        {order ? (
          <div className="mt-6 rounded-2xl border border-line bg-white p-5 sm:p-6">
            <div className="flex flex-wrap items-start justify-between gap-3 border-b border-line pb-4">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.14em] text-signal">#{order.order_number}</p>
                <p className="mt-1 text-sm font-semibold text-ink">{order.customer_name}</p>
                <p className="mt-0.5 text-[11px] text-muted">Placed {new Date(order.created_at).toLocaleDateString('en-NG')}</p>
              </div>
              <div className="text-right">
                <p className="rounded-full bg-paper-deep px-3 py-1 text-[10px] font-bold uppercase tracking-[0.12em] text-ink">
                  {statusLabel[order.status] ?? order.status}
                </p>
                <p className="mt-1 text-[10px] text-muted">Payment: {order.payment_status}</p>
              </div>
            </div>
            <div className="divide-y divide-line py-2">
              {order.order_items.map((item, index) => (
                <div key={index} className="flex items-center justify-between gap-3 py-2 text-xs">
                  <span className="text-ink">{item.product_name}{item.variant_label ? ` · ${item.variant_label}` : ''} × {item.quantity}</span>
                  <span className="price font-semibold">{formatNaira(item.line_total)}</span>
                </div>
              ))}
            </div>
            <div className="flex items-center justify-between border-t border-line pt-3 text-sm font-semibold">
              <span>Total</span>
              <span className="price text-signal">{formatNaira(order.total)}</span>
            </div>
            {order.tracking_number ? (
              <div className="mt-4 rounded-xl bg-paper-deep p-4 text-xs text-muted">
                <p><span className="font-semibold text-ink">Courier:</span> {order.courier ?? 'Confirmed by the store'}</p>
                <p className="mt-1"><span className="font-semibold text-ink">Tracking:</span> {order.tracking_number}</p>
              </div>
            ) : (
              <p className="mt-4 flex items-center gap-2 text-[11px] text-muted">
                <PackageSearch className="h-3.5 w-3.5 text-signal" />
                Tracking is added after dispatch. Message the store if you need an update.
              </p>
            )}
          </div>
        ) : searched && !error ? (
          <div className="mt-6 rounded-2xl border border-line bg-white p-6 text-center">
            <CheckCircle2 className="mx-auto h-6 w-6 text-muted" />
            <p className="mt-3 text-sm text-muted">Order lookup is available after checkout.</p>
          </div>
        ) : null}

        <p className="mt-6 text-[11px] text-muted">
          Need help? <Link href="/contact" className="font-semibold text-ink underline underline-offset-2">Contact the store</Link>.
        </p>
      </div>
    </div>
  );
}

