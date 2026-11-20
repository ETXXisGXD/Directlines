import { Trash2 } from 'lucide-react';
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
  secondaryButtonClass,
} from '@/components/admin/ui';
import { MediaUploader } from '@/components/admin/media-uploader';
import { ConfirmButton } from '@/components/admin/confirm-button';
import { createCategory, deleteCategory, updateCategory } from '../actions';

export const dynamic = 'force-dynamic';

export default async function AdminCategoriesPage({
  searchParams,
}: {
  searchParams: Promise<{ saved?: string; err?: string }>;
}) {
  const params = await searchParams;
  const admin = createAdminClient();
  const [categoriesResult, productsResult] = await Promise.all([
    admin.from('categories').select('*').order('group_name').order('sort_order'),
    admin.from('products').select('category_id'),
  ]);
  const categories = categoriesResult.data ?? [];
  const counts = new Map<string, number>();
  for (const product of productsResult.data ?? []) {
    counts.set(product.category_id, (counts.get(product.category_id) ?? 0) + 1);
  }

  return (
    <div>
      <PageHeader
        title="Categories"
        subtitle="Phones, accessories and other stock. Faith can add categories and upload a cover image, then add products to them."
      />
      <AdminBanner saved={params.saved === '1'} err={params.err ?? null} />

      <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
        <div className="space-y-5">
          {['Phones', 'Accessories', 'Other'].map((group) => {
            const items = categories.filter((category) => (category.group_name || 'Phones') === group);
            return (
              <section key={group} className={cardClass}>
                <div className="flex items-center justify-between gap-3">
                  <h2 className="text-sm font-semibold text-ink">{group}</h2>
                  <span className="text-[10px] font-bold uppercase tracking-[0.12em] text-muted">{items.length} categories</span>
                </div>
                <div className="mt-4 space-y-3">
                  {items.map((category) => (
                    <div key={category.id} className="rounded-xl border border-line bg-paper p-4">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex min-w-0 items-center gap-3">
                          <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-lg border border-line bg-white">
                            {category.image_url ? <img src={siteMediaUrl(category.image_url)} alt="" className="h-full w-full object-cover" /> : null}
                          </div>
                          <div className="min-w-0">
                            <p className="truncate text-xs font-semibold text-ink">{category.name}</p>
                            <p className="mt-0.5 text-[10px] text-muted">/{category.slug} · {counts.get(category.id) ?? 0} products · {category.is_active ? 'live' : 'hidden'}</p>
                          </div>
                        </div>
                        <form action={deleteCategory}>
                          <input type="hidden" name="id" value={category.id} />
                          <ConfirmButton className={dangerButtonClass} message={`Delete "${category.name}"?`}><Trash2 className="h-3.5 w-3.5" /></ConfirmButton>
                        </form>
                      </div>

                      <form action={updateCategory} className="mt-4 grid gap-3 border-t border-line pt-4 sm:grid-cols-2">
                        <input type="hidden" name="id" value={category.id} />
                        <input type="hidden" name="image_url" value={category.image_url ?? ''} />
                        <div>
                          <label className={labelClass}>Name</label>
                          <input name="name" defaultValue={category.name} className={inputClass} />
                        </div>
                        <div>
                          <label className={labelClass}>Slug</label>
                          <input name="slug" defaultValue={category.slug} className={inputClass} />
                        </div>
                        <div>
                          <label className={labelClass}>Group</label>
                          <select name="group_name" defaultValue={category.group_name || 'Phones'} className={inputClass}>
                            <option value="Phones">Phones</option>
                            <option value="Accessories">Accessories</option>
                            <option value="Other">Other</option>
                          </select>
                        </div>
                        <div>
                          <label className={labelClass}>Sort order</label>
                          <input name="sort_order" defaultValue={category.sort_order} inputMode="numeric" className={inputClass} />
                        </div>
                        <div className="sm:col-span-2">
                          <label className={labelClass}>Description</label>
                          <textarea name="description" rows={2} defaultValue={category.description ?? ''} className={inputClass} />
                        </div>
                        <div className="sm:col-span-2">
                          <MediaUploader folder="categories" fieldName="uploaded_image" multiple={false} hint="Optional category cover image." />
                        </div>
                        <label className="flex items-center gap-2 text-xs font-semibold text-ink sm:col-span-2">
                          <input type="checkbox" name="is_active" defaultChecked={category.is_active} className="accent-[#dc2626]" /> Live on storefront
                        </label>
                        <div className="sm:col-span-2">
                          <button type="submit" className={secondaryButtonClass}>Save category</button>
                        </div>
                      </form>
                    </div>
                  ))}
                  {!items.length ? <p className="text-xs text-muted">No categories in this group yet.</p> : null}
                </div>
              </section>
            );
          })}
        </div>

        <aside className={cardClass}>
          <p className="text-sm font-semibold text-ink">Add a category</p>
          <form action={createCategory} className="mt-4 space-y-3">
            <div><label className={labelClass}>Name</label><input name="name" required className={inputClass} placeholder="Power Banks" /></div>
            <div><label className={labelClass}>Slug</label><input name="slug" className={inputClass} placeholder="power-banks" /></div>
            <div>
              <label className={labelClass}>Group</label>
              <select name="group_name" className={inputClass}>
                <option value="Phones">Phones</option>
                <option value="Accessories">Accessories</option>
                <option value="Other">Other</option>
              </select>
            </div>
            <div><label className={labelClass}>Sort order</label><input name="sort_order" inputMode="numeric" defaultValue={99} className={inputClass} /></div>
            <div><label className={labelClass}>Description</label><textarea name="description" rows={2} className={inputClass} /></div>
            <MediaUploader folder="categories" fieldName="uploaded_image" multiple={false} hint="Optional cover image." />
            <label className="flex items-center gap-2 text-xs font-semibold text-ink"><input type="checkbox" name="is_active" defaultChecked className="accent-[#dc2626]" /> Live on storefront</label>
            <button type="submit" className={`${buttonClass} w-full`}>Add category</button>
          </form>
        </aside>
      </div>
    </div>
  );
}
