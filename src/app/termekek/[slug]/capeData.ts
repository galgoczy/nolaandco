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

export type CapeConfig = {
  /** Label of the required initial-letter text input; undefined = no input. */
  initialLabel?: string;
  /** Whether the product shows the 7 designer dropdowns. */
  designer: boolean;
};

const CAPE_CONFIGS: Record<string, CapeConfig> = {
  'nola-hero-kalandkopeny': { initialLabel: 'Választott kezdőbetű', designer: false },
  'nola-stella-kalandkopeny': { initialLabel: 'Választott kezdőbetű', designer: false },
  'nola-crew-kalandkopeny': { designer: false },
  'nola-kalandkopeny-egyedi-tervezo': { initialLabel: 'Kért kezdőbetű', designer: true },
};

export function getCapeConfig(slug: string): CapeConfig {
  return CAPE_CONFIGS[slug] ?? { designer: false };
}
