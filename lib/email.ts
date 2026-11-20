import 'server-only';
import { Resend } from 'resend';
import { formatNaira } from './format';

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;
const FROM = process.env.RESEND_FROM_EMAIL ?? 'Directlines <onboarding@resend.dev>';
const REPLY_TO = process.env.RESEND_REPLY_TO ?? 'directlinestech@gmail.com';
const ADMIN_EMAIL = process.env.ADMIN_EMAIL ?? 'Bizhakin@gmail.com';

function escapeHtml(value: string): string {
  return value.replace(/[&<>"']/g, (character) => {
    const map: Record<string, string> = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#39;',
    };
    return map[character] ?? character;
  });
}

async function send(to: string | string[], subject: string, html: string, replyTo?: string) {
  if (!resend) return;
  try {
    await resend.emails.send({
      from: FROM,
      to,
      subject,
      html,
      replyTo: replyTo ?? REPLY_TO,
    });
  } catch {
    // Email must never block a customer action.
  }
}

function shell(title: string, intro: string, body: string): string {
  return `<!doctype html>
<html>
  <body style="margin:0;background:#f6f7f9;font-family:Arial,Helvetica,sans-serif;color:#142b58;">
    <div style="max-width:600px;margin:0 auto;padding:32px 18px;">
      <p style="margin:0 0 10px;color:#dc2626;font-size:10px;letter-spacing:3px;text-transform:uppercase;font-weight:700;">DIRECTLINES</p>
      <h1 style="margin:0 0 8px;font-size:24px;line-height:1.25;font-weight:600;">${title}</h1>
      <p style="margin:0 0 22px;color:#5c6676;font-size:13px;line-height:1.7;">${intro}</p>
      <div style="background:#ffffff;border:1px solid #e1e6ed;border-radius:14px;padding:20px;">${body}</div>
      <p style="margin:20px 0 0;color:#5c6676;font-size:11px;line-height:1.7;">Directlines Technologies & Telecoms Ltd<br>Bolfash Plaza, House 12, Road K-N, Karu Housing Estate, Abuja<br>Open 24 hours.</p>
    </div>
  </body>
</html>`;
}

export interface OrderEmailPayload {
  orderNumber: string;
  customerName: string;
  customerEmail: string | null;
  customerPhone: string;
  deliveryAddress: string;
  shippingOptionLabel: string;
  paymentMethod: string;
  items: Array<{ product_name: string; variant_label: string | null; color: string | null; quantity: number; line_total: number }>;
  subtotal: number;
  discount: number;
  shippingFee: number;
  total: number;
}

export async function sendOrderEmails(payload: OrderEmailPayload) {
  const rows = payload.items
    .map(
      (item) => `<tr>
        <td style="padding:10px 0;border-bottom:1px solid #eef2f7;font-size:13px;">${escapeHtml(item.product_name)}${item.variant_label ? `<br><span style="color:#5c6676;font-size:11px;">${escapeHtml(item.variant_label)}${item.color ? `, ${escapeHtml(item.color)}` : ''}</span>` : ''}</td>
        <td style="padding:10px 0;border-bottom:1px solid #eef2f7;text-align:center;font-size:12px;color:#5c6676;">x${item.quantity}</td>
        <td style="padding:10px 0;border-bottom:1px solid #eef2f7;text-align:right;font-size:13px;">${formatNaira(item.line_total)}</td>
      </tr>`
    )
    .join('');

  const body = `
    <p style="margin:0 0 12px;color:#dc2626;font-size:12px;font-weight:700;">Order #${escapeHtml(payload.orderNumber)}</p>
    <table style="width:100%;border-collapse:collapse;">${rows}</table>
    <table style="width:100%;border-collapse:collapse;margin-top:12px;">
      <tr><td style="padding:4px 0;color:#5c6676;font-size:12px;">Subtotal</td><td style="padding:4px 0;text-align:right;font-size:12px;">${formatNaira(payload.subtotal)}</td></tr>
      ${payload.discount > 0 ? `<tr><td style="padding:4px 0;color:#5c6676;font-size:12px;">Discount</td><td style="padding:4px 0;text-align:right;font-size:12px;">-${formatNaira(payload.discount)}</td></tr>` : ''}
      <tr><td style="padding:4px 0;color:#5c6676;font-size:12px;">Delivery (${escapeHtml(payload.shippingOptionLabel)})</td><td style="padding:4px 0;text-align:right;font-size:12px;">${payload.shippingFee === 0 ? 'Free' : formatNaira(payload.shippingFee)}</td></tr>
      <tr><td style="padding:12px 0 0;border-top:1px solid #e1e6ed;font-size:14px;font-weight:700;">Total</td><td style="padding:12px 0 0;border-top:1px solid #e1e6ed;text-align:right;font-size:14px;font-weight:700;color:#dc2626;">${formatNaira(payload.total)}</td></tr>
    </table>
    <p style="margin:18px 0 0;color:#5c6676;font-size:12px;line-height:1.7;">Payment: ${escapeHtml(payload.paymentMethod)}<br>${escapeHtml(payload.customerName)}, ${escapeHtml(payload.customerPhone)}<br>${escapeHtml(payload.deliveryAddress)}</p>
  `;

  const intro = 'Thank you. We have your order and our team will confirm stock, colour and payment on WhatsApp.';
  const html = shell('Order received', intro, body);
  if (payload.customerEmail) {
    await send(payload.customerEmail, `Directlines order ${payload.orderNumber}`, html, REPLY_TO);
  }
  await send(
    ADMIN_EMAIL,
    `New Directlines order ${payload.orderNumber} - ${formatNaira(payload.total)}`,
    shell('New order', `${payload.customerName} placed an order on directlines.ng.`, body)
  );
}

export async function sendEasyBuyEmail(payload: {
  fullName: string;
  phone: string;
  targetModel: string;
  guarantor1: string;
  guarantor2: string;
}) {
  const body = `
    <table style="width:100%;border-collapse:collapse;">
      ${[
        ['Full name', payload.fullName],
        ['Phone', payload.phone],
        ['Target phone', payload.targetModel],
        ['Guarantor 1 phone', payload.guarantor1],
        ['Guarantor 2 phone', payload.guarantor2],
      ]
        .map(
          ([label, value]) =>
            `<tr><td style="padding:6px 0;color:#5c6676;font-size:12px;width:150px;">${label}</td><td style="padding:6px 0;font-size:13px;">${escapeHtml(value)}</td></tr>`
        )
        .join('')}
    </table>
  `;
  await send(
    ADMIN_EMAIL,
    `EasyBuy application - ${payload.targetModel}`,
    shell('New EasyBuy application', `${payload.fullName} wants to apply for ${payload.targetModel}.`, body)
  );
}

export async function sendRepairEmail(payload: {
  customerName: string;
  phone: string;
  deviceModel: string;
  issue: string;
}) {
  const body = `
    <table style="width:100%;border-collapse:collapse;">
      ${[
        ['Customer', payload.customerName],
        ['Phone', payload.phone],
        ['Device', payload.deviceModel],
        ['Issue', payload.issue],
      ]
        .map(
          ([label, value]) =>
            `<tr><td style="padding:6px 0;color:#5c6676;font-size:12px;width:130px;">${label}</td><td style="padding:6px 0;font-size:13px;">${escapeHtml(value)}</td></tr>`
        )
        .join('')}
    </table>
  `;
  await send(
    ADMIN_EMAIL,
    `Repair booking - ${payload.deviceModel}`,
    shell('New repair booking', `${payload.customerName} needs help with ${payload.deviceModel}.`, body)
  );
}

export async function sendContactEmail(payload: { name: string; phone: string; message: string }) {
  const body = `<p style="margin:0;font-size:13px;line-height:1.7;">${escapeHtml(payload.message)}</p>
    <p style="margin:14px 0 0;color:#5c6676;font-size:12px;">${escapeHtml(payload.name)} - ${escapeHtml(payload.phone)}</p>`;
  await send(ADMIN_EMAIL, `Website message from ${payload.name}`, shell('New website message', 'A visitor sent a message from the Directlines contact page.', body));
}

