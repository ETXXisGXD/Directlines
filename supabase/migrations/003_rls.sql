-- 003_rls.sql
-- Row Level Security and Data API grants.

alter table public.profiles enable row level security;
alter table public.categories enable row level security;
alter table public.brands enable row level security;
alter table public.products enable row level security;
alter table public.product_images enable row level security;
alter table public.product_variants enable row level security;
alter table public.wishlists enable row level security;
alter table public.coupons enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;
alter table public.reviews enable row level security;
alter table public.testimonials enable row level security;
alter table public.repair_bookings enable row level security;
alter table public.easybuy_applications enable row level security;
alter table public.contact_messages enable row level security;
alter table public.blog_posts enable row level security;
alter table public.areas enable row level security;
alter table public.loyalty_settings enable row level security;
alter table public.loyalty_ledger enable row level security;
alter table public.analytics_events enable row level security;
alter table public.meta_events enable row level security;
alter table public.settings enable row level security;

-- profiles
drop policy if exists "profiles_select_own_or_admin" on public.profiles;
create policy "profiles_select_own_or_admin" on public.profiles
  for select using (auth.uid() = id or public.is_admin());
drop policy if exists "profiles_update_own" on public.profiles;
create policy "profiles_update_own" on public.profiles
  for update using (auth.uid() = id) with check (auth.uid() = id);
drop policy if exists "profiles_admin_all" on public.profiles;
create policy "profiles_admin_all" on public.profiles
  for all using (public.is_admin()) with check (public.is_admin());

-- catalogue reads
drop policy if exists "categories_public_read" on public.categories;
create policy "categories_public_read" on public.categories
  for select using (is_active or public.is_admin());
drop policy if exists "categories_admin_all" on public.categories;
create policy "categories_admin_all" on public.categories
  for all using (public.is_admin()) with check (public.is_admin());

drop policy if exists "brands_public_read" on public.brands;
create policy "brands_public_read" on public.brands
  for select using (is_active or public.is_admin());
drop policy if exists "brands_admin_all" on public.brands;
create policy "brands_admin_all" on public.brands
  for all using (public.is_admin()) with check (public.is_admin());

drop policy if exists "products_public_read" on public.products;
create policy "products_public_read" on public.products
  for select using (is_active or public.is_admin());
drop policy if exists "products_admin_all" on public.products;
create policy "products_admin_all" on public.products
  for all using (public.is_admin()) with check (public.is_admin());

drop policy if exists "product_images_public_read" on public.product_images;
create policy "product_images_public_read" on public.product_images
  for select using (
    public.is_admin() or exists (
      select 1 from public.products p where p.id = product_id and p.is_active
    )
  );
drop policy if exists "product_images_admin_all" on public.product_images;
create policy "product_images_admin_all" on public.product_images
  for all using (public.is_admin()) with check (public.is_admin());

drop policy if exists "product_variants_public_read" on public.product_variants;
create policy "product_variants_public_read" on public.product_variants
  for select using (
    public.is_admin() or (
      is_active and exists (
        select 1 from public.products p where p.id = product_id and p.is_active
      )
    )
  );
drop policy if exists "product_variants_admin_all" on public.product_variants;
create policy "product_variants_admin_all" on public.product_variants
  for all using (public.is_admin()) with check (public.is_admin());

drop policy if exists "reviews_public_read" on public.reviews;
create policy "reviews_public_read" on public.reviews
  for select using (is_approved or public.is_admin());
drop policy if exists "reviews_admin_all" on public.reviews;
create policy "reviews_admin_all" on public.reviews
  for all using (public.is_admin()) with check (public.is_admin());

drop policy if exists "testimonials_public_read" on public.testimonials;
create policy "testimonials_public_read" on public.testimonials
  for select using (is_active or public.is_admin());
drop policy if exists "testimonials_admin_all" on public.testimonials;
create policy "testimonials_admin_all" on public.testimonials
  for all using (public.is_admin()) with check (public.is_admin());

-- customers
drop policy if exists "wishlists_own_all" on public.wishlists;
create policy "wishlists_own_all" on public.wishlists
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
drop policy if exists "wishlists_admin_all" on public.wishlists;
create policy "wishlists_admin_all" on public.wishlists
  for all using (public.is_admin()) with check (public.is_admin());

drop policy if exists "orders_select_own_or_admin" on public.orders;
create policy "orders_select_own_or_admin" on public.orders
  for select using (auth.uid() = user_id or public.is_admin());
drop policy if exists "orders_admin_update" on public.orders;
create policy "orders_admin_update" on public.orders
  for update using (public.is_admin()) with check (public.is_admin());
drop policy if exists "orders_admin_delete" on public.orders;
create policy "orders_admin_delete" on public.orders
  for delete using (public.is_admin());

drop policy if exists "order_items_select_own_or_admin" on public.order_items;
create policy "order_items_select_own_or_admin" on public.order_items
  for select using (
    public.is_admin() or exists (
      select 1 from public.orders o where o.id = order_id and o.user_id = auth.uid()
    )
  );
drop policy if exists "order_items_admin_all" on public.order_items;
create policy "order_items_admin_all" on public.order_items
  for all using (public.is_admin()) with check (public.is_admin());

drop policy if exists "loyalty_settings_public_read" on public.loyalty_settings;
create policy "loyalty_settings_public_read" on public.loyalty_settings
  for select using (true);
drop policy if exists "loyalty_settings_admin_all" on public.loyalty_settings;
create policy "loyalty_settings_admin_all" on public.loyalty_settings
  for all using (public.is_admin()) with check (public.is_admin());

drop policy if exists "loyalty_ledger_select_own_or_admin" on public.loyalty_ledger;
create policy "loyalty_ledger_select_own_or_admin" on public.loyalty_ledger
  for select using (auth.uid() = user_id or public.is_admin());
drop policy if exists "loyalty_ledger_admin_all" on public.loyalty_ledger;
create policy "loyalty_ledger_admin_all" on public.loyalty_ledger
  for all using (public.is_admin()) with check (public.is_admin());

-- admin-only operational tables
drop policy if exists "coupons_admin_all" on public.coupons;
create policy "coupons_admin_all" on public.coupons
  for all using (public.is_admin()) with check (public.is_admin());

drop policy if exists "repairs_admin_all" on public.repair_bookings;
create policy "repairs_admin_all" on public.repair_bookings
  for all using (public.is_admin()) with check (public.is_admin());

drop policy if exists "easybuy_admin_all" on public.easybuy_applications;
create policy "easybuy_admin_all" on public.easybuy_applications
  for all using (public.is_admin()) with check (public.is_admin());

drop policy if exists "contact_admin_all" on public.contact_messages;
create policy "contact_admin_all" on public.contact_messages
  for all using (public.is_admin()) with check (public.is_admin());

drop policy if exists "analytics_admin_all" on public.analytics_events;
create policy "analytics_admin_all" on public.analytics_events
  for all using (public.is_admin()) with check (public.is_admin());

drop policy if exists "meta_admin_all" on public.meta_events;
create policy "meta_admin_all" on public.meta_events
  for all using (public.is_admin()) with check (public.is_admin());

-- content
drop policy if exists "blog_public_read" on public.blog_posts;
create policy "blog_public_read" on public.blog_posts
  for select using (
    public.is_admin() or (
      status = 'published' and (published_at is null or published_at <= now())
    )
  );
drop policy if exists "blog_admin_all" on public.blog_posts;
create policy "blog_admin_all" on public.blog_posts
  for all using (public.is_admin()) with check (public.is_admin());

drop policy if exists "areas_public_read" on public.areas;
create policy "areas_public_read" on public.areas
  for select using (is_active or public.is_admin());
drop policy if exists "areas_admin_all" on public.areas;
create policy "areas_admin_all" on public.areas
  for all using (public.is_admin()) with check (public.is_admin());

-- settings: public reads needed for storefront contact, delivery and pixel id.
drop policy if exists "settings_public_read" on public.settings;
create policy "settings_public_read" on public.settings
  for select using (true);
drop policy if exists "settings_admin_all" on public.settings;
create policy "settings_admin_all" on public.settings
  for all using (public.is_admin()) with check (public.is_admin());

-- Data API grants
grant usage on schema public to anon, authenticated;
grant select on public.categories, public.brands, public.products, public.product_images,
  public.product_variants, public.reviews, public.testimonials, public.blog_posts,
  public.areas, public.settings, public.loyalty_settings to anon, authenticated;
grant select, insert, update, delete on public.profiles, public.wishlists, public.loyalty_ledger to authenticated;
grant select on public.orders, public.order_items to authenticated;
grant select on public.loyalty_ledger to authenticated;
grant insert on public.analytics_events to anon, authenticated;
grant usage, select on sequence public.analytics_events_id_seq to anon, authenticated;

grant execute on function public.is_admin() to anon, authenticated;
grant execute on function public.place_order(jsonb) to anon, authenticated;
grant execute on function public.loyalty_balance(uuid) to authenticated;
