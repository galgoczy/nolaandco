import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { isAdminRequest } from '@/lib/admin-auth';
import { resetCard } from '@/lib/promoCards';

/**
 * Kártya visszaállítása érintetlenre: törli a nyereményt, a kódot, a kaparás
 * időpontját, az e-mailt és a hozzá tartozó kupont. A token (és így a
 * nyomtatott QR-kód / link) nem változik, a kártya újra kaparható, a
 * nyeremény visszakerül a köteg keretébe.
 *
 * Tesztköteg: egy sima megerősítés elég.
 * Éles köteg: a kérésben vissza kell küldeni a kártya tokenjét (az admin
 * begépeli), és ha a nyereményről már ment ki e-mail, nem engedjük — a vendég
 * kezében ott a levél a régi nyereménnyel.
 * Már beváltott kupont egyik kötegben sem állítunk vissza.
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

  const result = await resetCard(token);
  if (!result.ok) {
    const messages: Record<string, string> = {
      'not-found': 'A kártya nem található.',
      untouched: 'Ez a kártya még érintetlen.',
      'coupon-used': 'A kártya kuponját már beváltották egy rendelésben, ezért nem állítható vissza.',
    };
    return NextResponse.json({ error: messages[result.reason] }, { status: result.reason === 'not-found' ? 404 : 409 });
  }
  return NextResponse.json({ ok: true });
}
