/**
 * A termékgaléria (Product.images) bejegyzéseinek közös értelmezése.
 *
 * Egy bejegyzés lehet:
 *  - kép: sima URL,
 *  - videó: "videóURL|borítóképURL" — a pipe választja el a kettőt, mert a
 *    feltöltött Blob-URL-ekben pipe nem fordulhat elő. Így a képek és a videók
 *    egyetlen listában, közösen sorrendezhetők az adminban.
 */
export type MediaEntry =
  | { type: 'image'; src: string }
  | { type: 'video'; src: string; poster: string };

export function parseMediaEntry(entry: string): MediaEntry {
  const sep = entry.indexOf('|');
  if (sep > 0) {
    return { type: 'video', src: entry.slice(0, sep), poster: entry.slice(sep + 1) };
  }
  return { type: 'image', src: entry };
}

export function isVideoEntry(entry: string): boolean {
  return entry.indexOf('|') > 0;
}

export function makeVideoEntry(videoUrl: string, posterUrl: string): string {
  return `${videoUrl}|${posterUrl}`;
}

/** Az első kép-típusú bejegyzés (videók kihagyásával); hover-előnézethez. */
export function firstImageEntry(images: string[] | null | undefined): string | null {
  if (!images) return null;
  for (const entry of images) {
    if (!isVideoEntry(entry) && entry.trim() !== '') return entry;
  }
  return null;
}
