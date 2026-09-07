import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { isAdminRequest } from '@/lib/admin-auth';
import { isBlobImage } from '@/lib/imageVariants';
import { generateVariants, hasVariants } from '@/lib/imageVariants.server';

export const runtime = 'nodejs';
export const maxDuration = 60;

/** Minden Blobban tárolt kép, amit az oldal kiszolgál: termékképek + megjelenés-képek. */
async function collectSources(): Promise<string[]> {
  const [products, siteImages] = await Promise.all([
    prisma.product.findMany({ select: { imageUrl: true, images: true } }),
    prisma.siteImage.findMany({ select: { url: true } }),
  ]);
  const seen: Record<string, true> = {};
  const out: string[] = [];
  const add = (u: string | null | undefined) => {
    if (isBlobImage(u) && !seen[u]) {
      seen[u] = true;
      out.push(u);
    }
  };
  for (const p of products) {
    add(p.imageUrl);
    for (const u of p.images) add(u);
  }
  for (const s of siteImages) add(s.url);
  return out;
}

/**
 * GET: állapot — hány Blob-képnek van/nincs még változata.
 * POST: a következő néhány hiányzó változat legyártása (kötegelve, hogy
 * beleférjen a függvény időkeretébe); az admin oldal addig hívja, amíg
 * `remaining` nulla nem lesz.
 */
export async function GET() {
  if (!(await isAdminRequest())) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const sources = await collectSources();
  const flags = await Promise.all(sources.map((s) => hasVariants(s)));
  const missing = sources.filter((_, i) => !flags[i]);
  return NextResponse.json({ total: sources.length, done: sources.length - missing.length, remaining: missing.length });
}

export async function POST(req: Request) {
  if (!(await isAdminRequest())) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const body = (await req.json().catch(() => null)) as { limit?: number; force?: boolean } | null;
  const limit = Math.min(Math.max(body?.limit ?? 2, 1), 4);

  const sources = await collectSources();
  const flags = body?.force ? sources.map(() => false) : await Promise.all(sources.map((s) => hasVariants(s)));
  const missing = sources.filter((_, i) => !flags[i]);

  const processed: string[] = [];
  const errors: { url: string; error: string }[] = [];
  const started = Date.now();
  for (const url of missing.slice(0, limit)) {
    // Ne fussunk ki a 60 mp-es keretből: 25 mp után már nem kezdünk új képet.
    if (Date.now() - started > 25_000) break;
    try {
      await generateVariants(url);
      processed.push(url);
    } catch (err) {
      errors.push({ url, error: err instanceof Error ? err.message : String(err) });
    }
  }

  return NextResponse.json({
    total: sources.length,
    done: sources.length - missing.length + processed.length,
    remaining: missing.length - processed.length,
    processed,
    errors,
  });
}
