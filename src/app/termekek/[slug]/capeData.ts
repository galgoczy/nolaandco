/**
 * Personalization config for the Nagytesó kollekció (Kalandköpenyek + Koronák).
 * Crowns have no config: they're plain add-to-cart products.
 */

export type DesignerField = {
  key: string;
  label: string;
  options: string[];
};

const SIDE_COLORS = [
  'bézs',
  'cappuccino',
  'pasztell rózsaszín',
  'dusty rózsaszín',
  'kékesszürke',
  'acélkék',
];

const MOTIFS = ['kör', 'csillag', 'pajzs', 'villám', 'hold', 'felhő'];

const ACCENT_COLORS = [
  'nyers fehér',
  'bézs',
  'mustársárga',
  'barack',
  'pink',
  'szürke',
];

export const DESIGNER_FIELDS: DesignerField[] = [
  { key: 'kulso-szin', label: 'Külső oldal színe', options: SIDE_COLORS },
  { key: 'belso-szin', label: 'Belső oldal színe', options: SIDE_COLORS },
  { key: 'motivum-1', label: 'Motívum 1.', options: MOTIFS },
  { key: 'motivum-1-szin', label: 'Motívum 1. színe', options: ACCENT_COLORS },
  { key: 'motivum-2', label: 'Motívum 2.', options: MOTIFS },
  { key: 'motivum-2-szin', label: 'Motívum 2. színe', options: ACCENT_COLORS },
  { key: 'betu-szin', label: 'Betű színe', options: ACCENT_COLORS },
];

// Bundle (Szuperhős szett): cape + crown colour choice. The fantasy names map
// to the three fixed colourways.
const SET_COLORWAYS = ['Hero – acélkék', 'Stella – dusty rózsaszín', 'Crew – cappuccino'];

export const BUNDLE_FIELDS: DesignerField[] = [
  { key: 'kopeny-szin', label: 'Kalandköpeny színe', options: SET_COLORWAYS },
  { key: 'korona-szin', label: 'Korona színe', options: SET_COLORWAYS },
];

/** Bundle: the cape-colour selections that come with an initial letter (Crew has the TESÓ shield instead). */
export const BUNDLE_CAPE_FIELD_KEY = 'kopeny-szin';
export const BUNDLE_INITIAL_CHOICES = ['Hero – acélkék', 'Stella – dusty rózsaszín'];

export type CapeConfig = {
  /** Label of the required initial-letter text input; undefined = no input. */
  initialLabel?: string;
  /** Whether the product shows the 7 designer dropdowns. */
  designer: boolean;
  /** Whether the product is the cape+crown bundle (2 colour dropdowns). */
  bundle?: boolean;
  /** Egyedi lenyíló mezők (a designer/bundle listák helyett). */
  fields?: DesignerField[];
  /** True: a csomaghoz születési adatokat kérünk (párna/poszter tétel miatt). */
  birthData?: boolean;
};

// --- Válogatások: a kurált csomagok személyre szabási mezői ---

const PILLOW_MODELS = [
  'ORIGIN Core',
  'ORIGIN Linea',
  'ORIGIN Atelier',
  'NOVA Core',
  'NOVA Linea',
  'NOVA Atelier',
];

const POSTER_DESIGNS = ['Origin 1', 'Origin 2', 'Origin 3', 'Nova 1', 'Nova 2', 'Nova 3'];

const POSTER_BACKGROUNDS = [
  'Soft Ecru',
  'Warm Beige',
  'Dusty Rose',
  'Dove Grey',
  'Sage Green',
  'Dusty Blue',
];

const PIXIE_MODELS = ['Pillangó I.', 'Pillangó II.', 'Pillangó III.', 'Pillangó IV.'];

const CLOUD_COLORWAYS = [
  'Bézs & Cappuccino',
  'Pasztell rózsaszín & Dusty rózsaszín',
  'Kékesszürke & Acélkék',
];

const HUSH_COLORS = [
  'Bézs',
  'Cappuccino',
  'Pasztell rózsaszín',
  'Dusty rózsaszín',
  'Kékesszürke',
  'Acélkék',
];

const CAPE_CONFIGS: Record<string, CapeConfig> = {
  'nola-hero-kalandkopeny': { initialLabel: 'Választott kezdőbetű', designer: false },
  'nola-stella-kalandkopeny': { initialLabel: 'Választott kezdőbetű', designer: false },
  'nola-crew-kalandkopeny': { designer: false },
  'nola-kalandkopeny-egyedi-tervezo': { initialLabel: 'Kért kezdőbetű', designer: true },
  // A kezdőbetű mező csak Hero/Stella köpeny választásakor jelenik meg.
  'szuperhos-szett': { initialLabel: 'Választott kezdőbetű', designer: false, bundle: true },
  // --- Kurált csomagok ---
  'elso-pillanatok-csomag': {
    designer: false,
    birthData: true,
    fields: [
      { key: 'parna-modell', label: 'Emlékpárna modell', options: PILLOW_MODELS },
      { key: 'poszter-dizajn', label: 'Poszter dizájn', options: POSTER_DESIGNS },
      { key: 'poszter-hatter', label: 'Poszter háttérszín', options: POSTER_BACKGROUNDS },
    ],
  },
  'meses-gyerekszoba-valogatas': {
    designer: false,
    birthData: true,
    fields: [
      { key: 'pillango-modell', label: 'Pillangó függő', options: PIXIE_MODELS },
      { key: 'poszter-dizajn', label: 'Poszter dizájn', options: POSTER_DESIGNS },
      { key: 'poszter-hatter', label: 'Poszter háttérszín', options: POSTER_BACKGROUNDS },
    ],
  },
  'kalandra-fel-csomag': {
    initialLabel: 'Választott kezdőbetű',
    designer: false,
    bundle: true,
  },
  'puha-kucko-csomag': {
    designer: false,
    fields: [
      { key: 'takaro-parositas', label: 'Takaró színpárosítás', options: CLOUD_COLORWAYS },
      { key: 'szundikendo-szin', label: 'Szundikendő színe', options: HUSH_COLORS },
    ],
  },
};

export function getCapeConfig(slug: string): CapeConfig {
  return CAPE_CONFIGS[slug] ?? { designer: false };
}
