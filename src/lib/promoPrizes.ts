/**
 * A kaparós szelvény nyereményei — a kliens (kaparófelület) és a szerver
 * (kártyához kötött sorsolás) ugyanezt a listát használja.
 *
 * Sorsolás: zsákból húzás, visszatevés nélkül. A `count` a kötegenkénti
 * keret (hány kártya nyerheti az adott nyereményt); a szerver a még ki nem
 * osztott darabok arányában sorsol, így a keret sosem lépődik túl. A demó
 * oldal ugyanezekkel a súlyokkal, de keret nélkül sorsol a böngészőben.
 *
 * Kuponos nyereményhez a kaparáskor valódi, egyszer használható kupon jön
 * létre a kuponrendszerben (`source: PROMO_COUPON_SOURCE`), a kártyán látható
 * kóddal. Tárgynyereménynél a kód csak átvételi azonosító.
 */

export type CouponSpec = {
  discountType: 'percent' | 'fixed';
  discountValue: number;
  minOrderAmount?: number;
  freeShippingOnParcel?: boolean;
};

export type Prize = {
  id: string;
  kind: 'coupon' | 'item';
  /** Kötegenkénti keret. 0 = már nem sorsolható (régi, csak megjelenítéshez). */
  count: number;
  /** A nagy vizuál a kártyán: százalék, összeg vagy embléma. */
  big: string;
  label: string;
  desc: string;
  coupon?: CouponSpec;
};

/** A kuponok forrás-címkéje a Coupon táblában (adminban külön listázva). */
export const PROMO_COUPON_SOURCE = 'pici-piac';

/** A vásári nyeremények beváltási határideje (2026. október 6., Budapest). */
export const PROMO_VALID_UNTIL = new Date('2026-10-06T21:59:59.000Z');
export const PROMO_VALID_UNTIL_TEXT = 'október 6-ig';

/** Tárgynyeremény átvételének egyeztetése, ha a vendég már nincs a vásáron. */
export const PROMO_CONTACT_EMAIL = 'hello@nolaandco.hu';

export const PRIZES: Prize[] = [
  {
    id: 'kupon15',
    kind: 'coupon',
    count: 25,
    big: '15%',
    label: '15% kedvezmény',
    desc: `a teljes rendelésedre, ${PROMO_VALID_UNTIL_TEXT}`,
    coupon: { discountType: 'percent', discountValue: 15 },
  },
  {
    id: 'szallitas',
    kind: 'coupon',
    count: 15,
    big: '🚚',
    label: 'Ingyenes csomagautomatás szállítás',
    desc: `belföldi csomagautomatába, ${PROMO_VALID_UNTIL_TEXT}`,
    coupon: { discountType: 'fixed', discountValue: 0, freeShippingOnParcel: true },
  },
  {
    id: 'kupon20',
    kind: 'coupon',
    count: 5,
    big: '20%',
    label: '20% kedvezmény',
    desc: `a teljes rendelésedre, ${PROMO_VALID_UNTIL_TEXT}`,
    coupon: { discountType: 'percent', discountValue: 20 },
  },
  {
    id: 'joviras3000',
    kind: 'coupon',
    count: 4,
    big: '3 000 Ft',
    label: '3 000 Ft jóváírás',
    desc: `15 000 Ft feletti rendelésre, ${PROMO_VALID_UNTIL_TEXT}`,
    coupon: { discountType: 'fixed', discountValue: 3000, minOrderAmount: 15000 },
  },
  {
    id: 'szundikendo',
    kind: 'item',
    count: 1,
    big: '🧸',
    label: 'Szundikendő ajándékba',
    desc: 'választható színben — a standnál átvehető, vagy e-mailben egyeztetve',
  },

  // Régi (demó-kori) nyeremények: már nem sorsolhatók, de a korábban
  // lekapart tesztkártyák még ezeket mutatják.
  { id: 'kupon10', kind: 'coupon', count: 0, big: '10%', label: '10% kedvezmény', desc: 'a teljes rendelésedre' },
  { id: 'hush', kind: 'item', count: 0, big: '🧸', label: 'NOLA Hush szundikendő', desc: 'választható színben, a standon átvehető' },
  { id: 'pixie', kind: 'item', count: 0, big: '🦋', label: 'NOLA Pixie pillangó függő', desc: 'a standon átvehető' },
];

/** A sorsolható nyeremények (keret > 0). */
export const ACTIVE_PRIZES = PRIZES.filter((p) => p.count > 0);

/** Összes kártya, amit egy köteg kerete lefed. */
export const POOL_SIZE = ACTIVE_PRIZES.reduce((sum, p) => sum + p.count, 0);

/**
 * Súlyozott sorsolás. `remaining` nélkül a teljes keret a súly (demó);
 * kötegen belül a szerver a még kiosztatlan darabszámokat adja át.
 */
export function pickPrize(remaining?: Record<string, number>): Prize {
  const weights = ACTIVE_PRIZES.map((p) => {
    const w = remaining ? (remaining[p.id] ?? 0) : p.count;
    return w > 0 ? w : 0;
  });
  const total = weights.reduce((sum, w) => sum + w, 0);
  if (total <= 0) {
    // Kimerült keret (elvileg nem fordul elő: 50 kártya, 50 nyeremény).
    // A legnagyobb keretű nyereményre esünk vissza.
    return ACTIVE_PRIZES.reduce((best, p) => (p.count > best.count ? p : best), ACTIVE_PRIZES[0]);
  }
  let roll = Math.random() * total;
  for (let i = 0; i < ACTIVE_PRIZES.length; i++) {
    roll -= weights[i];
    if (roll <= 0 && weights[i] > 0) return ACTIVE_PRIZES[i];
  }
  return ACTIVE_PRIZES[ACTIVE_PRIZES.length - 1];
}

export function prizeById(id: string | null | undefined): Prize | null {
  if (!id) return null;
  return PRIZES.find((p) => p.id === id) ?? null;
}

/** Egyedi kinézetű kód — összetéveszthető karakterek (0/O, 1/I/L) nélkül. */
export function makeCode(): string {
  const chars = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';
  let out = '';
  for (let i = 0; i < 8; i++) {
    out += chars[Math.floor(Math.random() * chars.length)];
    if (i === 3) out += '-';
  }
  return 'PICI-' + out;
}
