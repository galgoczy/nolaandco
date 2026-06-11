import type { CartItemData } from '@/store/cart';

/**
 * Returns true when a single cart line needs physical shipping.
 *
 * Rules (keep in sync with server-side verification in /api/checkout):
 * - giftcard category → never ships (digital delivery or shipping baked into price)
 * - poster category + "Digitális" variant → digital file, no shipping
 * - everything else → ships
 */
export function cartItemRequiresShipping(item: {
  slug?: string;
  variant?: string;
  category?: string | null;
}): boolean {
  const category = (item.category ?? '').toLowerCase();
  const variant = (item.variant ?? '').toLowerCase();

  if (category === 'giftcard' || item.slug === 'nola-ajandekkartya') {
    return false;
  }
  if ((category === 'poster' || item.slug === 'poszter') && variant.startsWith('digit')) {
    return false;
  }
  return true;
}

/** True if at least one line in the cart requires shipping. */
export function cartRequiresShipping(
  items: Array<Pick<CartItemData, 'slug' | 'variant'> & { category?: string | null }>,
): boolean {
  return items.some((i) => cartItemRequiresShipping(i));
}
