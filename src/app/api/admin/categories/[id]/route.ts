import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { isAdminRequest } from '@/lib/admin-auth';

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  if (!(await isAdminRequest())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await params;
  const body = await req.json().catch(() => null);
  if (!body || typeof body !== 'object') {
    return NextResponse.json({ error: 'Érvénytelen kérés' }, { status: 400 });
  }

  const data = body as Record<string, unknown>;
  const update: Record<string, unknown> = {};
  if (typeof data.name === 'string') update.name = data.name.trim();
  if (typeof data.nameEn === 'string') update.nameEn = data.nameEn.trim() || null;
  if (typeof data.slug === 'string') update.slug = data.slug.trim().toLowerCase();
  if (typeof data.visibleOnHome === 'boolean') update.visibleOnHome = data.visibleOnHome;

  try {
    const category = await prisma.category.update({ where: { id }, data: update });
    return NextResponse.json({ category });
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Mentés sikertelen';
    if (msg.includes('Unique constraint')) {
      return NextResponse.json({ error: 'Ez a slug már létezik' }, { status: 409 });
    }
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  if (!(await isAdminRequest())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await params;

  const cat = await prisma.category.findUnique({ where: { id } });
  if (!cat) {
    return NextResponse.json({ error: 'Nem található' }, { status: 404 });
  }

  // Check if products use this category
  const count = await prisma.product.count({ where: { category: cat.slug } });
  if (count > 0) {
    return NextResponse.json(
      { error: `${count} termék tartozik ebbe a kategóriába — előbb helyezd át őket.` },
      { status: 409 },
    );
  }

  await prisma.category.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
