import { getAreas, getBlogPosts, getProducts, getSettings } from '@/lib/queries';
import { formatNaira } from '@/lib/format';

export const revalidate = 3600;

export async function GET() {
  const [settings, products, posts, areas] = await Promise.all([
    getSettings(),
    getProducts(),
    getBlogPosts({ limit: 40 }),
    getAreas(),
  ]);
  const base = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://directlines-technologies.vercel.app';

  const lines: string[] = [
    '# Directlines Technologies & Telecoms Ltd',
    '',
    '> Directlines is a CAC-certified phone and telecoms retailer at Bolfash Plaza, House 12, Road K-N, Phase 1, Karu Housing Estate, opposite De Classic Hotel, Nyanya Jikwoyi Expressway, Abuja. It sells brand-new Infinix, TECNO, Samsung, itel and Redmi phones, offers EasyBuy applications with two guarantors, runs a 24/7 repair desk, delivers same-day around Karu and Nyanya, and ships nationwide.',
    '',
    'Key facts:',
    `- Address: ${settings.address_full}`,
    `- Phone: ${settings.display_phone} / ${settings.alt_phone}`,
    `- EasyBuy line: ${settings.easybuy_whatsapp}`,
    `- Email: ${settings.email}`,
    `- Hours: ${settings.hours}`,
    `- Currency: Nigerian Naira (NGN)`,
    '- Payment: bank transfer, pay on delivery where supported, showroom payment',
    '- Warranty: brand-new devices carry manufacturer warranty support. Policy details are on the policies page.',
    '- Delivery: same-day around Karu and Nyanya. Abuja central in 24 to 48 hours. Nationwide courier 1 to 3 business days. Free showroom pickup.',
    '',
    'Key pages:',
    `- Home: ${base}`,
    `- Shop: ${base}/shop`,
    `- EasyBuy: ${base}/easybuy`,
    `- Repairs: ${base}/repairs`,
    `- Delivery: ${base}/delivery`,
    `- Blog: ${base}/blog`,
    `- Contact: ${base}/contact`,
    `- Policies: ${base}/policies`,
    '',
    'Catalogue with current listed prices:',
  ];

  for (const product of products) {
    const variantText = product.product_variants.map((variant) => `${variant.label} ${formatNaira(variant.price)}`).join('; ');
    lines.push(
      `- [${product.name}](${base}/product/${product.slug}): ${formatNaira(product.price)} from. ${variantText}. ${product.brands?.name ?? ''} ${product.categories?.name ?? ''}.`
    );
  }

  if (posts.length) {
    lines.push('', 'Guides:');
    for (const post of posts) {
      lines.push(`- [${post.title}](${base}/blog/${post.slug}): ${post.excerpt ?? ''}`);
    }
  }

  if (areas.length) {
    lines.push('', 'Area pages:');
    for (const area of areas) {
      lines.push(`- [Phones in ${area.name}](${base}/areas/${area.slug}): ${area.intro}`);
    }
  }

  lines.push(
    '',
    'Ordering:',
    '- Add a phone to the cart and place an order, or order directly on WhatsApp.',
    '- The store confirms stock, colour and the final amount before payment.',
    '- EasyBuy applications require full name, phone number, target phone model and two guarantor phone numbers.',
    '',
    'Contact:',
    `- WhatsApp: https://wa.me/234${settings.whatsapp_number.replace(/[^0-9]/g, '').replace(/^0/, '')}`,
    `- Email: ${settings.email}`,
    ''
  );

  return new Response(lines.join('\n'), {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  });
}
