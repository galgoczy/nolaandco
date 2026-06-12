import { randomBytes } from 'crypto';
import { prisma } from './prisma';
import { sendEmail } from './emails/send';
import { giftCardSubject, giftCardHtml } from './emails/gift-card';

/** Unambiguous characters only (no 0/O, 1/I/L). */
const CODE_ALPHABET = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';

function randomSegment(length: number): string {
  const bytes = randomBytes(length);
  let out = '';
  for (let i = 0; i < length; i++) {
    out += CODE_ALPHABET[bytes[i] % CODE_ALPHABET.length];
  }
  return out;
}

function generateGiftCardCode(): string {
  return `NOLA-${randomSegment(4)}-${randomSegment(4)}`;
}

/** Marker stored in Coupon.description so fulfillment stays idempotent per order. */
function descriptionFor(orderId: string): string {
  return `Digitális ajándékkártya – rendelés ${orderId}`;
}

/**
 * Creates one single-use, fixed-amount coupon per purchased gift card item and
 * emails the code(s) to the buyer. Safe to call multiple times for the same
 * order (webhook retries, admin status flips): already-fulfilled orders are
 * skipped.
 */
export async function fulfillGiftCardsForOrder(orderId: string): Promise<void> {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: { items: { include: { product: true } } },
  });
  if (!order) return;

  const giftCardItems = order.items.filter(
    (item) => item.product.category === 'giftcard'
  );
  if (giftCardItems.length === 0) return;

  // Idempotency: if coupons already exist for this order, do nothing.
  const existing = await prisma.coupon.findFirst({
    where: { description: descriptionFor(orderId) },
    select: { id: true },
  });
  if (existing) return;

  const now = new Date();
  const oneYearLater = new Date(now);
  oneYearLater.setFullYear(oneYearLater.getFullYear() + 1);

  const customerName = order.shippingName || 'Vásárlónk';

  for (const item of giftCardItems) {
    for (let i = 0; i < item.quantity; i++) {
      // Retry on the (astronomically unlikely) code collision.
      let coupon = null;
      for (let attempt = 0; attempt < 5 && !coupon; attempt++) {
        try {
          coupon = await prisma.coupon.create({
            data: {
              code: generateGiftCardCode(),
              description: descriptionFor(orderId),
              discountType: 'fixed',
              discountValue: item.price,
              usageLimit: 1,
              freeShippingOnParcel: true,
              active: true,
              startsAt: now,
              endsAt: oneYearLater,
            },
          });
        } catch {
          coupon = null;
        }
      }
      if (!coupon) {
        console.error(`Gift card coupon creation failed for order ${orderId}`);
        continue;
      }

      try {
        await sendEmail({
          to: order.email,
          subject: giftCardSubject(),
          html: giftCardHtml({
            customerName,
            amount: item.price,
            code: coupon.code,
          }),
        });
      } catch (err) {
        console.error(`Gift card email failed for order ${orderId}:`, err);
      }
    }
  }
}
