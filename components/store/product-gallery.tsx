'use client';

import Image from 'next/image';
import { useState } from 'react';

export function ProductGallery({
  images,
  name,
  brand,
}: {
  images: Array<{ url: string; alt: string | null }>;
  name: string;
  brand?: string | null;
}) {
  const [active, setActive] = useState(0);

  return (
    <div>
      <div className="relative aspect-square overflow-hidden rounded-3xl border border-line bg-white">
        {images.length ? (
          <Image
            src={images[active]?.url ?? images[0].url}
            alt={images[active]?.alt ?? name}
            fill
            priority
            sizes="(max-width: 1024px) 100vw, 50vw"
            className="object-contain p-8 mix-blend-multiply"
          />
        ) : (
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,#ffffff,#eef2f7_60%,#e3e9f1)]">
            <div className="absolute inset-0 grid place-items-center">
              <div className="relative h-[54%] w-[30%] min-w-24 rounded-[2rem] border-[4px] border-[#142b58]/15 bg-white/70 shadow-[0_30px_60px_-30px_rgba(20,43,88,0.4)]">
                <span className="absolute left-1/2 top-3 h-1.5 w-10 -translate-x-1/2 rounded-full bg-[#142b58]/15" />
                <span className="absolute inset-x-4 top-8 bottom-8 rounded-[1.2rem] bg-gradient-to-br from-[#dc2626]/10 via-transparent to-[#142b58]/10" />
              </div>
            </div>
            <div className="absolute inset-x-6 bottom-6 flex items-end justify-between">
              <span className="text-[10px] font-bold uppercase tracking-[0.22em] text-[#142b58]/40">{brand ?? 'Directlines'}</span>
              <span className="text-[9px] uppercase tracking-[0.16em] text-[#142b58]/30">Photo on request</span>
            </div>
          </div>
        )}
      </div>

      {images.length > 1 ? (
        <div className="mt-3 flex gap-2 overflow-x-auto hide-scrollbar">
          {images.map((image, index) => (
            <button
              key={`${image.url}-${index}`}
              type="button"
              onClick={() => setActive(index)}
              className={`relative h-20 w-20 shrink-0 overflow-hidden rounded-xl border bg-white ${
                active === index ? 'border-ink' : 'border-line hover:border-line-strong'
              }`}
              aria-label={`View image ${index + 1}`}
            >
              <Image src={image.url} alt={image.alt ?? name} fill sizes="80px" className="object-contain p-1.5" />
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}

