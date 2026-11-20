import { getAreas, getSettings } from '@/lib/queries';
import { CartProvider } from '@/components/cart/cart-context';
import { CompareProvider } from '@/components/compare/compare-context';
import { CompareBar } from '@/components/compare/compare-bar';
import { CartDrawer } from '@/components/cart/cart-drawer';
import { Announcement } from '@/components/layout/announcement';
import { Navbar } from '@/components/layout/navbar';
import { Footer } from '@/components/layout/footer';
import { WhatsAppFloat } from '@/components/layout/whatsapp-float';

export default async function ShopLayout({ children }: { children: React.ReactNode }) {
  const [settings, areas] = await Promise.all([getSettings(), getAreas()]);

  return (
    <CartProvider>
      <CompareProvider>
      {settings.announcement?.active !== false ? (
        <Announcement
          items={settings.announcement?.items ?? []}
          speedDurationSeconds={settings.announcement?.speedDurationSeconds ?? 40}
        />
      ) : null}
      <Navbar
        phone={settings.display_phone}
        hours={settings.hours}
        storeName={settings.store_name}
      />
      <main className="min-h-[60vh]">{children}</main>
      <Footer settings={settings} areas={areas} />
      <CartDrawer />
      <WhatsAppFloat number={settings.whatsapp_number} storeName={settings.store_name} />
      <CompareBar />
      </CompareProvider>
    </CartProvider>
  );
}

