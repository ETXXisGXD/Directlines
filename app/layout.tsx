import type { Metadata, Viewport } from 'next';
import { Suspense } from 'react';
import '@fontsource-variable/plus-jakarta-sans';
import '@fontsource-variable/sora';
import './globals.css';
import { getSettings } from '@/lib/queries';
import { ConsentProvider } from '@/components/consent/consent-provider';
import { ConsentBanner } from '@/components/consent/consent-banner';
import { MetaPixel } from '@/components/analytics/meta-pixel';
import { AnalyticsTracker } from '@/components/analytics/analytics-tracker';

const fallbackUrl = 'http://localhost:3000';

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSettings();
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? fallbackUrl;
  return {
    metadataBase: new URL(siteUrl),
    title: {
      default: settings.seo?.title ?? 'Directlines Technologies & Telecoms Ltd',
      template: '%s | Directlines',
    },
    description: settings.seo?.description,
    applicationName: 'Directlines Technologies & Telecoms Ltd',
    keywords: settings.seo?.keywords ?? [],
    alternates: { canonical: '/' },
    openGraph: {
      type: 'website',
      siteName: settings.store_name,
      locale: 'en_NG',
      url: siteUrl,
      title: settings.seo?.title ?? settings.store_name,
      description: settings.seo?.description,
    },
    twitter: {
      card: 'summary_large_image',
      title: settings.seo?.title ?? settings.store_name,
      description: settings.seo?.description,
    },
    robots: { index: true, follow: true },
    manifest: '/manifest.webmanifest',
    icons: {
      icon: [
        { url: '/favicon.ico', sizes: 'any' },
        { url: '/favicon.svg', type: 'image/svg+xml' },
        { url: '/icon.png', type: 'image/png', sizes: '1024x1024' },
      ],
      apple: '/apple-touch-icon.png',
    },
    verification: settings.meta_domain_verification
      ? { other: { 'facebook-domain-verification': settings.meta_domain_verification } }
      : undefined,
    other: {
      'format-detection': 'telephone=no',
    },
  };
}

export const viewport: Viewport = {
  themeColor: '#ffffff',
  width: 'device-width',
  initialScale: 1,
};

export default async function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const settings = await getSettings();

  return (
    <html lang="en">
      <body className="bg-paper text-ink antialiased">
        <ConsentProvider required={settings.consent_enabled}>
          <MetaPixel pixelId={settings.meta_pixel_id} />
          <Suspense fallback={null}>
            <AnalyticsTracker enabled={settings.analytics_enabled} />
          </Suspense>
          <ConsentBanner enabled={settings.consent_enabled} />
          {children}
        </ConsentProvider>
      </body>
    </html>
  );
}

