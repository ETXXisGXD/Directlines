import { NextResponse } from 'next/server';
import { getSettings } from '@/lib/queries';
import { sendCapiEvent } from '@/lib/meta-capi';

const ALLOWED = new Set([
  'PageView',
  'ViewContent',
  'AddToCart',
  'InitiateCheckout',
  'AddPaymentInfo',
  'Lead',
  'Contact',
  'Search',
  'AddToWishlist',
  'Purchase',
]);

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const eventName = String(body?.eventName ?? '');
    const eventId = String(body?.eventId ?? '');
    if (!ALLOWED.has(eventName) || !eventId) return new NextResponse(null, { status: 204 });
    const consent = request.headers.get('cookie')?.match(/dl-consent=([^;]+)/)?.[1];
    if (consent !== 'all') return new NextResponse(null, { status: 204 });

    const settings = await getSettings();
    const token = process.env.META_CAPI_ACCESS_TOKEN;
    if (!settings.meta_pixel_id || !token) return new NextResponse(null, { status: 204 });

    const ip = (request.headers.get('x-forwarded-for') ?? '').split(',')[0].trim() || null;
    const ua = request.headers.get('user-agent');

    await sendCapiEvent({
      pixelId: settings.meta_pixel_id,
      accessToken: token,
      testEventCode: settings.meta_test_event_code,
      eventName,
      eventId,
      sourceUrl: String(body?.sourceUrl ?? process.env.NEXT_PUBLIC_SITE_URL ?? 'https://directlines-technologies.vercel.app'),
      userData: {
        email: body?.userData?.email ?? null,
        phone: body?.userData?.phone ?? null,
        fullName: body?.userData?.fullName ?? null,
        city: body?.userData?.city ?? null,
        state: body?.userData?.state ?? null,
        country: body?.userData?.country ?? 'NG',
        fbp: body?.fbp ?? null,
        fbc: body?.fbc ?? null,
        clientIp: ip,
        clientUserAgent: ua,
      },
      customData: body?.customData && typeof body.customData === 'object' ? body.customData : {},
    });
  } catch {
    // Never break the page because ad tracking failed.
  }
  return new NextResponse(null, { status: 204 });
}
