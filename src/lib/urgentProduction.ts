/**
 * Sürgősségi elkészítés az emlékpárnákhoz — a közös szabályok egy helyen,
 * hogy a termékoldal, a kosár, a pénztár és a szerver ugyanazzal számoljon.
 *
 * - Normál elkészítés: kb. 1 hét. Sürgős: 2–3 munkanap. Mindkettő gyártási
 *   idő; a kézbesítés ezen felül értendő.
 * - Felár rendelésenként: az első sürgős párna +4 000 Ft, minden további
 *   +2 000 Ft (bruttó). Nem szállítási díj, külön sorként szerepel.
 * - A kupon nem csökkenti a felárat. Sürgős párnával a belföldi
 *   csomagautomatás szállítás mindig ingyenes, akkor is, ha a kedvezmény
 *   25 000 Ft alá viszi a rendelést (házhozszállításra nem vonatkozik).
 * - Az admin ki-be kapcsolhatja a szabad kapacitás szerint; kikapcsolva a
 *   szerver elutasítja a sürgős tételt.
 * - Vegyes kosár engedett: ha normál párna vagy más, hosszabb gyártású termék
 *   is van a rendelésben, jelezzük, hogy a csomag a leglassabb tétellel indul.
 */

export const URGENT_FIRST_FEE = 4000;
export const URGENT_EXTRA_FEE = 2000;

export const URGENT_LABEL = 'Sürgősségi elkészítés';
export const NORMAL_LABEL = 'Normál elkészítés';
export const URGENT_DURATION = '2–3 munkanap';
export const NORMAL_DURATION = 'kb. 1 hét';

/** Az elkészítési idő kezdete — a visszaigazolásokon szó szerint ez szerepel. */
export const PRODUCTION_START_NOTE =
  'Az elkészítési idő akkor indul, amikor a fizetés és minden személyre szabási adat beérkezett. A szállítás ideje ezen felül értendő.';

/** Sürgős párnával a belföldi csomagautomatás szállítás mindig ingyenes. */
export const URGENT_FREE_PARCEL_NOTE =
  'Belföldön csomagautomatába ingyenes a szállítás, kedvezménnyel együtt is. Házhozszállításnál a szállítási díj felszámításra kerül.';

/** Van-e sürgős tétel — ilyenkor a belföldi csomagautomata ingyenes, összeghatártól függetlenül. */
export function urgentGrantsFreeParcel(urgentCount: number): boolean {
  return urgentCount > 0;
}

/** Vegyes kosár figyelmeztetése (sürgős párna mellett lassabban készülő tétel). */
export const URGENT_MIXED_NOTE =
  'A rendelésed egy csomagban indul, amikor minden tétel elkészült. Mivel a rendelésben normál elkészítésű termék is van, a sürgős párna is azzal együtt kerül postára.';

/** Mely termékekhez választható. Jelenleg az emlékpárnákhoz. */
export function isUrgentEligible(category: string | null | undefined): boolean {
  return category === 'pillow';
}

/** A felár a sürgős párnák darabszámából: az első 4 000, minden további 2 000 Ft. */
export function urgentFeeFor(count: number): number {
  if (count <= 0) return 0;
  return URGENT_FIRST_FEE + (count - 1) * URGENT_EXTRA_FEE;
}

/** Mennyivel nőne a felár, ha még egy sürgős párna kerülne a rendelésbe. */
export function nextUrgentFee(currentCount: number): number {
  return urgentFeeFor(currentCount + 1) - urgentFeeFor(currentCount);
}

type Line = {
  category?: string | null;
  urgent?: boolean;
  quantity: number;
};

/** Hány sürgős emlékpárna van a tételek között (darabszámban). */
export function countUrgent(items: Line[]): number {
  return items.reduce(
    (n, i) => n + (i.urgent && isUrgentEligible(i.category) ? i.quantity : 0),
    0,
  );
}

/** Rendelésre készülő, a sürgős párnánál hosszabb gyártási idejű kategóriák. */
const MADE_TO_ORDER = ['pillow', 'poster', 'cape', 'crown', 'bundle'];

/**
 * Van-e a sürgős párna mellett olyan szállítandó tétel, ami lassabban készül
 * (normál párna, poszter, köpeny, korona, csomag). A készleten lévő textilek és
 * függők nem számítanak, a digitális tételeket a hívó szűri ki (`ships`).
 */
export function hasSlowerItems(items: (Line & { ships: boolean })[]): boolean {
  return items.some((i) => {
    if (!i.ships) return false;
    if (!i.category || !MADE_TO_ORDER.includes(i.category)) return false;
    return !(isUrgentEligible(i.category) && i.urgent);
  });
}
