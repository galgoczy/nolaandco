import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { isAdminRequest } from '@/lib/admin-auth';

/**
 * Tesztkártya visszaállítása érintetlenre: törli a nyereményt, a kódot, a
 * kaparás időpontját és az e-mailt, hogy újra végig lehessen próbálni.
 *
 * Csak tesztkötegeknél engedett (a köteg neve tartalmazza a "teszt" szót).
 * Az éles vásári kártyát szándékosan nem lehet így nullázni: ott egy vendég
 * már kisorsolt nyereménye veszne el.
 */
export async function POST(_req: Request, { params }: { params: Promise<{ token: string }> }) {
  if (!(await isAdminRequest())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const { token } = await params;

  const card = await prisma.promoCard.findUnique({ where: { token } });
  if (!card) {
    return NextResponse.json({ error: 'A kártya nem található.' }, { status: 404 });
  }
  if (!card.batch.includes('teszt')) {
    return NextResponse.json(
      { error: 'Éles kártya nem állítható vissza — csak a tesztkötegek.' },
      { status: 403 },
    );
  }

  await prisma.promoCard.update({
    where: { token },
    data: {
      prizeId: null,
      prizeLabel: null,
      couponCode: null,
      scratchedAt: null,
      email: null,
      emailedAt: null,
    },
  });
  return NextResponse.json({ ok: true });
}
