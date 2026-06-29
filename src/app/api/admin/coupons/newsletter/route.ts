import { NextResponse } from 'next/server';
import { isAdminRequest } from '@/lib/admin-auth';
import { createNewsletterCoupon } from '@/lib/coupons';

export const runtime = 'nodejs';

/**
 * Admin: create a newsletter (free parcel-shipping, single-use, 3-month) coupon
 * for a given e-mail, optionally with an explicit code — e.g. to back a code
 * that was already e-mailed by hand. Appears in the admin "Hírlevél kuponok".
 */
export async function POST(req: Request) {
  if (!(await isAdminRequest())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = (await req.json().catch(() => null)) as { email?: string; code?: string } | null;
  const email = body?.email?.trim();
  const code = body?.code?.trim();

  if (!email || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
    return NextResponse.json({ error: 'Érvényes e-mail cím szükséges.' }, { status: 400 });
  }
  if (code && !/^[A-Za-z0-9]{4,16}$/.test(code)) {
    return NextResponse.json(
      { error: 'A kód 4–16 betű/szám lehet (szóköz és írásjel nélkül).' },
      { status: 400 }
    );
  }

  const coupon = await createNewsletterCoupon(email, code ? { code } : undefined);
  if (!coupon) {
    return NextResponse.json(
      { error: 'Nem sikerült létrehozni — lehet, hogy ez a kód már foglalt. Próbálj másikat.' },
      { status: 409 }
    );
  }

  return NextResponse.json({ ok: true, code: coupon.code });
}
