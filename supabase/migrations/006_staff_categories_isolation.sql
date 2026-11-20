-- 005_staff_categories_isolation.sql
-- Staff role, category groups, and Dee/Directlines auth isolation.

alter type public.user_role add value if not exists 'staff';

alter table public.categories add column if not exists group_name text not null default 'Phones';
create index if not exists categories_group_idx on public.categories (group_name);

create or replace function public.is_staff()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.profiles p
    where p.id = auth.uid() and p.role in ('admin', 'staff')
  );
$$;

-- Never create a Directlines customer profile for a Dee app user.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if coalesce(new.raw_user_meta_data ->> 'app', new.raw_app_meta_data ->> 'app', '') = 'dee' then
    return new;
  end if;
  if exists (select 1 from public.dee_admin_users d where d.user_id = new.id) then
    return new;
  end if;
  insert into public.profiles (id, email, full_name, phone)
  values (
    new.id,
    coalesce(new.email, ''),
    coalesce(new.raw_user_meta_data ->> 'full_name', ''),
    coalesce(new.raw_user_meta_data ->> 'phone', '')
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

-- Remove the Dee admin from Directlines customers if it already exists.
delete from public.profiles
where email = 'deemp4media@gmail.com'
  and exists (
    select 1 from public.dee_admin_users d where d.user_id = public.profiles.id
  );

-- Profiles: staff can read customer contact details, only admins change roles.
drop policy if exists "profiles_select_own_or_admin" on public.profiles;
create policy "profiles_select_own_or_staff" on public.profiles
  for select using (auth.uid() = id or public.is_staff());
drop policy if exists "profiles_update_own" on public.profiles;
create policy "profiles_update_own" on public.profiles
  for update using (auth.uid() = id) with check (auth.uid() = id);
drop policy if exists "profiles_admin_all" on public.profiles;
create policy "profiles_admin_all" on public.profiles
  for all using (public.is_admin()) with check (public.is_admin());

-- Operational catalogue/content tables: staff can manage.
drop policy if exists "categories_admin_all" on public.categories;
create policy "categories_staff_all" on public.categories
  for all using (public.is_staff()) with check (public.is_staff());

drop policy if exists "brands_admin_all" on public.brands;
create policy "brands_staff_all" on public.brands
  for all using (public.is_staff()) with check (public.is_staff());

drop policy if exists "products_admin_all" on public.products;
create policy "products_staff_all" on public.products
  for all using (public.is_staff()) with check (public.is_staff());

drop policy if exists "product_images_admin_all" on public.product_images;
create policy "product_images_staff_all" on public.product_images
  for all using (public.is_staff()) with check (public.is_staff());

drop policy if exists "product_variants_admin_all" on public.product_variants;
create policy "product_variants_staff_all" on public.product_variants
  for all using (public.is_staff()) with check (public.is_staff());

drop policy if exists "reviews_admin_all" on public.reviews;
create policy "reviews_staff_all" on public.reviews
  for all using (public.is_staff()) with check (public.is_staff());

drop policy if exists "testimonials_admin_all" on public.testimonials;
create policy "testimonials_staff_all" on public.testimonials
  for all using (public.is_staff()) with check (public.is_staff());

drop policy if exists "blog_admin_all" on public.blog_posts;
create policy "blog_staff_all" on public.blog_posts
  for all using (public.is_staff()) with check (public.is_staff());

-- Orders: staff can view and update; admins can delete.
drop policy if exists "orders_select_own_or_admin" on public.orders;
create policy "orders_select_own_or_staff" on public.orders
  for select using (auth.uid() = user_id or public.is_staff());
drop policy if exists "orders_admin_update" on public.orders;
create policy "orders_staff_update" on public.orders
  for update using (public.is_staff()) with check (public.is_staff());
drop policy if exists "orders_admin_delete" on public.orders;
create policy "orders_admin_delete" on public.orders
  for delete using (public.is_admin());

drop policy if exists "repairs_admin_all" on public.repair_bookings;
create policy "repairs_staff_all" on public.repair_bookings
  for all using (public.is_staff()) with check (public.is_staff());

drop policy if exists "easybuy_admin_all" on public.easybuy_applications;
create policy "easybuy_staff_all" on public.easybuy_applications
  for all using (public.is_staff()) with check (public.is_staff());

drop policy if exists "contact_admin_all" on public.contact_messages;
create policy "contact_staff_all" on public.contact_messages
  for all using (public.is_staff()) with check (public.is_staff());

-- Admin-only settings, money and tracking surfaces remain admin-only.
drop policy if exists "coupons_admin_all" on public.coupons;
create policy "coupons_admin_all" on public.coupons
  for all using (public.is_admin()) with check (public.is_admin());

drop policy if exists "loyalty_settings_admin_all" on public.loyalty_settings;
create policy "loyalty_settings_admin_all" on public.loyalty_settings
  for all using (public.is_admin()) with check (public.is_admin());

drop policy if exists "loyalty_ledger_select_own_or_admin" on public.loyalty_ledger;
create policy "loyalty_ledger_select_own_or_admin" on public.loyalty_ledger
  for select using (auth.uid() = user_id or public.is_admin());
drop policy if exists "loyalty_ledger_admin_all" on public.loyalty_ledger;
create policy "loyalty_ledger_admin_all" on public.loyalty_ledger
  for all using (public.is_admin()) with check (public.is_admin());

drop policy if exists "analytics_admin_all" on public.analytics_events;
create policy "analytics_admin_all" on public.analytics_events
  for all using (public.is_admin()) with check (public.is_admin());

drop policy if exists "meta_admin_all" on public.meta_events;
create policy "meta_admin_all" on public.meta_events
  for all using (public.is_admin()) with check (public.is_admin());

drop policy if exists "settings_admin_all" on public.settings;
create policy "settings_admin_all" on public.settings
  for all using (public.is_admin()) with check (public.is_admin());

drop policy if exists "areas_admin_all" on public.areas;
create policy "areas_admin_all" on public.areas
  for all using (public.is_admin()) with check (public.is_admin());

grant execute on function public.is_staff() to authenticated;

-- Category groups. These are visible now; Faith adds the products from admin.
insert into public.categories (name, slug, description, sort_order, is_active, group_name)
values
  ('Smartphones', 'smartphones', 'Brand-new Infinix, TECNO, Samsung, itel and Redmi smartphones available in Karu, Abuja.', 1, true, 'Phones'),
  ('Feature Phones', 'feature-phones', 'Reliable basic phones with long standby time.', 2, true, 'Phones'),
  ('Chargers & Cables', 'chargers-cables', 'Chargers, adapters and charging cables for phones and laptops.', 3, true, 'Accessories'),
  ('Power Banks', 'power-banks', 'Power banks for travel, outages and long days away from a socket.', 4, true, 'Accessories'),
  ('Ring Lights', 'ring-lights', 'Ring lights for creators, live selling and content shoots.', 5, true, 'Accessories'),
  ('Speakers & Audio', 'speakers-audio', 'Speakers, earbuds and audio accessories.', 6, true, 'Accessories'),
  ('Cases & Protection', 'cases-protection', 'Phone cases, screen protectors and protective covers.', 7, true, 'Accessories'),
  ('Laptops & Tablets', 'laptops-tablets', 'Laptops and tablets for work, school and entertainment.', 8, true, 'Other')
on conflict (slug) do update set
  name = excluded.name,
  description = excluded.description,
  sort_order = excluded.sort_order,
  group_name = excluded.group_name;

