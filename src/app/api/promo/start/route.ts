import { NextRequest, NextResponse } from 'next/server';
import { startCard } from '@/lib/promoCards';

export const runtime = 'nodejs';

/**
 * Az első kaparás: a kártya nyereményt kap és onnantól mindig ugyanazt mutatja.
 * Idempotens — ismételt hívás a már kisorsolt nyereményt adja vissza.
 */
export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  const token = typeof body?.token === 'string' ? body.token.trim().toUpperCase() : '';
  if (!/^[A-Z0-9]{6,12}$/.test(token)) {
    return NextResponse.json({ error: 'Érvénytelen kártya.' }, { status: 400 });
  }

  const card = await startCard(token);
  if (!card || !card.prize || !card.code) {
    return NextResponse.json({ error: 'Ez a kártya nem található.' }, { status: 404 });
  }

  return NextResponse.json({
    prize: card.prize,
    code: card.code,
    email: card.email,
  });
}
