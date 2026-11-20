'use client';

import { useEffect } from 'react';
import { trackEvent } from '@/lib/track-client';
import { trackPixel } from '@/lib/meta-client';

export function ProductViewTracker({
  slug,
  name,
  price,
  variantId,
}: {
  slug: string;
  name: string;
  price: number;
  variantId: string | null;
}) {
  useEffect(() => {
    trackEvent('product_view', { product: slug, value: price });
    trackPixel('ViewContent', {
      content_ids: variantId ? [variantId] : [slug],
      content_name: name,
      content_type: 'product',
      value: price,
      currency: 'NGN',
    });
  }, [slug, name, price, variantId]);

  return null;
}
