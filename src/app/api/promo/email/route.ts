import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { emailCard } from '@/lib/promoCards';

export const runtime = 'nodejs';

const schema = z.object({
  token: z.string().min(6).max(12),
  email: z.string().email('Érvényes e-mail cím szükséges'),
});

/** A nyeremény elküldése a vendég saját címére. */
export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: 'Érvényes e-mail cím szükséges.' }, { status: 400 });
  }

  const token = parsed.data.token.trim().toUpperCase();
  const email = parsed.data.email.trim().toLowerCase();

  const result = await emailCard(token, email);
  if (!result.ok) {
    if (result.reason === 'not-found') {
      return NextResponse.json({ error: 'Ez a kártya nem található.' }, { status: 404 });
    }
    if (result.reason === 'not-scratched') {
      return NextResponse.json({ error: 'Előbb kapard le a szelvényt!' }, { status: 409 });
    }
    return NextResponse.json({ error: 'A levelet nem sikerült elküldeni. Próbáld újra.' }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
