import { prisma } from './prisma';
import {
  ACTIVE_PRIZES,
  PROMO_COUPON_SOURCE,
  PROMO_VALID_UNTIL,
  pickPrize,
  prizeById,
  makeCode,
  type Prize,
} from './promoPrizes';
import { sendEmail } from './emails/send';
import { piciPiacPrizeSubject, piciPiacPrizeHtml } from './emails/pici-piac-nyeremeny';

/**
 * Vásári kaparós kártyák: a QR-kód tokenje azonosítja a vendéget, a
 * nyeremény a kártyához kötődik. Kuponos nyereménynél a kaparáskor valódi
 * kupon jön létre a kuponrendszerben, ugyanazzal a kóddal.
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

/** Kötegen belül nyereményenként hány kártya kapta már meg. */
export async function assignedCounts(batch: string): Promise<Record<string, number>> {
  const rows = await prisma.promoCard.groupBy({
    by: ['prizeId'],
    where: { batch, prizeId: { not: null } },
    _count: { _all: true },
  });
  const out: Record<string, number> = {};
  for (const r of rows) if (r.prizeId) out[r.prizeId] = r._count._all;
  return out;
}

/** A még kiosztható darabszámok a kötegben (keret − kiosztott). */
async function remainingCounts(batch: string, exclude?: string): Promise<Record<string, number>> {
  const assigned = await assignedCounts(batch);
  const remaining: Record<string, number> = {};
  for (const p of ACTIVE_PRIZES) {
    remaining[p.id] = p.id === exclude ? 0 : Math.max(0, p.count - (assigned[p.id] ?? 0));
  }
  return remaining;
}

/**
 * Kód foglalása a nyereményhez. Kuponos nyereménynél ez maga a kupon
 * létrehozása (a kód egyedisége a Coupon táblán garantált); ütközésnél új
 * kódot húzunk. Tárgynyereménynél csak a kártyák között kell egyedinek lennie.
 */
async function allocateCode(prize: Prize, token: string): Promise<string> {
  for (let attempt = 0; attempt < 8; attempt++) {
    const code = makeCode();
    if (prize.kind === 'coupon' && prize.coupon) {
      try {
        await prisma.coupon.create({
          data: {
            code,
            description: `Pici Piac kártya ${token}`,
            discountType: prize.coupon.discountType,
            discountValue: prize.coupon.discountValue,
            minOrderAmount: prize.coupon.minOrderAmount ?? null,
            freeShippingOnParcel: prize.coupon.freeShippingOnParcel ?? false,
            usageLimit: 1,
            source: PROMO_COUPON_SOURCE,
            active: true,
            startsAt: new Date(),
            endsAt: PROMO_VALID_UNTIL,
          },
        });
        return code;
      } catch {
        // Valószínűleg kódütközés — új kóddal próbáljuk.
      }
    } else {
      const clash = await prisma.promoCard.findFirst({ where: { couponCode: code }, select: { id: true } });
      if (!clash) return code;
    }
  }
  throw new Error('Nem sikerült egyedi kódot foglalni.');
}

/** A kártyához tartozó kupon törlése (csak a vásári forrásúakat bántjuk). */
async function deletePrizeCoupon(code: string | null | undefined) {
  if (!code) return;
  await prisma.coupon.deleteMany({ where: { code, source: PROMO_COUPON_SOURCE } });
}

/**
 * Az első kaparás: kisorsolja és a kártyához köti a nyereményt. Ha a kártya
 * már kapott nyereményt, azt adja vissza — így a beolvasás és a kaparás is
 * ugyanazt mutatja, bármikor, bárhányszor.
 *
 * Versenyhelyzet (két egyidejű kérés ugyanarra a kártyára): a feltételes
 * updateMany garantálja, hogy csak az egyik tud nyereményt írni; a vesztes
 * a saját, feleslegessé vált kuponját törli és a már beírtat olvassa vissza.
 *
 * Keret-túllépés (két kártya egyszerre húzza ugyanannak a nyereménynek az
 * utolsó darabját): beírás után visszaszámolunk, és ha a keret túlcsordult,
 * a később érkezett kártya másik, még elérhető nyereményt kap.
 */
export async function startCard(token: string): Promise<CardState | null> {
  const card = await prisma.promoCard.findUnique({ where: { token } });
  if (!card) return null;
  if (card.prizeId && card.couponCode) return getCard(token);

  const prize = pickPrize(await remainingCounts(card.batch));
  const code = await allocateCode(prize, token);
  const claimed = await prisma.promoCard.updateMany({
    where: { token, prizeId: null },
    data: { prizeId: prize.id, prizeLabel: prize.label, couponCode: code, scratchedAt: new Date() },
  });
  if (claimed.count === 0) {
    await deletePrizeCoupon(code);
    return getCard(token);
  }

  const assigned = await assignedCounts(card.batch);
  if (prize.count > 0 && (assigned[prize.id] ?? 0) > prize.count) {
    const other = pickPrize(await remainingCounts(card.batch, prize.id));
    if (other.id !== prize.id) {
      const otherCode = await allocateCode(other, token);
      await prisma.promoCard.update({
        where: { token },
        data: { prizeId: other.id, prizeLabel: other.label, couponCode: otherCode },
      });
      await deletePrizeCoupon(code);
    }
  }
  return getCard(token);
}

export type ResetResult =
  | { ok: true }
  | { ok: false; reason: 'not-found' | 'untouched' | 'coupon-used' };

/**
 * Kártya visszaállítása érintetlenre: a nyeremény visszakerül a köteg
 * keretébe, a hozzá tartozó kupon törlődik. Ha a kupont már beváltották,
 * nem engedjük — az a vendég valódi rendelése.
 */
export async function resetCard(token: string): Promise<ResetResult> {
  const card = await prisma.promoCard.findUnique({ where: { token } });
  if (!card) return { ok: false, reason: 'not-found' };
  if (!card.scratchedAt && !card.prizeId) return { ok: false, reason: 'untouched' };

  if (card.couponCode) {
    const coupon = await prisma.coupon.findUnique({
      where: { code: card.couponCode },
      select: { usageCount: true, source: true },
    });
    if (coupon && coupon.source === PROMO_COUPON_SOURCE && coupon.usageCount > 0) {
      return { ok: false, reason: 'coupon-used' };
    }
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
      redeemedAt: null,
    },
  });
  await deletePrizeCoupon(card.couponCode);
  return { ok: true };
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
