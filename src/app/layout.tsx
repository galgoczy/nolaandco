import type { Metadata } from 'next';
import dynamic from 'next/dynamic';
import './globals.css';
import Footer from '@/components/layout/Footer';
import SessionProviderWrapper from '@/components/providers/SessionProviderWrapper';

const Navbar = dynamic(() => import('@/components/layout/Navbar'), {
  ssr: false,
});

export const metadata: Metadata = {
  title: 'Nola & Co. | Nordic Serenity',
  description:
    'Személyre szabott babapárnák és poszterek. Prémium minőségű, OEKO-TEX tanúsítvánnyal rendelkező anyagokból.',
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
          <Navbar />
          <main>{children}</main>
          <Footer />
        </SessionProviderWrapper>
      </body>
    </html>
  );
}
