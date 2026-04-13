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
  const str = (v: unknown) => (typeof v === 'string' ? v.trim() : undefined);
  const num = (v: unknown) =>
    typeof v === 'number' ? v : v !== undefined && v !== null ? Number(v) : undefined;
  const arr = (v: unknown) =>
    Array.isArray(v)
      ? v.filter((x): x is string => typeof x === 'string' && x.trim() !== '')
      : undefined;

  const update: Record<string, unknown> = {};
  if (data.name !== undefined) update.name = str(data.name);
  if (data.slug !== undefined) update.slug = str(data.slug);
  if (data.description !== undefined) update.description = str(data.description);
  if (data.longDescription !== undefined) {
    const s = str(data.longDescription);
    update.longDescription = s || null;
  }
  if (data.price !== undefined) update.price = num(data.price);
  if (data.category !== undefined) update.category = str(data.category);
  if (data.series !== undefined) update.series = str(data.series);
  if (data.variant !== undefined) update.variant = str(data.variant);
  if (data.imageUrl !== undefined) update.imageUrl = str(data.imageUrl);
  if (data.images !== undefined) update.images = arr(data.images);
  if (data.badge !== undefined) {
    const s = str(data.badge);
    update.badge = s || null;
  }
  if (data.active !== undefined) update.active = Boolean(data.active);
  if (data.onSale !== undefined) update.onSale = Boolean(data.onSale);
  if (data.salePrice !== undefined) {
    update.salePrice = data.salePrice === null || data.salePrice === '' ? null : num(data.salePrice);
  }

  try {
    const product = await prisma.product.update({ where: { id }, data: update });
    return NextResponse.json({ product });
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

  // Don't hard-delete a product that has orders — soft delete (deactivate) instead.
  const orderCount = await prisma.orderItem.count({ where: { productId: id } });
  if (orderCount > 0) {
    const product = await prisma.product.update({
      where: { id },
      data: { active: false },
    });
    return NextResponse.json({
      product,
      softDeleted: true,
      message: 'A termékhez tartoznak rendelések, ezért deaktiváltuk törlés helyett.',
    });
  }

  await prisma.product.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
