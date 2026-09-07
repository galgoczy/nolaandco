import { list, del } from '@vercel/blob';
import { prisma } from './prisma';
import { parseMediaEntry } from './productMedia';
import { isBlobUrl, isBlobImage, allVariantUrls } from './imageVariants';

/**
 * Blob-tárhely: mi van benne, mire hivatkozik az oldal, mi árva.
 *
 * Hivatkozott: termék fő kép és galéria (kép, videó, videó-borító),
 * variáns-galériák, kategória- és alias-képek, megjelenés-képek — plusz a
 * hivatkozott képek változatai. Minden más árva: régi, lecserélt feltöltés,
 * félbemaradt próbálkozás, elhagyott videó.
 */

export type ReferencedUrls = {
  /** Minden hivatkozott Blob-URL (kép, videó, borító). */
  all: string[];
  /** Ezek közül a képek, amelyekhez változat tartozik. */
  images: string[];
};

export async function collectReferencedUrls(): Promise<ReferencedUrls> {
  const [products, variants, categories, aliases, siteImages] = await Promise.all([
    prisma.product.findMany({ select: { imageUrl: true, images: true } }),
    prisma.productVariant.findMany({ select: { images: true } }),
    prisma.category.findMany({ select: { imageUrl: true } }),
    prisma.productAlias.findMany({ select: { imageUrl: true } }),
    prisma.siteImage.findMany({ select: { url: true } }),
  ]);

  const seen: Record<string, true> = {};
  const all: string[] = [];
  const add = (u: string | null | undefined) => {
    if (!u) return;
    for (const part of u.indexOf('|') > 0 ? [parseMediaEntry(u)] : [{ type: 'image' as const, src: u }]) {
      const urls = part.type === 'video' ? [part.src, part.poster] : [part.src];
      for (const x of urls) {
        if (isBlobUrl(x) && !seen[x]) {
          seen[x] = true;
          all.push(x);
        }
      }
    }
  };
  for (const p of products) {
    add(p.imageUrl);
    for (const e of p.images) add(e);
  }
  for (const v of variants) for (const e of v.images) add(e);
  for (const c of categories) add(c.imageUrl);
  for (const a of aliases) add(a.imageUrl);
  for (const s of siteImages) add(s.url);

  return { all, images: all.filter((u) => isBlobImage(u)) };
}

export type BlobFile = { url: string; pathname: string; size: number; uploadedAt: string };

export type StorageReport = {
  totalBytes: number;
  files: number;
  referenced: { bytes: number; count: number };
  variants: { bytes: number; count: number };
  orphans: BlobFile[];
  orphanBytes: number;
  largest: (BlobFile & { status: 'hivatkozott' | 'változat' | 'árva' })[];
};

/** Végigolvassa a teljes tárat (lapozva), és besorolja a fájlokat. */
export async function scanStorage(): Promise<StorageReport> {
  const refs = await collectReferencedUrls();
  const referenced: Record<string, true> = {};
  for (const u of refs.all) referenced[u] = true;
  const variantOf: Record<string, true> = {};
  for (const img of refs.images) for (const v of allVariantUrls(img)) variantOf[v] = true;

  const files: BlobFile[] = [];
  let cursor: string | undefined;
  do {
    const page = await list({ limit: 1000, cursor });
    for (const b of page.blobs) {
      files.push({ url: b.url, pathname: b.pathname, size: b.size, uploadedAt: b.uploadedAt.toISOString() });
    }
    cursor = page.hasMore ? page.cursor : undefined;
  } while (cursor);

  const report: StorageReport = {
    totalBytes: 0,
    files: files.length,
    referenced: { bytes: 0, count: 0 },
    variants: { bytes: 0, count: 0 },
    orphans: [],
    orphanBytes: 0,
    largest: [],
  };
  const classified: StorageReport['largest'] = [];
  for (const f of files) {
    report.totalBytes += f.size;
    let status: 'hivatkozott' | 'változat' | 'árva';
    if (referenced[f.url]) {
      status = 'hivatkozott';
      report.referenced.bytes += f.size;
      report.referenced.count++;
    } else if (variantOf[f.url]) {
      // Aktuális méretű változat egy hivatkozott képhez. (Egy régebbi
      // méretkészlet változata vagy egy lecserélt kép változata árva.)
      status = 'változat';
      report.variants.bytes += f.size;
      report.variants.count++;
    } else {
      status = 'árva';
      report.orphans.push(f);
      report.orphanBytes += f.size;
    }
    classified.push({ ...f, status });
  }
  report.orphans.sort((a, b) => b.size - a.size);
  report.largest = classified.sort((a, b) => b.size - a.size).slice(0, 15);
  return report;
}

/** Csak azokat törli, amelyeket a friss vizsgálat is árvának talál. */
export async function deleteOrphans(urls: string[]): Promise<{ deleted: number; bytes: number }> {
  const report = await scanStorage();
  const orphan: Record<string, BlobFile> = {};
  for (const o of report.orphans) orphan[o.url] = o;
  const targets = urls.filter((u) => orphan[u]);
  if (targets.length === 0) return { deleted: 0, bytes: 0 };
  // A del() több URL-t is elfogad; 100-asával, hogy ne legyen túl nagy kérés.
  let bytes = 0;
  for (let i = 0; i < targets.length; i += 100) {
    const chunk = targets.slice(i, i + 100);
    await del(chunk);
    for (const u of chunk) bytes += orphan[u].size;
  }
  return { deleted: targets.length, bytes };
}
