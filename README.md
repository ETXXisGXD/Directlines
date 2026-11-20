# Directlines Technologies & Telecoms Ltd

Production Next.js storefront and admin for Directlines, Karu, Abuja.

- Live: https://directlines-technologies.vercel.app
- Admin: https://directlines-technologies.vercel.app/admin
- Owner: directlinestech@gmail.com
- Shop staff: directlinestech+faith@gmail.com
- Vercel team: `biz-hakin-websites`
- Supabase project: `jmlbugxtqqolgmayghle` (`https://jmlbugxtqqolgmayghle.supabase.co`)

## What is included

- 23 products, 25 exact SKUs from the supplied catalogue, grouped by storage/RAM variants.
- 30 blog posts, 8 Abuja area pages and 8 area blog posts.
- Storefront: home, shop, product, cart, checkout, order tracking, accounts, wishlist, EasyBuy, repairs, blog, areas, delivery, policies, privacy, terms.
- Admin: dashboard, products, categories, orders, customers, EasyBuy, repairs, blog, reviews/testimonials, coupons, loyalty, analytics, Meta, settings.
- Staff role: Faith can manage products, categories, orders, customers, EasyBuy, repairs, blog and reviews. Settings, Meta, coupons, loyalty and analytics are owner-only.
- Compare: product cards, product pages and /compare side-by-side table, max four phones.
- Checkout: bank transfer, pay on delivery and showroom pickup. Flutterwave can be added later through the payment-method and order fields.
- EasyBuy: application form with full name, phone number, target model and two guarantor phone numbers. It saves the application then opens WhatsApp to `07038820885`.
- First-party analytics: pageviews, product views, cart adds, checkouts, orders, referrals, UTM and conversion.
- Meta: browser Pixel, Conversions API route, catalog CSV feed, consent banner and admin Meta page. Add the Pixel ID in admin and the CAPI token in Vercel when the business owner provides them.
- SEO/GEO: sitemap, robots, AI crawler allowances, `llms.txt`, `ai.txt`, JSON-LD, canonical URLs, local area pages and FAQ blocks.

## Local setup

```bash
npm install
npm run dev
npm run lint
npm run build
```

Environment: see `.env.example`. The real local values are in `.env.local` and are not committed.

## Database

Migrations are in `supabase/migrations`.

- `001_schema.sql` tables, settings, content, analytics and meta log.
- `002_functions.sql` admin helper, order numbering and server-priced `place_order`.
- `003_rls.sql` RLS and grants.
- `004_storage.sql` public `site-media` bucket.

Seed scripts:

```bash
node scripts/seed-catalog.mjs
node scripts/seed-blog.mjs
```

`scripts/fetch-product-images.mjs` and `scripts/import-jumia-images.mjs` were used to source product images. Replace any image in Admin > Products with a real store photo.

## Admin

The temporary admin credentials are in `ADMIN-CREDENTIALS.local.txt` (gitignored). Change the password after first login.

Admin tasks:

- Products: edit price, stock, images, variants and SEO.
- Orders: confirm payment, update status, add courier/tracking, resend the Meta purchase event.
- EasyBuy: review applications and update status.
- Repairs: review bookings and update status.
- Blog: write Markdown guides, add FAQs, related products, cover image and SEO.
- Meta: Pixel ID, test code, domain verification, catalog feed URL, event log and test event.
- Settings: contact details, hero, EasyBuy terms, delivery zones, bank details, announcement, policies, loyalty, socials and SEO.

## Meta setup

1. Add the Pixel ID in Admin > Meta.
2. Add `META_CAPI_ACCESS_TOKEN` in Vercel Production and Preview.
3. Add the domain verification string from Meta Business Settings.
4. Add the catalog feed URL in Meta Commerce Manager. The feed only includes products that have an image.
5. Use the test event code and send a test Lead from Admin > Meta.
6. Mark a test order paid to verify the Purchase event.

## Deployment

Production deploys to Vercel project `directlines-technologies` under `biz-hakin-websites`. Set `NEXT_PUBLIC_SITE_URL` to the final domain before adding a custom domain.

## Notes

- Official product images were sourced from Jumia Nigeria listings and optimised locally. Some models did not have a reliable listing image, so the storefront uses a clean brand fallback. Upload real photos in admin when available.
- Prices and stock should be confirmed on WhatsApp before payment. The site intentionally avoids fake reviews and fake discounts.
- Resend emails are skipped until `RESEND_API_KEY` is set and a verified sender is available.

