const publicBase = process.env.NEXT_PUBLIC_SUPABASE_URL
  ? `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public`
  : '';

export function siteMediaUrl(path: string): string {
  if (!path) return '';
  if (path.startsWith('http://') || path.startsWith('https://') || path.startsWith('/')) {
    return path;
  }
  return `${publicBase}/site-media/${path}`;
}

export function firstImage(images: Array<{ url: string; sort_order?: number }> | null | undefined): string {
  if (!images?.length) return '';
  const sorted = [...images].sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0));
  return siteMediaUrl(sorted[0].url);
}
