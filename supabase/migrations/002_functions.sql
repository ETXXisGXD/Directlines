-- 002_functions.sql
-- Helpers, triggers, order numbering and server-priced checkout.

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.profiles p
    where p.id = auth.uid() and p.role = 'admin'
  );
$$;

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

do $$
declare
  t text;
begin
  foreach t in array array['profiles','products','orders','settings','blog_posts','areas','repair_bookings','easybuy_applications','loyalty_settings']
  loop
    execute format('drop trigger if exists set_%s_updated_at on public.%I', t, t);
    execute format('create trigger set_%s_updated_at before update on public.%I for each row execute function public.set_updated_at()', t, t);
  end loop;
end
$$;

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
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

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

create sequence if not exists public.order_number_seq start 1001;

create or replace function public.next_order_number()
returns text
language sql
volatile
as $$
  select 'DL-' || to_char(now(), 'YYYY') || '-' || lpad(nextval('public.order_number_seq')::text, 5, '0');
$$;

create or replace function public.loyalty_balance(p_user uuid default auth.uid())
returns integer
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(sum(delta), 0)::int
  from public.loyalty_ledger
  where user_id = p_user;
$$;

create or replace function public.place_order(payload jsonb)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user uuid := auth.uid();
  v_items jsonb := coalesce(payload -> 'items', '[]'::jsonb);
  v_shipping_option text := coalesce(nullif(payload ->> 'shipping_option', ''), 'karu-nyanya');
  v_coupon_code text := upper(nullif(payload ->> 'coupon_code', ''));
  v_payment_method public.payment_method := coalesce(nullif(payload ->> 'payment_method', '')::public.payment_method, 'bank_transfer');
  v_order_id uuid;
  v_order_number text;
  v_subtotal numeric(12,2) := 0;
  v_discount numeric(12,2) := 0;
  v_shipping numeric(12,2) := 0;
  v_total numeric(12,2) := 0;
  v_item jsonb;
  v_qty int;
  v_variant public.product_variants%rowtype;
  v_product public.products%rowtype;
  v_coupon public.coupons%rowtype;
  v_zones jsonb;
  v_threshold numeric(12,2);
  v_zone jsonb;
  v_order_items jsonb := '[]'::jsonb;
  v_image text;
  v_name text := nullif(trim(payload ->> 'customer_name'), '');
  v_phone text := nullif(trim(payload ->> 'customer_phone'), '');
  v_email text := nullif(trim(payload ->> 'customer_email'), '');
  v_street text := nullif(trim(payload ->> 'delivery_street'), '');
  v_city text := nullif(trim(payload ->> 'delivery_city'), '');
  v_state text := nullif(trim(payload ->> 'delivery_state'), '');
  v_country text := coalesce(nullif(trim(payload ->> 'delivery_country'), ''), 'Nigeria');
  v_landmark text := nullif(trim(payload ->> 'delivery_landmark'), '');
  v_notes text := nullif(trim(payload ->> 'notes'), '');
begin
  if jsonb_array_length(v_items) = 0 then
    raise exception 'Your cart is empty.';
  end if;
  if v_name is null or v_phone is null or v_street is null or v_city is null or v_state is null then
    raise exception 'Name, phone and delivery address are required.';
  end if;

  select shipping_zones, free_shipping_threshold into v_zones, v_threshold
  from public.settings where id;

  for v_item in select * from jsonb_array_elements(v_items) loop
    v_qty := coalesce((v_item ->> 'quantity')::int, 0);
    if v_qty < 1 or v_qty > 20 then
      raise exception 'Invalid quantity.';
    end if;

    select * into v_variant
    from public.product_variants
    where id = (v_item ->> 'variant_id')::uuid and is_active
    for update;

    if not found then
      raise exception 'One item is no longer available.';
    end if;

    select * into v_product from public.products where id = v_variant.product_id and is_active;
    if not found then
      raise exception 'One item is no longer available.';
    end if;

    if v_variant.stock is not null and v_variant.stock < v_qty then
      raise exception 'Only % left for %', v_variant.stock, v_product.name;
    end if;

    select url into v_image from public.product_images where product_id = v_product.id order by sort_order asc limit 1;

    v_subtotal := v_subtotal + (v_variant.price * v_qty);
    v_order_items := v_order_items || jsonb_build_object(
      'product_id', v_product.id,
      'variant_id', v_variant.id,
      'product_name', v_product.name,
      'product_slug', v_product.slug,
      'variant_label', v_variant.label,
      'color', v_variant.color,
      'image_url', v_image,
      'quantity', v_qty,
      'unit_price', v_variant.price,
      'line_total', v_variant.price * v_qty
    );
  end loop;

  select zone into v_zone
  from jsonb_array_elements(coalesce(v_zones, '[]'::jsonb)) as zone
  where zone ->> 'id' = v_shipping_option and coalesce((zone ->> 'active')::boolean, false) = true
  limit 1;

  if v_zone is null then
    raise exception 'Choose a valid delivery option.';
  end if;

  v_shipping := coalesce((v_zone ->> 'price')::numeric, 0);
  if coalesce((v_zone ->> 'free_over_threshold')::boolean, false) and v_subtotal >= v_threshold then
    v_shipping := 0;
  end if;
  if v_shipping_option = 'pickup' then
    v_shipping := 0;
  end if;

  if v_coupon_code is not null then
    select * into v_coupon from public.coupons
    where code = v_coupon_code and active = true
      and (expires_at is null or expires_at > now())
      and v_subtotal >= min_order;
    if found then
      if v_coupon.discount_type = 'percentage' then
        v_discount := round(v_subtotal * v_coupon.value / 100, 2);
      else
        v_discount := v_coupon.value;
      end if;
      v_discount := least(v_discount, v_subtotal);
    else
      raise exception 'That coupon is not valid for this order.';
    end if;
  end if;

  v_total := greatest(v_subtotal - v_discount + v_shipping, 0);
  v_order_number := public.next_order_number();

  insert into public.orders (
    order_number, user_id, customer_name, customer_phone, customer_email,
    delivery_street, delivery_city, delivery_state, delivery_country, delivery_landmark,
    subtotal, discount, coupon_code, shipping_fee, shipping_option, total,
    payment_method, notes, fbp, fbc, client_ip, client_user_agent,
    utm_source, utm_medium, utm_campaign, utm_content, utm_term
  ) values (
    v_order_number, v_user, v_name, v_phone, v_email,
    v_street, v_city, v_state, v_country, v_landmark,
    v_subtotal, v_discount, v_coupon_code, v_shipping, v_shipping_option, v_total,
    v_payment_method, v_notes,
    nullif(payload ->> 'fbp', ''), nullif(payload ->> 'fbc', ''),
    nullif(payload ->> 'client_ip', ''), nullif(payload ->> 'client_user_agent', ''),
    nullif(payload ->> 'utm_source', ''), nullif(payload ->> 'utm_medium', ''),
    nullif(payload ->> 'utm_campaign', ''), nullif(payload ->> 'utm_content', ''),
    nullif(payload ->> 'utm_term', '')
  ) returning id into v_order_id;

  for v_item in select * from jsonb_array_elements(v_order_items) loop
    insert into public.order_items (
      order_id, product_id, variant_id, product_name, product_slug, variant_label,
      color, image_url, quantity, unit_price, line_total
    ) values (
      v_order_id,
      (v_item ->> 'product_id')::uuid,
      (v_item ->> 'variant_id')::uuid,
      v_item ->> 'product_name',
      v_item ->> 'product_slug',
      v_item ->> 'variant_label',
      nullif(v_item ->> 'color', ''),
      nullif(v_item ->> 'image_url', ''),
      (v_item ->> 'quantity')::int,
      (v_item ->> 'unit_price')::numeric,
      (v_item ->> 'line_total')::numeric
    );

    update public.product_variants
    set stock = stock - (v_item ->> 'quantity')::int
    where id = (v_item ->> 'variant_id')::uuid and stock is not null;
  end loop;

  if v_coupon_code is not null then
    update public.coupons set usage_count = usage_count + 1 where code = v_coupon_code;
  end if;

  return jsonb_build_object(
    'order_id', v_order_id,
    'order_number', v_order_number,
    'subtotal', v_subtotal,
    'discount', v_discount,
    'shipping_fee', v_shipping,
    'total', v_total,
    'shipping_option', v_shipping_option,
    'items', v_order_items
  );
end;
$$;
