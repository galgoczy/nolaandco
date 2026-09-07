import sharp from 'sharp';
import { put, head } from '@vercel/blob';
import { VARIANT_WIDTHS, VARIANT_MARKER, variantUrl, isBlobImage, type VariantFormat } from './imageVariants';

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

  // A 48 MP-es fotót egyszer dekódoljuk (EXIF-forgatással, sRGB-re alakítva)
  // teljes méretben, és minden változat ebből, egy lépésben kicsinyítve
  // készül — ugyanaz a minőség, mint a közvetlen út, de nem 6 dekódolás.
  const master = await sharp(buf, { limitInputPixels: 80_000_000 })
    .rotate()
    .raw()
    .toBuffer({ resolveWithObject: true });
  const fromMaster = () =>
    sharp(master.data, {
      raw: { width: master.info.width, height: master.info.height, channels: master.info.channels },
    });

  // Sorrend: a WebP tartalék előbb, az AVIF-ek méret szerint növekvően — a
  // legnagyobb AVIF az utolsó írás, a hasVariants() ezt nézi, így egy
  // félbeszakadt gyártás sosem számít késznek.
  const jobs: { width: number; format: VariantFormat }[] = [];
  for (const width of VARIANT_WIDTHS.webp) jobs.push({ width, format: 'webp' });
  for (const width of VARIANT_WIDTHS.avif) jobs.push({ width, format: 'avif' });

  const urls: string[] = [];
  for (const { width, format } of jobs) {
    const data = await encode(fromMaster().resize({ width, withoutEnlargement: true }), format);
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
  return urls;
}

/** Igaz, ha az adott eredetihez már megvannak a változatok (a legnagyobb AVIF-et nézzük). */
export async function hasVariants(sourceUrl: string): Promise<boolean> {
  try {
    await head(variantUrl(sourceUrl, VARIANT_MARKER.width, VARIANT_MARKER.format));
    return true;
  } catch {
    return false;
  }
}
