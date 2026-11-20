import { BadgeCheck, Clock, ShieldCheck, Truck, Zap } from 'lucide-react';

const items = [
  { icon: BadgeCheck, title: 'CAC certified', text: 'A registered telecoms vendor' },
  { icon: ShieldCheck, title: 'Warranty support', text: 'Manufacturer warranty on new devices' },
  { icon: Zap, title: 'EasyBuy', text: 'Apply with two guarantors' },
  { icon: Clock, title: 'Open 24/7', text: 'Karu showroom, every day' },
  { icon: Truck, title: 'Same-day Karu', text: 'Delivery around Karu and Nyanya' },
];

export function TrustStrip() {
  return (
    <section className="border-y border-line bg-white">
      <div className="container-page grid grid-cols-2 gap-x-6 gap-y-6 py-7 md:grid-cols-5 md:py-8">
        {items.map((item) => (
          <div key={item.title} className="flex items-start gap-2.5">
            <item.icon className="mt-0.5 h-4 w-4 shrink-0 text-signal" />
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-ink">{item.title}</p>
              <p className="mt-0.5 text-[10px] leading-relaxed text-muted">{item.text}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
