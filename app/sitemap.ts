import type { MetadataRoute } from 'next';
import { getAreas, getBlogSitemapEntries, getProductSitemapEntries } from '@/lib/queries';

export const revalidate = 3600;

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://directlines-technologies.vercel.app';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [products, posts, areas] = await Promise.all([
    getProductSitemapEntries().catch(() => []),
    getBlogSitemapEntries().catch(() => []),
    getAreas().catch(() => []),
  ]);

  const staticPages: MetadataRoute.Sitemap = [
    { url: BASE_URL, changeFrequency: 'daily', priority: 1 },
    { url: `${BASE_URL}/shop`, changeFrequency: 'daily', priority: 0.95 },
    { url: `${BASE_URL}/easybuy`, changeFrequency: 'weekly', priority: 0.8 },
    { url: `${BASE_URL}/accessories`, changeFrequency: 'weekly', priority: 0.7 },
    { url: `${BASE_URL}/repairs`, changeFrequency: 'monthly', priority: 0.7 },
    { url: `${BASE_URL}/blog`, changeFrequency: 'daily', priority: 0.8 },
    { url: `${BASE_URL}/delivery`, changeFrequency: 'monthly', priority: 0.6 },
    { url: `${BASE_URL}/about`, changeFrequency: 'monthly', priority: 0.5 },
    { url: `${BASE_URL}/contact`, changeFrequency: 'monthly', priority: 0.6 },
    { url: `${BASE_URL}/policies`, changeFrequency: 'monthly', priority: 0.4 },
    { url: `${BASE_URL}/privacy`, changeFrequency: 'yearly', priority: 0.3 },
    { url: `${BASE_URL}/terms`, changeFrequency: 'yearly', priority: 0.3 },
  ];

  return [
    ...staticPages,
    ...products.map((product) => ({
      url: `${BASE_URL}/product/${product.slug}`,
      lastModified: product.updated_at ? new Date(product.updated_at) : undefined,
      changeFrequency: 'weekly' as const,
      priority: 0.85,
    })),
    ...posts.map((post) => ({
      url: `${BASE_URL}/blog/${post.slug}`,
      lastModified: post.updated_at ? new Date(post.updated_at) : undefined,
      changeFrequency: 'monthly' as const,
      priority: 0.7,
    })),
    ...areas.map((area) => ({
      url: `${BASE_URL}/areas/${area.slug}`,
      changeFrequency: 'monthly' as const,
      priority: 0.65,
    })),
  ];
}

