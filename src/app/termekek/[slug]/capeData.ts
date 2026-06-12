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
};

const CAPE_CONFIGS: Record<string, CapeConfig> = {
  'nola-hero-kalandkopeny': { initialLabel: 'Választott kezdőbetű', designer: false },
  'nola-stella-kalandkopeny': { initialLabel: 'Választott kezdőbetű', designer: false },
  'nola-crew-kalandkopeny': { designer: false },
  'nola-kalandkopeny-egyedi-tervezo': { initialLabel: 'Kért kezdőbetű', designer: true },
  // A kezdőbetű mező csak Hero/Stella köpeny választásakor jelenik meg.
  'szuperhos-szett': { initialLabel: 'Választott kezdőbetű', designer: false, bundle: true },
};

export function getCapeConfig(slug: string): CapeConfig {
  return CAPE_CONFIGS[slug] ?? { designer: false };
}
