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

const pages = {
  infinix: 'C:/Users/FONMA USORO/.local/share/opencode/tool-output/tool_1f85731b50018DFohk5ESvrf66',
  tecno: 'C:/Users/FONMA USORO/.local/share/opencode/tool-output/tool_1f892b0b5001hRQAu4xRpHZUUz',
  samsung: 'C:/Users/FONMA USORO/.local/share/opencode/tool-output/tool_1f891ecb5001OC22KZR9RoFHyz',
  itel: 'C:/Users/FONMA USORO/.local/share/opencode/tool-output/tool_1f891ed79001A4ftyOKG8GdS3X',
  redmi: 'C:/Users/FONMA USORO/.local/share/opencode/tool-output/tool_1f891ed73001hCfBSB24JmPpP2',
};

const queries = {
  'infinix-smart-20': { brand: 'infinix', match: ['smart 20'], exclude: ['hd'] },
  'infinix-smart-20-hd': { brand: 'infinix', match: ['smart 20 hd'], exclude: [] },
  'infinix-hot-70': { brand: 'infinix', match: ['hot 70'], exclude: [] },
  'tecno-pop-20': { brand: 'tecno', match: ['pop 20'], exclude: [] },
  'tecno-spark-50': { brand: 'tecno', match: ['spark 50'], exclude: ['pro'] },
  'samsung-galaxy-a17': { brand: 'samsung', match: ['galaxy a17', 'a17'], exclude: [] },
  'samsung-galaxy-a07': { brand: 'samsung', match: ['galaxy a07', 'a07'], exclude: [] },
  'itel-50c': { brand: 'itel', match: ['50c'], exclude: [] },
  'itel-a100c': { brand: 'itel', match: ['a100c'], exclude: [] },
  'itel-a200-plus': { brand: 'itel', match: ['a200'], exclude: ['a200s'] },
  'itel-city-200': { brand: 'itel', match: ['city 200'], exclude: ['200s'] },
  'itel-power-80': { brand: 'itel', match: ['power 80'], exclude: [] },
  'itel-5033-double-battery': { brand: 'itel', match: ['5033'], exclude: [] },
  'itel-2167-type-c': { brand: 'itel', match: ['2167'], exclude: [] },
  'redmi-17': { brand: 'redmi', match: ['redmi 17'], exclude: [] },
  'redmi-15c': { brand: 'redmi', match: ['15c'], exclude: [] },
  'redmi-a7-pro': { brand: 'redmi', match: ['a7 pro'], exclude: [] },
  'redmi-a7': { brand: 'redmi', match: ['redmi a7'], exclude: ['pro'] },
  'tecno-t301': { brand: 'tecno', match: ['t301'], exclude: [] },
  'tecno-t316': { brand: 'tecno', match: ['t316'], exclude: [] },
  'tecno-t354': { brand: 'tecno', match: ['t354'], exclude: [] },
  'tecno-t455': { brand: 'tecno', match: ['t455'], exclude: [] },
  'tecno-s702': { brand: 'tecno', match: ['s702'], exclude: [] },
};

const blocked = /case|cover|charger|battery|screen|glass|protector|watch|strap|pouch|cable|earbud|headphone|adapter|holder|repair|renewed|used|free\b/i;
const decode = (v) => v.replace(/&amp;/g, '&').replace(/&#039;/g, "'").replace(/&quot;/g, '"');
const normalize = (v) => decode(v).toLowerCase().replace(/[^a-z0-9+ ]+/g, ' ').replace(/\s+/g, ' ').trim();

const cache = new Map();
function candidates(brand) {
  if (cache.has(brand)) return cache.get(brand);
  const html = fs.readFileSync(pages[brand], 'utf8');
  const regex = /<a href="([^"]+)" class="core"[^>]*data-gtm-name="([^"]*)"[^>]*>[\s\S]*?<img[^>]*data-src="([^"]+)"/g;
  const rows = [];
  for (const match of html.matchAll(regex)) {
    rows.push({ href: decode(match[1]), title: decode(match[2]), image: decode(match[3]) });
  }
  cache.set(brand, rows);
  return rows;
}

function score(candidate, config) {
  const title = normalize(candidate.title);
  if (blocked.test(title)) return -100;
  if (!config.match.some((m) => title.includes(normalize(m)))) return -100;
  if (config.exclude.some((m) => title.includes(normalize(m)))) return -100;
  let value = 20;
  if (title.includes(config.brand)) value += 4;
  if (title.startsWith(config.brand)) value += 2;
  if (!title.includes('plus free')) value += 2;
  value -= Math.max(0, title.split(' ').length - 8) * 0.3;
  return value;
}

const outputDir = path.join(root, 'public', 'products');
fs.mkdirSync(outputDir, { recursive: true });
const manifestPath = path.join(root, 'content', 'product-images.json');
const manifest = fs.existsSync(manifestPath) ? JSON.parse(fs.readFileSync(manifestPath, 'utf8')) : {};
const { data: productRows, error } = await supabase.from('products').select('id, slug');
if (error) throw error;
const ids = new Map(productRows.map((row) => [row.slug, row.id]));

for (const product of products) {
  const config = queries[product.slug];
  if (!config) continue;
  const rows = candidates(config.brand);
  if (!rows.length) {
    console.warn(`no candidates for ${product.slug} (${config.brand})`);
    continue;
  }
  const ranked = rows
    .map((row) => ({ ...row, score: score(row, config) }))
    .sort((a, b) => b.score - a.score);
  const best = ranked[0];
  if (!best || best.score < 0) {
    console.warn(`no match for ${product.slug}`);
    continue;
  }

  try {
    const response = await fetch(best.image, { headers: { 'user-agent': 'Mozilla/5.0' } });
    if (!response.ok) throw new Error(`image ${response.status}`);
    const buffer = Buffer.from(await response.arrayBuffer());
    const filename = `${product.slug}.webp`;
    await sharp(buffer)
      .flatten({ background: '#ffffff' })
      .resize(1000, 1000, { fit: 'contain', background: '#ffffff' })
      .webp({ quality: 86 })
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
      source: 'Jumia Nigeria listing',
      product_url: `https://www.jumia.com.ng${best.href}`,
      image_url: best.image,
      matched_title: best.title,
    };
    console.log(`OK ${product.slug} <- ${best.title}`);
  } catch (error) {
    console.warn(`FAILED ${product.slug}: ${error.message}`);
  }
}

fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2));
console.log(`\nSaved ${Object.keys(manifest).length} product images.`);
