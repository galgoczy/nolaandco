export type PosterLayout = {
  id: string;
  label: string;
  series: 'origin' | 'nova';
  variant: 1 | 2 | 3;
  webImage: string;
};

export type PosterColor = {
  id: string;
  label: string;
  hex: string;
};

export const POSTER_LAYOUTS: PosterLayout[] = [
  { id: 'origin-1', label: 'Origin 1', series: 'origin', variant: 1, webImage: '/posters/web/origin-1.svg' },
  { id: 'origin-2', label: 'Origin 2', series: 'origin', variant: 2, webImage: '/posters/web/origin-2.svg' },
  { id: 'origin-3', label: 'Origin 3', series: 'origin', variant: 3, webImage: '/posters/web/origin-3.svg' },
  { id: 'nova-1', label: 'Nova 1', series: 'nova', variant: 1, webImage: '/posters/web/nova-1.svg' },
  { id: 'nova-2', label: 'Nova 2', series: 'nova', variant: 2, webImage: '/posters/web/nova-2.svg' },
  { id: 'nova-3', label: 'Nova 3', series: 'nova', variant: 3, webImage: '/posters/web/nova-3.svg' },
];

// Placeholder colors – site palette. User will refine with final hex codes later.
export const POSTER_COLORS: PosterColor[] = [
  { id: 'cream', label: 'Krém', hex: '#FAF6F1' },
  { id: 'sky', label: 'Égkék', hex: '#D5E8F0' },
  { id: 'terracotta', label: 'Terrakotta', hex: '#C4A591' },
  { id: 'sage', label: 'Zsálya', hex: '#B8C9B3' },
  { id: 'dusty-rose', label: 'Antikrózsa', hex: '#E3C2BD' },
  { id: 'carbon', label: 'Grafit', hex: '#4A4A4A' },
];

export const DEFAULT_LAYOUT_ID = 'origin-1';
export const DEFAULT_COLOR_ID = 'cream';

export function findLayout(id: string | null | undefined): PosterLayout {
  return POSTER_LAYOUTS.find((l) => l.id === id) ?? POSTER_LAYOUTS[0];
}

export function findColor(id: string | null | undefined): PosterColor {
  return POSTER_COLORS.find((c) => c.id === id) ?? POSTER_COLORS[0];
}
