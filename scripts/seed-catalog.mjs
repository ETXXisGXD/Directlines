import fs from 'node:fs';
import path from 'node:path';
import { createClient } from '@supabase/supabase-js';
import { categories, brands, products } from '../content/catalog.mjs';

const root = process.cwd();
const env = {};
for (const line of fs.readFileSync(path.join(root, '.env.local'), 'utf8').split(/\r?\n/)) {
  const match = line.match(/^([A-Z0-9_]+)=(.*)$/);
  if (match) env[match[1]] = match[2].replace(/^"|"$/g, '');
}

const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false, autoRefreshToken: false },
});

const imageManifestPath = path.join(root, 'content', 'product-images.json');
const imageManifest = fs.existsSync(imageManifestPath)
  ? JSON.parse(fs.readFileSync(imageManifestPath, 'utf8'))
  : {};

async function main() {
  for (const category of categories) {
    const { error } = await supabase.from('categories').upsert(category, { onConflict: 'slug' });
    if (error) throw error;
  }
  for (const brand of brands) {
    const { error } = await supabase.from('brands').upsert(brand, { onConflict: 'slug' });
    if (error) throw error;
  }

  const { data: categoryRows, error: categoryError } = await supabase
    .from('categories')
    .select('id, slug');
  if (categoryError) throw categoryError;
  const { data: brandRows, error: brandError } = await supabase.from('brands').select('id, slug');
  if (brandError) throw brandError;

  const categoryMap = new Map(categoryRows.map((row) => [row.slug, row.id]));
  const brandMap = new Map(brandRows.map((row) => [row.slug, row.id]));

  let count = 0;
  for (const [index, product] of products.entries()) {
    const categorySlug = product.category === 'Feature Phones' ? 'feature-phones' : 'smartphones';
    const brandSlug = product.brand.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    const tags = [
      product.brand,
      product.category,
      ...Object.values(product.specs || {}).filter((value) => typeof value === 'string'),
    ];

    const { data: saved, error } = await supabase
      .from('products')
      .upsert(
        {
          slug: product.slug,
          name: product.name,
          short_description: product.short_description,
          description: product.description,
          brand_id: brandMap.get(brandSlug) ?? null,
          category_id: categoryMap.get(categorySlug) ?? null,
          condition: 'brand_new',
          warranty: product.specs?.warranty ?? 'Manufacturer warranty support',
          price: product.price,
          badge: product.badge ?? null,
          is_active: true,
          is_featured: Boolean(product.featured),
          is_new_arrival: Boolean(product.new_arrival),
          easybuy_eligible: true,
          tags,
          specs: product.specs ?? {},
          highlights: product.highlights ?? [],
          seo_title: `${product.name} price in Abuja | Directlines`,
          seo_description: `${product.name} at Directlines Technologies, Karu, Abuja. ${product.short_description} Confirm current price and stock on WhatsApp.`,
          sort_order: index + 1,
        },
        { onConflict: 'slug' }
      )
      .select('id, slug')
      .single();
    if (error) throw error;

    for (const variant of product.variants) {
      const { error: variantError } = await supabase.from('product_variants').upsert(
        {
          product_id: saved.id,
          label: variant.label,
          color: variant.color ?? null,
          price: variant.price,
          stock: variant.stock ?? null,
          sku: variant.sku,
          is_active: true,
        },
        { onConflict: 'product_id,label' }
      );
      if (variantError) throw variantError;
    }

    const urls = imageManifest[product.slug] ?? [];
    if (urls.length) {
      await supabase.from('product_images').delete().eq('product_id', saved.id).eq('alt', 'seed');
      const rows = urls.map((url, imageIndex) => ({
        product_id: saved.id,
        url,
        alt: `${product.name} image ${imageIndex + 1}`,
        sort_order: imageIndex + 1,
      }));
      const { error: imageError } = await supabase.from('product_images').insert(rows);
      if (imageError) throw imageError;
    }

    count += 1;
    console.log(`seeded ${product.slug}`);
  }

  console.log(`\nSeeded ${count} products and ${products.reduce((sum, p) => sum + p.variants.length, 0)} variants.`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
