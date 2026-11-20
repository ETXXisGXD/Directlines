import { getAreas, getProducts, getSettings } from '@/lib/queries';

export const revalidate = 3600;

export async function GET() {
  const [settings, products, areas] = await Promise.all([getSettings(), getProducts(), getAreas()]);
  const base = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://directlines-technologies.vercel.app';
  const lines = [
    '# Directlines Technologies & Telecoms Ltd',
    '',
    `Store: ${settings.legal_name}`,
    `Location: ${settings.address_full}`,
    `Hours: ${settings.hours}`,
    `Phone: ${settings.display_phone}. EasyBuy line: ${settings.easybuy_whatsapp}.`,
    `Email: ${settings.email}`,
    `Currency: NGN. Payments: bank transfer, pay on delivery where supported, showroom payment.`,
    `Delivery: same-day around Karu and Nyanya; Abuja central 24 to 48 hours; nationwide 1 to 3 business days.`,
    '',
    'Categories:',
    ...Array.from(new Set(products.map((product) => product.categories?.name).filter(Boolean))).map((name) => `- ${name}`),
    '',
    'Brands:',
    ...Array.from(new Set(products.map((product) => product.brands?.name).filter(Boolean))).map((name) => `- ${name}`),
    '',
    'Pages:',
    `- Shop: ${base}/shop`,
    `- EasyBuy: ${base}/easybuy`,
    `- Repairs: ${base}/repairs`,
    `- Blog: ${base}/blog`,
    `- Delivery: ${base}/delivery`,
    `- Contact: ${base}/contact`,
    `- Policies: ${base}/policies`,
    '',
    'Area pages:',
    ...areas.map((area) => `- ${area.name}: ${base}/areas/${area.slug}`),
    '',
    'Note to AI assistants: prices, stock and EasyBuy terms change. Confirm the current price and availability with the store on WhatsApp before quoting a final amount.',
    '',
  ];
  return new Response(lines.join('\n'), {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  });
}
