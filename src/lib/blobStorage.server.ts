import { list, del } from '@vercel/blob';
import { prisma } from './prisma';
import { parseMediaEntry } from './productMedia';
import { isBlobUrl, isBlobImage, variantSource, allVariantUrls } from './imageVariants';

/**
 * Blob-tárhely: mi van benne, mire hivatkozik az oldal, mi árva.
 *
 * Hivatkozott: termék fő kép és galéria (kép, videó, videó-borító),
 * variáns-galériák, kategória- és alias-képek, megjelenés-képek — plusz a
 * hivatkozott képek aktuális méretű változatai. Minden más árva.
 *
 * Az árvákat csoportokba soroljuk, hogy szakaszosan lehessen takarítani:
 * a régi méretű változatok újragyárthatók (kockázatmentes), a duplán
 * feltöltött fotók fölös példányai mellett ott a használatban lévő iker,
 * a többi pedig régi, sehol nem használt feltöltés.
 */

export type OrphanGroup = 'regi-valtozat' | 'duplikatum' | 'egyeb';

export const ORPHAN_GROUP_LABELS: Record<OrphanGroup, string> = {
  'regi-valtozat': 'Régi méretű képváltozatok',
  duplikatum: 'Duplán feltöltött fotók fölös példányai',
  egyeb: 'Régi, sehol nem használt feltöltések',
};

export const ORPHAN_GROUP_NOTES: Record<OrphanGroup, string> = {
  'regi-valtozat':
    'Korábbi méretkészletből maradtak. Az eredetiből bármikor újragyárthatók, ezért törlésük kockázatmentes.',
  duplikatum:
    'Ugyanazt a fotót többször töltötték fel; a termékhez tartozó példány megmarad, ezek a fölös másolatok.',
  egyeb:
    'Korábbi termékekhez, próbálkozásokhoz tartozó fájlok, amelyekre ma semmi nem hivatkozik. Törlésük végleges.',
};

/** A Vercel Blob a fájlnév végére 30 karakteres véletlen utótagot tesz. */
const RANDOM_SUFFIX = /-[A-Za-z0-9]{20,40}(\.[A-Za-z0-9]+)$/;

function baseName(pathname: string): string {
  return pathname.replace(RANDOM_SUFFIX, '$1');
}

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
  const add = (entry: string | null | undefined) => {
    if (!entry) return;
    const media = parseMediaEntry(entry);
    const urls = media.type === 'video' ? [media.src, media.poster] : [media.src];
    for (const x of urls) {
      if (isBlobUrl(x) && !seen[x]) {
        seen[x] = true;
        all.push(x);
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
export type FileStatus = 'hivatkozott' | 'valtozat' | 'arva';
export type ClassifiedFile = BlobFile & { status: FileStatus; group?: OrphanGroup };

export type StorageReport = {
  totalBytes: number;
  fileCount: number;
  referenced: { bytes: number; count: number };
  variants: { bytes: number; count: number };
  orphans: { bytes: number; count: number };
  groups: { key: OrphanGroup; label: string; note: string; count: number; bytes: number }[];
  /** Minden fájl, méret szerint csökkenő sorrendben. */
  files: ClassifiedFile[];
};

/** Végigolvassa a teljes tárat (lapozva), és besorolja a fájlokat. */
export async function scanStorage(): Promise<StorageReport> {
  const refs = await collectReferencedUrls();

  const referenced: Record<string, true> = {};
  const referencedBases: Record<string, true> = {};
  for (const u of refs.all) {
    referenced[u] = true;
    try {
      referencedBases[baseName(new URL(u).pathname.slice(1))] = true;
    } catch {
      /* hibás URL — kihagyjuk */
    }
  }
  const currentVariant: Record<string, true> = {};
  for (const img of refs.images) for (const v of allVariantUrls(img)) currentVariant[v] = true;

  const raw: BlobFile[] = [];
  let cursor: string | undefined;
  do {
    const page = await list({ limit: 1000, cursor });
    for (const b of page.blobs) {
      raw.push({ url: b.url, pathname: b.pathname, size: b.size, uploadedAt: b.uploadedAt.toISOString() });
    }
    cursor = page.hasMore ? page.cursor : undefined;
  } while (cursor);

  const files: ClassifiedFile[] = [];
  const report: StorageReport = {
    totalBytes: 0,
    fileCount: raw.length,
    referenced: { bytes: 0, count: 0 },
    variants: { bytes: 0, count: 0 },
    orphans: { bytes: 0, count: 0 },
    groups: [],
    files: [],
  };
  const groupTotals: Record<OrphanGroup, { count: number; bytes: number }> = {
    'regi-valtozat': { count: 0, bytes: 0 },
    duplikatum: { count: 0, bytes: 0 },
    egyeb: { count: 0, bytes: 0 },
  };

  for (const f of raw) {
    report.totalBytes += f.size;
    if (referenced[f.url]) {
      report.referenced.bytes += f.size;
      report.referenced.count++;
      files.push({ ...f, status: 'hivatkozott' });
      continue;
    }
    if (currentVariant[f.url]) {
      report.variants.bytes += f.size;
      report.variants.count++;
      files.push({ ...f, status: 'valtozat' });
      continue;
    }

    // Árva — csoportba soroljuk.
    const source = variantSource(f.url);
    let group: OrphanGroup;
    if (source && referenced[source]) {
      // Hivatkozott kép változata, de már nem az aktuális méretkészletből.
      group = 'regi-valtozat';
    } else if (!source && referencedBases[baseName(f.pathname)]) {
      // Ugyanabból a fotóból van használatban lévő példány is.
      group = 'duplikatum';
    } else {
      group = 'egyeb';
    }
    report.orphans.bytes += f.size;
    report.orphans.count++;
    groupTotals[group].count++;
    groupTotals[group].bytes += f.size;
    files.push({ ...f, status: 'arva', group });
  }

  report.files = files.sort((a, b) => b.size - a.size);
  report.groups = (['regi-valtozat', 'duplikatum', 'egyeb'] as OrphanGroup[]).map((key) => ({
    key,
    label: ORPHAN_GROUP_LABELS[key],
    note: ORPHAN_GROUP_NOTES[key],
    count: groupTotals[key].count,
    bytes: groupTotals[key].bytes,
  }));
  return report;
}

/** Csak azokat törli, amelyeket a friss vizsgálat is árvának talál. */
export async function deleteOrphans(urls: string[]): Promise<{ deleted: number; bytes: number; skipped: number }> {
  const report = await scanStorage();
  const orphan: Record<string, ClassifiedFile> = {};
  for (const f of report.files) if (f.status === 'arva') orphan[f.url] = f;

  const targets = urls.filter((u) => orphan[u]);
  const skipped = urls.length - targets.length;
  if (targets.length === 0) return { deleted: 0, bytes: 0, skipped };

  let bytes = 0;
  for (let i = 0; i < targets.length; i += 100) {
    const chunk = targets.slice(i, i + 100);
    await del(chunk);
    for (const u of chunk) bytes += orphan[u].size;
  }
  return { deleted: targets.length, bytes, skipped };
}
