import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { isAdminRequest } from '@/lib/admin-auth';
import { prizeById } from '@/lib/promoPrizes';

/**
 * Tárgynyeremény átvételének jelölése (vagy visszavonása) az adminból.
 * Kuponos nyereménynél nincs értelme: azt a rendelés váltja be.
 */
export async function POST(req: Request, { params }: { params: Promise<{ token: string }> }) {
  if (!(await isAdminRequest())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const { token } = await params;
  const body = (await req.json().catch(() => null)) as { redeemed?: boolean } | null;
  const redeemed = body?.redeemed !== false;

  const card = await prisma.promoCard.findUnique({ where: { token } });
  if (!card) {
    return NextResponse.json({ error: 'A kártya nem található.' }, { status: 404 });
  }
  const prize = prizeById(card.prizeId);
  if (!prize || prize.kind !== 'item') {
    return NextResponse.json({ error: 'Ez a kártya nem tárgynyereményt nyert.' }, { status: 409 });
  }

  await prisma.promoCard.update({
    where: { token },
    data: { redeemedAt: redeemed ? new Date() : null },
  });
  return NextResponse.json({ ok: true });
}
