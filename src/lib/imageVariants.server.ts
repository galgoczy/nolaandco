import sharp from 'sharp';
import { put, head } from '@vercel/blob';
import { VARIANT_WIDTHS, VARIANT_FORMATS, variantUrl, isBlobImage, type VariantFormat } from './imageVariants';

/**
 * Képváltozatok gyártása és ellenőrzése — csak szerveren (sharp + Blob token).
 *
 * Minőség: a próbalapok alapján választva. AVIF q65 teljes színfelbontással
 * (4:4:4) a pasztell gézen is megtartja a színátmeneteket; a WebP q85 a
 * tartalék az AVIF-et nem ismerő böngészőknek.
 */

const ONE_YEAR = 60 * 60 * 24 * 365;

function encode(pipeline: sharp.Sharp, format: VariantFormat): Promise<Buffer> {
  return format === 'avif'
    ? pipeline.avif({ quality: 65, chromaSubsampling: '4:4:4', effort: 4 }).toBuffer()
    : pipeline.webp({ quality: 85 }).toBuffer();
}

/** Az eredeti letöltése a Blobból (a változatgyártáshoz). */
async function fetchOriginal(url: string): Promise<Buffer> {
  const res = await fetch(url, { cache: 'no-store' });
  if (!res.ok) throw new Error(`Nem tölthető le az eredeti kép (${res.status}): ${url}`);
  return Buffer.from(await res.arrayBuffer());
}

/**
 * Legyártja és a Blobba menti az összes változatot. A kulcs az eredetiből
 * származik, véletlen utótag nélkül, így a URL determinisztikus; egy újabb
 * futás egyszerűen felülírja ugyanazt a kulcsot.
 */
export async function generateVariants(sourceUrl: string, original?: Buffer): Promise<string[]> {
  if (!isBlobImage(sourceUrl)) throw new Error(`Nem Blob-kép: ${sourceUrl}`);
  const buf = original ?? (await fetchOriginal(sourceUrl));
  const pathname = new URL(sourceUrl).pathname.slice(1);

  // Egyszer dekódolunk, utána méretenként/formátumonként enkódolunk.
  const base = sharp(buf, { limitInputPixels: 80_000_000 }).rotate();
  const meta = await base.metadata();
  const urls: string[] = [];

  for (const width of VARIANT_WIDTHS) {
    const resized = base.clone().resize({ width, withoutEnlargement: true });
    for (const format of VARIANT_FORMATS) {
      const data = await encode(resized.clone(), format);
      const key = `${pathname}~${width}.${format}`;
      const blob = await put(key, data, {
        access: 'public',
        addRandomSuffix: false,
        allowOverwrite: true,
        contentType: `image/${format}`,
        cacheControlMaxAge: ONE_YEAR,
      });
      urls.push(blob.url);
    }
  }
  void meta;
  return urls;
}

/** Igaz, ha az adott eredetihez már megvannak a változatok (a legnagyobb AVIF-et nézzük). */
export async function hasVariants(sourceUrl: string): Promise<boolean> {
  try {
    await head(variantUrl(sourceUrl, VARIANT_WIDTHS[VARIANT_WIDTHS.length - 1], 'avif'));
    return true;
  } catch {
    return false;
  }
}
