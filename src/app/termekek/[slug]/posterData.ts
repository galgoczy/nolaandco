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
  { id: 'origin-1', label: 'Origin 1', series: 'origin', variant: 1, webImage: '/posters/web/origin-1.png' },
  { id: 'origin-2', label: 'Origin 2', series: 'origin', variant: 2, webImage: '/posters/web/origin-2.png' },
  { id: 'origin-3', label: 'Origin 3', series: 'origin', variant: 3, webImage: '/posters/web/origin-3.png' },
  { id: 'nova-1', label: 'Nova 1', series: 'nova', variant: 1, webImage: '/posters/web/nova-1.png' },
  { id: 'nova-2', label: 'Nova 2', series: 'nova', variant: 2, webImage: '/posters/web/nova-2.png' },
  { id: 'nova-3', label: 'Nova 3', series: 'nova', variant: 3, webImage: '/posters/web/nova-3.png' },
];

// The 6 poster background colors. On the printed poster each color is applied
// at 43% opacity over a white substrate — so the rendered preview blends the
// color with white via rgba alpha.
export const POSTER_COLOR_ALPHA = 0.43;

export const POSTER_COLORS: PosterColor[] = [
  { id: 'soft-ecru', label: 'Soft Ecru', hex: '#F7F0E4' },
  { id: 'warm-beige', label: 'Warm Beige', hex: '#E8C5AE' },
  { id: 'dusty-rose', label: 'Dusty Rose', hex: '#F5D7D7' },
  { id: 'dove-grey', label: 'Dove Grey', hex: '#CCCCCC' },
  { id: 'sage-green', label: 'Sage Green', hex: '#BDC7B7' },
  { id: 'dusty-blue', label: 'Dusty Blue', hex: '#B7BDC7' },
];

export const DEFAULT_LAYOUT_ID = 'origin-1';
export const DEFAULT_COLOR_ID = 'soft-ecru';

export function findLayout(id: string | null | undefined): PosterLayout {
  return POSTER_LAYOUTS.find((l) => l.id === id) ?? POSTER_LAYOUTS[0];
}

export function findColor(id: string | null | undefined): PosterColor {
  return POSTER_COLORS.find((c) => c.id === id) ?? POSTER_COLORS[0];
}

/** Convert a hex color + alpha to an rgba() CSS string. */
export function hexToRgba(hex: string, alpha: number): string {
  const h = hex.replace('#', '');
  const r = parseInt(h.substring(0, 2), 16);
  const g = parseInt(h.substring(2, 4), 16);
  const b = parseInt(h.substring(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

/** Background color as displayed on the poster (with the 43% opacity applied). */
export function posterBackground(color: PosterColor): string {
  return hexToRgba(color.hex, POSTER_COLOR_ALPHA);
}

