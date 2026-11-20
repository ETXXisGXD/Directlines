import Link from 'next/link';
import { Plus } from 'lucide-react';
import { createAdminClient } from '@/lib/supabase/admin';
import { formatDate } from '@/lib/format';
import { AdminBanner, PageHeader, StatusPill, buttonClass, cardClass, secondaryButtonClass } from '@/components/admin/ui';

export const dynamic = 'force-dynamic';

export default async function AdminBlogPage({
  searchParams,
}: {
  searchParams: Promise<{ saved?: string; err?: string; kind?: string; status?: string }>;
}) {
  const params = await searchParams;
  const admin = createAdminClient();
  let query = admin.from('blog_posts').select('id, title, slug, category, kind, status, published_at, updated_at').order('updated_at', { ascending: false }).limit(300);
  if (params.kind) query = query.eq('kind', params.kind);
  if (params.status) query = query.eq('status', params.status);
  const { data } = await query;
  const posts = data ?? [];

  return (
    <div>
      <PageHeader
        title="Blog"
        subtitle={`${posts.length} posts shown. Blog posts and area posts.`}
        action={<Link href="/admin/blog/new" className={buttonClass}><Plus className="h-4 w-4" /> New post</Link>}
      />
      <AdminBanner saved={params.saved === '1'} err={params.err ?? null} />

      <div className="mb-4 flex flex-wrap gap-2">
        {[
          ['', 'All'],
          ['blog', 'Blog'],
          ['area', 'Area posts'],
        ].map(([value, label]) => (
          <a key={value || 'all'} href={value ? `/admin/blog?kind=${value}` : '/admin/blog'} className={`rounded-full border px-3.5 py-1.5 text-[10px] font-bold uppercase tracking-[0.12em] ${params.kind === value || (!params.kind && !value) ? 'border-ink bg-ink text-white' : 'border-line bg-white text-muted hover:border-ink hover:text-ink'}`}>
            {label}
          </a>
        ))}
        <span className="mx-1 h-5 w-px bg-line" />
        {['', 'published', 'draft', 'scheduled'].map((status) => (
          <a key={status || 'any'} href={status ? `/admin/blog?status=${status}${params.kind ? `&kind=${params.kind}` : ''}` : '/admin/blog'} className={`rounded-full border px-3.5 py-1.5 text-[10px] font-bold uppercase tracking-[0.12em] ${params.status === status || (!params.status && !status) ? 'border-ink bg-ink text-white' : 'border-line bg-white text-muted hover:border-ink hover:text-ink'}`}>
            {status || 'Any status'}
          </a>
        ))}
      </div>

      <div className={cardClass + ' overflow-hidden !p-0'}>
        <div className="divide-y divide-line">
          {posts.map((post) => (
            <Link key={post.id} href={`/admin/blog/${post.id}`} className="flex flex-col gap-2 px-5 py-4 hover:bg-paper sm:flex-row sm:items-center sm:justify-between">
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-ink">{post.title}</p>
                <p className="mt-0.5 text-[10px] text-muted">{post.category} · /blog/{post.slug}</p>
              </div>
              <div className="flex shrink-0 items-center gap-2">
                <span className="rounded-full bg-paper-deep px-2.5 py-1 text-[8px] font-bold uppercase tracking-[0.1em] text-muted">{post.kind}</span>
                <StatusPill status={post.status} />
                <span className="text-[10px] text-muted">{formatDate(post.published_at ?? post.updated_at)}</span>
              </div>
            </Link>
          ))}
        </div>
        {!posts.length ? <p className="p-8 text-center text-sm text-muted">No posts yet.</p> : null}
      </div>
    </div>
  );
}
