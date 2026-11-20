import Image from 'next/image';

export function ProductVisual({
  image,
  name,
  brand,
  className = '',
  priority = false,
  sizes = '(max-width: 768px) 50vw, 25vw',
}: {
  image: string;
  name: string;
  brand?: string | null;
  className?: string;
  priority?: boolean;
  sizes?: string;
}) {
  if (image) {
    return (
      <Image
        src={image}
        alt={name}
        fill
        sizes={sizes}
        priority={priority}
        className={`object-contain p-4 mix-blend-multiply ${className}`}
      />
    );
  }

  return (
    <div className={`absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,#ffffff,#eef2f7_60%,#e3e9f1)] ${className}`}>
      <div className="absolute inset-0 grid place-items-center">
        <div className="relative h-[62%] w-[34%] min-w-16 rounded-[1.3rem] border-[3px] border-[#142b58]/15 bg-white/70 shadow-[0_20px_40px_-24px_rgba(20,43,88,0.45)]">
          <span className="absolute left-1/2 top-2 h-1 w-6 -translate-x-1/2 rounded-full bg-[#142b58]/15" />
          <span className="absolute inset-x-3 top-6 bottom-6 rounded-[0.8rem] bg-gradient-to-br from-[#dc2626]/10 via-transparent to-[#142b58]/10" />
        </div>
      </div>
      <div className="absolute inset-x-3 bottom-3 flex items-end justify-between">
        <span className="text-[9px] font-bold uppercase tracking-[0.2em] text-[#142b58]/45">
          {brand ?? 'Directlines'}
        </span>
        <span className="text-[8px] uppercase tracking-[0.14em] text-[#142b58]/30">Ask for photo</span>
      </div>
    </div>
  );
}

