import type { Metadata } from 'next';
import Link from 'next/link';
import { BatteryCharging, CheckCircle2, Clock, Cpu, Smartphone, Wrench } from 'lucide-react';
import { RepairForm } from '@/components/store/repair-form';

export const metadata: Metadata = {
  title: 'Phone repair in Karu, Abuja',
  description:
    'Book a phone diagnostic at Directlines in Karu, Abuja. Screens, batteries, charging ports and board-level checks. 24/7 drop-off.',
  alternates: { canonical: '/repairs' },
};

const services = [
  { icon: Smartphone, title: 'Screen and glass', text: 'Cracked glass, dead touch, lines or a blank display.' },
  { icon: BatteryCharging, title: 'Battery and charging', text: 'Fast drain, swollen battery or a charging port that will not hold.' },
  { icon: Cpu, title: 'Board-level checks', text: 'Power faults and liquid damage that need bench diagnostics.' },
  { icon: Wrench, title: 'Software and setup', text: 'Setup, transfer, account issues and general troubleshooting.' },
];

const faqs = [
  {
    question: 'Do you quote before repairing?',
    answer:
      'Yes. We inspect the device first and confirm the fault, part and price before any repair starts. We do not give blind quotes over the phone for board-level faults.',
  },
  {
    question: 'Where is the repair desk?',
    answer:
      'The desk is inside Directlines at Bolfash Plaza, House 12, Road K-N, Phase 1, Karu Housing Estate, opposite De Classic Hotel, Nyanya Jikwoyi Expressway. It is open 24/7.',
  },
  {
    question: 'How long does a screen replacement take?',
    answer:
      'That depends on the model and part availability. The team confirms the timeline after seeing the device. Do not assume a same-day repair until it is confirmed on WhatsApp.',
  },
];

export default function RepairsPage() {
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
        <span className="text-ink">Repairs</span>
      </nav>

      <div className="mt-6 grid gap-10 lg:grid-cols-[1fr_0.85fr] lg:gap-16">
        <div>
          <p className="eyebrow text-signal">Repairs and diagnostics</p>
          <h1 className="mt-3 max-w-2xl text-4xl font-semibold leading-tight text-ink sm:text-5xl">
            Fix the phone before you replace it.
          </h1>
          <p className="mt-5 max-w-xl text-sm leading-relaxed text-muted sm:text-base">
            A cracked screen, weak battery or charging fault does not always mean a new phone. Bring the
            device to the Karu showroom or send us the details. We diagnose first, then quote.
          </p>

          <div className="mt-7 grid gap-3 sm:grid-cols-2">
            {services.map((service) => (
              <div key={service.title} className="rounded-2xl border border-line bg-white p-5">
                <service.icon className="h-4 w-4 text-signal" />
                <p className="mt-3 text-sm font-semibold text-ink">{service.title}</p>
                <p className="mt-1.5 text-xs leading-relaxed text-muted">{service.text}</p>
              </div>
            ))}
          </div>

          <div className="mt-6 rounded-2xl border border-line bg-white p-5">
            <div className="flex items-start gap-3">
              <Clock className="mt-0.5 h-5 w-5 shrink-0 text-signal" />
              <div>
                <p className="text-sm font-semibold text-ink">24/7 drop-off</p>
                <p className="mt-1 text-xs leading-relaxed text-muted">
                  Drop the device at Bolfash Plaza any time. Ask for a repair intake note so the device and
                  fault are recorded before it goes to the bench.
                </p>
              </div>
            </div>
          </div>

          <div className="mt-8">
            <h2 className="text-xl font-semibold text-ink">Repair questions</h2>
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
          <RepairForm />
          <div className="mt-4 rounded-2xl border border-line bg-paper-deep p-5">
            <p className="text-xs font-semibold text-ink">Before you drop off</p>
            <ul className="mt-3 space-y-2 text-[11px] leading-relaxed text-muted">
              {['Back up what you can.', 'Bring the charger if the fault is charging-related.', 'Remove SIM and memory cards if you can.', 'Ask for the intake note.'].map((item) => (
                <li key={item} className="flex gap-2">
                  <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-signal" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
