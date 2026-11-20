'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Heart } from 'lucide-react';
import { toggleWishlist } from '@/app/actions/wishlist';

export function WishlistButton({ productId, initialSaved }: { productId: string; initialSaved: boolean }) {
  const router = useRouter();
  const [saved, setSaved] = useState(initialSaved);
  const [pending, startTransition] = useTransition();

  return (
    <button
      type="button"
      disabled={pending}
      onClick={() => {
        startTransition(async () => {
          const result = await toggleWishlist(productId);
          if (result.authRequired) {
            router.push(`/login?next=/product/${window.location.pathname.split('/').pop()}`);
            return;
          }
          if (result.ok) setSaved(Boolean(result.saved));
        });
      }}
      className={`inline-flex items-center gap-1.5 rounded-lg border px-3 py-2 text-[10px] font-bold uppercase tracking-[0.12em] transition-colors ${
        saved ? 'border-signal/30 bg-signal-soft text-signal' : 'border-line bg-white text-muted hover:border-ink hover:text-ink'
      }`}
      aria-label={saved ? 'Remove from wishlist' : 'Save to wishlist'}
    >
      <Heart className={`h-3.5 w-3.5 ${saved ? 'fill-current' : ''}`} />
      {saved ? 'Saved' : 'Save'}
    </button>
  );
}
