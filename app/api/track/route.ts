import { createHash } from 'node:crypto';
import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';

const ALLOWED = new Set([
  'page_view',
  'product_view',
  'add_to_cart',
  'begin_checkout',
  'order_placed',
  'easybuy_submit',
  'repair_submit',
  'contact_submit',
  'whatsapp_click',
  'search',
  'wishlist_add',
  'blog_view',
  'area_view',
]);

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const name = String(body?.name ?? '');
    if (!ALLOWED.has(name)) return new NextResponse(null, { status: 204 });

    const ip = (request.headers.get('x-forwarded-for') ?? '').split(',')[0].trim() || 'unknown';
    const userAgent = request.headers.get('user-agent') ?? '';
    const country = request.headers.get('x-vercel-ip-country') ?? null;
    const device = /mobile/i.test(userAgent) ? 'mobile' : /tablet|ipad/i.test(userAgent) ? 'tablet' : 'desktop';
    const day = new Date().toISOString().slice(0, 10);
    const salt = process.env.ANALYTICS_SALT ?? 'directlines-technologies';
    const visitorHash = createHash('sha256').update(`${ip}|${userAgent}|${day}|${salt}`).digest('hex').slice(0, 24);

    const admin = createAdminClient();
    await admin.from('analytics_events').insert({
      name,
      path: String(body?.path ?? '').slice(0, 500),
      referrer: String(body?.referrer ?? '').slice(0, 500),
      visitor_hash: visitorHash,
      device,
      country,
      metadata: body?.metadata && typeof body.metadata === 'object' ? body.metadata : {},
    });
  } catch {
    // Tracking must never break a visitor action.
  }
  return new NextResponse(null, { status: 204 });
}
