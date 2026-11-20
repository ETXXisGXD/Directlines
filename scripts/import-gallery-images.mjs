import fs from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';
import { chromium } from '@playwright/test';
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

const configs = {
  'infinix-smart-20': { query: 'Infinix Smart 20', match: ['smart 20'], exclude: ['hd'] },
  'infinix-smart-20-hd': { query: 'Infinix Smart 20 HD', match: ['smart 20 hd'], exclude: [] },
  'infinix-hot-70': { query: 'Infinix Hot 70', match: ['hot 70'], exclude: [] },
  'tecno-pop-20': { query: 'Tecno Pop 20', match: ['pop 20'], exclude: ['canse', 'flip', 'case', 'cover'] },
  'tecno-spark-50': { query: 'Tecno Spark 50', match: ['spark 50'], exclude: ['pro'] },
  'samsung-galaxy-a17': { query: 'Samsung Galaxy A17', match: ['galaxy a17', 'a17'], exclude: ['case', 'cover', 'protector'] },
  'samsung-galaxy-a07': { query: 'Samsung Galaxy A07', match: ['galaxy a07', 'a07'], exclude: ['case', 'cover', 'protector'] },
  'itel-50c': { query: 'Itel A50CS', match: ['a50cs', 'a50c'], exclude: ['case', 'cover', 'protector'] },
  'itel-a100c': { query: 'itel A100C 3GB 128GB phone', match: ['a100c'], exclude: ['a100cs'] },
  'itel-a200-plus': { query: 'Itel A200+', match: ['a200'], exclude: ['a200s'] },
  'itel-city-200': { query: 'Itel City 200', match: ['city 200'], exclude: ['200s'] },
  'itel-power-80': { query: 'itel power 80 phone 7000mah', match: ['power 80'], exclude: ['tank', 'power bank'] },
  'itel-5033-double-battery': { query: 'Itel 5033', match: ['5033'], exclude: [] },
  'itel-2167-type-c': { query: 'Itel 2167', match: ['2167'], exclude: [] },
  'redmi-17': { query: 'Redmi 17', match: ['redmi 17'], exclude: [] },
  'redmi-15c': { query: 'Redmi 15C', match: ['15c'], exclude: [] },
  'redmi-a7-pro': { query: 'Redmi A7 Pro', match: ['a7 pro'], exclude: [] },
  'redmi-a7': { query: 'Redmi A7', match: ['redmi a7'], exclude: ['pro'] },
  'tecno-t301': { query: 'Tecno T301', match: ['t301'], exclude: [] },
  'tecno-t316': { query: 'Tecno T316', match: ['t316'], exclude: [] },
  'tecno-t354': { query: 'Tecno T354', match: ['t354'], exclude: [] },
  'tecno-t455': { query: 'Tecno T455', match: ['t455'], exclude: [] },
  'tecno-s702': { query: 'Tecno S702', match: ['s702'], exclude: [] },
};

const blocked = /case|cover|charger|battery|screen|glass|protector|watch|strap|pouch|cable|earbud|headphone|adapter|holder|repair|renewed|used|free\b/i;
const normalize = (value) =>
  value
    .toLowerCase()
    .replace(/&amp;/g, '&')
    .replace(/[^a-z0-9+ ]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

const outputDir = path.join(root, 'public', 'products');
fs.mkdirSync(outputDir, { recursive: true });
const existingManifestPath = path.join(root, 'content', 'product-images.json');
const existingManifest = fs.existsSync(existingManifestPath)
  ? JSON.parse(fs.readFileSync(existingManifestPath, 'utf8').replace(/^\uFEFF/, ''))
  : {};
const sources = {};

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({
  userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0 Safari/537.36',
});

function score(title, config) {
  const t = normalize(title);
  if (blocked.test(t)) return -100;
  if (!config.match.some((m) => t.includes(normalize(m)))) return -100;
  if (config.exclude.some((m) => t.includes(normalize(m)))) return -100;
  let value = 20;
  if (!t.includes('plus free')) value += 4;
  if (t.includes('official')) value += 2;
  value -= Math.max(0, t.split(' ').length - 9) * 0.25;
  return value;
}

async function searchCandidates(config) {
  const url = `https://www.jumia.com.ng/catalog/?q=${encodeURIComponent(config.query)}`;
  await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 60000 });
  await page.waitForTimeout(1600);
  return page.evaluate(() => {
    return Array.from(document.querySelectorAll('article.c-prd'))
      .map((article) => {
        const link = article.querySelector('a.core');
        const image = article.querySelector('img');
        return {
          title: article.querySelector('.name')?.textContent?.trim() ?? '',
          href: link?.getAttribute('href') ?? '',
          img: image?.getAttribute('data-src') || image?.getAttribute('src') || '',
        };
      })
      .filter((item) => item.title && item.href && item.img && item.img.includes('/product/'));
  });
}

async function galleryFromPage(url, config) {
  await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 60000 });
  await page.waitForTimeout(1500);
  return page.evaluate((matchTerms) => {
    const terms = matchTerms.map((term) => term.toLowerCase());
    return Array.from(document.querySelectorAll('img'))
      .map((image) => ({
        img: image.getAttribute('data-src') || image.currentSrc || image.src,
        alt: image.alt || '',
        width: image.naturalWidth || image.width || 0,
      }))
      .filter((item) => item.img && item.img.includes('/product/') && (item.alt.toLowerCase().includes(terms[0]) || item.width >= 400))
      .map((item) => item.img);
  }, config.match);
}

function imageKey(url) {
  const match = url.match(/\/product\/([^?]+)/);
  return match ? match[1] : url;
}

async function download(url, filename) {
  const large = url.replace(/fit-in\/\d+x\d+/, 'fit-in/1000x1000');
  const response = await fetch(large, { headers: { 'user-agent': 'Mozilla/5.0' } });
  if (!response.ok) throw new Error(`image ${response.status}`);
  const buffer = Buffer.from(await response.arrayBuffer());
  await sharp(buffer)
    .flatten({ background: '#ffffff' })
    .trim({ threshold: 12 })
    .resize(1000, 1000, { fit: 'contain', background: '#ffffff' })
    .webp({ quality: 88 })
    .toFile(path.join(outputDir, filename));
}

const { data: productRows, error } = await supabase.from('products').select('id, slug');
if (error) throw error;
const ids = new Map(productRows.map((row) => [row.slug, row.id]));

const onlyIndex = process.argv.indexOf('--only');
const only = onlyIndex >= 0 ? new Set(process.argv[onlyIndex + 1].split(',')) : null;

for (const product of products) {
  if (only && !only.has(product.slug)) continue;
  const config = configs[product.slug];
  if (!config) continue;

  let candidates = [];
  for (let attempt = 0; attempt < 2; attempt += 1) {
    try {
      candidates = await searchCandidates(config);
      if (candidates.length) break;
    } catch (error) {
      console.warn(`search retry ${product.slug}: ${error.message}`);
      await page.waitForTimeout(2000);
    }
  }

  const ranked = candidates
    .map((candidate) => ({ ...candidate, score: score(candidate.title, config) }))
    .filter((candidate) => candidate.score >= 0)
    .sort((a, b) => b.score - a.score);

  const imageUrls = [];
  const seen = new Set();

  for (const candidate of ranked.slice(0, 5)) {
    if (imageUrls.length >= 4) break;
    if (candidate.img) {
      const key = imageKey(candidate.img);
      if (!seen.has(key)) {
        seen.add(key);
        imageUrls.push(candidate.img);
      }
    }
    try {
      const gallery = await galleryFromPage(`https://www.jumia.com.ng${candidate.href}`, config);
      for (const image of gallery) {
        if (imageUrls.length >= 4) break;
        const key = imageKey(image);
        if (seen.has(key)) continue;
        seen.add(key);
        imageUrls.push(image);
      }
    } catch {
      // Keep the listing thumbnail.
    }
    await page.waitForTimeout(500);
  }

  if (!imageUrls.length) {
    const fallback = existingManifest[product.slug];
    const fallbackArray = Array.isArray(fallback) ? fallback : fallback ? [fallback] : [];
    if (fallbackArray.length) {
      existingManifest[product.slug] = fallbackArray;
      console.log(`KEPT ${product.slug} (${fallbackArray.length})`);
    } else {
      console.warn(`NO IMAGES ${product.slug}`);
    }
    continue;
  }

  const saved = [];
  const sourceRows = [];
  for (const [index, imageUrl] of imageUrls.slice(0, 4).entries()) {
    const filename = `${product.slug}-${index + 1}.webp`;
    try {
      await download(imageUrl, filename);
      saved.push(`/products/${filename}`);
      sourceRows.push({ url: imageUrl, source: 'Jumia Nigeria listing image' });
    } catch (error) {
      console.warn(`download failed ${product.slug} ${index + 1}: ${error.message}`);
    }
  }

  if (!saved.length) continue;

  existingManifest[product.slug] = saved;
  sources[product.slug] = {
    sources: sourceRows,
    query: config.query,
    matched_titles: ranked.slice(0, 5).map((candidate) => candidate.title),
  };

  const productId = ids.get(product.slug);
  if (productId) {
    await supabase.from('product_images').delete().eq('product_id', productId);
    await supabase.from('product_images').insert(
      saved.map((url, index) => ({
        product_id: productId,
        url,
        alt: `${product.name} image ${index + 1}`,
        sort_order: index + 1,
      }))
    );
  }

  // Remove old single-image files that are no longer referenced.
  for (const old of fs.readdirSync(outputDir)) {
    if (old.startsWith(`${product.slug}.webp`) && !saved.includes(`/products/${old}`)) {
      fs.rmSync(path.join(outputDir, old), { force: true });
    }
  }

  console.log(`OK ${product.slug} (${saved.length} images)`);
}

fs.writeFileSync(existingManifestPath, JSON.stringify(existingManifest, null, 2));
fs.writeFileSync(path.join(root, 'content', 'product-gallery-sources.json'), JSON.stringify(sources, null, 2));

// Contact sheet for visual review.
const sheetProducts = products.filter((product) => Array.isArray(existingManifest[product.slug]) && existingManifest[product.slug].length);
const cellW = 260;
const cellH = 320;
const sheetW = cellW * 4;
const sheetH = cellH * Math.ceil(sheetProducts.length / 4);
const composites = [];
for (const [index, product] of sheetProducts.entries()) {
  const images = existingManifest[product.slug].slice(0, 4);
  for (const [imageIndex, imagePath] of images.entries()) {
    const x = (index % 4) * cellW + imageIndex * (cellW / 4);
    const y = Math.floor(index / 4) * cellH;
    try {
      composites.push({
        input: await sharp(path.join(root, 'public', imagePath)).resize(Math.round(cellW / 4) - 4, cellH - 4, { fit: 'contain', background: '#ffffff' }).toBuffer(),
        left: x + 2,
        top: y + 2,
      });
    } catch {
      // skip
    }
  }
}
if (composites.length) {
  const reportsDir = path.join(root, 'reports');
  fs.mkdirSync(reportsDir, { recursive: true });
  await sharp({ create: { width: sheetW, height: sheetH, channels: 3, background: '#f4f6f9' } })
    .composite(composites)
    .jpeg({ quality: 86 })
    .toFile(path.join(reportsDir, 'product-gallery-contact-sheet.jpg'));
}

await browser.close();
console.log(`\nSaved ${Object.keys(sources).length} product galleries.`);



