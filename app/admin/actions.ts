'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { sendCapiEvent } from '@/lib/meta-capi';
import { getSettings } from '@/lib/queries';

async function requireStaff() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect('/login?next=/admin');
  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single();
  if (profile?.role !== 'admin' && profile?.role !== 'staff') redirect('/account');
  return user;
}

async function requireAdmin() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect('/login?next=/admin');
  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single();
  if (profile?.role !== 'admin') redirect('/account');
  return user;
}

function text(formData: FormData, key: string): string {
  return String(formData.get(key) ?? '').trim();
}

function numberOrNull(value: FormDataEntryValue | null): number | null {
  if (value === null) return null;
  const parsed = Number(String(value).trim());
  return Number.isFinite(parsed) ? parsed : null;
}

function fail(path: string, message: string): never {
  redirect(`${path}?err=${encodeURIComponent(message.slice(0, 300))}&t=${Date.now()}`);
}

function succeed(path: string): never {
  redirect(`${path}?saved=1&t=${Date.now()}`);
}

function slugify(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .slice(0, 90);
}

function parseJson<T>(value: FormDataEntryValue | null, fallback: T): T {
  try {
    return JSON.parse(String(value ?? '')) as T;
  } catch {
    return fallback;
  }
}

function refreshAll() {
  revalidatePath('/', 'layout');
  revalidatePath('/shop');
  revalidatePath('/blog');
  revalidatePath('/admin');
}

async function uniqueCategorySlug(base: string, excludeId?: string): Promise<string> {
  const admin = createAdminClient();
  let candidate = base || `category-${Date.now()}`;
  for (let attempt = 0; attempt < 8; attempt += 1) {
    const query = admin.from('categories').select('id').eq('slug', candidate);
    const { data } = excludeId ? await query.neq('id', excludeId) : await query;
    if (!data?.length) return candidate;
    candidate = `${base}-${Math.random().toString(36).slice(2, 6)}`;
  }
  return `${base}-${Date.now()}`;
}
async function uniqueProductSlug(base: string, excludeId?: string): Promise<string> {
  const admin = createAdminClient();
  let candidate = base || `product-${Date.now()}`;
  for (let attempt = 0; attempt < 8; attempt += 1) {
    const query = admin.from('products').select('id').eq('slug', candidate);
    const { data } = excludeId ? await query.neq('id', excludeId) : await query;
    if (!data?.length) return candidate;
    candidate = `${base}-${Math.random().toString(36).slice(2, 6)}`;
  }
  return `${base}-${Date.now()}`;
}

async function uniquePostSlug(base: string, excludeId?: string): Promise<string> {
  const admin = createAdminClient();
  let candidate = base || `post-${Date.now()}`;
  for (let attempt = 0; attempt < 8; attempt += 1) {
    const query = admin.from('blog_posts').select('id').eq('slug', candidate);
    const { data } = excludeId ? await query.neq('id', excludeId) : await query;
    if (!data?.length) return candidate;
    candidate = `${base}-${Math.random().toString(36).slice(2, 6)}`;
  }
  return `${base}-${Date.now()}`;
}

function parseUploaded(formData: FormData): string[] {
  return formData
    .getAll('uploaded_image')
    .filter((value): value is string => typeof value === 'string' && value.length > 0 && value.length < 500 && !value.includes('..'))
    .slice(0, 20);
}

function parseVariants(formData: FormData) {
  const raw = parseJson<Array<Record<string, unknown>>>(formData.get('variants'), []);
  return raw
    .map((item) => ({
      id: typeof item.id === 'string' && item.id ? item.id : null,
      label: String(item.label ?? '').trim(),
      color: String(item.color ?? '').trim() || null,
      price: Number(item.price),
      stock: item.stock === '' || item.stock === null || item.stock === undefined ? null : Number(item.stock),
      sku: String(item.sku ?? '').trim() || null,
    }))
    .filter((variant) => variant.label && Number.isFinite(variant.price) && variant.price >= 0);
}

async function saveVariants(productId: string, variants: ReturnType<typeof parseVariants>) {
  const admin = createAdminClient();
  const { data: existing } = await admin.from('product_variants').select('id').eq('product_id', productId);
  const existingIds = new Set((existing ?? []).map((row) => row.id as string));
  const kept = new Set<string>();

  for (const variant of variants) {
    const row = {
      product_id: productId,
      label: variant.label,
      color: variant.color,
      price: variant.price,
      stock: variant.stock,
      sku: variant.sku,
      is_active: true,
    };
    if (variant.id && existingIds.has(variant.id)) {
      const { error } = await admin.from('product_variants').update(row).eq('id', variant.id);
      if (error) throw new Error(error.message);
      kept.add(variant.id);
    } else {
      const { data, error } = await admin.from('product_variants').insert(row).select('id').single();
      if (error) throw new Error(error.message);
      if (data?.id) kept.add(data.id);
    }
  }

  for (const id of existingIds) {
    if (!kept.has(id)) await admin.from('product_variants').delete().eq('id', id);
  }
}

// CATEGORIES

export async function createCategory(formData: FormData) {
  await requireStaff();
  const admin = createAdminClient();
  const name = text(formData, 'name');
  if (!name) fail('/admin/categories', 'Category name is required.');
  const slug = await uniqueCategorySlug(slugify(text(formData, 'slug') || name));
  const uploads = parseUploaded(formData);
  const { error } = await admin.from('categories').insert({
    name,
    slug,
    description: text(formData, 'description') || null,
    group_name: text(formData, 'group_name') || 'Phones',
    image_url: uploads[0] ?? (text(formData, 'image_url') || null),
    sort_order: numberOrNull(formData.get('sort_order')) ?? 99,
    is_active: formData.get('is_active') === 'on',
  });
  if (error) fail('/admin/categories', error.message);
  refreshAll();
  succeed('/admin/categories');
}

export async function updateCategory(formData: FormData) {
  await requireStaff();
  const admin = createAdminClient();
  const id = text(formData, 'id');
  const name = text(formData, 'name');
  if (!id || !name) fail('/admin/categories', 'Category id and name are required.');
  const slug = await uniqueCategorySlug(slugify(text(formData, 'slug') || name), id);
  const uploads = parseUploaded(formData);
  const { error } = await admin
    .from('categories')
    .update({
      name,
      slug,
      description: text(formData, 'description') || null,
      group_name: text(formData, 'group_name') || 'Phones',
      image_url: uploads[0] ?? (text(formData, 'image_url') || null),
      sort_order: numberOrNull(formData.get('sort_order')) ?? 0,
      is_active: formData.get('is_active') === 'on',
    })
    .eq('id', id);
  if (error) fail('/admin/categories', error.message);
  refreshAll();
  succeed('/admin/categories');
}

export async function deleteCategory(formData: FormData) {
  await requireStaff();
  const admin = createAdminClient();
  const id = text(formData, 'id');
  if (!id) fail('/admin/categories', 'Missing category id.');
  const { count } = await admin.from('products').select('id', { count: 'exact', head: true }).eq('category_id', id);
  if ((count ?? 0) > 0) fail('/admin/categories', `This category still has ${count} product(s). Move them first.`);
  const { error } = await admin.from('categories').delete().eq('id', id);
  if (error) fail('/admin/categories', error.message);
  refreshAll();
  succeed('/admin/categories');
}
// PRODUCTS

export async function createProduct(formData: FormData) {
  await requireStaff();
  const admin = createAdminClient();
  const name = text(formData, 'name');
  if (!name) fail('/admin/products/new', 'Product name is required.');
  const slug = await uniqueProductSlug(slugify(text(formData, 'slug') || name));

  const { data: product, error } = await admin
    .from('products')
    .insert({
      slug,
      name,
      short_description: text(formData, 'short_description') || null,
      description: text(formData, 'description') || null,
      brand_id: text(formData, 'brand_id') || null,
      category_id: text(formData, 'category_id') || null,
      condition: text(formData, 'condition') || 'brand_new',
      warranty: text(formData, 'warranty') || null,
      price: numberOrNull(formData.get('price')) ?? 0,
      original_price: numberOrNull(formData.get('original_price')),
      cost_price: numberOrNull(formData.get('cost_price')),
      badge: text(formData, 'badge') || null,
      is_active: formData.get('is_active') === 'on',
      is_featured: formData.get('is_featured') === 'on',
      is_new_arrival: formData.get('is_new_arrival') === 'on',
      easybuy_eligible: formData.get('easybuy_eligible') === 'on',
      tags: text(formData, 'tags').split(',').map((tag) => tag.trim()).filter(Boolean),
      specs: parseJson<Record<string, string>>(formData.get('specs'), {}),
      highlights: text(formData, 'highlights').split('\n').map((item) => item.trim()).filter(Boolean),
      seo_title: text(formData, 'seo_title') || null,
      seo_description: text(formData, 'seo_description') || null,
      sort_order: numberOrNull(formData.get('sort_order')) ?? 99,
    })
    .select('id')
    .single();

  if (error || !product) fail('/admin/products/new', error?.message ?? 'Could not create product.');

  try {
    await saveVariants(product.id, parseVariants(formData));
  } catch (error) {
    fail(`/admin/products/${product.id}`, error instanceof Error ? error.message : 'Variants failed.');
  }

  const uploads = parseUploaded(formData);
  if (uploads.length) {
    const { error: imageError } = await admin.from('product_images').insert(
      uploads.map((url, index) => ({ product_id: product.id, url, alt: name, sort_order: index + 1 }))
    );
    if (imageError) fail(`/admin/products/${product.id}`, imageError.message);
  }

  refreshAll();
  succeed(`/admin/products/${product.id}`);
}

export async function updateProduct(formData: FormData) {
  await requireStaff();
  const admin = createAdminClient();
  const id = text(formData, 'id');
  const name = text(formData, 'name');
  if (!id || !name) fail('/admin/products', 'Product id and name are required.');
  const slug = await uniqueProductSlug(slugify(text(formData, 'slug') || name), id);

  const { error } = await admin
    .from('products')
    .update({
      slug,
      name,
      short_description: text(formData, 'short_description') || null,
      description: text(formData, 'description') || null,
      brand_id: text(formData, 'brand_id') || null,
      category_id: text(formData, 'category_id') || null,
      condition: text(formData, 'condition') || 'brand_new',
      warranty: text(formData, 'warranty') || null,
      price: numberOrNull(formData.get('price')) ?? 0,
      original_price: numberOrNull(formData.get('original_price')),
      cost_price: numberOrNull(formData.get('cost_price')),
      badge: text(formData, 'badge') || null,
      is_active: formData.get('is_active') === 'on',
      is_featured: formData.get('is_featured') === 'on',
      is_new_arrival: formData.get('is_new_arrival') === 'on',
      easybuy_eligible: formData.get('easybuy_eligible') === 'on',
      tags: text(formData, 'tags').split(',').map((tag) => tag.trim()).filter(Boolean),
      specs: parseJson<Record<string, string>>(formData.get('specs'), {}),
      highlights: text(formData, 'highlights').split('\n').map((item) => item.trim()).filter(Boolean),
      seo_title: text(formData, 'seo_title') || null,
      seo_description: text(formData, 'seo_description') || null,
      sort_order: numberOrNull(formData.get('sort_order')) ?? 99,
    })
    .eq('id', id);
  if (error) fail(`/admin/products/${id}`, error.message);

  try {
    await saveVariants(id, parseVariants(formData));
  } catch (variantError) {
    fail(`/admin/products/${id}`, variantError instanceof Error ? variantError.message : 'Variants failed.');
  }

  const removeIds = formData.getAll('remove_image').map(String).filter(Boolean);
  for (const imageId of removeIds) {
    const { data: image } = await admin.from('product_images').select('url').eq('id', imageId).maybeSingle();
    if (image?.url && !image.url.startsWith('http')) {
      await admin.storage.from('site-media').remove([image.url]);
    }
    await admin.from('product_images').delete().eq('id', imageId);
  }

  const { count } = await admin.from('product_images').select('id', { count: 'exact', head: true }).eq('product_id', id);
  const uploads = parseUploaded(formData);
  if (uploads.length) {
    const { error: imageError } = await admin.from('product_images').insert(
      uploads.map((url, index) => ({ product_id: id, url, alt: name, sort_order: (count ?? 0) + index + 1 }))
    );
    if (imageError) fail(`/admin/products/${id}`, imageError.message);
  }

  refreshAll();
  revalidatePath(`/product/${slug}`);
  succeed(`/admin/products/${id}`);
}

export async function deleteProduct(formData: FormData) {
  await requireStaff();
  const admin = createAdminClient();
  const id = text(formData, 'id');
  if (!id) fail('/admin/products', 'Missing product id.');
  const { data: images } = await admin.from('product_images').select('url').eq('product_id', id);
  const paths = (images ?? []).map((row) => row.url).filter((url) => typeof url === 'string' && !url.startsWith('http'));
  if (paths.length) await admin.storage.from('site-media').remove(paths);
  const { error } = await admin.from('products').delete().eq('id', id);
  if (error) fail(`/admin/products/${id}`, error.message);
  refreshAll();
  succeed('/admin/products');
}

export async function bulkUpdatePrices(formData: FormData) {
  await requireStaff();
  const admin = createAdminClient();
  const mode = text(formData, 'mode');
  const value = numberOrNull(formData.get('value')) ?? 0;
  const categoryId = text(formData, 'category_id');
  const { data: products } = await admin.from('products').select('id, price, price, category_id');
  if (!products?.length) succeed('/admin/products');

  for (const product of products) {
    if (categoryId && product.category_id !== categoryId) continue;
    const current = Number(product.price);
    let next = current;
    if (mode === 'increase_percent') next = Math.round(current * (1 + value / 100));
    if (mode === 'decrease_percent') next = Math.round(current * (1 - value / 100));
    if (mode === 'increase_amount') next = Math.round(current + value);
    if (mode === 'decrease_amount') next = Math.max(0, Math.round(current - value));
    if (next !== current) await admin.from('products').update({ price: next }).eq('id', product.id);
  }
  refreshAll();
  succeed('/admin/products');
}

// ORDERS

async function sendPurchaseForOrder(orderId: string) {
  const admin = createAdminClient();
  const { data: order } = await admin
    .from('orders')
    .select('*, order_items(*)')
    .eq('id', orderId)
    .maybeSingle();
  if (!order || order.meta_purchase_event_id) return;
  if (!order.fbp && !order.fbc) return;

  const settings = await getSettings();
  if (!settings.meta_pixel_id || !process.env.META_CAPI_ACCESS_TOKEN) return;

  const eventId = `purchase-${order.order_number}`;
  const result = await sendCapiEvent({
    pixelId: settings.meta_pixel_id,
    accessToken: process.env.META_CAPI_ACCESS_TOKEN,
    testEventCode: settings.meta_test_event_code,
    eventName: 'Purchase',
    eventId,
    sourceUrl: `${process.env.NEXT_PUBLIC_SITE_URL ?? ''}/product/${order.order_items?.[0]?.product_slug ?? ''}`,
    userData: {
      email: order.customer_email,
      phone: order.customer_phone,
      fullName: order.customer_name,
      city: order.delivery_city,
      state: order.delivery_state,
      country: order.delivery_country,
      fbp: order.fbp,
      fbc: order.fbc,
      clientIp: order.client_ip,
      clientUserAgent: order.client_user_agent,
    },
    customData: {
      currency: 'NGN',
      value: Number(order.total),
      order_id: order.order_number,
      content_type: 'product',
      num_items: (order.order_items ?? []).reduce((sum: number, item: { quantity: number }) => sum + item.quantity, 0),
      contents: (order.order_items ?? []).map((item: { variant_id: string | null; quantity: number; unit_price: number }) => ({
        id: item.variant_id,
        quantity: item.quantity,
        item_price: Number(item.unit_price),
      })),
    },
    orderId: order.id,
    value: Number(order.total),
  });

  if (result.ok) {
    await admin
      .from('orders')
      .update({ meta_purchase_event_id: eventId, meta_purchase_sent_at: new Date().toISOString() })
      .eq('id', order.id);
  }
}

export async function resendPurchaseEvent(formData: FormData) {
  await requireStaff();
  const id = text(formData, 'id');
  if (!id) fail('/admin/orders', 'Missing order id.');
  await sendPurchaseForOrder(id);
  succeed(`/admin/orders/${id}`);
}

export async function updateOrder(formData: FormData) {
  await requireStaff();
  const admin = createAdminClient();
  const id = text(formData, 'id');
  if (!id) fail('/admin/orders', 'Missing order id.');

  const { data: before } = await admin.from('orders').select('payment_status, user_id, total, order_number').eq('id', id).maybeSingle();
  const paymentStatus = text(formData, 'payment_status') || 'pending';

  const { error } = await admin
    .from('orders')
    .update({
      status: text(formData, 'status') || 'received',
      payment_status: paymentStatus,
      tracking_number: text(formData, 'tracking_number') || null,
      courier: text(formData, 'courier') || null,
      admin_notes: text(formData, 'admin_notes') || null,
    })
    .eq('id', id);
  if (error) fail(`/admin/orders/${id}`, error.message);

  if (paymentStatus === 'paid' && before?.payment_status !== 'paid') {
    await sendPurchaseForOrder(id);
    if (before?.user_id) {
      const settings = await getSettings();
      const { data: loyalty } = await admin.from('loyalty_settings').select('*').single();
      if (loyalty?.enabled) {
        const points = Math.floor(Number(before.total) / 1000) * Number(loyalty.points_per_1000);
        if (points > 0) {
          await admin.from('loyalty_ledger').insert({
            user_id: before.user_id,
            order_id: id,
            delta: Math.round(points),
            reason: 'earn',
            note: `Order ${before.order_number}`,
          });
        }
      }
    }
  }

  revalidatePath('/admin/orders');
  revalidatePath(`/admin/orders/${id}`);
  revalidatePath('/account');
  succeed(`/admin/orders/${id}`);
}

// COUPONS

export async function createCoupon(formData: FormData) {
  await requireAdmin();
  const admin = createAdminClient();
  const code = text(formData, 'code').toUpperCase();
  if (!code) fail('/admin/coupons', 'Coupon code is required.');
  const { error } = await admin.from('coupons').insert({
    code,
    discount_type: text(formData, 'discount_type') === 'fixed' ? 'fixed' : 'percentage',
    value: numberOrNull(formData.get('value')) ?? 0,
    min_order: numberOrNull(formData.get('min_order')) ?? 0,
    active: true,
    expires_at: text(formData, 'expires_at') || null,
  });
  if (error) fail('/admin/coupons', error.message);
  revalidatePath('/admin/coupons');
  succeed('/admin/coupons');
}

export async function toggleCoupon(formData: FormData) {
  await requireAdmin();
  const admin = createAdminClient();
  const id = text(formData, 'id');
  const active = formData.get('active') === 'true';
  if (!id) fail('/admin/coupons', 'Missing coupon id.');
  const { error } = await admin.from('coupons').update({ active: !active }).eq('id', id);
  if (error) fail('/admin/coupons', error.message);
  revalidatePath('/admin/coupons');
  succeed('/admin/coupons');
}

export async function deleteCoupon(formData: FormData) {
  await requireAdmin();
  const admin = createAdminClient();
  const id = text(formData, 'id');
  if (!id) fail('/admin/coupons', 'Missing coupon id.');
  const { error } = await admin.from('coupons').delete().eq('id', id);
  if (error) fail('/admin/coupons', error.message);
  revalidatePath('/admin/coupons');
  succeed('/admin/coupons');
}

// BLOG

export async function createPost(formData: FormData) {
  await requireStaff();
  const admin = createAdminClient();
  const title = text(formData, 'title');
  if (!title) fail('/admin/blog/new', 'Title is required.');
  const slug = await uniquePostSlug(slugify(text(formData, 'slug') || title));
  const status = text(formData, 'status') || 'draft';
  const publishedAt = text(formData, 'published_at') || (status === 'published' ? new Date().toISOString() : null);
  const uploads = parseUploaded(formData);

  const { data: post, error } = await admin
    .from('blog_posts')
    .insert({
      slug,
      title,
      excerpt: text(formData, 'excerpt') || null,
      content: text(formData, 'content'),
      cover_url: uploads[0] ?? (text(formData, 'cover_url') || null),
      category: text(formData, 'category') || 'Buying guide',
      tags: text(formData, 'tags').split(',').map((tag) => tag.trim()).filter(Boolean),
      author: text(formData, 'author') || 'Directlines Team',
      kind: text(formData, 'kind') === 'area' ? 'area' : 'blog',
      area_slug: text(formData, 'area_slug') || null,
      seo_title: text(formData, 'seo_title') || null,
      seo_description: text(formData, 'seo_description') || null,
      faq: parseJson(formData.get('faq'), []),
      related_product_ids: formData.getAll('related_product_ids').map(String).filter(Boolean),
      status,
      published_at: publishedAt,
    })
    .select('id, slug')
    .single();
  if (error || !post) fail('/admin/blog/new', error?.message ?? 'Could not create post.');

  revalidatePath('/blog');
  revalidatePath(`/blog/${post.slug}`);
  revalidatePath('/admin/blog');
  succeed(`/admin/blog/${post.id}`);
}

export async function updatePost(formData: FormData) {
  await requireStaff();
  const admin = createAdminClient();
  const id = text(formData, 'id');
  const title = text(formData, 'title');
  if (!id || !title) fail('/admin/blog', 'Post id and title are required.');
  const slug = await uniquePostSlug(slugify(text(formData, 'slug') || title), id);
  const status = text(formData, 'status') || 'draft';
  const publishedAt = text(formData, 'published_at') || (status === 'published' ? new Date().toISOString() : null);
  const uploads = parseUploaded(formData);

  const { error } = await admin
    .from('blog_posts')
    .update({
      slug,
      title,
      excerpt: text(formData, 'excerpt') || null,
      content: text(formData, 'content'),
      cover_url: uploads[0] ?? (text(formData, 'cover_url') || null),
      category: text(formData, 'category') || 'Buying guide',
      tags: text(formData, 'tags').split(',').map((tag) => tag.trim()).filter(Boolean),
      author: text(formData, 'author') || 'Directlines Team',
      kind: text(formData, 'kind') === 'area' ? 'area' : 'blog',
      area_slug: text(formData, 'area_slug') || null,
      seo_title: text(formData, 'seo_title') || null,
      seo_description: text(formData, 'seo_description') || null,
      faq: parseJson(formData.get('faq'), []),
      related_product_ids: formData.getAll('related_product_ids').map(String).filter(Boolean),
      status,
      published_at: publishedAt,
    })
    .eq('id', id);
  if (error) fail(`/admin/blog/${id}`, error.message);

  revalidatePath('/blog');
  revalidatePath(`/blog/${slug}`);
  revalidatePath('/admin/blog');
  succeed(`/admin/blog/${id}`);
}

export async function deletePost(formData: FormData) {
  await requireStaff();
  const admin = createAdminClient();
  const id = text(formData, 'id');
  if (!id) fail('/admin/blog', 'Missing post id.');
  const { data: post } = await admin.from('blog_posts').select('slug').eq('id', id).maybeSingle();
  const { error } = await admin.from('blog_posts').delete().eq('id', id);
  if (error) fail(`/admin/blog/${id}`, error.message);
  revalidatePath('/blog');
  if (post?.slug) revalidatePath(`/blog/${post.slug}`);
  succeed('/admin/blog');
}

// REVIEWS, LEADS, TESTIMONIALS

export async function approveReview(formData: FormData) {
  await requireStaff();
  const admin = createAdminClient();
  const id = text(formData, 'id');
  const approve = formData.get('approve') === 'true';
  if (!id) fail('/admin/reviews', 'Missing review id.');
  const { error } = await admin.from('reviews').update({ is_approved: !approve }).eq('id', id);
  if (error) fail('/admin/reviews', error.message);
  revalidatePath('/admin/reviews');
  revalidatePath('/shop');
  succeed('/admin/reviews');
}

export async function deleteReview(formData: FormData) {
  await requireStaff();
  const admin = createAdminClient();
  const id = text(formData, 'id');
  if (!id) fail('/admin/reviews', 'Missing review id.');
  const { error } = await admin.from('reviews').delete().eq('id', id);
  if (error) fail('/admin/reviews', error.message);
  succeed('/admin/reviews');
}

export async function updateEasyBuyStatus(formData: FormData) {
  await requireStaff();
  const admin = createAdminClient();
  const id = text(formData, 'id');
  if (!id) fail('/admin/easybuy', 'Missing application id.');
  const { error } = await admin
    .from('easybuy_applications')
    .update({
      status: text(formData, 'status') || 'new',
      admin_notes: text(formData, 'admin_notes') || null,
    })
    .eq('id', id);
  if (error) fail('/admin/easybuy', error.message);
  succeed('/admin/easybuy');
}

export async function updateRepairStatus(formData: FormData) {
  await requireStaff();
  const admin = createAdminClient();
  const id = text(formData, 'id');
  if (!id) fail('/admin/repairs', 'Missing repair id.');
  const { error } = await admin
    .from('repair_bookings')
    .update({
      status: text(formData, 'status') || 'new',
      admin_notes: text(formData, 'admin_notes') || null,
    })
    .eq('id', id);
  if (error) fail('/admin/repairs', error.message);
  succeed('/admin/repairs');
}

export async function createTestimonial(formData: FormData) {
  await requireStaff();
  const admin = createAdminClient();
  const quote = text(formData, 'quote');
  const customerName = text(formData, 'customer_name');
  if (!quote || !customerName) fail('/admin/reviews', 'Quote and customer name are required.');
  const uploads = parseUploaded(formData);
  const { error } = await admin.from('testimonials').insert({
    quote,
    customer_name: customerName,
    location: text(formData, 'location') || null,
    image_url: uploads[0] ?? null,
    sort_order: numberOrNull(formData.get('sort_order')) ?? 0,
    is_active: true,
  });
  if (error) fail('/admin/reviews', error.message);
  revalidatePath('/');
  succeed('/admin/reviews');
}

export async function toggleTestimonial(formData: FormData) {
  await requireStaff();
  const admin = createAdminClient();
  const id = text(formData, 'id');
  const active = formData.get('active') === 'true';
  if (!id) fail('/admin/reviews', 'Missing testimonial id.');
  await admin.from('testimonials').update({ is_active: !active }).eq('id', id);
  revalidatePath('/');
  succeed('/admin/reviews');
}

export async function deleteTestimonial(formData: FormData) {
  await requireStaff();
  const admin = createAdminClient();
  const id = text(formData, 'id');
  if (!id) fail('/admin/reviews', 'Missing testimonial id.');
  const { error } = await admin.from('testimonials').delete().eq('id', id);
  if (error) fail('/admin/reviews', error.message);
  revalidatePath('/');
  succeed('/admin/reviews');
}

// SETTINGS

export async function updateStoreSettings(formData: FormData) {
  await requireAdmin();
  const admin = createAdminClient();
  const { error } = await admin
    .from('settings')
    .update({
      store_name: text(formData, 'store_name'),
      legal_name: text(formData, 'legal_name'),
      tagline: text(formData, 'tagline'),
      whatsapp_number: text(formData, 'whatsapp_number'),
      display_phone: text(formData, 'display_phone'),
      alt_phone: text(formData, 'alt_phone'),
      easybuy_whatsapp: text(formData, 'easybuy_whatsapp'),
      email: text(formData, 'email'),
      address_full: text(formData, 'address_full'),
      address_street: text(formData, 'address_street'),
      address_area: text(formData, 'address_area'),
      address_city: text(formData, 'address_city'),
      address_state: text(formData, 'address_state'),
      address_country: text(formData, 'address_country'),
      hours: text(formData, 'hours'),
      cac_note: text(formData, 'cac_note'),
      warranty_text: text(formData, 'warranty_text'),
      free_shipping_threshold: numberOrNull(formData.get('free_shipping_threshold')) ?? 250000,
      hero_eyebrow: text(formData, 'hero_eyebrow'),
      hero_title: text(formData, 'hero_title'),
      hero_subtitle: text(formData, 'hero_subtitle'),
      easybuy_enabled: formData.get('easybuy_enabled') === 'on',
      easybuy_down_payment_percent: numberOrNull(formData.get('easybuy_down_payment_percent')) ?? 30,
      easybuy_tenures: text(formData, 'easybuy_tenures').split(',').map((value) => Number(value.trim())).filter((value) => Number.isFinite(value) && value > 0),
      repairs_enabled: formData.get('repairs_enabled') === 'on',
      socials: {
        twitter: text(formData, 'twitter'),
        instagram: text(formData, 'instagram'),
        facebook: text(formData, 'facebook'),
      },
      seo: {
        title: text(formData, 'seo_title'),
        description: text(formData, 'seo_description'),
        keywords: text(formData, 'seo_keywords').split(',').map((value) => value.trim()).filter(Boolean),
      },
    })
    .eq('id', true);
  if (error) fail('/admin/settings', error.message);
  refreshAll();
  succeed('/admin/settings');
}

export async function updateDeliveryZones(formData: FormData) {
  await requireAdmin();
  const admin = createAdminClient();
  const zones = parseJson<Array<Record<string, unknown>>>(formData.get('zones'), []);
  const clean = zones
    .map((zone, index) => {
      const name = String(zone.name ?? '').trim();
      if (!name) return null;
      return {
        id: String(zone.id ?? '').trim().toLowerCase().replace(/[^a-z0-9-]/g, '-') || `zone-${index + 1}`,
        name,
        price: Number(zone.price) || 0,
        active: zone.active !== false,
        free_over_threshold: zone.free_over_threshold === true,
        sort_order: index + 1,
      };
    })
    .filter(Boolean);
  const { error } = await admin.from('settings').update({ shipping_zones: clean }).eq('id', true);
  if (error) fail('/admin/settings', error.message);
  refreshAll();
  succeed('/admin/settings');
}

export async function updateBankAnnouncement(formData: FormData) {
  await requireAdmin();
  const admin = createAdminClient();
  const { error } = await admin
    .from('settings')
    .update({
      bank_details: {
        bankName: text(formData, 'bankName'),
        accountName: text(formData, 'accountName'),
        accountNumber: text(formData, 'accountNumber'),
        instructions: text(formData, 'instructions'),
      },
      announcement: {
        active: formData.get('announcement_active') === 'on',
        speedDurationSeconds: numberOrNull(formData.get('announcement_speed')) ?? 40,
        items: text(formData, 'announcement_items').split('\n').map((line) => line.trim()).filter(Boolean),
      },
      policies: {
        refunds: text(formData, 'refunds'),
        returns: text(formData, 'returns').split('\n').map((line) => line.trim()).filter(Boolean),
        condition: text(formData, 'condition'),
      },
    })
    .eq('id', true);
  if (error) fail('/admin/settings', error.message);
  refreshAll();
  succeed('/admin/settings');
}

export async function updateMetaSettings(formData: FormData) {
  await requireAdmin();
  const admin = createAdminClient();
  const { error } = await admin
    .from('settings')
    .update({
      analytics_enabled: formData.get('analytics_enabled') === 'on',
      consent_enabled: formData.get('consent_enabled') === 'on',
      meta_pixel_id: text(formData, 'meta_pixel_id') || null,
      meta_test_event_code: text(formData, 'meta_test_event_code') || null,
      meta_domain_verification: text(formData, 'meta_domain_verification') || null,
      meta_catalog_enabled: formData.get('meta_catalog_enabled') === 'on',
    })
    .eq('id', true);
  if (error) fail('/admin/meta', error.message);
  refreshAll();
  succeed('/admin/meta');
}

export async function updateLoyaltySettings(formData: FormData) {
  await requireAdmin();
  const admin = createAdminClient();
  const { error } = await admin
    .from('loyalty_settings')
    .update({
      enabled: formData.get('enabled') === 'on',
      points_per_1000: numberOrNull(formData.get('points_per_1000')) ?? 1,
      naira_per_point: numberOrNull(formData.get('naira_per_point')) ?? 10,
      min_redeem_points: Math.round(numberOrNull(formData.get('min_redeem_points')) ?? 500),
    })
    .eq('id', true);
  if (error) fail('/admin/loyalty', error.message);
  succeed('/admin/loyalty');
}

export async function sendTestCapiEvent() {
  await requireAdmin();
  const settings = await getSettings();
  if (!settings.meta_pixel_id || !process.env.META_CAPI_ACCESS_TOKEN) {
    fail('/admin/meta', 'Add a Pixel ID and META_CAPI_ACCESS_TOKEN before testing.');
  }
  const result = await sendCapiEvent({
    pixelId: settings.meta_pixel_id!,
    accessToken: process.env.META_CAPI_ACCESS_TOKEN!,
    testEventCode: settings.meta_test_event_code,
    eventName: 'Lead',
    eventId: `test-${Date.now()}`,
    sourceUrl: `${process.env.NEXT_PUBLIC_SITE_URL ?? ''}/`,
    userData: { email: 'test@directlines.ng', phone: '2348000000000', fullName: 'Directlines Test', country: 'NG' },
    customData: { test: true },
  });
  if (!result.ok) fail('/admin/meta', `Meta returned ${result.status}. Check the token and Pixel ID.`);
  succeed('/admin/meta');
}





