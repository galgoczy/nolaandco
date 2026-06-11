import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { isAdminRequest } from '@/lib/admin-auth';

export async function GET() {
  if (!(await isAdminRequest())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const categories = await prisma.category.findMany({ orderBy: { sortOrder: 'asc' } });
  return NextResponse.json({ categories });
}

export async function POST(req: Request) {
  if (!(await isAdminRequest())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await req.json().catch(() => null);
  if (!body || typeof body !== 'object') {
    return NextResponse.json({ error: 'Érvénytelen kérés' }, { status: 400 });
  }

  const data = body as Record<string, unknown>;
  const slug = (typeof data.slug === 'string' ? data.slug.trim() : '').toLowerCase();
  const name = typeof data.name === 'string' ? data.name.trim() : '';
  if (!slug || !name) {
    return NextResponse.json({ error: 'Slug és név kötelező' }, { status: 400 });
  }

  const maxOrder = await prisma.category.aggregate({ _max: { sortOrder: true } });
  const nextOrder = (maxOrder._max.sortOrder ?? -1) + 1;

  try {
    const category = await prisma.category.create({
      data: {
        slug,
        name,
        nameEn: typeof data.nameEn === 'string' ? data.nameEn.trim() || null : null,
        sortOrder: nextOrder,
        visibleOnHome: data.visibleOnHome !== false,
      },
    });
    return NextResponse.json({ category });
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Mentés sikertelen';
    if (msg.includes('Unique constraint')) {
      return NextResponse.json({ error: 'Ez a slug már létezik' }, { status: 409 });
    }
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

// Bulk reorder
export async function PATCH(req: Request) {
  if (!(await isAdminRequest())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await req.json().catch(() => null);
  if (!body || typeof body !== 'object') {
    return NextResponse.json({ error: 'Érvénytelen kérés' }, { status: 400 });
  }

  const { order } = body as { order?: { id: string; sortOrder: number }[] };
  if (!Array.isArray(order)) {
    return NextResponse.json({ error: 'order tömb szükséges' }, { status: 400 });
  }

  await Promise.all(
    order.map((item) =>
      prisma.category.update({
        where: { id: item.id },
        data: { sortOrder: item.sortOrder },
      }),
    ),
  );

  const categories = await prisma.category.findMany({ orderBy: { sortOrder: 'asc' } });
  return NextResponse.json({ categories });
}
