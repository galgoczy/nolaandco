import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * Termékkatalógus-feed a Meta (Facebook + Instagram) Commerce Managerhez —
 * a TikTok Catalog Manager is ezt a oszlopkészletet fogadja, így később ott
 * is ugyanez az URL köthető be.
 *
 * A feed az adatbázisból épül minden lekérésnél: átnevezett szín, új ár,
 * elfogyott készlet magától követődik, nincs kézzel karbantartott lista.
 * A Commerce Managerben ütemezett letöltésként kell bekötni (napi frissítés).
 *
 * FONTOS: az `id` oszlop a termék adatbázis-azonosítója — ugyanaz, amit a
 * Meta Pixel `ViewContent` eseménye küld `content_ids`-ként (lásd
 * src/lib/metaPixel.ts). A dinamikus katalógus-hirdetés ezen az egyezésen
 * áll: csak így tudja a Meta a megnézett terméket újra megmutatni.
 *
 * Kimarad: inaktív termék, digitális termék (noShipping — a katalógus csak
 * szállítható, fizikai árut fogad), és aminek még nincs képe (kép nélküli
 * tételt a Meta elutasít).
 */

const BASE_URL = 'https://nolaandco.hu';
const BRAND = 'Nola & Co';

/**
 * A feed képei a weboldal képoptimalizálóján át mennek, 1200 px szélesen:
 * a Meta így pár száz KB-os JPEG-et kap (PNG forrásnál PNG-t) a 3 MB-os
 * eredeti helyett, és a kész kép 31 napig a CDN-en marad — a katalógus
 * szinkronizálása nem húzza le újra és újra az eredetit a tárhelyről.
 *
 * Az AVIF/WebP változatokat szándékosan nem használjuk: a Meta katalógus
 * JPEG-et és PNG-t fogad. A formátumot a letöltő `Accept` fejléce dönti el,
 * tehát a Meta mindig olyat kap, amit elfogad. Az 1200 px bőven a Meta által
 * ajánlott legalább 1024 px fölött van.
 */
function feedImageUrl(src: string): string {
  return `${BASE_URL}/_next/image?url=${encodeURIComponent(src)}&w=1200&q=85`;
}

/** Markdown-jelölés és sortörések nélküli, egysoros szöveg. */
function plainText(text: string): string {
  return text.replace(/\*\*/g, '').replace(/\s+/g, ' ').trim();
}

/** CSV-mező: idézőjelezve, a belső idézőjelek duplázva. */
function csvField(value: string): string {
  return '"' + value.replace(/"/g, '""') + '"';
}

export async function GET() {
  const products = await prisma.product.findMany({
    where: { active: true, noShipping: false },
    orderBy: [{ sortOrder: 'asc' }, { createdAt: 'asc' }],
    select: {
      id: true,
      name: true,
      slug: true,
      description: true,
      price: true,
      onSale: true,
      salePrice: true,
      stock: true,
      imageUrl: true,
      images: true,
    },
  });

  const header = [
    'id',
    'title',
    'description',
    'availability',
    'condition',
    'price',
    'sale_price',
    'link',
    'image_link',
    'additional_image_link',
    'brand',
  ].join(',');

  const rows: string[] = [header];

  for (const p of products) {
    // A galéria videóbejegyzései ("videóURL|poszterURL") nem képek.
    const galleryImages = (p.images ?? []).filter((img) => !img.includes('|'));
    const mainImage = p.imageUrl || galleryImages[0];
    if (!mainImage) continue; // kép nélküli tételt a Meta elutasít

    const extraImages = galleryImages
      .filter((img) => img !== mainImage)
      .slice(0, 5)
      .map(feedImageUrl)
      .join(',');

    const onSale = p.onSale && p.salePrice != null;

    rows.push(
      [
        csvField(p.id),
        csvField(p.name),
        csvField(plainText(p.description).slice(0, 4900)),
        csvField(p.stock === 0 ? 'out of stock' : 'in stock'),
        csvField('new'),
        csvField(`${p.price} HUF`),
        csvField(onSale ? `${p.salePrice} HUF` : ''),
        csvField(`${BASE_URL}/termekek/${p.slug}`),
        csvField(feedImageUrl(mainImage)),
        csvField(extraImages),
        csvField(BRAND),
      ].join(','),
    );
  }

  return new NextResponse(rows.join('\n') + '\n', {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      // A CDN egy órán át adhatja a kész választ — a Meta napi letöltéséhez
      // bőven friss, az adatbázist meg nem éri felesleges terhelés.
      'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
    },
  });
}
