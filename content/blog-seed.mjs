import { products } from './catalog.mjs';

const bySlug = new Map(products.map((product) => [product.slug, product]));

const naira = (value) => `₦${Number(value).toLocaleString('en-NG')}`;

function table(slugs) {
  const rows = slugs
    .map((slug) => bySlug.get(slug))
    .filter(Boolean)
    .map((product) => {
      const options = product.variants.map((variant) => `${variant.label}: ${naira(variant.price)}`).join('<br>');
      return `| ${product.name} | ${options} |`;
    });
  return ['| Model | Listed options |', '| --- | --- |', ...rows].join('\n');
}

const localBlock = `## Buying in Abuja

Directlines is at Bolfash Plaza, House 12, Road K-N, Phase 1, Karu Housing Estate, opposite De Classic Hotel, along the Nyanya Jikwoyi Expressway. The showroom is open 24 hours.

Delivery is same-day around Karu and Nyanya, 24 to 48 hours for Abuja central, and 1 to 3 business days nationwide. Showroom pickup is free. Send the model you want on WhatsApp and the store will confirm colour, storage and the current price before you pay.`;

function pricePost(config) {
  const product = bySlug.get(config.slug);
  if (!product) throw new Error(`Unknown product ${config.slug}`);
  const options = product.variants.map((variant) => `- ${variant.label}: ${naira(variant.price)}`).join('\n');
  const primary = product.variants[0];
  const related = config.related ?? [product.slug];

  return {
    slug: config.postSlug,
    title: config.title,
    excerpt: config.excerpt,
    category: 'Price guide',
    tags: [product.brand, product.category, 'Abuja', 'price'],
    cover_url: null,
    kind: 'blog',
    area_slug: null,
    related,
    seo_title: config.seoTitle ?? `${product.name} price in Abuja | Directlines`,
    seo_description: config.seoDescription ?? `Current ${product.name} prices at Directlines in Karu, Abuja. See the options, who it suits and how to confirm stock.`,
    faq: [
      {
        question: `How much is the ${product.name} in Abuja?`,
        answer: `The current Directlines listing starts at ${naira(primary.price)} for ${primary.label}. Confirm the exact option and stock on WhatsApp before paying.`,
      },
      {
        question: `Is the ${product.name} brand new?`,
        answer: 'Yes. This listing is for a brand-new sealed unit with manufacturer warranty support. Ask the store to confirm the colour and full specification before payment.',
      },
      {
        question: 'Can I use EasyBuy for this phone?',
        answer: 'EasyBuy is available on eligible phones. Submit the EasyBuy form with your full name, phone number, target model and two guarantor phone numbers. Approval is not automatic.',
      },
    ],
    content: `${config.intro}

## ${product.name} price at Directlines

The store currently lists these options:

${options}

> Prices change. Confirm the current price, colour and stock on WhatsApp before you pay.

${config.why}

## Who it suits

${config.bestFor}

## What to check before paying

- Confirm the exact storage or RAM option. Two phones with the same name can have different prices.
- Ask whether the unit is sealed and what warranty support comes with it.
- Check the colour if that matters to you. Stock can change during the day.
- If you are using EasyBuy, remember that the application needs two guarantors and is reviewed before approval.

${config.note ? `${config.note}\n\n` : ''}${localBlock}

## Quick answer

If you want the ${product.name}, start with the ${primary.label} option at ${naira(primary.price)}. Send the store a message to confirm what is physically in stock today.`,
  };
}

const pricePosts = [
  {
    postSlug: 'infinix-smart-20-price-abuja',
    slug: 'infinix-smart-20',
    title: 'Infinix Smart 20 price in Abuja: 64GB or 128GB?',
    excerpt: 'The Infinix Smart 20 is listed in two storage options at Directlines. Here is the current price difference and who each one suits.',
    intro: 'The Infinix Smart 20 is one of the more straightforward budget Android phones in the store. The main decision is storage: 64GB or 128GB.',
    why: 'The 64GB option is the lower entry point. The 128GB option costs more but gives you more room for photos, apps and offline video. If you keep a lot of WhatsApp media or games, the extra storage is usually worth it.',
    bestFor: 'Buyers who want a new Android phone for calls, WhatsApp, browsing and light social media. It is not positioned as a gaming phone, so do not expect flagship performance.',
    note: 'If you are choosing between this and the Smart 20 HD, compare the RAM and storage first. The HD model is a different listing with its own price.',
    related: ['infinix-smart-20', 'infinix-smart-20-hd', 'tecno-pop-20'],
  },
  {
    postSlug: 'infinix-smart-20-hd-price-abuja',
    slug: 'infinix-smart-20-hd',
    title: 'Infinix Smart 20 HD price in Abuja',
    excerpt: 'The Smart 20 HD comes in a 3GB / 64GB configuration. Here is the current Directlines price and what to confirm before buying.',
    intro: 'The Infinix Smart 20 HD is the 3GB RAM, 64GB storage version in this catalogue. It sits below the standard Smart 20 128GB option on price.',
    why: 'This is a budget-first choice. The 3GB RAM is fine for everyday messaging and browsing, but heavy multitasking will feel tighter than a 4GB phone. The 64GB storage is the main limitation if you keep a lot of media.',
    bestFor: 'A first smartphone, a backup phone, or a device for calls, WhatsApp and light browsing where the lowest possible price matters.',
    note: 'Ask the store to confirm the exact model name on the box. Infinix uses similar names across variants, and the label should match what you pay for.',
    related: ['infinix-smart-20-hd', 'infinix-smart-20', 'tecno-pop-20'],
  },
  {
    postSlug: 'infinix-hot-70-price-abuja',
    slug: 'infinix-hot-70',
    title: 'Infinix Hot 70 price in Abuja: 4GB / 128GB',
    excerpt: 'The Infinix Hot 70 is the higher-priced Infinix option in the current catalogue. See the listed price and compare it with the Spark 50.',
    intro: 'The Infinix Hot 70 is listed at 4GB RAM and 128GB storage. It is the most expensive Infinix model in the current Directlines catalogue.',
    why: 'Compared with the Smart 20, you are paying for more RAM and more storage. That matters if you use several apps at once or keep a lot of media. Compare it with the TECNO Spark 50, which sits close in price.',
    bestFor: 'Buyers who want a 128GB Infinix and are willing to spend above the Smart 20 range. Also a sensible step up for people who keep phones for two or three years.',
    note: 'At this price, ask about the exact charger and accessories in the box. Those details can differ between models and regions.',
    related: ['infinix-hot-70', 'tecno-spark-50', 'samsung-galaxy-a17'],
  },
  {
    postSlug: 'tecno-pop-20-price-abuja',
    slug: 'tecno-pop-20',
    title: 'TECNO Pop 20 price in Abuja: 4GB / 64GB',
    excerpt: 'The TECNO Pop 20 is a 4GB / 64GB budget phone. Here is the current price and how it compares with the Infinix Smart 20.',
    intro: 'The TECNO Pop 20 gives you 4GB RAM and 64GB storage at a budget price. It is one of the lower-priced TECNO smartphones in the store.',
    why: 'The 4GB RAM is the useful part here. It handles everyday apps better than a 2GB or 3GB phone. The 64GB storage is the trade-off, so plan to use cloud storage or a memory card if you take a lot of photos.',
    bestFor: 'TECNO buyers who want 4GB RAM without jumping to the Spark price. A practical daily phone for WhatsApp, calls, mobile banking and light social media.',
    note: 'Ask whether the unit comes with a charger and case. Bundles vary, and the store will confirm what is inside the box.',
    related: ['tecno-pop-20', 'infinix-smart-20', 'itel-a100c'],
  },
  {
    postSlug: 'tecno-spark-50-price-abuja',
    slug: 'tecno-spark-50',
    title: 'TECNO Spark 50 price in Abuja: 4GB / 128GB',
    excerpt: 'The TECNO Spark 50 is listed at 4GB / 128GB. See the current price, who it suits and how it compares with the Infinix Hot 70.',
    intro: 'The TECNO Spark 50 is the 4GB / 128GB option in the current TECNO lineup at Directlines. It sits near the top of the budget-to-mid range.',
    why: 'The 128GB storage gives you more room than the Pop 20. If you keep videos, photos and games on the phone, this is the more comfortable TECNO choice. It is also close in price to the Infinix Hot 70, so compare both before deciding.',
    bestFor: 'TECNO buyers who want more storage, and anyone who wants a phone that will not need a memory card immediately.',
    note: 'Do not assume the camera or charging specification from the name alone. Ask for the full specification of the exact unit in stock.',
    related: ['tecno-spark-50', 'infinix-hot-70', 'samsung-galaxy-a17'],
  },
  {
    postSlug: 'samsung-galaxy-a17-price-abuja',
    slug: 'samsung-galaxy-a17',
    title: 'Samsung Galaxy A17 price in Abuja: 4GB / 128GB',
    excerpt: 'The Galaxy A17 is the higher-priced Samsung option in the current catalogue. See the listed price and what to check before buying.',
    intro: 'The Samsung Galaxy A17 is listed at 4GB RAM and 128GB storage. It is the more expensive of the two Samsung models in the current catalogue.',
    why: 'The A17 price reflects the Samsung brand and the 128GB storage. If you want a Samsung with more room for apps and media, this is the option above the A07. Compare the two if your budget is tight.',
    bestFor: 'Samsung buyers who want 128GB storage and are comfortable spending above the entry A07 price.',
    note: 'Samsung model names and regional variants can look similar. Confirm the exact model number on the box and the warranty support before paying.',
    related: ['samsung-galaxy-a17', 'samsung-galaxy-a07', 'redmi-15c'],
  },
  {
    postSlug: 'samsung-galaxy-a07-price-abuja',
    slug: 'samsung-galaxy-a07',
    title: 'Samsung Galaxy A07 price in Abuja: 4GB / 64GB',
    excerpt: 'The Galaxy A07 is the entry Samsung option at Directlines. Here is the current price and who should consider it.',
    intro: 'The Samsung Galaxy A07 is the lower-priced Samsung in the current catalogue, with 4GB RAM and 64GB storage.',
    why: 'This is for buyers who want a Samsung at the lowest possible entry point. The 64GB storage is enough for messaging and everyday apps, but heavy media users should look at the A17 or a Redmi 15C.',
    bestFor: 'A first Samsung, a backup phone, or a straightforward phone for calls, WhatsApp and mobile banking.',
    note: 'Ask the store to confirm the exact colour and whether the unit is sealed. Samsung boxes are often opened for inspection, so agree on the condition before payment.',
    related: ['samsung-galaxy-a07', 'samsung-galaxy-a17', 'infinix-smart-20'],
  },
  {
    postSlug: 'itel-50c-price-abuja',
    slug: 'itel-50c',
    title: 'itel 50C price in Abuja: 2GB / 64GB',
    excerpt: 'The itel 50C is the lowest-priced smartphone in the current Directlines catalogue. See the price and its limits.',
    intro: 'The itel 50C is the cheapest smartphone listed by Directlines right now, at 2GB RAM and 64GB storage.',
    why: 'This is a price-first phone. The 2GB RAM is enough for the basics, but it will not feel comfortable with many apps open at once. If you can stretch to 3GB or 4GB, the itel A100C or Tecno Pop 20 will feel less tight.',
    bestFor: 'Calls, WhatsApp, mobile banking and light browsing on the smallest possible budget. Also useful as a backup device.',
    note: 'Be realistic about performance. A 2GB phone is not a gaming or heavy multitasking device. Ask the store what it recommends if you use many apps.',
    related: ['itel-50c', 'itel-a100c', 'tecno-pop-20'],
  },
  {
    postSlug: 'itel-a100c-price-abuja',
    slug: 'itel-a100c',
    title: 'itel A100C price in Abuja: 3GB / 128GB',
    excerpt: 'The itel A100C pairs 3GB RAM with 128GB storage. See the price and why it is a strong budget storage option.',
    intro: 'The itel A100C is listed at 3GB RAM and 128GB storage. It is one of the better storage values in the budget range.',
    why: 'The 128GB storage is the main draw. It gives you more room than the 50C without jumping to the higher-priced phones. The 3GB RAM is an improvement over 2GB, though still not a heavy multitasking setup.',
    bestFor: 'Budget buyers who keep a lot of photos, videos or WhatsApp media and do not want to manage storage every week.',
    note: 'Compare this with the itel A200+ if battery life matters. The A200+ has a larger 6000mAh battery but a different price.',
    related: ['itel-a100c', 'itel-a200-plus', 'itel-50c'],
  },
  {
    postSlug: 'itel-a200-plus-price-abuja',
    slug: 'itel-a200-plus',
    title: 'itel A200+ price in Abuja: 4GB / 128GB and 6000mAh',
    excerpt: 'The itel A200+ adds a 6000mAh battery to 4GB RAM and 128GB storage. See the current price and who it suits.',
    intro: 'The itel A200+ is the 4GB RAM, 128GB storage option with a 6000mAh battery. It sits in the middle of the budget range.',
    why: 'The bigger battery is the reason to choose this over the A100C. If you travel, work away from a charger, or deal with unstable power, the 6000mAh cell is a practical advantage. The 4GB RAM also handles everyday apps more comfortably than the 3GB models.',
    bestFor: 'People who want longer battery life and 128GB storage without paying the higher TECNO Spark or Samsung A17 price.',
    note: 'Ask the store to confirm the exact battery capacity on the box. The catalogue describes the 6000mAh version, and the model name should match.',
    related: ['itel-a200-plus', 'itel-power-80', 'itel-a100c'],
  },
  {
    postSlug: 'itel-power-80-price-abuja',
    slug: 'itel-power-80',
    title: 'itel Power 80 price in Abuja: 4GB / 128GB, 7000mAh',
    excerpt: 'The itel Power 80 has a 7000mAh battery, 4GB RAM and 128GB storage. See the price and how it compares with the A200+.',
    intro: 'The itel Power 80 is the largest battery phone in the current catalogue, with a 7000mAh cell, 4GB RAM and 128GB storage.',
    why: 'This is for people who prioritise battery life above everything else. The 7000mAh capacity is larger than the A200+ 6000mAh, and the storage is the same 128GB. Compare the two prices and decide whether the extra battery is worth the difference to you.',
    bestFor: 'Heavy days, travel, long shifts and anyone who is tired of charging a phone twice a day.',
    note: 'A larger battery usually means a heavier phone. If weight matters, ask to hold the display unit at the showroom before you decide.',
    related: ['itel-power-80', 'itel-a200-plus', 'infinix-hot-70'],
  },
  {
    postSlug: 'redmi-17-price-abuja',
    slug: 'redmi-17',
    title: 'Redmi 17 price in Abuja: 4GB / 128GB',
    excerpt: 'The Redmi 17 is the entry Redmi smartphone in the current catalogue. See the price and what to confirm before buying.',
    intro: 'The Redmi 17 is listed at 4GB RAM and 128GB storage. It is the lowest-priced Redmi in the current Directlines catalogue.',
    why: 'The 128GB storage is generous for the price. If you want a Redmi with more room than a 64GB phone, this is the entry point. Compare it with the Redmi A7 and Redmi 15C if you are deciding between Redmi models.',
    bestFor: 'Buyers who want the Redmi name and 128GB storage on a tighter budget.',
    note: 'Ask the store to confirm the exact model number. Redmi names can be confused with similar regional models, and the box should match the listing.',
    related: ['redmi-17', 'redmi-a7', 'redmi-15c'],
  },
  {
    postSlug: 'redmi-15c-price-abuja',
    slug: 'redmi-15c',
    title: 'Redmi 15C price in Abuja: 4GB / 128GB or 8GB / 256GB',
    excerpt: 'The Redmi 15C comes in two configurations at Directlines. See both prices and which one makes sense.',
    intro: 'The Redmi 15C is listed in two configurations: 4GB / 128GB and 8GB / 256GB. The price gap is significant, so choose based on how you use the phone.',
    why: 'The 4GB / 128GB option is the value pick for everyday use. The 8GB / 256GB option costs more but gives you more RAM and double the storage. If you play games, keep many apps open, or want to keep the phone for longer, the higher option is the more comfortable one.',
    bestFor: 'Redmi buyers who want a current model with a clear choice between value and more headroom.',
    note: 'Both options share the Redmi 15C name. Confirm the RAM and storage on the box and on the invoice before paying.',
    related: ['redmi-15c', 'samsung-galaxy-a17', 'infinix-hot-70'],
  },
  {
    postSlug: 'redmi-a7-price-abuja',
    slug: 'redmi-a7',
    title: 'Redmi A7 price in Abuja: 3GB / 64GB',
    excerpt: 'The Redmi A7 is a 3GB / 64GB entry phone. See the price and whether the Pro or Redmi 17 is a better fit.',
    intro: 'The Redmi A7 is the lower-priced Redmi A-series option, with 3GB RAM and 64GB storage.',
    why: 'This is a basic Redmi. The 3GB RAM is fine for messaging and browsing, but the 64GB storage will fill up if you keep a lot of media. The Redmi A7 Pro and Redmi 17 are the alternatives if you need more room.',
    bestFor: 'A low-cost Redmi for calls, WhatsApp and light apps, or a backup phone.',
    note: 'Compare the A7 with the A7 Pro carefully. The names are close, but the RAM and storage can differ, and so can the price.',
    related: ['redmi-a7', 'redmi-a7-pro', 'redmi-17'],
  },
  {
    postSlug: 'best-phones-under-100000-abuja',
    slug: 'itel-50c',
    title: 'Best phones under ₦100,000 in Abuja',
    excerpt: 'The current Directlines catalogue has a few options below ₦100,000, including feature phones and the itel 50C. Here is the honest breakdown.',
    intro: 'Below ₦100,000, the choice is mostly between a basic smartphone and a feature phone. The right pick depends on whether you need apps or just calls and long battery life.',
    why: 'The itel 50C is the cheapest smartphone listed, at ₦108,000, so it is actually just above the ₦100,000 line. Below that, the feature phones are the main options. Check the latest prices on the shop page because the list changes.',
    bestFor: 'Buyers on a strict budget, secondary phones, and anyone who mainly needs calls, SMS and long standby time.',
    note: 'Do not buy a smartphone simply because it is cheap if you need smooth apps. If your budget is close to ₦100,000, ask the store what is available today and whether stretching slightly gets you 3GB or 4GB RAM.',
    related: ['itel-50c', 'itel-2167-type-c', 'tecno-t301'],
  },
];

// Three budget list posts are generated separately below to keep exact catalogue prices.
function budgetPost({ postSlug, title, excerpt, min, max, intro, closing, related }) {
  const matches = products
    .filter((product) => product.price >= min && product.price <= max)
    .sort((a, b) => a.price - b.price)
    .slice(0, 10);
  const rows = matches
    .map((product) => {
      const options = product.variants.map((variant) => `${variant.label} ${naira(variant.price)}`).join('; ');
      return `- [${product.name}](/product/${product.slug}) - ${options}`;
    })
    .join('\n');
  return {
    slug: postSlug,
    title,
    excerpt,
    category: 'Budget guide',
    tags: ['Abuja', 'budget phones', 'price list'],
    kind: 'blog',
    area_slug: null,
    related,
    seo_title: `${title} | Directlines`,
    seo_description: excerpt,
    faq: [
      {
        question: 'Are these prices current?',
        answer: 'They are the listed prices in the Directlines catalogue when this guide was last updated. Prices and stock change, so confirm the exact model on WhatsApp.',
      },
      {
        question: 'Can I pay on delivery?',
        answer: 'Pay on delivery is available within Abuja where the store confirms it. Ask before you order so there is no misunderstanding.',
      },
    ],
    content: `${intro}

## Current options

${rows}

${closing}

${localBlock}

## A note on price

The list is sorted by the current base price. A phone with multiple storage options can start at the lower price and go higher. Always confirm the exact RAM and storage option before paying.`,
  };
}

const budgetPosts = [
  budgetPost({
    postSlug: 'best-phones-under-150000-abuja',
    title: 'Best phones under ₦150,000 in Abuja',
    excerpt: 'These are the phones in the Directlines catalogue that start below ₦150,000, with the exact listed options.',
    min: 100000,
    max: 150000,
    intro: 'At this budget, you can get a smartphone with 2GB to 4GB RAM and 64GB to 128GB storage. The main trade-offs are battery size and brand.',
    closing: 'If battery life matters most, look at the itel A200+ or Power 80 if you can stretch above this range. If you want the lowest price, the itel 50C is the entry point.',
    related: ['itel-50c', 'itel-a100c', 'itel-a200-plus', 'redmi-17'],
  }),
  budgetPost({
    postSlug: 'best-phones-under-200000-abuja',
    title: 'Best phones under ₦200,000 in Abuja',
    excerpt: 'The sub-₦200,000 range is where the choice opens up. See the current Directlines options and their exact prices.',
    min: 150000,
    max: 200000,
    intro: 'Below ₦200,000, you start seeing 4GB RAM with 128GB storage, plus larger batteries and more brand choice. This is the most competitive part of the catalogue.',
    closing: 'Compare the Infinix Smart 20, TECNO Pop 20, Samsung A07, itel A200+, itel Power 80 and Redmi 15C. The right choice depends on whether you value battery, storage or brand support.',
    related: ['infinix-smart-20', 'infinix-smart-20-hd', 'tecno-pop-20', 'samsung-galaxy-a07', 'itel-a200-plus', 'itel-power-80', 'redmi-15c'],
  }),
];

const customPosts = [
  {
    slug: 'infinix-hot-70-vs-tecno-spark-50',
    title: 'Infinix Hot 70 vs TECNO Spark 50: which should you buy in Abuja?',
    excerpt: 'Both are 4GB / 128GB phones with a similar price. Here is the honest comparison, without invented specs.',
    category: 'Comparison',
    tags: ['Infinix', 'TECNO', 'comparison', 'Abuja'],
    kind: 'blog',
    area_slug: null,
    related: ['infinix-hot-70', 'tecno-spark-50'],
    seo_title: 'Infinix Hot 70 vs TECNO Spark 50 | Directlines Abuja',
    seo_description: 'Compare the current prices and practical differences between the Infinix Hot 70 and TECNO Spark 50 at Directlines in Karu, Abuja.',
    faq: [
      { question: 'Which is cheaper, the Hot 70 or Spark 50?', answer: 'In the current catalogue, the TECNO Spark 50 is listed at ₦215,000 and the Infinix Hot 70 at ₦218,000. Confirm the current price before buying.' },
      { question: 'Do both have 128GB storage?', answer: 'Yes, both are listed at 4GB RAM and 128GB storage in this catalogue. The exact specifications should be confirmed on the box.' },
    ],
    content: `The Infinix Hot 70 and TECNO Spark 50 are close in price and both sit at 4GB RAM with 128GB storage. That makes the decision less about raw numbers and more about the details you can actually verify.

## Price

${table(['infinix-hot-70', 'tecno-spark-50'])}

The difference is small, so do not choose based on price alone. Ask what is in the box, what warranty support applies and which colour is available.

## What is actually different

The catalogue lists the same RAM and storage for both. The honest answer is that you need to compare the exact model on the box, the charger, the battery and the camera specification. Do not assume a feature because of the model name. Ask the store for the full specification of the unit in stock.

## Who should pick the Infinix Hot 70

Choose the Hot 70 if you prefer the Infinix interface or you have used Infinix before and want the same ecosystem. It is the higher-priced option in this pair, so ask what justifies the difference for the exact unit.

## Who should pick the TECNO Spark 50

Choose the Spark 50 if you want the slightly lower price or you prefer TECNO. It is also a 128GB phone, so it covers the same storage need.

## The practical recommendation

At this price, the condition of the unit and the warranty support matter more than the logo. Visit the showroom, hold both phones, check the box labels and confirm the price on WhatsApp. If one is sealed and the other is not, that should decide it.

${localBlock}`,
  },
  {
    slug: 'samsung-galaxy-a17-vs-redmi-15c',
    title: 'Samsung Galaxy A17 vs Redmi 15C: price and value in Abuja',
    excerpt: 'A 4GB / 128GB Samsung against a Redmi that also comes in 8GB / 256GB. Here is how to choose.',
    category: 'Comparison',
    tags: ['Samsung', 'Redmi', 'comparison', 'Abuja'],
    kind: 'blog',
    area_slug: null,
    related: ['samsung-galaxy-a17', 'redmi-15c'],
    seo_title: 'Samsung Galaxy A17 vs Redmi 15C | Directlines Abuja',
    seo_description: 'Compare the Samsung Galaxy A17 and Redmi 15C prices and options at Directlines in Karu, Abuja.',
    faq: [
      { question: 'Which is cheaper?', answer: 'The Redmi 15C 4GB / 128GB option is listed at ₦184,000. The Samsung Galaxy A17 4GB / 128GB is listed at ₦235,000.' },
      { question: 'Does the Redmi 15C have an 8GB option?', answer: 'Yes, the catalogue lists an 8GB / 256GB option at ₦240,000. Confirm stock before paying.' },
    ],
    content: `This comparison is really about brand preference versus storage headroom.

## Price

${table(['samsung-galaxy-a17', 'redmi-15c'])}

The Samsung starts higher. The Redmi 15C has a 4GB / 128GB option below it and an 8GB / 256GB option that lands close to the Samsung price.

## The case for the Samsung Galaxy A17

You want a Samsung, you want 128GB storage, and you are comfortable with the higher entry price. The value is in the brand, the support network and your own familiarity with Samsung.

## The case for the Redmi 15C

You want the most storage for the money. The 8GB / 256GB option gives you more RAM and double the storage compared with the 4GB / 128GB models. If you keep a lot of media or play games, that is a real advantage. The 4GB / 128GB option is the value pick if you do not need the extra headroom.

## What to confirm

Confirm the exact RAM and storage on the box. Both phones have multiple listings and similar names. Check the warranty support and what is included in the box. Then decide whether brand or storage matters more to you.

${localBlock}`,
  },
  {
    slug: 'itel-a200-plus-vs-itel-power-80',
    title: 'itel A200+ vs itel Power 80: 6000mAh or 7000mAh?',
    excerpt: 'Two big-battery itel phones with 4GB / 128GB. The difference is the battery capacity and the price.',
    category: 'Comparison',
    tags: ['itel', 'battery', 'comparison', 'Abuja'],
    kind: 'blog',
    area_slug: null,
    related: ['itel-a200-plus', 'itel-power-80'],
    seo_title: 'itel A200+ vs itel Power 80 | Directlines Abuja',
    seo_description: 'Compare the 6000mAh itel A200+ and 7000mAh itel Power 80 prices and storage at Directlines in Abuja.',
    faq: [
      { question: 'Which has the bigger battery?', answer: 'The itel Power 80 is listed with a 7000mAh battery. The itel A200+ is listed with 6000mAh.' },
      { question: 'Do both have 128GB storage?', answer: 'Yes, both are listed at 4GB RAM and 128GB storage in this catalogue.' },
    ],
    content: `If battery life is your main reason for buying, this is the comparison to read.

## Price

${table(['itel-a200-plus', 'itel-power-80'])}

## The A200+

The A200+ gives you 4GB RAM, 128GB storage and a 6000mAh battery. It is the lower-priced of the two and still a big battery by normal phone standards.

## The Power 80

The Power 80 steps the battery up to 7000mAh. If you work long shifts, travel, or deal with unreliable power, that extra capacity can be the difference between finishing the day and looking for a socket.

## Which one to buy

If the price difference is small and battery life is your priority, the Power 80 is the obvious choice. If you want to save a little and 6000mAh is enough, the A200+ is the better value. Hold both at the showroom if weight matters to you.

${localBlock}`,
  },
  {
    slug: 'easybuy-requirements-abuja',
    title: 'EasyBuy requirements at Directlines in Abuja',
    excerpt: 'The five details you need, how the application moves to WhatsApp, and what approval actually means.',
    category: 'EasyBuy',
    tags: ['EasyBuy', 'financing', 'Abuja'],
    kind: 'blog',
    area_slug: null,
    related: ['infinix-smart-20', 'tecno-spark-50', 'samsung-galaxy-a17'],
    seo_title: 'EasyBuy requirements in Abuja | Directlines',
    seo_description: 'EasyBuy at Directlines requires your full name, phone number, target phone model and two guarantor phone numbers. Here is the process.',
    faq: [
      { question: 'What details does EasyBuy need?', answer: 'Full name, phone number, target phone model, guarantor 1 phone number and guarantor 2 phone number.' },
      { question: 'Is approval automatic?', answer: 'No. The application is reviewed by the EasyBuy team. The deposit and monthly amount are confirmed after review.' },
      { question: 'How much is the deposit?', answer: 'The website illustration uses 30% down, but the final amount is set by the provider. Confirm it on WhatsApp before committing.' },
    ],
    content: `EasyBuy is an application process, not a checkout button. The website collects the five details the team needs, saves them, and opens WhatsApp so the conversation can continue.

## The five details

1. Full name
2. Phone number
3. Target phone model
4. Guarantor 1 phone number
5. Guarantor 2 phone number

That is the form. Nothing else is required on the website.

## What happens next

The application is saved and WhatsApp opens with the details. The EasyBuy team reviews the application and confirms the deposit, monthly amount and any additional information they need. Do not pay anyone outside the official process the store confirms to you.

## What approval is not

Submitting the form does not approve you. It does not reserve a phone. It does not set the final price. Those steps happen after review.

## Who should use it

EasyBuy can make sense if you need the phone now and can meet the deposit and monthly amount. It is not a way to avoid paying. Read the terms, ask questions, and only commit when the numbers are clear.

${localBlock}`,
  },
  {
    slug: 'easybuy-guarantors-guide-abuja',
    title: 'EasyBuy guarantors: what to prepare before you apply',
    excerpt: 'Two guarantor phone numbers are required. Here is what that means and how to avoid a stalled application.',
    category: 'EasyBuy',
    tags: ['EasyBuy', 'guarantors', 'Abuja'],
    kind: 'blog',
    area_slug: null,
    related: ['infinix-smart-20', 'redmi-15c', 'itel-a200-plus'],
    seo_title: 'EasyBuy guarantors guide | Directlines Abuja',
    seo_description: 'What to prepare before an EasyBuy application at Directlines, including the two guarantor phone numbers.',
    faq: [
      { question: 'How many guarantors do I need?', answer: 'Two guarantor phone numbers are required in the website form.' },
      { question: 'Do the guarantors need to be present?', answer: 'Ask the EasyBuy team. The form only collects their phone numbers, but the review may require more.' },
    ],
    content: `The EasyBuy form asks for two guarantor phone numbers. That is not a formality. It is part of how the application is reviewed.

## Before you submit

- Confirm both guarantors know you are using their number.
- Make sure the numbers are active and reachable.
- Have your own phone number and the exact phone model ready.
- Be clear about the deposit you can afford.

## What the form collects

1. Full name
2. Phone number
3. Target phone model
4. Guarantor 1 phone number
5. Guarantor 2 phone number

## What happens after

The application is saved and WhatsApp opens. The EasyBuy team reviews it and may contact you or your guarantors. Approval is not automatic, and the final deposit and monthly amount are confirmed after review.

## The mistake to avoid

Do not submit a guarantor number you have not spoken to. A stalled guarantor call can stall the application. Prepare both people before you apply.

${localBlock}`,
  },
  {
    slug: 'buy-phone-karu-nyanya-guide',
    title: 'Buying a phone in Karu or Nyanya: the practical guide',
    excerpt: 'Where the showroom is, how delivery works, what to check before you pay and how to avoid a wasted trip.',
    category: 'Local guide',
    tags: ['Karu', 'Nyanya', 'Abuja', 'buying guide'],
    kind: 'blog',
    area_slug: null,
    related: ['infinix-smart-20', 'tecno-pop-20', 'itel-a200-plus'],
    seo_title: 'Buying a phone in Karu or Nyanya | Directlines',
    seo_description: 'A practical guide to buying a phone from Directlines at Bolfash Plaza, Karu Housing Estate, near Nyanya, Abuja.',
    faq: [
      { question: 'Where exactly is the showroom?', answer: 'Bolfash Plaza, House 12, Road K-N, Phase 1, Karu Housing Estate, opposite De Classic Hotel, along the Nyanya Jikwoyi Expressway.' },
      { question: 'Is delivery same-day?', answer: 'Same-day delivery is available around Karu and Nyanya when the order is confirmed early. Confirm on WhatsApp before you rely on it.' },
    ],
    content: `Karu and Nyanya are busy, and a phone is not a small purchase. The sensible approach is to confirm the model and price before you travel.

## Before you leave

- Check the current price on the product page.
- Send the model and storage option to the store on WhatsApp.
- Ask whether the unit is physically in stock.
- Ask for the colour options.
- Confirm the total, including delivery if you are not picking up.

## At the showroom

The store is at Bolfash Plaza, House 12, Road K-N, Phase 1, Karu Housing Estate, opposite De Classic Hotel. It is open 24 hours. Ask to inspect the unit, check the box label and confirm the invoice details.

## Delivery around Karu and Nyanya

Same-day delivery is available around Karu and Nyanya. The fee depends on the zone and the order value. Showroom pickup is free. For addresses further into Abuja, the estimate is 24 to 48 hours.

## What to avoid

Do not pay into an account that was not confirmed by the store. Do not accept a different model without agreeing the new price. Do not leave without an invoice or order number.

${localBlock}`,
  },
  {
    slug: 'phone-delivery-abuja-guide',
    title: 'Phone delivery in Abuja: what to expect',
    excerpt: 'Same-day around Karu and Nyanya, 24 to 48 hours for Abuja central, and 1 to 3 days nationwide. Here is how dispatch works.',
    category: 'Local guide',
    tags: ['delivery', 'Abuja', 'Karu', 'Nyanya'],
    kind: 'blog',
    area_slug: null,
    related: ['infinix-smart-20', 'tecno-spark-50', 'redmi-15c'],
    seo_title: 'Phone delivery in Abuja | Directlines',
    seo_description: 'Directlines delivery times and fees for Karu, Nyanya, Abuja central and nationwide courier orders.',
    faq: [
      { question: 'Can I get same-day delivery in Abuja?', answer: 'Same-day delivery is available around Karu and Nyanya when the order is confirmed early. Abuja central is usually 24 to 48 hours.' },
      { question: 'Can I pick up at the showroom?', answer: 'Yes. Showroom pickup at Bolfash Plaza is free and available 24/7.' },
    ],
    content: `Delivery is simple once the stock and payment are confirmed. The timing depends on where you are.

## The zones

${table(['infinix-smart-20', 'tecno-spark-50'])}

The catalogue delivery zones are:

- Karu / Nyanya same-day
- Abuja central, 24 to 48 hours
- Nationwide courier, 1 to 3 business days
- Showroom pickup, free

## The process

1. Place the order or send it on WhatsApp.
2. The store confirms stock, colour and the final amount.
3. You pay or choose pay on delivery where supported.
4. The phone is dispatched or set aside for pickup.
5. You receive the device and invoice.

## What can delay a delivery

Stock changes, incomplete addresses and courier cut-off times. If you need the phone today, confirm with the store before you pay. Do not assume a same-day delivery until it is agreed.

${localBlock}`,
  },
  {
    slug: 'best-feature-phones-abuja',
    title: 'Best feature phones in Abuja: TECNO T301, itel 2167 or itel 5033?',
    excerpt: 'Basic phones still make sense for calls, long battery life and a second line. Here are the current options at Directlines.',
    category: 'Feature phones',
    tags: ['feature phones', 'TECNO', 'itel', 'Abuja'],
    kind: 'blog',
    area_slug: null,
    related: ['tecno-t301', 'itel-2167-type-c', 'itel-5033-double-battery'],
    seo_title: 'Best feature phones in Abuja | Directlines',
    seo_description: 'Compare the TECNO T301, itel 2167 Type-C and itel 5033 double battery at Directlines in Karu, Abuja.',
    faq: [
      { question: 'Which feature phone has a Type-C port?', answer: 'The itel 2167 is listed as the Type-C model.' },
      { question: 'Which one has a double battery?', answer: 'The itel 5033 listing is the double-battery version.' },
    ],
    content: `A feature phone is still useful: a second line, a work phone, a phone for an elderly parent, or a device that stays on for days.

## Current options

${table(['tecno-t301', 'tecno-t316', 'tecno-t354', 'tecno-t455', 'itel-2167-type-c', 'itel-5033-double-battery', 'tecno-s702'])}

## How to choose

- If charging convenience matters, the itel 2167 has a Type-C port.
- If you want the double-battery listing, choose the itel 5033.
- If you prefer TECNO, compare the T301, T316, T354 and T455 on price and confirm the exact specification.
- If you need a basic phone and the budget is higher, ask about the TECNO S702 and confirm what it includes.

## What not to expect

These are basic phones. Do not expect a modern smartphone experience, heavy apps or a high-end camera. The value is calls, SMS, long standby and simplicity.

${localBlock}`,
  },
  {
    slug: 'phone-repair-abuja-guide',
    title: 'Phone repair in Abuja: how the process should work',
    excerpt: 'Diagnose first, quote second, repair third. Here is what to ask before handing over your device.',
    category: 'Repair guide',
    tags: ['repairs', 'Abuja', 'Karu'],
    kind: 'blog',
    area_slug: null,
    related: ['samsung-galaxy-a17', 'infinix-smart-20', 'tecno-spark-50'],
    seo_title: 'Phone repair in Abuja | Directlines',
    seo_description: 'How phone repairs work at Directlines in Karu, Abuja: diagnostic, quote, repair and warranty. Book online.',
    faq: [
      { question: 'Do you repair phones bought elsewhere?', answer: 'Ask the store. The repair desk handles diagnostics for common devices, but the team will confirm what it can take on.' },
      { question: 'Do you quote before repairing?', answer: 'Yes. The fault and price should be confirmed before work starts. Do not accept a blind quote for a board-level fault.' },
    ],
    content: `A repair should be a sequence, not a guess.

## Step 1: describe the fault

Tell the repair desk what happened. Cracked screen, battery drain, charging port, water damage, or a phone that will not power on. Be specific.

## Step 2: diagnostic

The technician inspects the device. For a screen or battery, the fault may be obvious. For board-level issues, the device may need bench testing. Ask what the diagnostic will cost before leaving the phone.

## Step 3: quote and approval

You should receive a clear price for the part and labour before the repair starts. If the price changes after opening the device, the store should contact you before proceeding.

## Step 4: repair and test

After the repair, test the device before you leave. Check touch, charging, camera, speakers and the fingerprint sensor if the phone has one.

## Step 5: warranty

Ask what warranty covers the part and labour, and how long it lasts. Keep the intake note and invoice.

You can book a repair on the Directlines repairs page or send the details on WhatsApp. The showroom is open 24/7.

${localBlock}`,
  },
  {
    slug: 'brand-new-vs-uk-used-phones-abuja',
    title: 'Brand new vs UK used phones in Abuja: which should you buy?',
    excerpt: 'The honest trade-offs between a sealed phone with warranty and a used phone at a lower price.',
    category: 'Buying guide',
    tags: ['UK used', 'brand new', 'Abuja', 'buying guide'],
    kind: 'blog',
    area_slug: null,
    related: ['samsung-galaxy-a17', 'redmi-15c', 'infinix-hot-70'],
    seo_title: 'Brand new vs UK used phones in Abuja | Directlines',
    seo_description: 'Compare brand new and UK used phones in Abuja, including warranty, battery health and what to check.',
    faq: [
      { question: 'Are UK used phones still available at Directlines?', answer: 'The current website catalogue focuses on brand-new phones. Ask the store on WhatsApp if you want a certified pre-owned option.' },
      { question: 'What should I check on a used phone?', answer: 'Battery health, screen condition, water damage signs, IMEI, network lock and whether the device has been repaired before.' },
    ],
    content: `The right answer depends on your budget and your tolerance for risk.

## Brand new

You get a sealed device, manufacturer warranty support and the exact model you paid for. You pay more. This is the simplest option if the phone needs to last and you do not want surprises.

## UK used

You can get a higher-tier phone for less money. But you need to check battery health, screen condition, repairs, network lock and IMEI. A used phone is only a good deal if it is honestly graded and you know what you are buying.

## What the current catalogue focuses on

The current Directlines website catalogue lists brand-new phones. If you want a certified pre-owned option, ask the store directly. Do not assume a used unit is available because it was listed in the past.

## The practical rule

If the price difference is small, buy new. If the used phone is significantly cheaper and you can verify its condition, it can make sense. Either way, get an invoice and confirm the warranty in writing.

${localBlock}`,
  },
  {
    slug: 'how-to-check-phone-before-buying-abuja',
    title: 'How to check a phone before buying it in Abuja',
    excerpt: 'A simple checklist for the box, the device, the accessories and the paperwork.',
    category: 'Buying guide',
    tags: ['checklist', 'Abuja', 'buying guide'],
    kind: 'blog',
    area_slug: null,
    related: ['samsung-galaxy-a17', 'infinix-smart-20', 'tecno-spark-50'],
    seo_title: 'How to check a phone before buying in Abuja | Directlines',
    seo_description: 'A practical phone inspection checklist for buyers in Abuja: box, IMEI, screen, battery, charging and invoice.',
    faq: [
      { question: 'Should I open the box before paying?', answer: 'Ask the store what its inspection policy is. For a sealed new phone, you may inspect the box and confirm the model before payment, then open it with the store present.' },
      { question: 'What is the most important thing to check?', answer: 'The model, RAM and storage on the box should match what you paid for. Then check the device condition and warranty.' },
    ],
    content: `This checklist works for a new phone and a used one.

## Before payment

- Confirm the exact model name, RAM and storage.
- Check the box seal if the phone is sold as sealed.
- Ask what warranty applies and how a claim is handled.
- Confirm the total price, including delivery.
- Get the account details from the store, not from a random message.

## When the phone is in your hand

- Check the screen for cracks, lines or dead spots.
- Test touch across the whole screen.
- Check the charging port and try the charger.
- Test the camera, speaker and microphone.
- Check the fingerprint sensor or face unlock if present.
- Confirm the IMEI on the device matches the box and invoice.

## Paperwork

Keep the invoice, order number and warranty note. They matter if something goes wrong.

## A word on pressure

Do not let anyone rush you. A legitimate store will let you inspect the device and ask questions. If something feels off, walk away.

${localBlock}`,
  },
  {
    slug: 'best-phone-for-battery-life-abuja',
    title: 'Best phone for battery life in Abuja',
    excerpt: 'If you deal with unstable power or long days away from a socket, these are the current big-battery options.',
    category: 'Buying guide',
    tags: ['battery', 'Abuja', 'itel', 'Infinix'],
    kind: 'blog',
    area_slug: null,
    related: ['itel-power-80', 'itel-a200-plus', 'infinix-hot-70'],
    seo_title: 'Best phone for battery life in Abuja | Directlines',
    seo_description: 'Compare the itel Power 80 7000mAh, itel A200+ 6000mAh and other current options at Directlines in Abuja.',
    faq: [
      { question: 'Which phone has the biggest battery?', answer: 'The itel Power 80 is listed with a 7000mAh battery, the largest in the current catalogue.' },
      { question: 'Does a bigger battery always mean longer life?', answer: 'Not automatically. Screen size, processor and how you use the phone also matter. But a larger capacity usually gives you more headroom.' },
    ],
    content: `Battery life is one of the few phone features you feel every single day.

## The current options

- [itel Power 80](/product/itel-power-80) - 4GB / 128GB, 7000mAh
- [itel A200+](/product/itel-a200-plus) - 4GB / 128GB, 6000mAh
- [Infinix Hot 70](/product/infinix-hot-70) - 4GB / 128GB, confirm battery on the box

## What to ask

Ask for the exact battery capacity, the charger in the box and the charging speed. A big battery with a slow charger can still be inconvenient. Ask how long the store expects the phone to last under normal use, but treat any estimate as an estimate.

## The honest recommendation

If battery life is the priority and the price difference is acceptable, start with the itel Power 80. If you want to save a little, the A200+ is the next step down. Do not buy a phone solely on the mAh number without checking the rest of the device.

${localBlock}`,
  },
  {
    slug: 'best-phone-for-students-abuja',
    title: 'Best phones for students in Abuja on a budget',
    excerpt: 'A student phone needs storage, battery and a price that leaves room for data. Here are the practical options.',
    category: 'Buying guide',
    tags: ['students', 'Abuja', 'budget phones'],
    kind: 'blog',
    area_slug: null,
    related: ['itel-a100c', 'tecno-pop-20', 'infinix-smart-20', 'redmi-17'],
    seo_title: 'Best phones for students in Abuja | Directlines',
    seo_description: 'Budget phone options for students in Abuja, including storage, battery and EasyBuy considerations.',
    faq: [
      { question: 'What matters most for a student phone?', answer: 'Enough storage for notes and media, a battery that lasts through classes, and a price that leaves room for data.' },
      { question: 'Can a student use EasyBuy?', answer: 'EasyBuy is an application. A student can apply, but the guarantors and approval requirements still apply.' },
    ],
    content: `A student phone has to do a lot: WhatsApp groups, notes, PDFs, mobile banking, photos and maybe a little entertainment. The mistake is buying the cheapest phone and then running out of storage in a month.

## What to prioritise

1. Storage. 128GB is more comfortable than 64GB if you keep PDFs and videos.
2. Battery. A 6000mAh or 7000mAh phone can save you from charging in class.
3. RAM. 4GB is a better long-term choice than 2GB or 3GB if the budget allows.

## Current options

${table(['itel-50c', 'itel-a100c', 'itel-a200-plus', 'itel-power-80', 'tecno-pop-20', 'infinix-smart-20', 'redmi-17'])}

## The practical picks

- Lowest price: itel 50C, but be realistic about 2GB RAM.
- Best storage value: itel A100C or Redmi 17.
- Best battery: itel A200+ or Power 80.
- Balanced daily phone: Infinix Smart 20 or TECNO Pop 20.

${localBlock}`,
  },
];

// Fix the first pricePosts item that was left in the array above as a demo.
const cleanedPricePosts = pricePosts.filter((post) => post.postSlug !== 'best-phones-under-100000-abuja');

const under100k = {
  slug: 'best-phones-under-100000-abuja',
  title: 'Best phones under ₦100,000 in Abuja',
  excerpt: 'The honest options below ₦100,000 at Directlines, including feature phones and the closest smartphone.',
  category: 'Budget guide',
  tags: ['Abuja', 'budget phones', 'under 100000'],
  kind: 'blog',
  area_slug: null,
  related: ['itel-50c', 'itel-2167-type-c', 'tecno-t301'],
  seo_title: 'Best phones under ₦100,000 in Abuja | Directlines',
  seo_description: 'See the current Directlines options below ₦100,000 and the closest smartphone above that line.',
  faq: [
    { question: 'Is there a smartphone below ₦100,000?', answer: 'In the current catalogue the itel 50C starts at ₦108,000, so it sits just above the line. Below ₦100,000, the feature phones are the main options.' },
    { question: 'Are the feature phones brand new?', answer: 'Yes. The current feature phone listings are brand new. Confirm the exact model and battery on WhatsApp.' },
  ],
  content: `Below ₦100,000, the honest advice is to decide whether you need apps or just calls and long battery life.

## The current prices

${table(['itel-2167-type-c', 'itel-5033-double-battery', 'tecno-t301', 'tecno-t316', 'tecno-t354', 'tecno-t455', 'itel-50c'])}

The feature phones are the true sub-₦100,000 options. The itel 50C is the cheapest smartphone in the catalogue, but it starts slightly above ₦100,000.

## If you need apps

Do not force a feature phone to run WhatsApp and banking apps. Save a little longer for the itel 50C or a 3GB/4GB phone. The experience will be better and the phone will last longer.

## If you need calls and battery

A feature phone is the right tool. Choose the itel 2167 if Type-C charging matters. Choose the itel 5033 if you want the double-battery listing. Compare the TECNO models on price.

${localBlock}`,
};

export const blogPosts = [
  ...cleanedPricePosts.map(pricePost),
  ...budgetPosts,
  ...customPosts.slice(0, 2),
  under100k,
  ...customPosts.slice(2),
];

export const areas = [
  {
    slug: 'abuja',
    name: 'Abuja',
    intro: 'Directlines serves buyers across Abuja from its showroom in Karu Housing Estate. If you are comparing phone prices in Abuja, the store lists current options for Infinix, TECNO, Samsung, itel and Redmi in one place.',
    delivery_note: 'Abuja central delivery is usually 24 to 48 hours after confirmation. Same-day delivery is available around Karu and Nyanya when the order is confirmed early.',
    landmarks: 'Bolfash Plaza, House 12, Road K-N, Phase 1, Karu Housing Estate, opposite De Classic Hotel, along the Nyanya Jikwoyi Expressway.',
    faq: [
      { question: 'Do you deliver across Abuja?', answer: 'Yes. Abuja central is usually 24 to 48 hours. Confirm your exact address and the delivery fee on WhatsApp.' },
      { question: 'Can I visit the showroom?', answer: 'Yes. The showroom is at Bolfash Plaza in Karu Housing Estate and is open 24 hours.' },
    ],
  },
  {
    slug: 'karu',
    name: 'Karu',
    intro: 'Karu is home base. The Directlines showroom is at Bolfash Plaza, House 12, Road K-N, Phase 1, Karu Housing Estate. Buyers in Karu can inspect the phone, confirm the price and walk out with it.',
    delivery_note: 'Karu same-day delivery is available when the order is confirmed early. Showroom pickup is free and available 24/7.',
    landmarks: 'Opposite De Classic Hotel, along the Nyanya Jikwoyi Expressway.',
    faq: [
      { question: 'Can I pick up in Karu today?', answer: 'Yes, if the model is in stock. Confirm on WhatsApp first so the unit is set aside.' },
      { question: 'Is the showroom really open 24/7?', answer: 'Yes, the showroom is open 24 hours, seven days a week.' },
    ],
  },
  {
    slug: 'nyanya',
    name: 'Nyanya',
    intro: 'Nyanya is a short drive from the Karu showroom. If you are buying in Nyanya, confirm the model on WhatsApp, then choose same-day delivery or pick up at Bolfash Plaza.',
    delivery_note: 'Nyanya is inside the same-day delivery area when the order is confirmed early. Showroom pickup is free.',
    landmarks: 'Use the Nyanya Jikwoyi Expressway and turn toward Phase 1, Karu Housing Estate, opposite De Classic Hotel.',
    faq: [
      { question: 'Do you deliver to Nyanya?', answer: 'Yes, same-day delivery is available around Nyanya when the order is confirmed early.' },
      { question: 'How much is delivery to Nyanya?', answer: 'The current Karu / Nyanya zone price is shown at checkout and confirmed on WhatsApp.' },
    ],
  },
  {
    slug: 'jikwoyi',
    name: 'Jikwoyi',
    intro: 'Jikwoyi buyers can use the same Karu showroom and the Nyanya Jikwoyi Expressway route. The catalogue is online, but the confirmation happens on WhatsApp before payment.',
    delivery_note: 'Jikwoyi delivery is confirmed per address. Same-day may be possible depending on the time and courier availability.',
    landmarks: 'The showroom is along the Nyanya Jikwoyi Expressway at Bolfash Plaza, Phase 1, Karu Housing Estate.',
    faq: [
      { question: 'Can I get delivery to Jikwoyi?', answer: 'Yes. Send your address on WhatsApp and the store will confirm the fee and timing.' },
      { question: 'Can I pay on delivery?', answer: 'Pay on delivery is available where the store confirms it. Ask before you order.' },
    ],
  },
  {
    slug: 'kubwa',
    name: 'Kubwa',
    intro: 'Kubwa is further into Abuja, so delivery is usually 24 to 48 hours rather than same-day. You can still confirm stock and price on WhatsApp before making the trip.',
    delivery_note: 'Kubwa is outside the same-day Karu / Nyanya zone. Expect 24 to 48 hours after confirmation.',
    landmarks: 'The showroom is in Karu Housing Estate, not Kubwa. Use the address on the contact page for pickup.',
    faq: [
      { question: 'Do you deliver to Kubwa?', answer: 'Yes. Delivery to Kubwa is usually 24 to 48 hours after confirmation.' },
      { question: 'Can I pick up instead?', answer: 'Yes. Showroom pickup in Karu is free and open 24/7.' },
    ],
  },
  {
    slug: 'wuse',
    name: 'Wuse',
    intro: 'Wuse buyers usually choose delivery to the office or home. Confirm the model and delivery fee on WhatsApp, then the store dispatches after payment or agreed pay-on-delivery terms.',
    delivery_note: 'Wuse is in the Abuja central delivery range, usually 24 to 48 hours.',
    landmarks: 'The showroom is in Karu Housing Estate. Use the contact page for the full address and map search.',
    faq: [
      { question: 'Do you deliver to Wuse?', answer: 'Yes. Abuja central delivery, including Wuse, is usually 24 to 48 hours.' },
      { question: 'Can I pay on delivery in Wuse?', answer: 'Ask the store. Pay on delivery is available where confirmed.' },
    ],
  },
  {
    slug: 'garki',
    name: 'Garki',
    intro: 'Garki is inside the Abuja central delivery range. If you need a phone for work, confirm the model and ask the store to hold it while you arrange payment.',
    delivery_note: 'Garki delivery is usually 24 to 48 hours after confirmation.',
    landmarks: 'Pickup is at Bolfash Plaza, Phase 1, Karu Housing Estate, opposite De Classic Hotel.',
    faq: [
      { question: 'Can you deliver to Garki the same day?', answer: 'Same-day is not guaranteed for Garki. The standard estimate is 24 to 48 hours.' },
      { question: 'Can I get an invoice for my office?', answer: 'Yes. Ask the store for the invoice details you need when you confirm the order.' },
    ],
  },
  {
    slug: 'maitama',
    name: 'Maitama',
    intro: 'Maitama buyers often want a quick confirmation and a clean invoice. Send the exact model on WhatsApp, confirm the price and delivery, then the store dispatches from Karu.',
    delivery_note: 'Maitama is in the Abuja central range, usually 24 to 48 hours.',
    landmarks: 'The showroom is in Karu Housing Estate. The full address is on the contact page.',
    faq: [
      { question: 'Do you deliver to Maitama?', answer: 'Yes. Delivery is usually 24 to 48 hours after confirmation.' },
      { question: 'Can I order without visiting?', answer: 'Yes. Place the order online, send it to WhatsApp, and confirm payment and delivery details.' },
    ],
  },
];

function areaPost(area) {
  const picks = products.filter((product) => product.price >= 100000 && product.price <= 200000).slice(0, 4);
  const list = picks.map((product) => `- [${product.name}](/product/${product.slug}) - ${naira(product.price)}`).join('\n');
  return {
    slug: `phones-in-${area.slug}-buying-guide`,
    title: `Buying a phone in ${area.name}: prices, delivery and what to check`,
    excerpt: `${area.intro} Here is how delivery works and which current phones to compare.`,
    category: 'Local guide',
    tags: [area.name, 'Abuja', 'buying guide'],
    kind: 'area',
    area_slug: area.slug,
    related: picks.map((product) => product.slug),
    seo_title: `Phones in ${area.name} | Directlines`,
    seo_description: `${area.intro} ${area.delivery_note}`.slice(0, 170),
    faq: area.faq,
    content: `${area.intro}

## Delivery to ${area.name}

${area.delivery_note}

## Where to find the showroom

${area.landmarks}

## Current phones to compare

${list}

## What to confirm before paying

- The exact model, RAM and storage.
- The colour, if it matters.
- The total price and delivery fee.
- Whether the unit is sealed and what warranty applies.
- If you are using EasyBuy, the deposit and monthly amount.

${localBlock}`,
  };
}

export const areaPosts = areas.map(areaPost);

