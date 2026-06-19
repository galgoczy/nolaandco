/**
 * Right-of-withdrawal ("elállás a szerződéstől") helpers.
 *
 * The 14-day, no-reason withdrawal right (45/2014. (II. 26.) Korm. rendelet)
 * applies only to non-personalised goods. Eligibility is per product
 * (Product.withdrawalEligible), since e.g. the cape category mixes personalised
 * (Hero/Stella/custom) and non-personalised (Crew) items.
 */

/** Days of the statutory withdrawal window, measured from delivery. */
export const WITHDRAWAL_WINDOW_DAYS = 14;

/**
 * Extra days added when we only know the dispatch date (not delivery), so the
 * function never disappears before the consumer's real deadline. Conservative
 * on purpose — over-availability is harmless, under-availability is the risk.
 */
const TRANSIT_BUFFER_DAYS = 7;

type ProductLike = { withdrawalEligible?: boolean | null };
type OrderItemLike = { product: ProductLike };
type OrderLike = {
  status: string;
  deliveredAt?: Date | null;
  shippedAt?: Date | null;
  createdAt: Date;
  items: OrderItemLike[];
};

const addDays = (d: Date, days: number) => new Date(d.getTime() + days * 86_400_000);

export function isWithdrawalEligibleProduct(product: ProductLike): boolean {
  return product.withdrawalEligible === true;
}

/**
 * Deadline after which the online withdrawal function may stop being offered.
 * - delivered → deliveredAt + 14 days
 * - shipped (not yet delivered) → shippedAt + transit buffer + 14 days
 * - not yet shipped → no deadline yet (right can be exercised even before
 *   receipt); returns null meaning "open".
 */
export function getWithdrawalDeadline(order: OrderLike): Date | null {
  if (order.deliveredAt) return addDays(order.deliveredAt, WITHDRAWAL_WINDOW_DAYS);
  if (order.shippedAt) return addDays(order.shippedAt, TRANSIT_BUFFER_DAYS + WITHDRAWAL_WINDOW_DAYS);
  return null;
}

/**
 * Whether the withdrawal function should be shown for this order: it has at
 * least one eligible item, it isn't cancelled, and we're still within (or
 * before) the deadline.
 */
export function isWithdrawalOpen(order: OrderLike, now: Date = new Date()): boolean {
  if (order.status === 'cancelled' || order.status === 'pending') return false;
  if (!order.items.some((it) => isWithdrawalEligibleProduct(it.product))) return false;
  const deadline = getWithdrawalDeadline(order);
  return deadline === null || now <= deadline;
}
