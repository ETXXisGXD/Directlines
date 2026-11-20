import { createPublicClient } from './supabase/public';

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  image_url: string | null;
  group_name: string;
  sort_order: number;
}

export interface Brand {
  id: string;
  name: string;
  slug: string;
  logo_url: string | null;
  description: string | null;
}

export interface ProductImage {
  id: string;
  url: string;
  alt: string | null;
  sort_order: number;
}

export interface ProductVariant {
  id: string;
  label: string;
  color: string | null;
  price: number;
  stock: number | null;
  sku: string | null;
  is_active: boolean;
}

export interface Product {
  id: string;
  slug: string;
  name: string;
  short_description: string | null;
  description: string | null;
  condition: string;
  warranty: string | null;
  price: number;
  original_price: number | null;
  badge: string | null;
  is_active: boolean;
  is_featured: boolean;
  is_new_arrival: boolean;
  easybuy_eligible: boolean;
  tags: string[];
  specs: Record<string, string>;
  highlights: string[];
  seo_title: string | null;
  seo_description: string | null;
  created_at: string;
  brands: { name: string; slug: string } | null;
  categories: { name: string; slug: string } | null;
  product_images: ProductImage[];
  product_variants: ProductVariant[];
}

export interface Review {
  id: string;
  product_id: string | null;
  customer_name: string;
  location: string | null;
  rating: number;
  title: string | null;
  body: string;
  created_at: string;
}

export interface Testimonial {
  id: string;
  quote: string;
  customer_name: string;
  location: string | null;
  image_url: string | null;
  sort_order: number;
}

export interface ShippingZone {
  id: string;
  name: string;
  price: number;
  active: boolean;
  free_over_threshold: boolean;
  sort_order: number;
}

export interface BlogPost {
  id: string;
  slug: string;
  title: string;
  excerpt: string | null;
  content: string;
  cover_url: string | null;
  category: string;
  tags: string[];
  author: string;
  kind: 'blog' | 'area';
  area_slug: string | null;
  seo_title: string | null;
  seo_description: string | null;
  faq: Array<{ question: string; answer: string }>;
  related_product_ids: string[];
  status: string;
  published_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface Area {
  id: string;
  slug: string;
  name: string;
  intro: string;
  delivery_note: string;
  landmarks: string | null;
  faq: Array<{ question: string; answer: string }>;
  sort_order: number;
}

export interface Settings {
  store_name: string;
  legal_name: string;
  tagline: string;
  whatsapp_number: string;
  display_phone: string;
  alt_phone: string;
  easybuy_whatsapp: string;
  email: string;
  address_full: string;
  address_street: string;
  address_area: string;
  address_city: string;
  address_state: string;
  address_country: string;
  hours: string;
  cac_note: string;
  warranty_text: string;
  currency: string;
  free_shipping_threshold: number;
  shipping_zones: ShippingZone[];
  bank_details: {
    bankName: string;
    accountName: string;
    accountNumber: string;
    instructions: string;
  };
  announcement: {
    active: boolean;
    speedDurationSeconds?: number;
    items?: string[];
  };
  delivery_info: Record<string, string>;
  policies: {
    refunds: string;
    returns: string[];
    condition: string;
    lagosReturnHours?: number;
    outsideLagosReturnHours?: number;
  };
  seo: {
    title: string;
    description: string;
    keywords: string[];
  };
  socials: Record<string, string>;
  hero_eyebrow: string;
  hero_title: string;
  hero_subtitle: string;
  hero_image_url: string | null;
  easybuy_enabled: boolean;
  easybuy_down_payment_percent: number;
  easybuy_tenures: number[];
  repairs_enabled: boolean;
  analytics_enabled: boolean;
  consent_enabled: boolean;
  meta_pixel_id: string | null;
  meta_test_event_code: string | null;
  meta_domain_verification: string | null;
  meta_catalog_enabled: boolean;
}

const PRODUCT_SELECT = `
  id, slug, name, short_description, description, condition, warranty, price, original_price,
  badge, is_active, is_featured, is_new_arrival, easybuy_eligible, tags, specs, highlights,
  seo_title, seo_description, created_at,
  brands(name, slug),
  categories(name, slug),
  product_images(id, url, alt, sort_order),
  product_variants(id, label, color, price, stock, sku, is_active)
`;

function normalizeProduct(product: Product): Product {
  return {
    ...product,
    product_images: [...(product.product_images ?? [])].sort((a, b) => a.sort_order - b.sort_order),
    product_variants: (product.product_variants ?? [])
      .filter((variant) => variant.is_active)
      .sort((a, b) => a.price - b.price),
    specs: product.specs ?? {},
    highlights: product.highlights ?? [],
  };
}

export const DEFAULT_SETTINGS: Settings = {
  store_name: 'Directlines Technologies & Telecoms Ltd',
  legal_name: 'Directlines Technologies & Telecoms Ltd',
  tagline: '...Live Smart, Connect More',
  whatsapp_number: '09033834939',
  display_phone: '0903 383 4939',
  alt_phone: '08026100185',
  easybuy_whatsapp: '07038820885',
  email: 'directlinestech@gmail.com',
  address_full:
    'Bolfash Plaza, House 12, Road K-N, Phase 1, Karu Housing Estate, Opp. De Classic Hotel, Nyanya Jikwoyi Expressway',
  address_street: 'Bolfash Plaza, House 12, Road K-N, Phase 1, Karu Housing Estate',
  address_area: 'Karu / Nyanya',
  address_city: 'Abuja',
  address_state: 'FCT',
  address_country: 'Nigeria',
  hours: 'Open 24 hours, 7 days a week',
  cac_note: 'CAC Certified & Regulated Telecoms Vendor',
  warranty_text:
    'Brand-new devices carry up to 13 months official manufacturer warranty. Certified pre-owned devices include a 90-day Directlines warranty.',
  currency: 'NGN',
  free_shipping_threshold: 250000,
  shipping_zones: [
    { id: 'karu-nyanya', name: 'Karu / Nyanya same-day', price: 1500, active: true, free_over_threshold: true, sort_order: 1 },
    { id: 'abuja-central', name: 'Abuja central (24-48 hours)', price: 3000, active: true, free_over_threshold: false, sort_order: 2 },
    { id: 'nationwide', name: 'Nationwide courier (1-3 days)', price: 6500, active: true, free_over_threshold: false, sort_order: 3 },
    { id: 'pickup', name: 'Showroom pickup, Karu', price: 0, active: true, free_over_threshold: false, sort_order: 4 },
  ],
  bank_details: {
    bankName: 'Moniepoint MFB / Zenith Bank',
    accountName: 'Directlines Technologies & Telecoms Ltd',
    accountNumber: '8026100185',
    instructions:
      'Use your order number as the transfer narration and send the receipt on WhatsApp for instant verification.',
  },
  announcement: {
    active: true,
    speedDurationSeconds: 40,
    items: [
      'Directlines Technologies & Telecoms Ltd. ...Live Smart, Connect More',
      'Open 24/7 at Bolfash Plaza, Karu Housing Estate, Abuja',
      'Brand-new devices with manufacturer warranty. EasyBuy available.',
      'Same-day delivery within Karu and Nyanya',
    ],
  },
  delivery_info: {
    withinKaru: 'Same-day delivery and 24/7 showroom pickup at Bolfash Plaza.',
    abuja: 'Abuja central delivery in 24 to 48 hours.',
    nationwide: '1 to 3 business days by courier.',
    sundayNote: 'The showroom is open every day. Courier pickups may vary on Sundays.',
  },
  policies: {
    refunds: 'Refunds are handled case by case where a device is defective on arrival.',
    returns: [
      '7-day replacement for factory-defective brand-new units.',
      '90-day Directlines warranty on certified pre-owned devices.',
      'Serial or IMEI must match the invoice.',
    ],
    condition: 'Devices must be returned in the condition they were supplied.',
    lagosReturnHours: 24,
    outsideLagosReturnHours: 72,
  },
  seo: {
    title: 'Directlines Technologies & Telecoms Ltd | Phones in Karu, Abuja',
    description:
      'Buy Infinix, TECNO, Samsung, itel and Redmi phones in Karu, Abuja. Brand-new devices, EasyBuy financing, 24/7 showroom and nationwide delivery.',
    keywords: ['phones in Abuja', 'Infinix Abuja', 'Tecno Abuja', 'Samsung Abuja', 'itel Abuja', 'Redmi Abuja', 'phone store Karu', 'EasyBuy phones Abuja'],
  },
  socials: { twitter: 'https://x.com/directlinestech', instagram: '', facebook: '' },
  hero_eyebrow: 'Karu, Abuja. Open 24/7.',
  hero_title: 'Phones that fit your life. Prices that make sense.',
  hero_subtitle:
    'Brand-new Infinix, TECNO, Samsung, itel and Redmi devices with warranty, EasyBuy support and same-day delivery around Karu and Nyanya.',
  hero_image_url: null,
  easybuy_enabled: true,
  easybuy_down_payment_percent: 30,
  easybuy_tenures: [3, 4, 5, 6],
  repairs_enabled: true,
  analytics_enabled: true,
  consent_enabled: true,
  meta_pixel_id: null,
  meta_test_event_code: null,
  meta_domain_verification: null,
  meta_catalog_enabled: true,
};

export async function getSettings(): Promise<Settings> {
  const supabase = createPublicClient();
  const { data } = await supabase.from('settings').select('*').single();
  return (data as Settings | null) ?? DEFAULT_SETTINGS;
}

export async function getCategories(): Promise<Category[]> {
  const supabase = createPublicClient();
  const { data } = await supabase
    .from('categories')
    .select('id, name, slug, description, image_url, group_name, sort_order')
    .eq('is_active', true)
    .order('sort_order', { ascending: true });
  return data ?? [];
}

export async function getBrands(): Promise<Brand[]> {
  const supabase = createPublicClient();
  const { data } = await supabase
    .from('brands')
    .select('id, name, slug, logo_url, description')
    .eq('is_active', true)
    .order('sort_order', { ascending: true });
  return data ?? [];
}

export async function getProducts(): Promise<Product[]> {
  const supabase = createPublicClient();
  const { data, error } = await supabase
    .from('products')
    .select(PRODUCT_SELECT)
    .eq('is_active', true)
    .order('sort_order', { ascending: true })
    .order('created_at', { ascending: false });
  if (error || !data) return [];
  return (data as unknown as Product[]).map(normalizeProduct);
}

export async function getProductBySlug(slug: string): Promise<Product | null> {
  const supabase = createPublicClient();
  const { data, error } = await supabase
    .from('products')
    .select(PRODUCT_SELECT)
    .eq('slug', slug)
    .eq('is_active', true)
    .maybeSingle();
  if (error || !data) return null;
  return normalizeProduct(data as unknown as Product);
}

export async function getRelatedProducts(categorySlug: string | null, excludeId: string, limit = 4): Promise<Product[]> {
  const supabase = createPublicClient();
  let query = supabase
    .from('products')
    .select(PRODUCT_SELECT)
    .eq('is_active', true)
    .neq('id', excludeId)
    .limit(limit);

  if (categorySlug) {
    const { data: category } = await supabase
      .from('categories')
      .select('id')
      .eq('slug', categorySlug)
      .maybeSingle();
    if (category?.id) query = query.eq('category_id', category.id);
  }

  const { data, error } = await query;
  if (error || !data) return [];
  return (data as unknown as Product[]).map(normalizeProduct);
}

export async function getProductSitemapEntries(): Promise<Array<{ slug: string; updated_at: string }>> {
  const supabase = createPublicClient();
  const { data } = await supabase
    .from('products')
    .select('slug, updated_at')
    .eq('is_active', true);
  return (data ?? []) as Array<{ slug: string; updated_at: string }>;
}

export async function getTestimonials(): Promise<Testimonial[]> {
  const supabase = createPublicClient();
  const { data } = await supabase
    .from('testimonials')
    .select('id, quote, customer_name, location, image_url, sort_order')
    .eq('is_active', true)
    .order('sort_order', { ascending: true });
  return data ?? [];
}

export async function getApprovedReviews(productId?: string): Promise<Review[]> {
  const supabase = createPublicClient();
  let query = supabase
    .from('reviews')
    .select('id, product_id, customer_name, location, rating, title, body, created_at')
    .eq('is_approved', true)
    .order('created_at', { ascending: false });
  if (productId) query = query.eq('product_id', productId);
  const { data } = await query;
  return data ?? [];
}

export async function getBlogPosts(options: { kind?: 'blog' | 'area'; limit?: number; areaSlug?: string } = {}): Promise<BlogPost[]> {
  const supabase = createPublicClient();
  let query = supabase
    .from('blog_posts')
    .select('*')
    .eq('status', 'published')
    .lte('published_at', new Date().toISOString())
    .order('published_at', { ascending: false });
  if (options.kind) query = query.eq('kind', options.kind);
  if (options.areaSlug) query = query.eq('area_slug', options.areaSlug);
  if (options.limit) query = query.limit(options.limit);
  const { data } = await query;
  return (data ?? []) as BlogPost[];
}

export async function getBlogPostBySlug(slug: string): Promise<BlogPost | null> {
  const supabase = createPublicClient();
  const { data } = await supabase
    .from('blog_posts')
    .select('*')
    .eq('slug', slug)
    .eq('status', 'published')
    .lte('published_at', new Date().toISOString())
    .maybeSingle();
  return (data as BlogPost | null) ?? null;
}

export async function getBlogSitemapEntries(): Promise<Array<{ slug: string; updated_at: string }>> {
  const supabase = createPublicClient();
  const { data } = await supabase
    .from('blog_posts')
    .select('slug, updated_at')
    .eq('status', 'published');
  return (data ?? []) as Array<{ slug: string; updated_at: string }>;
}

export async function getAreas(): Promise<Area[]> {
  const supabase = createPublicClient();
  const { data } = await supabase
    .from('areas')
    .select('id, slug, name, intro, delivery_note, landmarks, faq, sort_order')
    .eq('is_active', true)
    .order('sort_order', { ascending: true });
  return (data ?? []) as Area[];
}

export async function getAreaBySlug(slug: string): Promise<Area | null> {
  const supabase = createPublicClient();
  const { data } = await supabase
    .from('areas')
    .select('id, slug, name, intro, delivery_note, landmarks, faq, sort_order')
    .eq('slug', slug)
    .eq('is_active', true)
    .maybeSingle();
  return (data as Area | null) ?? null;
}

