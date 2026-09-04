import { prisma } from './prisma';
import { pickPrize, prizeById, makeCode, type Prize } from './promoPrizes';
import { sendEmail } from './emails/send';
import { piciPiacPrizeSubject, piciPiacPrizeHtml } from './emails/pici-piac-nyeremeny';

/**
 * Vásári kaparós kártyák: a QR-kód tokenje azonosítja a vendéget, a
 * nyeremény a kártyához kötődik.
 */

export type CardState = {
  token: string;
  prize: Prize | null;
  code: string | null;
  scratchedAt: Date | null;
  email: string | null;
};

export async function getCard(token: string): Promise<CardState | null> {
  const card = await prisma.promoCard.findUnique({ where: { token } });
  if (!card) return null;
  return {
    token: card.token,
    prize: prizeById(card.prizeId),
    code: card.couponCode,
    scratchedAt: card.scratchedAt,
    email: card.email,
  };
}

/**
 * Az első kaparás: kisorsolja és a kártyához köti a nyereményt. Ha a kártya
 * már kapott nyereményt, azt adja vissza — így a beolvasás és a kaparás is
 * ugyanazt mutatja, bármikor, bárhányszor.
 *
 * Versenyhelyzet (két egyidejű kérés ugyanarra a kártyára): a feltételes
 * updateMany garantálja, hogy csak az egyik tud nyereményt írni; a másik a
 * már beírtat olvassa vissza.
 */
export async function startCard(token: string): Promise<CardState | null> {
  const existing = await getCard(token);
  if (!existing) return null;
  if (existing.prize && existing.code) return existing;

  const prize = pickPrize();
  const code = makeCode();
  await prisma.promoCard.updateMany({
    where: { token, prizeId: null },
    data: { prizeId: prize.id, prizeLabel: prize.label, couponCode: code, scratchedAt: new Date() },
  });
  return getCard(token);
}

/** A nyeremény elküldése a vendégnek — csak már kikapart kártyára. */
export async function emailCard(
  token: string,
  email: string,
): Promise<{ ok: true } | { ok: false; reason: 'not-found' | 'not-scratched' | 'send-failed' }> {
  const card = await getCard(token);
  if (!card) return { ok: false, reason: 'not-found' };
  if (!card.prize || !card.code) return { ok: false, reason: 'not-scratched' };

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://nolaandco.hu';
  const result = await sendEmail({
    to: email,
    subject: piciPiacPrizeSubject(),
    html: piciPiacPrizeHtml({
      prizeLabel: card.prize.label,
      prizeDesc: card.prize.desc,
      isCoupon: card.prize.kind === 'coupon',
      code: card.code,
      shopUrl: `${baseUrl}/termekek`,
      cardUrl: `${baseUrl}/pp/${card.token}`,
    }),
  });
  if (!result.success) {
    console.error('Pici Piac nyeremény-levél nem ment ki', { token, email, error: result.error });
    return { ok: false, reason: 'send-failed' };
  }

  await prisma.promoCard.update({
    where: { token },
    data: { email, emailedAt: new Date() },
  });
  return { ok: true };
}
