import fs from 'node:fs';
import path from 'node:path';
import { createClient } from '@supabase/supabase-js';
import { areas, blogPosts, areaPosts } from '../content/blog-seed.mjs';

const root = process.cwd();
const env = {};
for (const line of fs.readFileSync(path.join(root, '.env.local'), 'utf8').split(/\r?\n/)) {
  const match = line.match(/^([A-Z0-9_]+)=(.*)$/);
  if (match) env[match[1]] = match[2].replace(/^"|"$/g, '');
}

const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false, autoRefreshToken: false },
});

async function main() {
  const { data: products, error: productError } = await supabase.from('products').select('id, slug');
  if (productError) throw productError;
  const productMap = new Map(products.map((product) => [product.slug, product.id]));

  for (const [index, area] of areas.entries()) {
    const { error } = await supabase.from('areas').upsert(
      {
        slug: area.slug,
        name: area.name,
        intro: area.intro,
        delivery_note: area.delivery_note,
        landmarks: area.landmarks,
        faq: area.faq,
        sort_order: index + 1,
        is_active: true,
      },
      { onConflict: 'slug' }
    );
    if (error) throw error;
  }
  console.log(`seeded ${areas.length} areas`);

  const allPosts = [...blogPosts, ...areaPosts];
  if (blogPosts.length !== 30) throw new Error(`Expected 30 blog posts, got ${blogPosts.length}`);
  if (areaPosts.length !== 8) throw new Error(`Expected 8 area posts, got ${areaPosts.length}`);

  const base = new Date('2026-11-18T09:00:00.000Z').getTime();

  for (const [index, post] of allPosts.entries()) {
    const publishedAt = new Date(base - index * 24 * 60 * 60 * 1000).toISOString();
    const related = (post.related ?? [])
      .map((slug) => productMap.get(slug))
      .filter(Boolean);
    const { error } = await supabase.from('blog_posts').upsert(
      {
        slug: post.slug,
        title: post.title,
        excerpt: post.excerpt,
        content: post.content,
        cover_url: post.cover_url ?? null,
        category: post.category,
        tags: post.tags ?? [],
        author: post.author ?? 'Directlines Team',
        kind: post.kind,
        area_slug: post.area_slug ?? null,
        seo_title: post.seo_title,
        seo_description: post.seo_description,
        faq: post.faq ?? [],
        related_product_ids: related,
        status: 'published',
        published_at: publishedAt,
      },
      { onConflict: 'slug' }
    );
    if (error) throw error;
    console.log(`seeded ${post.kind}: ${post.slug}`);
  }

  console.log(`\nSeeded ${blogPosts.length} blog posts, ${areaPosts.length} area posts and ${areas.length} area pages.`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
