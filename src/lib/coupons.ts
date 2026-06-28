import { prisma } from './prisma';

/** Tag stored on Coupon.source so newsletter welcome coupons can be grouped. */
export const NEWSLETTER_COUPON_SOURCE = 'newsletter';

/** Months a newsletter welcome coupon stays valid from generation. */
export const NEWSLETTER_COUPON_MONTHS = 3;

/** Unambiguous code alphabet (no 0/O, 1/I/L). */
const CODE_ALPHABET = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';

function randomCode(length = 8): string {
  // crypto is available in the Node.js runtime used by the API routes.
  const { randomBytes } = require('crypto') as typeof import('crypto');
  const bytes = randomBytes(length);
  let out = '';
  for (let i = 0; i < length; i++) out += CODE_ALPHABET[bytes[i] % CODE_ALPHABET.length];
  return out;
}

export type NewsletterCoupon = { code: string; endsAt: Date; isNew: boolean };

/**
 * Creates a single-use, free parcel-locker-shipping coupon for a newsletter
 * subscriber, valid for NEWSLETTER_COUPON_MONTHS. Idempotent per e-mail: if a
 * newsletter coupon already exists for the address, that one is returned with
 * isNew=false (so the caller can skip re-sending the welcome mail). Returns
 * null on failure.
 */
export async function createNewsletterCoupon(email: string): Promise<NewsletterCoupon | null> {
  const normalizedEmail = email.trim().toLowerCase();

  // Dedup: one welcome coupon per subscriber.
  const existing = await prisma.coupon.findFirst({
    where: { source: NEWSLETTER_COUPON_SOURCE, description: normalizedEmail },
    select: { code: true, endsAt: true },
  });
  if (existing) return { ...existing, isNew: false };

  const startsAt = new Date();
  const endsAt = new Date(startsAt);
  endsAt.setMonth(endsAt.getMonth() + NEWSLETTER_COUPON_MONTHS);

  for (let attempt = 0; attempt < 6; attempt++) {
    try {
      const coupon = await prisma.coupon.create({
        data: {
          code: randomCode(8),
          description: normalizedEmail,
          discountType: 'fixed',
          discountValue: 0, // value is in the free shipping, not a price cut
          freeShippingOnParcel: true,
          usageLimit: 1,
          source: NEWSLETTER_COUPON_SOURCE,
          active: true,
          startsAt,
          endsAt,
        },
        select: { code: true, endsAt: true },
      });
      return { ...coupon, isNew: true };
    } catch {
      // Likely a unique-code collision — retry with a fresh code.
    }
  }
  console.error('Newsletter coupon creation failed for', normalizedEmail);
  return null;
}
