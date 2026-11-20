'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';

export async function toggleWishlist(productId: string): Promise<{ ok: boolean; saved?: boolean; authRequired?: boolean }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, authRequired: true };

  const { data: existing } = await supabase
    .from('wishlists')
    .select('product_id')
    .eq('user_id', user.id)
    .eq('product_id', productId)
    .maybeSingle();

  if (existing) {
    await supabase.from('wishlists').delete().eq('user_id', user.id).eq('product_id', productId);
    revalidatePath('/wishlist');
    return { ok: true, saved: false };
  }

  await supabase.from('wishlists').insert({ user_id: user.id, product_id: productId });
  revalidatePath('/wishlist');
  return { ok: true, saved: true };
}
