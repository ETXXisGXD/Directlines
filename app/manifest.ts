import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Directlines Technologies & Telecoms Ltd',
    short_name: 'Directlines',
    description: 'Phones, accessories, EasyBuy and repairs in Karu, Abuja.',
    start_url: '/',
    display: 'standalone',
    background_color: '#ffffff',
    theme_color: '#142b58',
    icons: [
      { src: '/icon.png', sizes: '1024x1024', type: 'image/png' },
      { src: '/favicon.ico', sizes: 'any', type: 'image/x-icon' },
    ],
  };
}
