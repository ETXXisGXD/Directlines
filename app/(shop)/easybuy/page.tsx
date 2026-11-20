import type { Metadata } from 'next';
import Link from 'next/link';
import { CheckCircle2, MessageCircle, ShieldCheck, Zap } from 'lucide-react';
import { getProducts, getSettings } from '@/lib/queries';
import { EasyBuyForm } from '@/components/store/easybuy-form';
import { createWhatsAppUrl } from '@/lib/whatsapp';

export const metadata: Metadata = {
  title: 'EasyBuy phone financing in Abuja',
  description:
    'Apply for EasyBuy at Directlines in Karu, Abuja. Full name, phone number, target phone model and two guarantors. Submit and continue on WhatsApp.',
  alternates: { canonical: '/easybuy' },
};

const faqs = [
  {
    question: 'What details do I need to apply for EasyBuy?',
    answer:
      'You need your full name, your phone number, the phone model you want, and two guarantors’ phone numbers. The form on this page collects exactly those five fields.',
  },
  {
    question: 'Does submitting this form approve me?',
    answer:
      'No. The form is an application. The EasyBuy team reviews it and confirms the deposit, monthly amount and eligibility with you on WhatsApp.',
  },
  {
    question: 'How much is the down payment?',
    answer:
      'The illustration on this page uses 30% down, but the final amount is set by the EasyBuy provider after review. Confirm it on WhatsApp before you commit.',
  },
  {
    question: 'Can I apply if I live outside Abuja?',
    answer:
      'Yes, you can submit the form. The team will confirm whether your location and delivery option are supported before approval.',
  },
];

export default async function EasyBuyPage({
  searchParams,
}: {
  searchParams: Promise<{ model?: string; product?: string }>;
}) {
  const [settings, products, params] = await Promise.all([getSettings(), getProducts(), searchParams]);

  return (
    <div className="container-page py-10 sm:py-14">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'FAQPage',
            mainEntity: faqs.map((faq) => ({
              '@type': 'Question',
              name: faq.question,
              acceptedAnswer: { '@type': 'Answer', text: faq.answer },
            })),
          }),
        }}
      />

      <nav className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.14em] text-muted" aria-label="Breadcrumb">
        <Link href="/" className="hover:text-ink">Home</Link>
        <span>/</span>
        <span className="text-ink">EasyBuy</span>
      </nav>

      <div className="mt-6 grid gap-10 lg:grid-cols-[1fr_0.85fr] lg:gap-16">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full border border-signal/20 bg-signal-soft px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.14em] text-signal">
            <Zap className="h-3 w-3" />
            EasyBuy at Directlines
          </div>
          <h1 className="mt-5 max-w-2xl text-4xl font-semibold leading-tight text-ink sm:text-5xl">
            Get the phone now. Pay small-small.
          </h1>
          <p className="mt-5 max-w-xl text-sm leading-relaxed text-muted sm:text-base">
            EasyBuy lets eligible customers take a phone home after a down payment and pay the balance over
            an agreed period. Apply here with two guarantors, then finish the conversation on WhatsApp.
          </p>

          <div className="mt-7 grid gap-3 sm:grid-cols-2">
            {[
              'Full name',
              'Phone number',
              'Target phone model',
              'Two guarantors’ phone numbers',
            ].map((item) => (
              <div key={item} className="flex items-center gap-2 rounded-xl border border-line bg-white px-4 py-3 text-xs font-semibold text-ink">
                <CheckCircle2 className="h-4 w-4 shrink-0 text-signal" />
                {item}
              </div>
            ))}
          </div>

          <div className="mt-8 rounded-2xl border border-line bg-white p-5">
            <div className="flex items-start gap-3">
              <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-signal" />
              <div>
                <p className="text-sm font-semibold text-ink">What happens after you apply</p>
                <ol className="mt-2 space-y-1.5 text-xs leading-relaxed text-muted">
                  <li>1. We save your application and open WhatsApp with the five details.</li>
                  <li>2. The EasyBuy team reviews your details and may ask for more information.</li>
                  <li>3. If approved, you agree the deposit and monthly amount in writing.</li>
                  <li>4. You pay the deposit and arrange pickup or delivery.</li>
                </ol>
              </div>
            </div>
          </div>

          <div className="mt-5 flex flex-wrap gap-3">
            <a
              href={createWhatsAppUrl(settings.easybuy_whatsapp, 'Hello EasyBuy team. I have a question about a phone application.')}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-secondary"
            >
              <MessageCircle className="h-4 w-4" />
              EasyBuy WhatsApp
            </a>
            <Link href="/shop" className="btn-ghost">See phone prices</Link>
          </div>

          <div className="mt-10">
            <h2 className="text-xl font-semibold text-ink">EasyBuy questions</h2>
            <div className="mt-4 divide-y divide-line rounded-2xl border border-line bg-white">
              {faqs.map((faq) => (
                <details key={faq.question} className="group p-5">
                  <summary className="cursor-pointer list-none text-sm font-semibold text-ink">
                    {faq.question}
                    <span className="float-right text-muted group-open:rotate-45">+</span>
                  </summary>
                  <p className="mt-2 text-xs leading-relaxed text-muted">{faq.answer}</p>
                </details>
              ))}
            </div>
          </div>
        </div>

        <div className="lg:sticky lg:top-28">
          <EasyBuyForm
            settings={settings}
            products={products}
            initialModel={params.model}
            initialProduct={params.product}
          />
        </div>
      </div>
    </div>
  );
}
