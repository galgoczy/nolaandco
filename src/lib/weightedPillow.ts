/**
 * Méret- és súlyarányos emlékpárna — a közös szabályok és szövegek egy helyen,
 * hogy a termékoldal, a kosár, a pénztár és a szerver ugyanazzal számoljon.
 *
 * - A súlyarányos változat a meglévő párnák opciója, párnánként kapcsolható.
 * - A súlymaximum központi beállítás, párnánként felülírható. A szövegekben és
 *   az ellenőrzésben mindig az aktuális érték szerepel — sehol nincs beégetve.
 * - Egy központi teljes ár érvényes minden párnára.
 * - Státusz: előrendelhető / rendelhető / nem rendelhető. Érvénytelen
 *   (hiányzó) maximum vagy ár esetén a változat nem rendelhető.
 * - Sürgősségi elkészítés nem kérhető hozzá.
 */

export type WeightedStatus = 'preorder' | 'available' | 'unavailable';

/** Központi (admin) beállítás. */
export type WeightedConfig = {
  maxGrams: number | null;
  price: number | null;
  status: WeightedStatus;
  /** Az előrendelés várható elkészítési és feladási tájékoztatója. */
  info: string;
};

/** Egy adott párnára érvényes, rendelhető ajánlat. */
export type WeightedOffer = {
  status: Exclude<WeightedStatus, 'unavailable'>;
  maxGrams: number;
  price: number;
  info: string;
};

export const LIGHT_LABEL = 'Méretarányos, könnyű változat';
export const WEIGHTED_LABEL = 'Méret- és súlyarányos változat';
export const PREORDER_LABEL = 'Előrendelés';
export const VARIANT_QUESTION = 'Melyik emlékpárnát szeretnéd?';

export const LIGHT_DESCRIPTION =
  'A baba születési méretét őrzi. A születési súly feliratként szerepel rajta, de a párna nem súlyarányos.';
export const LIGHT_WEIGHT_HINT = 'Ez az adat a párna feliratán jelenik meg. A párna nem súlyarányos.';

/** A súlyarányos párnával a belföldi csomagautomata mindig ingyenes. */
export const WEIGHTED_FREE_PARCEL = 'Ingyenes belföldi csomagautomatás szállítással';

/** Van-e súlyarányos párna — ilyenkor a belföldi csomagautomata ingyenes, összeghatártól és kupontól függetlenül. */
export function weightedGrantsFreeParcel(items: { weighted?: boolean }[]): boolean {
  return items.some((i) => !!i.weighted);
}

export const WEIGHTED_MIXED_NOTE =
  'A rendelésed egy csomagban indul, amikor az előrendelt súlyarányos párna is elkészült.';

/** Grammérték magyar ezres tagolással (pl. „4 000”). */
export function formatGrams(n: number): string {
  // Kézi tagolás nem törő szóközzel: a hu-HU formázás a négyjegyűt nem tagolja.
  return String(n).replace(/\B(?=(\d{3})+(?!\d))/g, '\u00a0');
}

export function weightedDescription(maxGrams: number): string {
  return `A baba születési méretét és súlyát is megidézi. Jelenleg legfeljebb ${formatGrams(maxGrams)} g születési súlyig rendelhető.`;
}

export function weightedWeightHint(maxGrams: number): string {
  return `A párna súlya ehhez igazodik. Legfeljebb ${formatGrams(maxGrams)} g adható meg, egész grammban.`;
}

export function overMaxMessage(maxGrams: number): string {
  return `A méret- és súlyarányos változat jelenleg legfeljebb ${formatGrams(maxGrams)} g születési súlyig rendelhető. A megadott adattal a könnyű, méretarányos változatot választhatod.`;
}

/** Pozitív egész gramm, vagy null. */
export function parseGrams(value: string | null | undefined): number | null {
  const s = (value ?? '').trim();
  if (!/^\d+$/.test(s)) return null;
  const n = parseInt(s, 10);
  return n > 0 ? n : null;
}

/** A súlyarányos változat súlyellenőrzése; hibaüzenet vagy null. */
export function checkWeightedWeight(value: string | null | undefined, maxGrams: number): string | null {
  if (!(value ?? '').trim()) return 'A súlyarányos változathoz a születési súly megadása kötelező.';
  const grams = parseGrams(value);
  if (grams === null) return 'Kérlek, a születési súlyt pozitív, egész grammértékként add meg (pl. 3450).';
  if (grams > maxGrams) return overMaxMessage(maxGrams);
  return null;
}

const STATUSES: WeightedStatus[] = ['preorder', 'available', 'unavailable'];

function intOrNull(v: unknown): number | null {
  const n = typeof v === 'number' ? v : typeof v === 'string' && v.trim() ? Number(v) : NaN;
  return Number.isInteger(n) && n > 0 ? n : null;
}

/** A tárolt beállítás értelmezése; hiányzó/hibás érték = nem rendelhető. */
export function normalizeWeightedConfig(raw: unknown): WeightedConfig {
  const o = (raw && typeof raw === 'object' ? raw : {}) as Record<string, unknown>;
  return {
    maxGrams: intOrNull(o.maxGrams),
    price: intOrNull(o.price),
    status: STATUSES.includes(o.status as WeightedStatus) ? (o.status as WeightedStatus) : 'unavailable',
    info: typeof o.info === 'string' ? o.info : '',
  };
}

function validPositiveInt(n: unknown): n is number {
  return typeof n === 'number' && Number.isInteger(n) && n > 0;
}

/**
 * Az adott párnára érvényes ajánlat, vagy null, ha a súlyarányos változat ott
 * most nem rendelhető (kikapcsolt párna, nem rendelhető státusz, hiányzó vagy
 * érvénytelen maximum/ár, előrendelésnél hiányzó tájékoztató).
 */
export function offerFor(
  config: WeightedConfig,
  product: { category?: string | null; weightedEnabled?: boolean | null; weightedMaxGrams?: number | null },
): WeightedOffer | null {
  if (product.category !== 'pillow' || !product.weightedEnabled) return null;
  if (config.status === 'unavailable') return null;
  const maxGrams = product.weightedMaxGrams ?? config.maxGrams;
  if (!validPositiveInt(maxGrams) || !validPositiveInt(config.price)) return null;
  if (config.status === 'preorder' && !config.info.trim()) return null;
  return { status: config.status, maxGrams, price: config.price, info: config.info.trim() };
}

/** Megjelenítéshez: a párna neve a választott változattal. */
export function pillowVariantName(name: string, weighted: boolean | null | undefined): string {
  return `${name} – ${weighted ? 'méret- és súlyarányos változat' : 'méretarányos, könnyű változat'}`;
}

/** Súlyadat megjelenítése (a súlyarányosnál ez a kért kész súly is). */
export function weightLine(weight: string | null | undefined, weighted: boolean | null | undefined): string {
  const w = (weight ?? '').trim();
  const grams = parseGrams(w);
  const shown = grams !== null ? `${formatGrams(grams)} g` : w;
  return weighted ? `Születési súly / kért kész súly: ${shown}` : `Születési súly: ${shown}`;
}

/** Hosszadat megjelenítése („50” → „50 cm”). */
export function heightLine(height: string | null | undefined): string {
  const h = (height ?? '').trim();
  return `Születési hossz: ${/^\d+$/.test(h) ? `${h} cm` : h}`;
}

/**
 * Kosártétel újraellenőrzése az aktuális ajánlattal (kosár, pénztár): ha a
 * súlyarányos változat közben nem rendelhető lett, vagy a maximum csökkent,
 * hibaüzenet; különben null. Amíg az ajánlat nem töltött be, nincs hiba.
 */
export function weightedLineProblem(
  item: { productId: string; weighted?: boolean; birthWeight?: string },
  offers: Record<string, WeightedOffer | null> | null,
): string | null {
  if (!item.weighted || !offers) return null;
  const offer = offers[item.productId];
  if (!offer) return 'A méret- és súlyarányos változat ehhez a párnához jelenleg nem rendelhető.';
  return checkWeightedWeight(item.birthWeight, offer.maxGrams);
}

/** Előrendelt súlyarányos párna mellett van-e más szállítandó tétel. */
export function hasMixedPreorder(items: { weighted?: boolean; weightedStatus?: string | null; ships: boolean }[]): boolean {
  const isPre = (i: { weighted?: boolean; weightedStatus?: string | null }) => !!i.weighted && i.weightedStatus === 'preorder';
  return items.some(isPre) && items.some((i) => i.ships && !isPre(i));
}

/** URL-paraméter, amellyel az oldal a súlyarányos változattal nyílik meg. */
export const WEIGHTED_URL_PARAM = 'valtozat';
export const WEIGHTED_URL_VALUE = 'sulyaranyos';

const WEIGHTED_SHORT_LABEL = '1:1 méret- és súlyarány';
const WEIGHTED_SHORT_TEXT =
  'a baba születési hosszához és súlyához igazítva készül, hogy kézbe véve ne csak a méretét, hanem a születési súlyát is megidézze';
const WEIGHTED_LONG_LABEL = '1:1 méret- és súlyarány:';
const WEIGHTED_LONG_TEXT =
  'A baba születési hosszát és súlyát őrzi, puha, ölelhető formában. Külön súlyozott belső magja mellett is megtartja az eredeti babaformát, hogy újra felidézhesd, milyen érzés volt a karodban tartani';

/**
 * A termékleírás súlyarányos változata: csak a méretarányról szóló pont
 * cserélődik (az első „•” sor, amely „1:1”-et vagy „nem súlyarányos”-t
 * tartalmaz); a többi szöveg és a formázás (félkövér cím) változatlan.
 */
export function weightedDescriptionText(text: string | null | undefined, kind: 'short' | 'long'): string {
  if (!text) return '';
  const lines = text.split('\n');
  const idx = lines.findIndex((l) => /^\s*•/.test(l) && /1:1|nem súlyarányos/.test(l));
  if (idx === -1) return text;
  const line = lines[idx];
  const lead = line.match(/^\s*•\s*/)?.[0] ?? '• ';
  const bold = /^\s*•\s*\*\*/.test(line);
  if (kind === 'short') {
    const label = bold ? `**${WEIGHTED_SHORT_LABEL}**` : WEIGHTED_SHORT_LABEL;
    lines[idx] = `${lead}${label} – ${WEIGHTED_SHORT_TEXT}`;
  } else {
    const label = bold ? `**${WEIGHTED_LONG_LABEL}**` : WEIGHTED_LONG_LABEL;
    lines[idx] = `${lead}${label} ${WEIGHTED_LONG_TEXT}`;
  }
  return lines.join('\n');
}
