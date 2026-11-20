import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft, MessageCircle, Send } from 'lucide-react';
import { createAdminClient } from '@/lib/supabase/admin';
import { formatNaira } from '@/lib/format';
import { createWhatsAppUrl } from '@/lib/whatsapp';
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
import { resendPurchaseEvent, updateOrder } from '../../actions';

export const dynamic = 'force-dynamic';

export default async function AdminOrderDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ saved?: string; err?: string }>;
}) {
  const { id } = await params;
  const query = await searchParams;
  const admin = createAdminClient();
  const { data: order } = await admin.from('orders').select('*, order_items(*)').eq('id', id).maybeSingle();
  if (!order) notFound();

  const items = order.order_items ?? [];
  const whatsapp = createWhatsAppUrl(
    order.customer_phone,
    `Hello ${order.customer_name}, this is Directlines about your order #${order.order_number}.`
  );

  return (
    <div>
      <PageHeader
        title={`#${order.order_number}`}
        subtitle={`Placed ${new Date(order.created_at).toLocaleString('en-NG')}`}
        action={
          <Link href="/admin/orders" className="inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.12em] text-muted hover:text-ink">
            <ArrowLeft className="h-3.5 w-3.5" /> All orders
          </Link>
        }
      />
      <AdminBanner saved={query.saved === '1'} err={query.err ?? null} />

      <div className="grid gap-6 lg:grid-cols-[1.3fr_0.7fr]">
        <div className="space-y-5">
          <section className={cardClass}>
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h2 className="text-sm font-semibold text-ink">Items</h2>
              <div className="flex items-center gap-2">
                <StatusPill status={order.status} />
                <StatusPill status={order.payment_status} />
              </div>
            </div>
            <div className="mt-4 divide-y divide-line">
              {items.map((item: { id: string; product_name: string; variant_label: string | null; color: string | null; quantity: number; line_total: number }) => (
                <div key={item.id} className="flex items-center justify-between gap-4 py-3">
                  <div>
                    <p className="text-xs font-semibold text-ink">{item.product_name}</p>
                    <p className="mt-0.5 text-[10px] text-muted">{item.variant_label ?? ''}{item.color ? ` · ${item.color}` : ''} · Qty {item.quantity}</p>
                  </div>
                  <p className="price text-xs font-semibold">{formatNaira(item.line_total)}</p>
                </div>
              ))}
            </div>
            <div className="mt-4 space-y-1.5 border-t border-line pt-4 text-xs">
              <div className="flex justify-between text-muted"><span>Subtotal</span><span>{formatNaira(order.subtotal)}</span></div>
              {Number(order.discount) > 0 ? <div className="flex justify-between text-muted"><span>Discount</span><span>-{formatNaira(order.discount)}</span></div> : null}
              <div className="flex justify-between text-muted"><span>Delivery</span><span>{Number(order.shipping_fee) === 0 ? 'Free' : formatNaira(order.shipping_fee)}</span></div>
              <div className="flex justify-between border-t border-line pt-2 text-sm font-semibold"><span>Total</span><span className="price text-signal">{formatNaira(order.total)}</span></div>
            </div>
          </section>

          <section className={cardClass}>
            <h2 className="text-sm font-semibold text-ink">Customer and delivery</h2>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <div>
                <p className="label">Customer</p>
                <p className="text-sm font-semibold text-ink">{order.customer_name}</p>
                <p className="mt-1 text-xs text-muted">{order.customer_phone}</p>
                {order.customer_email ? <p className="text-xs text-muted">{order.customer_email}</p> : null}
              </div>
              <div>
                <p className="label">Address</p>
                <p className="text-xs leading-relaxed text-muted">{order.delivery_street}, {order.delivery_city}, {order.delivery_state}{order.delivery_landmark ? ` (${order.delivery_landmark})` : ''}</p>
              </div>
              <div>
                <p className="label">Payment method</p>
                <p className="text-xs text-muted">{String(order.payment_method).replace(/_/g, ' ')}</p>
              </div>
              <div>
                <p className="label">Delivery option</p>
                <p className="text-xs text-muted">{order.shipping_option}</p>
              </div>
              {order.notes ? <div className="sm:col-span-2"><p className="label">Customer note</p><p className="text-xs leading-relaxed text-muted">{order.notes}</p></div> : null}
            </div>
            <div className="mt-5 flex flex-wrap gap-2">
              <a href={whatsapp} target="_blank" rel="noopener noreferrer" className={secondaryButtonClass}>
                <MessageCircle className="h-3.5 w-3.5" /> WhatsApp customer
              </a>
              <form action={resendPurchaseEvent}>
                <input type="hidden" name="id" value={order.id} />
                <button type="submit" className={secondaryButtonClass}>
                  <Send className="h-3.5 w-3.5" /> Resend Meta purchase
                </button>
              </form>
            </div>
            <p className="mt-3 text-[10px] text-muted">
              Meta purchase: {order.meta_purchase_event_id ? `sent ${new Date(order.meta_purchase_sent_at).toLocaleString('en-NG')}` : 'not sent.'}
            </p>
          </section>
        </div>

        <aside className="space-y-5">
          <section className={cardClass}>
            <h2 className="text-sm font-semibold text-ink">Update order</h2>
            <form action={updateOrder} className="mt-4 space-y-4">
              <input type="hidden" name="id" value={order.id} />
              <div>
                <label className={labelClass}>Order status</label>
                <select name="status" defaultValue={order.status} className={inputClass}>
                  {['received', 'confirmed', 'processing', 'dispatched', 'delivered', 'cancelled'].map((status) => <option key={status} value={status}>{status}</option>)}
                </select>
              </div>
              <div>
                <label className={labelClass}>Payment status</label>
                <select name="payment_status" defaultValue={order.payment_status} className={inputClass}>
                  {['pending', 'paid', 'refunded', 'cancelled'].map((status) => <option key={status} value={status}>{status}</option>)}
                </select>
                <p className="mt-1 text-[10px] text-muted">Marking paid sends the Meta Purchase event and adds loyalty points if enabled.</p>
              </div>
              <div>
                <label className={labelClass}>Courier</label>
                <input name="courier" defaultValue={order.courier ?? ''} className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Tracking number</label>
                <input name="tracking_number" defaultValue={order.tracking_number ?? ''} className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Admin notes</label>
                <textarea name="admin_notes" rows={3} defaultValue={order.admin_notes ?? ''} className={inputClass} />
              </div>
              <button type="submit" className={`${buttonClass} w-full`}>Save order</button>
            </form>
          </section>

          <section className={cardClass}>
            <p className="text-sm font-semibold text-ink">Tracking details</p>
            <div className="mt-3 space-y-1 text-[10px] text-muted">
              <p>UTM source: {order.utm_source ?? '"”'}</p>
              <p>UTM campaign: {order.utm_campaign ?? '"”'}</p>
              <p>FB click ID: {order.fbc ? 'captured' : '"”'}</p>
              <p>FB browser ID: {order.fbp ? 'captured' : '"”'}</p>
            </div>
          </section>
        </aside>
      </div>
    </div>
  );
}

