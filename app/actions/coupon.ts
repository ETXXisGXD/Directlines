'use server';

import { createAdminClient } from '@/lib/supabase/admin';

export async function previewCoupon(
  code: string,
  subtotal: number
): Promise<{ ok: boolean; discount: number; message: string }> {
  const normalized = code.trim().toUpperCase();
  if (!normalized) return { ok: false, discount: 0, message: 'Enter a coupon code.' };

  const admin = createAdminClient();
  const { data } = await admin
    .from('coupons')
    .select('code, discount_type, value, min_order, active, expires_at')
    .eq('code', normalized)
    .maybeSingle();

  if (!data || !data.active) return { ok: false, discount: 0, message: 'That coupon is not valid.' };
  if (data.expires_at && new Date(data.expires_at) < new Date()) {
    return { ok: false, discount: 0, message: 'That coupon has expired.' };
  }
  if (Number(subtotal) < Number(data.min_order)) {
    return { ok: false, discount: 0, message: `This coupon needs a minimum order of ₦${Number(data.min_order).toLocaleString('en-NG')}.` };
  }

  const discount =
    data.discount_type === 'percentage'
      ? Math.round((Number(subtotal) * Number(data.value)) / 100)
      : Number(data.value);

  return { ok: true, discount: Math.min(discount, Number(subtotal)), message: 'Coupon applied.' };
}
