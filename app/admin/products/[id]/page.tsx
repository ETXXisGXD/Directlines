import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft, Save, Trash2 } from 'lucide-react';
import { createAdminClient } from '@/lib/supabase/admin';
import { siteMediaUrl } from '@/lib/storage';
import {
  AdminBanner,
  PageHeader,
  buttonClass,
  cardClass,
  dangerButtonClass,
  inputClass,
  labelClass,
} from '@/components/admin/ui';
import { MediaUploader } from '@/components/admin/media-uploader';
import { VariantsEditor } from '@/components/admin/variants-editor';
import { ConfirmButton } from '@/components/admin/confirm-button';
import { createProduct, deleteProduct, updateProduct } from '../../actions';

export const dynamic = 'force-dynamic';

export default async function AdminProductFormPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ saved?: string; err?: string }>;
}) {
  const { id } = await params;
  const query = await searchParams;
  const isNew = id === 'new';
  const admin = createAdminClient();

  const [brandsResult, categoriesResult, productResult] = await Promise.all([
    admin.from('brands').select('id, name').order('sort_order'),
    admin.from('categories').select('id, name').order('sort_order'),
    isNew
      ? Promise.resolve({ data: null })
      : admin.from('products').select('*, product_images(*), product_variants(*)').eq('id', id).maybeSingle(),
  ]);

  const product = productResult.data as Record<string, any> | null;
  if (!isNew && !product) notFound();

  const images = [...(product?.product_images ?? [])].sort((a, b) => a.sort_order - b.sort_order);
  const variantRows = (product?.product_variants ?? []).map((variant: Record<string, unknown>) => ({
    id: variant.id as string,
    label: String(variant.label ?? ''),
    color: String(variant.color ?? ''),
    price: String(variant.price ?? ''),
    stock: variant.stock === null || variant.stock === undefined ? '' : String(variant.stock),
    sku: String(variant.sku ?? ''),
  }));

  return (
    <div>
      <PageHeader
        title={isNew ? 'New product' : product!.name}
        subtitle={isNew ? 'Add a phone to the catalogue.' : `Slug: /product/${product!.slug}`}
        action={
          <Link href="/admin/products" className="inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.12em] text-muted hover:text-ink">
            <ArrowLeft className="h-3.5 w-3.5" /> All products
          </Link>
        }
      />
      <AdminBanner saved={query.saved === '1'} err={query.err ?? null} />

      <form action={isNew ? createProduct : updateProduct} className="space-y-5">
        {!isNew ? <input type="hidden" name="id" value={product!.id} /> : null}

        <section className={cardClass}>
          <h2 className="text-sm font-semibold text-ink">Basics</h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label className={labelClass}>Name *</label>
              <input name="name" required defaultValue={product?.name ?? ''} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Slug (auto if blank)</label>
              <input name="slug" defaultValue={product?.slug ?? ''} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Short description</label>
              <input name="short_description" defaultValue={product?.short_description ?? ''} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Brand</label>
              <select name="brand_id" defaultValue={product?.brand_id ?? ''} className={inputClass}>
                <option value="">No brand</option>
                {(brandsResult.data ?? []).map((brand) => <option key={brand.id} value={brand.id}>{brand.name}</option>)}
              </select>
            </div>
            <div>
              <label className={labelClass}>Category</label>
              <select name="category_id" defaultValue={product?.category_id ?? ''} className={inputClass}>
                <option value="">No category</option>
                {(categoriesResult.data ?? []).map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}
              </select>
            </div>
            <div>
              <label className={labelClass}>Condition</label>
              <select name="condition" defaultValue={product?.condition ?? 'brand_new'} className={inputClass}>
                <option value="brand_new">Brand new</option>
                <option value="uk_used">UK used</option>
                <option value="refurbished">Certified refurbished</option>
                <option value="open_box">Open box</option>
              </select>
            </div>
            <div>
              <label className={labelClass}>Warranty text</label>
              <input name="warranty" defaultValue={product?.warranty ?? 'Manufacturer warranty support'} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Base price (₦) *</label>
              <input name="price" required inputMode="numeric" defaultValue={product?.price ?? ''} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Original price (₦)</label>
              <input name="original_price" inputMode="numeric" defaultValue={product?.original_price ?? ''} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Cost price (₦, private)</label>
              <input name="cost_price" inputMode="numeric" defaultValue={product?.cost_price ?? ''} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Badge</label>
              <input name="badge" defaultValue={product?.badge ?? ''} className={inputClass} placeholder="NEW, HOT DEAL..." />
            </div>
            <div>
              <label className={labelClass}>Sort order</label>
              <input name="sort_order" inputMode="numeric" defaultValue={product?.sort_order ?? 99} className={inputClass} />
            </div>
            <div className="sm:col-span-2">
              <label className={labelClass}>Tags (comma separated)</label>
              <input name="tags" defaultValue={(product?.tags ?? []).join(', ')} className={inputClass} placeholder="Infinix, 5G, camera phone" />
            </div>
          </div>

          <div className="mt-5 flex flex-wrap gap-5">
            <label className="inline-flex items-center gap-2 text-xs text-ink-soft"><input type="checkbox" name="is_active" defaultChecked={product ? product.is_active : true} className="accent-[#dc2626]" /> Live on storefront</label>
            <label className="inline-flex items-center gap-2 text-xs text-ink-soft"><input type="checkbox" name="is_featured" defaultChecked={product?.is_featured ?? false} className="accent-[#dc2626]" /> Featured</label>
            <label className="inline-flex items-center gap-2 text-xs text-ink-soft"><input type="checkbox" name="is_new_arrival" defaultChecked={product?.is_new_arrival ?? false} className="accent-[#dc2626]" /> New arrival</label>
            <label className="inline-flex items-center gap-2 text-xs text-ink-soft"><input type="checkbox" name="easybuy_eligible" defaultChecked={product?.easybuy_eligible ?? true} className="accent-[#dc2626]" /> EasyBuy eligible</label>
          </div>
        </section>

        <section className={cardClass}>
          <h2 className="text-sm font-semibold text-ink">Details</h2>
          <div className="mt-4 space-y-4">
            <div>
              <label className={labelClass}>Description</label>
              <textarea name="description" rows={5} defaultValue={product?.description ?? ''} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Highlights (one per line)</label>
              <textarea name="highlights" rows={4} defaultValue={(product?.highlights ?? []).join('\n')} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Specs (JSON)</label>
              <textarea name="specs" rows={5} defaultValue={JSON.stringify(product?.specs ?? {}, null, 2)} className={`${inputClass} font-mono text-xs`} />
              <p className="mt-1 text-[10px] text-muted">Example: {'{"ram":"4GB","storage":"128GB","battery":"6000mAh"}'}. Only add facts you can verify.</p>
            </div>
          </div>
        </section>

        <section className={cardClass}>
          <h2 className="text-sm font-semibold text-ink">Photos</h2>
          {images.length ? (
            <div className="mt-4 grid grid-cols-3 gap-3 sm:grid-cols-5">
              {images.map((image) => (
                <label key={image.id} className="group relative cursor-pointer overflow-hidden rounded-xl border border-line">
                  <img src={siteMediaUrl(image.url)} alt={image.alt ?? ''} className="aspect-square w-full object-contain p-2" />
                  <span className="absolute inset-x-0 bottom-0 bg-black/65 py-1 text-center text-[9px] font-bold uppercase tracking-[0.1em] text-white opacity-0 group-has-[:checked]:opacity-100">Remove</span>
                  <input type="checkbox" name="remove_image" value={image.id} className="absolute left-2 top-2 accent-red-500" />
                </label>
              ))}
            </div>
          ) : (
            <p className="mt-3 text-xs text-muted">No photos yet. Add official product images below.</p>
          )}
          <div className="mt-5">
            <MediaUploader folder={`products/${product?.slug ?? 'new'}`} hint="Official product image, white background preferred. Compressed and uploaded immediately." />
          </div>
        </section>

        <section className={cardClass}>
          <h2 className="text-sm font-semibold text-ink">Options and stock</h2>
          <p className="mt-1 text-[11px] text-muted">Each option is a storage/RAM combination or a single standard option. Price here overrides the base price.</p>
          <div className="mt-4">
            <VariantsEditor initial={variantRows} defaultPrice={Number(product?.price ?? 0)} />
          </div>
        </section>

        <section className={cardClass}>
          <h2 className="text-sm font-semibold text-ink">Search appearance</h2>
          <div className="mt-4 space-y-4">
            <div>
              <label className={labelClass}>SEO title</label>
              <input name="seo_title" defaultValue={product?.seo_title ?? ''} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>SEO description</label>
              <textarea name="seo_description" rows={2} defaultValue={product?.seo_description ?? ''} className={inputClass} />
            </div>
          </div>
        </section>

        <button type="submit" className={buttonClass}>
          <Save className="h-4 w-4" /> {isNew ? 'Create product' : 'Save changes'}
        </button>
      </form>

      {!isNew ? (
        <form action={deleteProduct} className="mt-8 border-t border-line pt-6">
          <input type="hidden" name="id" value={product!.id} />
          <ConfirmButton className={dangerButtonClass} message={`Delete "${product!.name}"? Photos and options will also be removed.`}>
            <Trash2 className="h-4 w-4" /> Delete product
          </ConfirmButton>
        </form>
      ) : null}
    </div>
  );
}

