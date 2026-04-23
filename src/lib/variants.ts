// Server-side source of truth for poster and giftcard variant prices.
// Duplicated from `src/app/termekek/[slug]/AddToCartSection.tsx`, which is
// a client component — but clients cannot be trusted for pricing, so the
// server uses this file to re-derive the price from the variant label.

export const POSTER_VARIANT_PRICES: Record<string, number> = {
  Digitális: 5900,
  Nyomtatott: 12900,
};

export const GIFTCARD_VARIANT_PRICES: Record<string, number> = {
  'Digitális poszter': 6000,
  'Print poszter + szállítás': 14000,
  'Párna + szállítás': 24000,
  'Nola Duet – digital': 27000,
  'Nola Duet – print': 33000,
};

/**
 * Resolve the authoritative price for a cart item based on its category and
 * (for variant products) its variant label. Returns null when the variant
 * cannot be matched against the allowlist — caller should reject the order.
 */
export function resolveServerPrice(args: {
  category: string | null | undefined;
  variant: string | undefined;
  basePrice: number;
  salePrice: number | null | undefined;
  onSale: boolean;
}): number | null {
  const { category, variant, basePrice, salePrice, onSale } = args;

  if (category === 'poster') {
    if (!variant) return null;
    return POSTER_VARIANT_PRICES[variant] ?? null;
  }

  if (category === 'giftcard') {
    if (!variant) return null;
    return GIFTCARD_VARIANT_PRICES[variant] ?? null;
  }

  return onSale && salePrice ? salePrice : basePrice;
}
