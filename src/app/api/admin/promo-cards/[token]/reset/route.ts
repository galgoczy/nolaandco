import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { isAdminRequest } from '@/lib/admin-auth';

/**
 * Kártya visszaállítása érintetlenre: törli a nyereményt, a kódot, a kaparás
 * időpontját és az e-mailt. A token (és így a nyomtatott QR-kód / link) nem
 * változik, a kártya újra kaparható.
 *
 * Tesztköteg: egy sima megerősítés elég.
 * Éles köteg: a kérésben vissza kell küldeni a kártya tokenjét (az admin
 * begépeli), és ha a nyereményről már ment ki e-mail, nem engedjük — a vendég
 * kezében ott a levél a régi nyereménnyel.
 */
export async function POST(req: Request, { params }: { params: Promise<{ token: string }> }) {
  if (!(await isAdminRequest())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const { token } = await params;

  const card = await prisma.promoCard.findUnique({ where: { token } });
  if (!card) {
    return NextResponse.json({ error: 'A kártya nem található.' }, { status: 404 });
  }
  if (!card.scratchedAt && !card.prizeId) {
    return NextResponse.json({ error: 'Ez a kártya még érintetlen.' }, { status: 409 });
  }

  const isTest = card.batch.includes('teszt');
  if (!isTest) {
    const body = (await req.json().catch(() => null)) as { confirm?: string } | null;
    if (body?.confirm?.trim().toUpperCase() !== token) {
      return NextResponse.json(
        { error: 'Éles kártyához a kártya kódját be kell gépelni megerősítésként.' },
        { status: 400 },
      );
    }
    if (card.emailedAt) {
      return NextResponse.json(
        { error: 'Erről a nyereményről már ment ki e-mail a vendégnek, ezért nem állítható vissza.' },
        { status: 409 },
      );
    }
  }

  // Ha a nyereményhez később valódi kupon is készül a kuponrendszerben, azt
  // itt kell érvényteleníteni, különben a régi kód tovább élne.
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
