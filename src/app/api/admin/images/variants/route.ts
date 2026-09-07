import { NextResponse } from 'next/server';
import { isAdminRequest } from '@/lib/admin-auth';
import { collectReferencedUrls } from '@/lib/blobStorage.server';
import { generateVariants, hasVariants } from '@/lib/imageVariants.server';

export const runtime = 'nodejs';
export const maxDuration = 60;

/** Meglét-ellenőrzés kötegelve, hogy sok kép se fusson bele az időkeretbe. */
async function checkChunk(urls: string[]): Promise<boolean[]> {
  return Promise.all(urls.map((u) => hasVariants(u)));
}

/**
 * GET: állapot — hány Blob-képnek van/nincs még változata.
 *
 * POST: az `offset`-től keresi a következő hiányzókat, legyártja őket, és
 * visszaadja, hol tart. Az admin oldal ezzel lépked végig a katalóguson;
 * így egy hívás sem ellenőrzi újra az összes képet.
 */
export async function GET() {
  if (!(await isAdminRequest())) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const { images } = await collectReferencedUrls();
  let done = 0;
  for (let i = 0; i < images.length; i += 25) {
    const flags = await checkChunk(images.slice(i, i + 25));
    for (const ok of flags) if (ok) done++;
  }
  return NextResponse.json({ total: images.length, done, remaining: images.length - done });
}

export async function POST(req: Request) {
  if (!(await isAdminRequest())) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const body = (await req.json().catch(() => null)) as { limit?: number; offset?: number } | null;
  const limit = Math.min(Math.max(body?.limit ?? 3, 1), 5);
  const offset = Math.max(0, body?.offset ?? 0);

  const { images } = await collectReferencedUrls();
  const started = Date.now();

  // 1. A következő hiányzók megkeresése az offsettől, 25-ös kötegekben.
  const missing: string[] = [];
  let cursor = offset;
  while (cursor < images.length && missing.length < limit && Date.now() - started < 12_000) {
    const chunk = images.slice(cursor, cursor + 25);
    const flags = await checkChunk(chunk);
    let k = 0;
    for (; k < chunk.length; k++) {
      if (!flags[k]) missing.push(chunk[k]);
      if (missing.length >= limit) break;
    }
    cursor += Math.min(k + 1, chunk.length);
  }

  // 2. Gyártás — 30 mp után már nem kezdünk új képet, hogy beleférjünk.
  const processed: string[] = [];
  const errors: { url: string; error: string }[] = [];
  let quotaFull = false;
  for (const url of missing) {
    if (Date.now() - started > 30_000) {
      // A maradék hiányzót a következő hívás újra megtalálja.
      cursor = images.indexOf(url);
      break;
    }
    try {
      await generateVariants(url);
      processed.push(url);
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      errors.push({ url, error: msg });
      if (/quota/i.test(msg)) {
        quotaFull = true;
        cursor = images.indexOf(url);
        break;
      }
    }
  }

  return NextResponse.json({
    total: images.length,
    offset: cursor,
    finished: cursor >= images.length,
    processed,
    errors,
    quotaFull,
  });
}
