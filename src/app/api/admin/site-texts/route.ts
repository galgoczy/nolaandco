import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { isAdminRequest } from '@/lib/admin-auth';
import { SITE_TEXT_SLOTS } from '@/lib/siteTexts';

const VALID_KEYS = new Set(SITE_TEXT_SLOTS.map((s) => s.key));

export async function GET() {
  if (!(await isAdminRequest())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const overrides = await prisma.siteText.findMany();
  return NextResponse.json({ overrides });
}

/** { entries: [{ key, value }] } — üres value visszaállítja az alapértelmezettet. */
export async function PATCH(req: Request) {
  if (!(await isAdminRequest())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await req.json().catch(() => null);
  const entries = (body as { entries?: unknown })?.entries;
  if (!Array.isArray(entries)) {
    return NextResponse.json({ error: 'entries tömb szükséges' }, { status: 400 });
  }

  for (const entry of entries) {
    if (!entry || typeof entry !== 'object') continue;
    const { key, value } = entry as { key?: unknown; value?: unknown };
    if (typeof key !== 'string' || !VALID_KEYS.has(key)) continue;
    const trimmed = typeof value === 'string' ? value.trim() : '';
    if (!trimmed) {
      await prisma.siteText.deleteMany({ where: { key } });
    } else {
      await prisma.siteText.upsert({
        where: { key },
        update: { value: trimmed },
        create: { key, value: trimmed },
      });
    }
  }

  return NextResponse.json({ ok: true });
}
