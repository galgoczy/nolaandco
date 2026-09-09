/**
 * Előre legyártott képváltozatok (kliens- és szerveroldalon is használható rész).
 *
 * A Blobba feltöltött termékképekből feltöltéskor AVIF (q65, teljes
 * színfelbontás) és WebP (q85, tartalék) változat készül, és a látogató
 * ezeket kapja közvetlenül a Blobból — a Next képoptimalizálója kimarad.
 * Így a minőséget mi állítjuk, a Blobból csak a kész, kis fájlok mennek a
 * CDN felé, és a cache nem függ a deploytól.
 *
 * Méretek: 640 (lista mobilon), 1080 (galéria retina), 1440 (galéria 3×-es
 * kijelzőn: 470 px × 3). A WebP tartalékból csak az 1080-as készül, mert azt
 * kevés (régi) böngésző kéri — így a tárhely is kímélve van.
 *
 * A változat URL-je az eredetiből származik (`<eredeti>~<szélesség>.<fmt>`),
 * ezért nem kell adatbázisban nyilvántartani. Az eredeti érintetlenül marad
 * a Blobban; belőle bármikor újragyártható minden változat.
 */

/**
 * Kiszolgáljuk-e már a látogatóknak az előre gyártott változatokat?
 *
 * Amíg a visszamenőleges gyártás nem futott végig minden képre, a hiányzó
 * változat törött képet jelentene addig, amíg a böngésző vissza nem esik a
 * next/image útra — ez a visszaesés a gyakorlatban nem mindig ér célba
 * (a hidratálás előtti hibák miatt). Ezért amíg nincs kész minden változat,
 * a megszokott next/image utat használjuk.
 *
 * A gyártás (Admin → Képváltozatok) befejezése után ezt kell true-ra
 * állítani; a feltöltés és a gyártás ettől függetlenül készíti a fájlokat.
 */
export const SERVE_VARIANTS = false;

export type VariantFormat = 'avif' | 'webp';

export const VARIANT_WIDTHS: Record<VariantFormat, number[]> = {
  avif: [640, 1080, 1440],
  webp: [1080],
};

/** A legnagyobb AVIF — ennek a meglétét nézzük "kész"-nek. */
export const VARIANT_MARKER = { width: 1440, format: 'avif' as VariantFormat };

const BLOB_HOST = /^https:\/\/[a-z0-9]+\.public\.blob\.vercel-storage\.com\//;
const VARIANT_SUFFIX = /~\d+\.(avif|webp)$/;

/** Blob-URL (bármilyen fájl). */
export function isBlobUrl(src: string | null | undefined): src is string {
  return !!src && BLOB_HOST.test(src) && src.indexOf('|') === -1;
}

/** Csak a Vercel Blobban tárolt (adminból feltöltött) képeknek van változata. */
export function isBlobImage(src: string | null | undefined): src is string {
  return isBlobUrl(src) && !VARIANT_SUFFIX.test(src) && /\.(jpe?g|png|webp|gif|avif)$/i.test(src);
}

/** Változat-URL → az eredeti URL-je (vagy null, ha nem változat). */
export function variantSource(url: string): string | null {
  return VARIANT_SUFFIX.test(url) ? url.replace(VARIANT_SUFFIX, '') : null;
}

export function variantUrl(src: string, width: number, format: VariantFormat): string {
  return `${src}~${width}.${format}`;
}

export function variantSrcSet(src: string, format: VariantFormat): string {
  return VARIANT_WIDTHS[format].map((w) => `${variantUrl(src, w, format)} ${w}w`).join(', ');
}

/** Az eredetihez tartozó összes változat-URL (töröléshez, ellenőrzéshez). */
export function allVariantUrls(src: string): string[] {
  const out: string[] = [];
  for (const format of ['avif', 'webp'] as VariantFormat[]) {
    for (const w of VARIANT_WIDTHS[format]) out.push(variantUrl(src, w, format));
  }
  return out;
}
