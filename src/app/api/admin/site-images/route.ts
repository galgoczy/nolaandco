import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { isAdminRequest } from '@/lib/admin-auth';
import { SITE_IMAGE_SLOTS } from '@/lib/siteImages';

const VALID_KEYS = new Set(SITE_IMAGE_SLOTS.map((s) => s.key));

export async function GET() {
  if (!(await isAdminRequest())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const overrides = await prisma.siteImage.findMany();
  return NextResponse.json({ overrides });
}

/** { key, url } — üres url visszaállítja az alapértelmezett képet. */
export async function PATCH(req: Request) {
  if (!(await isAdminRequest())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await req.json().catch(() => null);
  if (!body || typeof body !== 'object') {
    return NextResponse.json({ error: 'Érvénytelen kérés' }, { status: 400 });
  }
  const { key, url } = body as { key?: unknown; url?: unknown };
  if (typeof key !== 'string' || !VALID_KEYS.has(key)) {
    return NextResponse.json({ error: 'Ismeretlen képhely' }, { status: 400 });
  }

  const trimmed = typeof url === 'string' ? url.trim() : '';
  if (!trimmed) {
    await prisma.siteImage.deleteMany({ where: { key } });
    return NextResponse.json({ ok: true, reset: true });
  }

  const saved = await prisma.siteImage.upsert({
    where: { key },
    update: { url: trimmed },
    create: { key, url: trimmed },
  });
  return NextResponse.json({ ok: true, image: saved });
}
