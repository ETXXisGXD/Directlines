export function Announcement({
  items,
  speedDurationSeconds = 40,
}: {
  items: string[];
  speedDurationSeconds?: number;
}) {
  if (!items.length) return null;
  const track = [...items, ...items];
  return (
    <div className="overflow-hidden border-b border-[#142846] bg-ink text-white">
      <div
        className="animate-marquee flex w-max items-center gap-10 py-2.5"
        style={{ animationDuration: `${speedDurationSeconds}s` }}
      >
        {track.map((item, index) => (
          <span
            key={`${item}-${index}`}
            className="flex items-center gap-3 whitespace-nowrap text-[10px] font-semibold uppercase tracking-[0.18em] text-white/80"
          >
            <span className="h-1 w-1 rounded-full bg-signal" />
            {item}
          </span>
        ))}
      </div>
    </div>
  );
}
