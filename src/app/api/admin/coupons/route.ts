import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { isAdminRequest } from '@/lib/admin-auth';

export async function GET() {
  if (!(await isAdminRequest())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const coupons = await prisma.coupon.findMany({ orderBy: { createdAt: 'desc' } });
  return NextResponse.json({ coupons });
}

export async function POST(req: Request) {
  if (!(await isAdminRequest())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await req.json().catch(() => null);
  if (!body || typeof body !== 'object') {
    return NextResponse.json({ error: 'Érvénytelen kérés' }, { status: 400 });
  }

  const d = body as Record<string, unknown>;
  const code = (typeof d.code === 'string' ? d.code.trim().toUpperCase() : '');
  if (!code) return NextResponse.json({ error: 'Kód kötelező' }, { status: 400 });

  const discountType = d.discountType === 'fixed' ? 'fixed' : 'percent';
  const discountValue = Number(d.discountValue) || 0;
  if (discountValue <= 0) return NextResponse.json({ error: 'Kedvezmény értéke kötelező' }, { status: 400 });

  const startsAt = typeof d.startsAt === 'string' ? new Date(d.startsAt) : new Date();
  const endsAt = typeof d.endsAt === 'string' ? new Date(d.endsAt) : new Date(Date.now() + 30 * 24 * 3600 * 1000);

  const arr = (v: unknown) =>
    Array.isArray(v) ? v.filter((x): x is string => typeof x === 'string' && x.trim() !== '') : [];

  try {
    const coupon = await prisma.coupon.create({
      data: {
        code,
        description: typeof d.description === 'string' ? d.description.trim() : '',
        discountType,
        discountValue,
        minOrderAmount: typeof d.minOrderAmount === 'number' ? d.minOrderAmount : d.minOrderAmount ? Number(d.minOrderAmount) || null : null,
        usageLimit: typeof d.usageLimit === 'number' ? d.usageLimit : d.usageLimit ? Number(d.usageLimit) || null : null,
        productIds: arr(d.productIds),
        categorySlugs: arr(d.categorySlugs),
        freeShippingOnParcel: d.freeShippingOnParcel === true,
        active: d.active !== false,
        startsAt,
        endsAt,
      },
    });
    return NextResponse.json({ coupon });
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Mentés sikertelen';
    if (msg.includes('Unique constraint')) {
      return NextResponse.json({ error: 'Ez a kód már létezik' }, { status: 409 });
    }
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
