import { Star, Trash2 } from 'lucide-react';
import { createAdminClient } from '@/lib/supabase/admin';
import { formatDate } from '@/lib/format';
import { siteMediaUrl } from '@/lib/storage';
import {
  AdminBanner,
  PageHeader,
  StatusPill,
  buttonClass,
  cardClass,
  inputClass,
  labelClass,
  secondaryButtonClass,
  dangerButtonClass,
} from '@/components/admin/ui';
import { MediaUploader } from '@/components/admin/media-uploader';
import {
  approveReview,
  createTestimonial,
  deleteReview,
  deleteTestimonial,
  toggleTestimonial,
} from '../actions';

export const dynamic = 'force-dynamic';

export default async function AdminReviewsPage({
  searchParams,
}: {
  searchParams: Promise<{ saved?: string; err?: string }>;
}) {
  const params = await searchParams;
  const admin = createAdminClient();
  const [reviewsResult, testimonialsResult] = await Promise.all([
    admin.from('reviews').select('*, products(name)').order('created_at', { ascending: false }).limit(100),
    admin.from('testimonials').select('*').order('sort_order').order('created_at', { ascending: false }),
  ]);
  const reviews = reviewsResult.data ?? [];
  const testimonials = testimonialsResult.data ?? [];

  return (
    <div>
      <PageHeader title="Reviews and testimonials" subtitle="Approve real customer reviews and manage the quotes shown on the homepage." />
      <AdminBanner saved={params.saved === '1'} err={params.err ?? null} />

      <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <section>
          <h2 className="mb-3 text-sm font-semibold text-ink">Product reviews</h2>
          <div className="space-y-3">
            {reviews.map((review) => (
              <div key={review.id} className={cardClass}>
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="text-xs font-semibold text-ink">{review.customer_name}</p>
                      <span className="inline-flex items-center gap-0.5 text-signal"><Star className="h-3 w-3 fill-current" /> {review.rating}</span>
                      <StatusPill status={review.is_approved ? 'published' : 'draft'} />
                    </div>
                    <p className="mt-1 text-[10px] text-muted">{review.products ? (review.products as unknown as { name: string }).name : 'Store review'} · {formatDate(review.created_at)}</p>
                  </div>
                  <div className="flex gap-1.5">
                    <form action={approveReview}>
                      <input type="hidden" name="id" value={review.id} />
                      <input type="hidden" name="approve" value={String(review.is_approved)} />
                      <button type="submit" className={secondaryButtonClass}>{review.is_approved ? 'Unpublish' : 'Approve'}</button>
                    </form>
                    <form action={deleteReview}>
                      <input type="hidden" name="id" value={review.id} />
                      <button type="submit" className={dangerButtonClass} aria-label="Delete review"><Trash2 className="h-3.5 w-3.5" /></button>
                    </form>
                  </div>
                </div>
                {review.title ? <p className="mt-3 text-xs font-semibold text-ink">{review.title}</p> : null}
                <p className="mt-1.5 text-xs leading-relaxed text-muted">{review.body}</p>
              </div>
            ))}
            {!reviews.length ? <div className={cardClass}><p className="text-sm text-muted">No reviews yet. Customer reviews can be added from the database or a review form in a future update.</p></div> : null}
          </div>
        </section>

        <section>
          <h2 className="mb-3 text-sm font-semibold text-ink">Homepage testimonials</h2>
          <div className={cardClass}>
            <form action={createTestimonial} className="space-y-3">
              <div>
                <label className={labelClass}>Quote *</label>
                <textarea name="quote" required rows={3} className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Customer name *</label>
                <input name="customer_name" required className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Location</label>
                <input name="location" className={inputClass} placeholder="Karu, Abuja" />
              </div>
              <div>
                <label className={labelClass}>Sort order</label>
                <input name="sort_order" inputMode="numeric" defaultValue={0} className={inputClass} />
              </div>
              <MediaUploader folder="testimonials" fieldName="uploaded_image" multiple={false} hint="Optional screenshot. Use a real customer message with permission." />
              <button type="submit" className={`${buttonClass} w-full`}>Add testimonial</button>
            </form>
          </div>

          <div className="mt-4 space-y-3">
            {testimonials.map((testimonial) => (
              <div key={testimonial.id} className={cardClass}>
                <p className="text-xs leading-relaxed text-muted">&ldquo;{testimonial.quote}&rdquo;</p>
                <div className="mt-3 flex items-center justify-between gap-2">
                  <div>
                    <p className="text-[10px] font-semibold text-ink">{testimonial.customer_name}</p>
                    <p className="text-[9px] text-muted">{testimonial.location ?? ''}</p>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <form action={toggleTestimonial}>
                      <input type="hidden" name="id" value={testimonial.id} />
                      <input type="hidden" name="active" value={String(testimonial.is_active)} />
                      <button type="submit" className={secondaryButtonClass}>{testimonial.is_active ? 'Hide' : 'Show'}</button>
                    </form>
                    <form action={deleteTestimonial}>
                      <input type="hidden" name="id" value={testimonial.id} />
                      <button type="submit" className={dangerButtonClass} aria-label="Delete testimonial"><Trash2 className="h-3.5 w-3.5" /></button>
                    </form>
                  </div>
                </div>
                {testimonial.image_url ? <img src={siteMediaUrl(testimonial.image_url)} alt="" className="mt-3 max-h-40 rounded-lg border border-line object-contain" /> : null}
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
