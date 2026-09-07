/**
 * Előre legyártott képváltozatok (kliens- és szerveroldalon is használható rész).
 *
 * A Blobba feltöltött termékképekből feltöltéskor három szélességben AVIF és
 * WebP változat készül, és a látogató ezeket kapja közvetlenül a Blobból —
 * a Next képoptimalizálója kimarad. Így a minőséget mi állítjuk (AVIF q65,
 * teljes színfelbontás; WebP q85 tartalék), a Blobból csak a kész, kis
 * fájlok mennek a CDN felé, és a cache nem függ a deploytól.
 *
 * A változat URL-je az eredetiből származik (`<eredeti>~<szélesség>.<fmt>`),
 * ezért nem kell adatbázisban nyilvántartani. Az eredeti érintetlenül marad
 * a Blobban; belőle bármikor újragyártható minden változat.
 */

export const VARIANT_WIDTHS = [640, 1080, 1920] as const;
export type VariantFormat = 'avif' | 'webp';
export const VARIANT_FORMATS: VariantFormat[] = ['avif', 'webp'];

const BLOB_HOST = /^https:\/\/[a-z0-9]+\.public\.blob\.vercel-storage\.com\//;

/** Csak a Vercel Blobban tárolt (adminból feltöltött) képeknek van változata. */
export function isBlobImage(src: string | null | undefined): src is string {
  return !!src && BLOB_HOST.test(src) && !/~\d+\.(avif|webp)$/.test(src);
}

export function variantUrl(src: string, width: number, format: VariantFormat): string {
  return `${src}~${width}.${format}`;
}

export function variantSrcSet(src: string, format: VariantFormat): string {
  return VARIANT_WIDTHS.map((w) => `${variantUrl(src, w, format)} ${w}w`).join(', ');
}
