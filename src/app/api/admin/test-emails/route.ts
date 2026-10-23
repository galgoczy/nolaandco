import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { isAdminRequest } from '@/lib/admin-auth';
import { sendEmail } from '@/lib/emails/send';
import { orderConfirmationHtml, orderConfirmationSubject } from '@/lib/emails/order-confirmation';
import { giftCardHtml, giftCardSubject } from '@/lib/emails/gift-card';
import { testOrderSamples } from '@/lib/emails/testSamples';
import { getWeightedConfig } from '@/lib/weightedPillow.server';
import { rateLimit } from '@/lib/rateLimit';

export const runtime = 'nodejs';
export const maxDuration = 60;

const bodySchema = z.object({ to: z.string().trim().email() });

/**
 * Mintaként kiküldi a rendelés-visszaigazoló e-mail összes változatát (és az
 * ajándékkártya-levelet) a megadott címre. Valódi rendelést nem hoz létre.
 */
export async function POST(request: NextRequest) {
  if (!(await isAdminRequest())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  let to: string;
  try {
    ({ to } = bodySchema.parse(await request.json()));
  } catch {
    return NextResponse.json({ error: 'Adj meg egy érvényes e-mail címet.' }, { status: 400 });
  }
  if (!rateLimit('admin-test-emails', 3, 10 * 60 * 1000).allowed) {
    return NextResponse.json({ error: 'Túl sok küldés, próbáld újra néhány perc múlva.' }, { status: 429 });
  }

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://nolaandco.hu';
  const weighted = await getWeightedConfig();
  const samples = testOrderSamples(weighted.info, weighted.price ?? 29900);
  const total = samples.length + 1;
  const results: { label: string; ok: boolean }[] = [];

  // Sorban, kis szünettel — a Resend másodpercenkénti korlátja miatt.
  const pause = () => new Promise((r) => setTimeout(r, 600));
  for (let i = 0; i < samples.length; i++) {
    const s = samples[i];
    const res = await sendEmail({
      to,
      subject: `[TESZT ${i + 1}/${total} – ${s.label}] ${orderConfirmationSubject()}`,
      html: orderConfirmationHtml({ ...s.data, orderUrl: `${baseUrl}/fiok#rendelesek` }),
    });
    results.push({ label: s.label, ok: res.success });
    await pause();
  }
  const gift = await sendEmail({
    to,
    subject: `[TESZT ${total}/${total} – Ajándékkártya kódja] ${giftCardSubject()}`,
    html: giftCardHtml({ customerName: 'Teszt Vásárló', amount: 10000, code: 'TESZT-KOD-0000' }),
  });
  results.push({ label: 'Ajándékkártya kódja (külön levél)', ok: gift.success });

  return NextResponse.json({ results }, { status: results.every((r) => r.ok) ? 200 : 502 });
}
