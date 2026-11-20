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
  secondaryButtonClass,
} from '@/components/admin/ui';
import { MediaUploader } from '@/components/admin/media-uploader';
import { FaqEditor } from '@/components/admin/faq-editor';
import { ConfirmButton } from '@/components/admin/confirm-button';
import { createPost, deletePost, updatePost } from '../../actions';

export const dynamic = 'force-dynamic';

export default async function AdminPostFormPage({
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

  const [postResult, productsResult, areasResult] = await Promise.all([
    isNew ? Promise.resolve({ data: null }) : admin.from('blog_posts').select('*').eq('id', id).maybeSingle(),
    admin.from('products').select('id, name, price').order('name'),
    admin.from('areas').select('slug, name').order('sort_order'),
  ]);
  const post = postResult.data as Record<string, any> | null;
  if (!isNew && !post) notFound();

  const publishedValue = post?.published_at
    ? new Date(post.published_at).toISOString().slice(0, 16)
    : '';

  return (
    <div>
      <PageHeader
        title={isNew ? 'New post' : post!.title}
        subtitle={isNew ? 'Write a guide or an area post.' : `Slug: /blog/${post!.slug}`}
        action={<Link href="/admin/blog" className="inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.12em] text-muted hover:text-ink"><ArrowLeft className="h-3.5 w-3.5" /> All posts</Link>}
      />
      <AdminBanner saved={query.saved === '1'} err={query.err ?? null} />

      <form action={isNew ? createPost : updatePost} className="grid gap-5 lg:grid-cols-[1.35fr_0.65fr] lg:items-start">
        {!isNew ? <input type="hidden" name="id" value={post!.id} /> : null}

        <div className="space-y-5">
          <section className={cardClass}>
            <div className="space-y-4">
              <div>
                <label className={labelClass}>Title *</label>
                <input name="title" required defaultValue={post?.title ?? ''} className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Slug (auto if blank)</label>
                <input name="slug" defaultValue={post?.slug ?? ''} className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Excerpt</label>
                <textarea name="excerpt" rows={3} defaultValue={post?.excerpt ?? ''} className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Content (Markdown) *</label>
                <textarea name="content" required rows={24} defaultValue={post?.content ?? ''} className={`${inputClass} font-mono text-xs leading-relaxed`} placeholder={'## Heading\n\nWrite the guide here.\n\n- bullet\n- bullet\n\n| Model | Price |\n| --- | --- |\n| Infinix Smart 20 | ₦165,000 |'} />
                <p className="mt-1 text-[10px] text-muted">Use Markdown headings, lists, links and tables. Keep claims factual and confirm prices.</p>
              </div>
            </div>
          </section>

          <section className={cardClass}>
            <h2 className="text-sm font-semibold text-ink">FAQ</h2>
            <div className="mt-4"><FaqEditor initial={post?.faq ?? []} /></div>
          </section>
        </div>

        <aside className="space-y-5">
          <section className={cardClass}>
            <div className="space-y-3">
              <div>
                <label className={labelClass}>Status</label>
                <select name="status" defaultValue={post?.status ?? 'draft'} className={inputClass}>
                  <option value="draft">Draft</option>
                  <option value="published">Published</option>
                  <option value="scheduled">Scheduled</option>
                </select>
              </div>
              <div>
                <label className={labelClass}>Publish date</label>
                <input name="published_at" type="datetime-local" defaultValue={publishedValue} className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Post type</label>
                <select name="kind" defaultValue={post?.kind ?? 'blog'} className={inputClass}>
                  <option value="blog">Blog</option>
                  <option value="area">Area post</option>
                </select>
              </div>
              <div>
                <label className={labelClass}>Area (for area posts)</label>
                <select name="area_slug" defaultValue={post?.area_slug ?? ''} className={inputClass}>
                  <option value="">None</option>
                  {(areasResult.data ?? []).map((area) => <option key={area.slug} value={area.slug}>{area.name}</option>)}
                </select>
              </div>
              <div>
                <label className={labelClass}>Category</label>
                <input name="category" defaultValue={post?.category ?? 'Buying guide'} className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Tags (comma separated)</label>
                <input name="tags" defaultValue={(post?.tags ?? []).join(', ')} className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Author</label>
                <input name="author" defaultValue={post?.author ?? 'Directlines Team'} className={inputClass} />
              </div>
            </div>
          </section>

          <section className={cardClass}>
            <h2 className="text-sm font-semibold text-ink">Cover image</h2>
            {post?.cover_url ? <img src={siteMediaUrl(post.cover_url)} alt="" className="mt-3 aspect-video w-full rounded-xl border border-line object-cover" /> : null}
            <input type="hidden" name="cover_url" value={post?.cover_url ?? ''} />
            <div className="mt-4"><MediaUploader folder="blog" fieldName="uploaded_image" multiple={false} hint="Landscape image works best. Optional." /></div>
          </section>

          <section className={cardClass}>
            <h2 className="text-sm font-semibold text-ink">Search appearance</h2>
            <div className="mt-3 space-y-3">
              <div>
                <label className={labelClass}>SEO title</label>
                <input name="seo_title" defaultValue={post?.seo_title ?? ''} className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>SEO description</label>
                <textarea name="seo_description" rows={3} defaultValue={post?.seo_description ?? ''} className={inputClass} />
              </div>
            </div>
          </section>

          <section className={cardClass}>
            <h2 className="text-sm font-semibold text-ink">Related products</h2>
            <div className="mt-3 max-h-64 space-y-1.5 overflow-y-auto pr-1 custom-scrollbar">
              {(productsResult.data ?? []).map((product) => (
                <label key={product.id} className="flex items-center gap-2 rounded-lg px-2 py-1.5 text-[11px] text-ink-soft hover:bg-paper">
                  <input type="checkbox" name="related_product_ids" value={product.id} defaultChecked={(post?.related_product_ids ?? []).includes(product.id)} className="accent-[#dc2626]" />
                  {product.name}
                </label>
              ))}
            </div>
          </section>

          <button type="submit" className={`${buttonClass} w-full`}>
            <Save className="h-4 w-4" /> {isNew ? 'Create post' : 'Save post'}
          </button>
          {!isNew ? (
            <Link href={`/blog/${post!.slug}`} target="_blank" className={`${secondaryButtonClass} w-full`}>View post</Link>
          ) : null}
        </aside>
      </form>

      {!isNew ? (
        <form action={deletePost} className="mt-8 border-t border-line pt-6">
          <input type="hidden" name="id" value={post!.id} />
          <ConfirmButton className={dangerButtonClass} message={`Delete "${post!.title}"? This cannot be undone.`}>
            <Trash2 className="h-4 w-4" /> Delete post
          </ConfirmButton>
        </form>
      ) : null}
    </div>
  );
}

