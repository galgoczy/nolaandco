import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { rateLimit, getClientIp } from '@/lib/rateLimit';

// Uniform "not valid" response — do NOT distinguish between "unknown code",
// "expired", "inactive", "usage limit reached" etc. Otherwise an attacker
// can iterate short codes and learn the full inventory of coupons.
const INVALID = () =>
  NextResponse.json({ error: 'Érvénytelen vagy lejárt kuponkód' }, { status: 400 });

export async function POST(req: NextRequest) {
  const ip = getClientIp(req.headers);
  const ipLimit = rateLimit(`coupon-validate:ip:${ip}`, 20, 10 * 60 * 1000);
  if (!ipLimit.allowed) {
    return NextResponse.json(
      { error: 'Túl sok próbálkozás. Kérjük, várj néhány percet.' },
      { status: 429 },
    );
  }

  const body = await req.json().catch(() => null);
  const code = typeof body?.code === 'string' ? body.code.trim().toUpperCase() : '';
  if (!code || code.length > 40) {
    return INVALID();
  }

  const now = new Date();
  const coupon = await prisma.coupon.findUnique({ where: { code } });

  if (!coupon) return INVALID();
  if (!coupon.active) return INVALID();
  if (coupon.startsAt > now) return INVALID();
  if (coupon.endsAt < now) return INVALID();
  if (coupon.usageLimit && coupon.usageCount >= coupon.usageLimit) return INVALID();

  // Return safe coupon info to the client (no internal IDs or usage stats)
  return NextResponse.json({
    valid: true,
    code: coupon.code,
    discountType: coupon.discountType,
    discountValue: coupon.discountValue,
    minOrderAmount: coupon.minOrderAmount,
    productIds: coupon.productIds,
    categorySlugs: coupon.categorySlugs,
    freeShippingOnParcel: coupon.freeShippingOnParcel,
    description: coupon.description,
  });
}
