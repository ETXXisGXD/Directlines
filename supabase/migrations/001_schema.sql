-- 001_schema.sql
-- Directlines Technologies & Telecoms Ltd store schema.

do $$
begin
  if not exists (select 1 from pg_type where typname = 'user_role') then
    create type public.user_role as enum ('admin', 'customer');
  end if;
  if not exists (select 1 from pg_type where typname = 'order_status') then
    create type public.order_status as enum ('received', 'confirmed', 'processing', 'dispatched', 'delivered', 'cancelled');
  end if;
  if not exists (select 1 from pg_type where typname = 'payment_status') then
    create type public.payment_status as enum ('pending', 'paid', 'refunded', 'cancelled');
  end if;
  if not exists (select 1 from pg_type where typname = 'payment_method') then
    create type public.payment_method as enum ('bank_transfer', 'pay_on_delivery', 'store_pickup', 'easybuy', 'online');
  end if;
  if not exists (select 1 from pg_type where typname = 'product_condition') then
    create type public.product_condition as enum ('brand_new', 'uk_used', 'refurbished', 'open_box');
  end if;
  if not exists (select 1 from pg_type where typname = 'discount_type') then
    create type public.discount_type as enum ('percentage', 'fixed');
  end if;
  if not exists (select 1 from pg_type where typname = 'lead_status') then
    create type public.lead_status as enum ('new', 'contacted', 'approved', 'declined', 'closed');
  end if;
  if not exists (select 1 from pg_type where typname = 'repair_status') then
    create type public.repair_status as enum ('new', 'contacted', 'scheduled', 'in_progress', 'completed', 'cancelled');
  end if;
  if not exists (select 1 from pg_type where typname = 'blog_status') then
    create type public.blog_status as enum ('draft', 'published', 'scheduled');
  end if;
end
$$;

create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  email text not null unique,
  full_name text,
  phone text,
  role public.user_role not null default 'customer',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.categories (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  slug text not null unique,
  description text,
  image_url text,
  sort_order int not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists public.brands (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  slug text not null unique,
  logo_url text,
  description text,
  sort_order int not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  short_description text,
  description text,
  brand_id uuid references public.brands (id) on delete set null,
  category_id uuid references public.categories (id) on delete set null,
  condition public.product_condition not null default 'brand_new',
  warranty text,
  price numeric(12, 2) not null check (price >= 0),
  original_price numeric(12, 2) check (original_price >= 0),
  cost_price numeric(12, 2) check (cost_price >= 0),
  badge text,
  is_active boolean not null default true,
  is_featured boolean not null default false,
  is_new_arrival boolean not null default false,
  easybuy_eligible boolean not null default true,
  tags text[] not null default '{}',
  specs jsonb not null default '{}'::jsonb,
  highlights text[] not null default '{}',
  seo_title text,
  seo_description text,
  sort_order int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists products_brand_idx on public.products (brand_id);
create index if not exists products_category_idx on public.products (category_id);
create index if not exists products_active_idx on public.products (is_active);
create index if not exists products_price_idx on public.products (price);

create table if not exists public.product_images (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products (id) on delete cascade,
  url text not null,
  alt text,
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);
create index if not exists product_images_product_idx on public.product_images (product_id);

create table if not exists public.product_variants (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products (id) on delete cascade,
  label text not null,
  color text,
  price numeric(12, 2) not null check (price >= 0),
  stock int check (stock >= 0),
  sku text unique,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  unique (product_id, label)
);
create index if not exists product_variants_product_idx on public.product_variants (product_id);

create table if not exists public.wishlists (
  user_id uuid not null references public.profiles (id) on delete cascade,
  product_id uuid not null references public.products (id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, product_id)
);

create table if not exists public.coupons (
  id uuid primary key default gen_random_uuid(),
  code text not null unique check (code = upper(code)),
  discount_type public.discount_type not null,
  value numeric(12, 2) not null check (value > 0),
  min_order numeric(12, 2) not null default 0 check (min_order >= 0),
  active boolean not null default true,
  usage_count int not null default 0 check (usage_count >= 0),
  expires_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  order_number text not null unique,
  user_id uuid references public.profiles (id) on delete set null,
  customer_name text not null,
  customer_phone text not null,
  customer_email text,
  delivery_street text not null,
  delivery_city text not null,
  delivery_state text not null,
  delivery_country text not null default 'Nigeria',
  delivery_landmark text,
  subtotal numeric(12, 2) not null check (subtotal >= 0),
  discount numeric(12, 2) not null default 0 check (discount >= 0),
  coupon_code text,
  shipping_fee numeric(12, 2) not null default 0 check (shipping_fee >= 0),
  shipping_option text not null,
  total numeric(12, 2) not null check (total >= 0),
  status public.order_status not null default 'received',
  payment_status public.payment_status not null default 'pending',
  payment_method public.payment_method not null default 'bank_transfer',
  tracking_number text,
  courier text,
  admin_notes text,
  notes text,
  fbp text,
  fbc text,
  client_ip text,
  client_user_agent text,
  utm_source text,
  utm_medium text,
  utm_campaign text,
  utm_content text,
  utm_term text,
  meta_purchase_event_id text,
  meta_purchase_sent_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists orders_user_idx on public.orders (user_id);
create index if not exists orders_status_idx on public.orders (status);
create index if not exists orders_created_idx on public.orders (created_at desc);

create table if not exists public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders (id) on delete cascade,
  product_id uuid references public.products (id) on delete set null,
  variant_id uuid references public.product_variants (id) on delete set null,
  product_name text not null,
  product_slug text,
  variant_label text,
  color text,
  image_url text,
  quantity int not null check (quantity > 0),
  unit_price numeric(12, 2) not null check (unit_price >= 0),
  line_total numeric(12, 2) not null check (line_total >= 0),
  created_at timestamptz not null default now()
);
create index if not exists order_items_order_idx on public.order_items (order_id);

create table if not exists public.reviews (
  id uuid primary key default gen_random_uuid(),
  product_id uuid references public.products (id) on delete set null,
  customer_name text not null,
  location text,
  rating int not null check (rating between 1 and 5),
  title text,
  body text not null,
  is_approved boolean not null default false,
  created_at timestamptz not null default now()
);
create index if not exists reviews_product_idx on public.reviews (product_id);

create table if not exists public.testimonials (
  id uuid primary key default gen_random_uuid(),
  quote text not null,
  customer_name text not null,
  location text,
  image_url text,
  sort_order int not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists public.repair_bookings (
  id uuid primary key default gen_random_uuid(),
  customer_name text not null,
  phone text not null,
  email text,
  device_brand text,
  device_model text not null,
  issue text not null,
  preferred_contact text not null default 'whatsapp',
  notes text,
  status public.repair_status not null default 'new',
  admin_notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.easybuy_applications (
  id uuid primary key default gen_random_uuid(),
  full_name text not null,
  phone text not null,
  product_id uuid references public.products (id) on delete set null,
  target_model text not null,
  guarantor_1_phone text not null,
  guarantor_2_phone text not null,
  notes text,
  status public.lead_status not null default 'new',
  admin_notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.contact_messages (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text,
  phone text,
  subject text,
  message text not null,
  status text not null default 'new',
  created_at timestamptz not null default now()
);

create table if not exists public.blog_posts (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  excerpt text,
  content text not null,
  cover_url text,
  category text not null default 'Buying guide',
  tags text[] not null default '{}',
  author text not null default 'Directlines Team',
  kind text not null default 'blog' check (kind in ('blog', 'area')),
  area_slug text,
  seo_title text,
  seo_description text,
  faq jsonb not null default '[]'::jsonb,
  related_product_ids uuid[] not null default '{}',
  status public.blog_status not null default 'draft',
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists blog_posts_status_idx on public.blog_posts (status, published_at desc);
create index if not exists blog_posts_kind_idx on public.blog_posts (kind);

create table if not exists public.areas (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  intro text not null,
  delivery_note text not null,
  landmarks text,
  faq jsonb not null default '[]'::jsonb,
  sort_order int not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.loyalty_settings (
  id boolean primary key default true check (id),
  enabled boolean not null default false,
  points_per_1000 numeric(8, 2) not null default 1 check (points_per_1000 >= 0),
  naira_per_point numeric(8, 2) not null default 10 check (naira_per_point > 0),
  min_redeem_points int not null default 500 check (min_redeem_points >= 0),
  updated_at timestamptz not null default now()
);
insert into public.loyalty_settings (id) values (true) on conflict (id) do nothing;

create table if not exists public.loyalty_ledger (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  order_id uuid references public.orders (id) on delete set null,
  delta int not null,
  reason text not null check (reason in ('earn', 'redeem', 'refund', 'adjustment', 'welcome')),
  note text,
  created_by uuid references public.profiles (id) on delete set null,
  created_at timestamptz not null default now()
);
create index if not exists loyalty_ledger_user_idx on public.loyalty_ledger (user_id);
create unique index if not exists loyalty_ledger_order_once_idx
  on public.loyalty_ledger (order_id, reason)
  where reason in ('earn', 'redeem', 'refund') and order_id is not null;

create table if not exists public.analytics_events (
  id bigserial primary key,
  name text not null,
  path text,
  referrer text,
  visitor_hash text,
  device text,
  country text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);
create index if not exists analytics_events_created_idx on public.analytics_events (created_at desc);
create index if not exists analytics_events_name_idx on public.analytics_events (name);

create table if not exists public.meta_events (
  id bigserial primary key,
  event_name text not null,
  event_id text not null,
  status text not null,
  http_status int,
  response jsonb,
  order_id uuid references public.orders (id) on delete set null,
  value numeric(12, 2),
  created_at timestamptz not null default now()
);
create unique index if not exists meta_events_event_id_idx on public.meta_events (event_id);
create index if not exists meta_events_created_idx on public.meta_events (created_at desc);

create table if not exists public.settings (
  id boolean primary key default true check (id),
  store_name text not null default 'Directlines Technologies & Telecoms Ltd',
  legal_name text not null default 'Directlines Technologies & Telecoms Ltd',
  tagline text not null default '...Live Smart, Connect More',
  whatsapp_number text not null default '09033834939',
  display_phone text not null default '0903 383 4939',
  alt_phone text not null default '08026100185',
  easybuy_whatsapp text not null default '07038820885',
  email text not null default 'directlinestech@gmail.com',
  address_full text not null default 'Bolfash Plaza, House 12, Road K-N, Phase 1, Karu Housing Estate, Opp. De Classic Hotel, Nyanya Jikwoyi Expressway',
  address_street text not null default 'Bolfash Plaza, House 12, Road K-N, Phase 1, Karu Housing Estate',
  address_area text not null default 'Karu / Nyanya',
  address_city text not null default 'Abuja',
  address_state text not null default 'FCT',
  address_country text not null default 'Nigeria',
  hours text not null default 'Open 24 hours, 7 days a week',
  cac_note text not null default 'CAC Certified & Regulated Telecoms Vendor',
  warranty_text text not null default 'Brand-new devices carry up to 13 months official manufacturer warranty. Certified pre-owned devices include a 90-day Directlines warranty.',
  currency text not null default 'NGN',
  free_shipping_threshold numeric(12, 2) not null default 250000 check (free_shipping_threshold >= 0),
  shipping_zones jsonb not null default '[
    {"id":"karu-nyanya","name":"Karu / Nyanya same-day","price":1500,"active":true,"free_over_threshold":true,"sort_order":1},
    {"id":"abuja-central","name":"Abuja central (24-48 hours)","price":3000,"active":true,"free_over_threshold":false,"sort_order":2},
    {"id":"nationwide","name":"Nationwide courier (1-3 days)","price":6500,"active":true,"free_over_threshold":false,"sort_order":3},
    {"id":"pickup","name":"Showroom pickup, Karu","price":0,"active":true,"free_over_threshold":false,"sort_order":4}
  ]'::jsonb,
  bank_details jsonb not null default '{"bankName":"Moniepoint MFB / Zenith Bank","accountName":"Directlines Technologies & Telecoms Ltd","accountNumber":"8026100185","instructions":"Use your order number as the transfer narration and send the receipt on WhatsApp for instant verification."}'::jsonb,
  announcement jsonb not null default '{"active":true,"speedDurationSeconds":40,"items":["Directlines Technologies & Telecoms Ltd. ...Live Smart, Connect More","Open 24/7 at Bolfash Plaza, Karu Housing Estate, Abuja","Brand-new devices with manufacturer warranty. EasyBuy available.","Same-day delivery within Karu and Nyanya"]}'::jsonb,
  delivery_info jsonb not null default '{"withinKaru":"Same-day delivery and 24/7 showroom pickup at Bolfash Plaza.","abuja":"Abuja central delivery in 24 to 48 hours.","nationwide":"1 to 3 business days by courier.","sundayNote":"The showroom is open every day. Courier pickups may vary on Sundays."}'::jsonb,
  policies jsonb not null default '{"refunds":"Refunds are handled case by case where a device is defective on arrival.","returns":["7-day replacement for factory-defective brand-new units.","90-day Directlines warranty on certified pre-owned devices.","Serial or IMEI must match the invoice."],"condition":"Devices must be returned in the condition they were supplied.","lagosReturnHours":24,"outsideLagosReturnHours":72}'::jsonb,
  seo jsonb not null default '{"title":"Directlines Technologies & Telecoms Ltd | Phones in Karu, Abuja","description":"Buy Infinix, TECNO, Samsung, itel and Redmi phones in Karu, Abuja. Brand-new devices, EasyBuy financing, 24/7 showroom and nationwide delivery.","keywords":["phones in Abuja","Infinix Abuja","Tecno Abuja","Samsung Abuja","itel Abuja","Redmi Abuja","phone store Karu","EasyBuy phones Abuja"]}'::jsonb,
  socials jsonb not null default '{"twitter":"https://x.com/directlinestech","instagram":"","facebook":""}'::jsonb,
  hero_eyebrow text not null default 'Karu, Abuja. Open 24/7.',
  hero_title text not null default 'Phones that fit your life. Prices that make sense.',
  hero_subtitle text not null default 'Brand-new Infinix, TECNO, Samsung, itel and Redmi devices with warranty, EasyBuy support and same-day delivery around Karu and Nyanya.',
  hero_image_url text,
  easybuy_enabled boolean not null default true,
  easybuy_down_payment_percent int not null default 30 check (easybuy_down_payment_percent between 0 and 100),
  easybuy_tenures int[] not null default '{3,4,5,6}',
  repairs_enabled boolean not null default true,
  analytics_enabled boolean not null default true,
  consent_enabled boolean not null default true,
  meta_pixel_id text,
  meta_test_event_code text,
  meta_domain_verification text,
  meta_catalog_enabled boolean not null default true,
  updated_at timestamptz not null default now()
);
insert into public.settings (id) values (true) on conflict (id) do nothing;
