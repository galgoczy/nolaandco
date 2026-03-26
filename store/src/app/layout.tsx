import type { Metadata } from "next";
import { Toaster } from "react-hot-toast";
import "./globals.css";

export const metadata: Metadata = {
  title: "NOLA&CO | Egyedi Babapárnák & Poszterek",
  description:
    "Kézzel készített, egyedi babapárnák és poszterek a kisbabád születési adataival. Tökéletes ajándék újszülötteknek.",
  keywords: [
    "babapárna",
    "egyedi párna",
    "babaposzter",
    "születési ajándék",
    "újszülött ajándék",
    "NOLA&CO",
  ],
  openGraph: {
    title: "NOLA&CO | Egyedi Babapárnák & Poszterek",
    description:
      "Kézzel készített, egyedi babapárnák és poszterek a kisbabád születési adataival.",
    type: "website",
    locale: "hu_HU",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="hu" className="antialiased">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Montserrat:wght@200;300;400;500;600;700&family=Playfair+Display:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-screen bg-warm-beige text-carbon font-sans">
        <Toaster
          position="top-center"
          toastOptions={{
            style: {
              background: "#F5F0E8",
              color: "#333333",
              border: "1px solid #C4A591",
            },
          }}
        />
        {children}
      </body>
    </html>
  );
}
