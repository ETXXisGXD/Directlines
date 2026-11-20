import { getProducts, getSettings } from '@/lib/queries';
import { siteMediaUrl } from '@/lib/storage';

export const revalidate = 3600;

function csv(value: string | number | null | undefined): string {
  const text = String(value ?? '');
  return `"${text.replace(/"/g, '""')}"`;
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const key = url.searchParams.get('key');
  const expected = process.env.META_CATALOG_SECRET;
  if (!expected || key !== expected) {
    return new Response('Unauthorized', { status: 401 });
  }

  const [settings, products] = await Promise.all([getSettings(), getProducts()]);
  if (!settings.meta_catalog_enabled) {
    return new Response('Catalog disabled', { status: 404 });
  }

  const base = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://directlines-technologies.vercel.app';
  const headers = [
    'id',
    'item_group_id',
    'title',
    'description',
    'availability',
    'condition',
    'price',
    'link',
    'image_link',
    'brand',
    'google_product_category',
    'quantity_to_sell_on_facebook',
    'size',
  ];

  const lines = [headers.map(csv).join(',')];

  for (const product of products) {
    const image = product.product_images[0]?.url ? siteMediaUrl(product.product_images[0].url) : '';
    const absoluteImage = image.startsWith('http') ? image : image ? `${base}${image}` : '';
    if (!absoluteImage) continue;
    for (const variant of product.product_variants) {
      const id = variant.sku || `${product.slug}-${variant.label.replace(/[^a-z0-9]+/gi, '-').toLowerCase()}`;
      lines.push(
        [
          id,
          product.id,
          `${product.name} ${variant.label}`.trim(),
          product.description ?? product.short_description ?? product.name,
          variant.stock === 0 ? 'out of stock' : 'in stock',
          'new',
          `${Math.round(Number(variant.price))} NGN`,
          `${base}/product/${product.slug}`,
          absoluteImage,
          product.brands?.name ?? 'Directlines',
          'Electronics > Communications > Telephony > Mobile Phones',
          variant.stock === null ? '' : variant.stock,
          variant.label,
        ]
          .map(csv)
          .join(',')
      );
    }
  }

  return new Response(lines.join('\n'), {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': 'attachment; filename="directlines-meta-catalog.csv"',
      'Cache-Control': 'public, max-age=3600',
    },
  });
}

