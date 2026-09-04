/**
 * A kaparós szelvény nyereményei — a kliens (kaparófelület) és a szerver
 * (kártyához kötött sorsolás) ugyanezt a listát használja.
 *
 * DEMÓ: súlyozott véletlen. Az éles vásári körben ezt zsákból húzás váltja
 * (pontos darabszámok, visszatevés nélkül), és a nyereményhez valódi kupon
 * jön létre a kuponrendszerben.
 */

export type Prize = {
  id: string;
  weight: number;
  kind: 'coupon' | 'item';
  /** A nagy vizuál a kártyán: százalék vagy embléma. */
  big: string;
  label: string;
  desc: string;
};

export const PRIZES: Prize[] = [
  { id: 'kupon10', weight: 38, kind: 'coupon', big: '10%', label: '10% kedvezmény', desc: 'a teljes rendelésedre' },
  { id: 'kupon15', weight: 22, kind: 'coupon', big: '15%', label: '15% kedvezmény', desc: 'a teljes rendelésedre' },
  { id: 'szallitas', weight: 18, kind: 'coupon', big: '🚚', label: 'Ingyenes szállítás', desc: 'a következő rendelésedre' },
  { id: 'hush', weight: 13, kind: 'item', big: '🧸', label: 'NOLA Hush szundikendő', desc: 'választható színben, a standon átvehető' },
  { id: 'pixie', weight: 9, kind: 'item', big: '🦋', label: 'NOLA Pixie pillangó függő', desc: 'a standon átvehető' },
];

export function pickPrize(): Prize {
  const total = PRIZES.reduce((sum, p) => sum + p.weight, 0);
  let roll = Math.random() * total;
  for (const p of PRIZES) {
    roll -= p.weight;
    if (roll <= 0) return p;
  }
  return PRIZES[0];
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
