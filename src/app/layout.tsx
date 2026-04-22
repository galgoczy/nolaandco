import type { Metadata } from 'next';
import dynamic from 'next/dynamic';
import './globals.css';
import Footer from '@/components/layout/Footer';
import CookieConsent from '@/components/layout/CookieConsent';
import Analytics from '@/components/layout/Analytics';
import PublicChrome from '@/components/layout/PublicChrome';
import SessionProviderWrapper from '@/components/providers/SessionProviderWrapper';

const Navbar = dynamic(() => import('@/components/layout/Navbar'), {
  ssr: false,
});

export const metadata: Metadata = {
  metadataBase: new URL('https://nolaandco.hu'),
  title: 'Nola & Co | Születési emlékpárnák & poszterek',
  description:
    'Személyre szabott babapárnák és poszterek. Prémium minőségű, OEKO-TEX tanúsítvánnyal rendelkező anyagokból.',
  openGraph: {
    type: 'website',
    locale: 'hu_HU',
    url: 'https://nolaandco.hu',
    siteName: 'Nola & Co.',
    title: 'Nola & Co. | Születési emlékpárnák és poszterek',
    description:
      'Az emlékek, amik pontosan akkorák, mint ő volt. 1:1 méretarányú, egyedi születési párnák és poszterek.',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Nola & Co. | Születési emlékpárnák és poszterek',
    description:
      'Az emlékek, amik pontosan akkorák, mint ő volt. 1:1 méretarányú, egyedi születési párnák és poszterek.',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="hu">
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Montserrat:wght@300;400;500;600;700&family=Inter:wght@400;500;700&display=swap"
          rel="stylesheet"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="font-body">
        <SessionProviderWrapper>
          <PublicChrome>
            <Navbar />
          </PublicChrome>
          <main>{children}</main>
          <PublicChrome>
            <Footer />
            <CookieConsent />
            <Analytics />
          </PublicChrome>
        </SessionProviderWrapper>
      </body>
    </html>
  );
}
