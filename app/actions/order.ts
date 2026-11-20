'use server';

import { after } from 'next/server';
import { headers } from 'next/headers';
import { createClient } from '@/lib/supabase/server';
import { getSettings } from '@/lib/queries';
import { createWhatsAppUrl } from '@/lib/whatsapp';
import { formatNaira } from '@/lib/format';
import { sendOrderEmails } from '@/lib/email';
import { sendCapiEvent } from '@/lib/meta-capi';

export interface CreateOrderInput {
  items: Array<{ variantId: string; quantity: number }>;
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  street: string;
  city: string;
  state: string;
  country: string;
  landmark?: string;
  shippingOption: string;
  paymentMethod: 'bank_transfer' | 'pay_on_delivery' | 'store_pickup';
  couponCode?: string;
  notes?: string;
  fbp?: string;
  fbc?: string;
  utm?: Record<string, string>;
}

export type CreateOrderResult =
  | { ok: true; orderNumber: string; whatsappUrl: string; total: number }
  | { ok: false; error: string };

interface PlaceOrderResult {
  order_number: string;
  subtotal: number;
  discount: number;
  shipping_fee: number;
  total: number;
  shipping_option: string;
  items: Array<{
    product_name: string;
    product_slug: string;
    variant_label: string | null;
    color: string | null;
    quantity: number;
    unit_price: number;
    line_total: number;
  }>;
}

export async function createOrder(input: CreateOrderInput): Promise<CreateOrderResult> {
  if (!input.items.length) return { ok: false, error: 'Your cart is empty.' };

  const supabase = await createClient();
  const headerStore = await headers();
  const clientIp = (headerStore.get('x-forwarded-for') ?? '').split(',')[0].trim() || null;
  const clientUa = headerStore.get('user-agent') ?? null;

  const { data, error } = await supabase.rpc('place_order', {
    payload: {
      items: input.items.map((item) => ({ variant_id: item.variantId, quantity: item.quantity })),
      customer_name: input.customerName,
      customer_phone: input.customerPhone,
      customer_email: input.customerEmail || null,
      delivery_street: input.street,
      delivery_city: input.city,
      delivery_state: input.state,
      delivery_country: input.country || 'Nigeria',
      delivery_landmark: input.landmark || null,
      shipping_option: input.shippingOption,
      payment_method: input.paymentMethod,
      coupon_code: input.couponCode || null,
      notes: input.notes || null,
      fbp: input.fbp || null,
      fbc: input.fbc || null,
      client_ip: clientIp,
      client_user_agent: clientUa,
      utm_source: input.utm?.utm_source || null,
      utm_medium: input.utm?.utm_medium || null,
      utm_campaign: input.utm?.utm_campaign || null,
      utm_content: input.utm?.utm_content || null,
      utm_term: input.utm?.utm_term || null,
    },
  });

  if (error) {
    return { ok: false, error: error.message };
  }

  const result = data as PlaceOrderResult;
  const settings = await getSettings();
  const zone = settings.shipping_zones.find((item) => item.id === result.shipping_option);
  const zoneName = zone?.name ?? result.shipping_option;
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://directlines-technologies.vercel.app';

  const itemLines = result.items
    .map(
      (item, index) =>
        `${index + 1}. ${item.product_name}${item.variant_label ? ` (${item.variant_label})` : ''}\n   Qty: ${item.quantity} | ${formatNaira(item.line_total)}\n   ${baseUrl}/product/${item.product_slug}`
    )
    .join('\n\n');

  const message = `*NEW ORDER - DIRECTLINES*\n\n*Order:* #${result.order_number}\n*Name:* ${input.customerName}\n*Phone:* ${input.customerPhone}\n*Delivery:* ${input.street}, ${input.city}, ${input.state}\n${input.landmark ? `*Landmark:* ${input.landmark}\n` : ''}${input.notes ? `*Note:* ${input.notes}\n` : ''}\n*ITEMS*\n${itemLines}\n\n*Subtotal:* ${formatNaira(result.subtotal)}\n${result.discount > 0 ? `*Discount:* -${formatNaira(result.discount)}\n` : ''}*Delivery (${zoneName}):* ${result.shipping_fee === 0 ? 'Free' : formatNaira(result.shipping_fee)}\n*TOTAL:* ${formatNaira(result.total)}\n\nPayment: ${input.paymentMethod.replace(/_/g, ' ')}\n\nPlease confirm payment details.`;

  const whatsappUrl = createWhatsAppUrl(settings.whatsapp_number, message);

  after(async () => {
    try {
      await sendOrderEmails({
        orderNumber: result.order_number,
        customerName: input.customerName,
        customerEmail: input.customerEmail || null,
        customerPhone: input.customerPhone,
        deliveryAddress: `${input.street}, ${input.city}, ${input.state}${input.landmark ? ` (${input.landmark})` : ''}`,
        shippingOptionLabel: zoneName,
        paymentMethod: input.paymentMethod.replace(/_/g, ' '),
        items: result.items.map((item) => ({
          product_name: item.product_name,
          variant_label: item.variant_label,
          color: item.color,
          quantity: item.quantity,
          line_total: item.line_total,
        })),
        subtotal: result.subtotal,
        discount: result.discount,
        shippingFee: result.shipping_fee,
        total: result.total,
      });
    } catch {
      // Never block checkout.
    }

    if (settings.meta_pixel_id && process.env.META_CAPI_ACCESS_TOKEN && (input.fbp || input.fbc)) {
      try {
        await sendCapiEvent({
          pixelId: settings.meta_pixel_id,
          accessToken: process.env.META_CAPI_ACCESS_TOKEN,
          testEventCode: settings.meta_test_event_code,
          eventName: 'InitiateCheckout',
          eventId: `checkout-${result.order_number}`,
          sourceUrl: `${baseUrl}/checkout`,
          userData: {
            email: input.customerEmail,
            phone: input.customerPhone,
            fullName: input.customerName,
            city: input.city,
            state: input.state,
            country: input.country || 'NG',
            fbp: input.fbp,
            fbc: input.fbc,
            clientIp,
            clientUserAgent: clientUa,
          },
          customData: {
            currency: 'NGN',
            value: result.total,
            content_type: 'product',
            num_items: result.items.reduce((sum, item) => sum + item.quantity, 0),
            order_id: result.order_number,
          },
          value: result.total,
        });
      } catch {
        // CAPI is best effort.
      }
    }
  });

  return { ok: true, orderNumber: result.order_number, whatsappUrl, total: result.total };
}

