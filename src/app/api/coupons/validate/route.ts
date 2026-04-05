import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  const code = typeof body?.code === 'string' ? body.code.trim().toUpperCase() : '';
  if (!code) {
    return NextResponse.json({ error: 'Kód megadása kötelező' }, { status: 400 });
  }

  const now = new Date();
  const coupon = await prisma.coupon.findUnique({ where: { code } });

  if (!coupon) {
    return NextResponse.json({ error: 'Érvénytelen kuponkód' }, { status: 404 });
  }

  if (!coupon.active) {
    return NextResponse.json({ error: 'Ez a kupon már nem aktív' }, { status: 410 });
  }

  if (coupon.startsAt > now) {
    return NextResponse.json({ error: 'Ez a kupon még nem érvényes' }, { status: 422 });
  }

  if (coupon.endsAt < now) {
    return NextResponse.json({ error: 'Ez a kupon lejárt' }, { status: 410 });
  }

  if (coupon.usageLimit && coupon.usageCount >= coupon.usageLimit) {
    return NextResponse.json({ error: 'Ez a kupon felhasználási limit elérte' }, { status: 410 });
  }

  // Return safe coupon info to the client (no internal IDs or usage stats)
  return NextResponse.json({
    valid: true,
    code: coupon.code,
    discountType: coupon.discountType,
    discountValue: coupon.discountValue,
    minOrderAmount: coupon.minOrderAmount,
    productIds: coupon.productIds,
    categorySlugs: coupon.categorySlugs,
    description: coupon.description,
  });
}
