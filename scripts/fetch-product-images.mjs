import fs from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';
import { createClient } from '@supabase/supabase-js';
import { products } from '../content/catalog.mjs';

const root = process.cwd();
const env = {};
for (const line of fs.readFileSync(path.join(root, '.env.local'), 'utf8').split(/\r?\n/)) {
  const match = line.match(/^([A-Z0-9_]+)=(.*)$/);
  if (match) env[match[1]] = match[2].replace(/^"|"$/g, '');
}

const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false, autoRefreshToken: false },
});

const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0 Safari/537.36';
const outputDir = path.join(root, 'public', 'products');
fs.mkdirSync(outputDir, { recursive: true });

const productQueries = {
  'infinix-smart-20': ['Infinix Smart 20'],
  'infinix-smart-20-hd': ['Infinix Smart 20 HD'],
  'infinix-hot-70': ['Infinix Hot 70'],
  'tecno-pop-20': ['Tecno Pop 20'],
  'tecno-spark-50': ['Tecno Spark 50'],
  'samsung-galaxy-a17': ['Samsung Galaxy A17'],
  'samsung-galaxy-a07': ['Samsung Galaxy A07'],
  'itel-50c': ['Itel 50C'],
  'itel-a100c': ['Itel A100C'],
  'itel-a200-plus': ['Itel A200+', 'Itel A200 Plus'],
  'itel-city-200': ['Itel City 200'],
  'itel-power-80': ['Itel Power 80'],
  'itel-5033-double-battery': ['Itel 5033'],
  'itel-2167-type-c': ['Itel 2167'],
  'redmi-17': ['Redmi 17'],
  'redmi-15c': ['Redmi 15C'],
  'redmi-a7-pro': ['Redmi A7 Pro'],
  'redmi-a7': ['Redmi A7'],
  'tecno-t301': ['Tecno T301'],
  'tecno-t316': ['Tecno T316'],
  'tecno-t354': ['Tecno T354'],
  'tecno-t455': ['Tecno T455'],
  'tecno-s702': ['Tecno S702'],
};

const blocked = /case|cover|charger|battery|screen|glass|protector|watch|strap|pouch|cable|earbud|headphone|adapter|holder|repair|renewed|used/i;

function decode(value) {
  return value
    .replace(/&amp;/g, '&')
    .replace(/&#039;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>');
}

function normalize(value) {
  return decode(value)
    .toLowerCase()
    .replace(/[^a-z0-9+ ]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function scoreCandidate(title, query, slug) {
  const t = normalize(title);
  const q = normalize(query);
  if (blocked.test(t)) return -100;
  if (!t.includes(q)) return -50;
  let score = 10;
  if (t === q) score += 10;
  if (t.startsWith(q)) score += 4;
  if (!t.includes('plus free')) score += 2;
  if (slug === 'infinix-smart-20' && t.includes('smart 20 hd')) score -= 20;
  if (slug === 'infinix-smart-20-hd' && !t.includes('smart 20 hd')) score -= 20;
  if (slug === 'redmi-a7' && t.includes('a7 pro')) score -= 20;
  if (slug === 'redmi-a7-pro' && !t.includes('a7 pro')) score -= 20;
  if (slug === 'itel-a200-plus' && !t.includes('a200')) score -= 20;
  if (slug === 'infinix-hot-70' && t.includes('hot 60')) score -= 20;
  score -= Math.max(0, t.split(' ').length - q.split(' ').length) * 0.2;
  return score;
}

async function fetchPage(query) {
  const url = `https://www.jumia.com.ng/catalog/?q=${encodeURIComponent(query)}`;
  const response = await fetch(url, { headers: { 'user-agent': UA, accept: 'text/html' } });
  if (!response.ok) throw new Error(`Search ${response.status}`);
  return response.text();
}

function extractCandidates(html) {
  const candidates = [];
  const regex = /<a href="([^"]+)" class="core"[^>]*data-gtm-name="([^"]*)"[^>]*>[\s\S]*?<img[^>]*data-src="([^"]+)"/g;
  for (const match of html.matchAll(regex)) {
    candidates.push({ url: decode(match[3]), title: decode(match[2]), href: decode(match[1]) });
  }
  return candidates;
}

async function main() {
  const manifest = {};
  const { data: productRows, error } = await supabase.from('products').select('id, slug');
  if (error) throw error;
  const ids = new Map(productRows.map((row) => [row.slug, row.id]));

  for (const product of products) {
    const queries = productQueries[product.slug] ?? [product.name];
    let best = null;
    let bestScore = -Infinity;
    for (const query of queries) {
      try {
        const html = await fetchPage(query);
        const candidates = extractCandidates(html);
        for (const candidate of candidates) {
          const score = scoreCandidate(candidate.title, query, product.slug);
          if (score > bestScore) {
            bestScore = score;
            best = { ...candidate, query };
          }
        }
      } catch (error) {
        console.warn(`search failed ${product.slug}: ${error.message}`);
      }
    }

    if (!best || bestScore < 0) {
      console.warn(`NO IMAGE ${product.slug}`);
      continue;
    }

    try {
      const imageResponse = await fetch(best.url, { headers: { 'user-agent': UA } });
      if (!imageResponse.ok) throw new Error(`image ${imageResponse.status}`);
      const buffer = Buffer.from(await imageResponse.arrayBuffer());
      const filename = `${product.slug}.webp`;
      await sharp(buffer)
        .flatten({ background: '#ffffff' })
        .resize(1200, 1200, { fit: 'contain', background: '#ffffff' })
        .webp({ quality: 88 })
        .toFile(path.join(outputDir, filename));

      const productId = ids.get(product.slug);
      if (productId) {
        await supabase.from('product_images').delete().eq('product_id', productId);
        await supabase.from('product_images').insert({
          product_id: productId,
          url: `/products/${filename}`,
          alt: product.name,
          sort_order: 1,
        });
      }

      manifest[product.slug] = {
        source: 'Jumia Nigeria product listing',
        product_url: `https://www.jumia.com.ng${best.href}`,
        image_url: best.url,
        matched_title: best.title,
        query: best.query,
      };
      console.log(`OK ${product.slug} <- ${best.title}`);
    } catch (error) {
      console.warn(`DOWNLOAD FAILED ${product.slug}: ${error.message}`);
    }
  }

  fs.writeFileSync(path.join(root, 'content', 'product-images.json'), JSON.stringify(manifest, null, 2));
  console.log(`\nSaved ${Object.keys(manifest).length} product images.`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
