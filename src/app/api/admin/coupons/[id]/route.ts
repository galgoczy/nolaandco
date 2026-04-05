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

  const d = body as Record<string, unknown>;
  const update: Record<string, unknown> = {};
  if (typeof d.code === 'string') update.code = d.code.trim().toUpperCase();
  if (typeof d.description === 'string') update.description = d.description.trim();
  if (d.discountType === 'fixed' || d.discountType === 'percent') update.discountType = d.discountType;
  if (d.discountValue !== undefined) update.discountValue = Number(d.discountValue) || 0;
  if (d.minOrderAmount !== undefined) update.minOrderAmount = d.minOrderAmount ? Number(d.minOrderAmount) || null : null;
  if (d.usageLimit !== undefined) update.usageLimit = d.usageLimit ? Number(d.usageLimit) || null : null;
  if (Array.isArray(d.productIds)) update.productIds = d.productIds.filter((x: unknown): x is string => typeof x === 'string');
  if (Array.isArray(d.categorySlugs)) update.categorySlugs = d.categorySlugs.filter((x: unknown): x is string => typeof x === 'string');
  if (typeof d.active === 'boolean') update.active = d.active;
  if (typeof d.startsAt === 'string') update.startsAt = new Date(d.startsAt);
  if (typeof d.endsAt === 'string') update.endsAt = new Date(d.endsAt);

  try {
    const coupon = await prisma.coupon.update({ where: { id }, data: update });
    return NextResponse.json({ coupon });
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Mentés sikertelen';
    if (msg.includes('Unique constraint')) {
      return NextResponse.json({ error: 'Ez a kód már létezik' }, { status: 409 });
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
  await prisma.coupon.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
