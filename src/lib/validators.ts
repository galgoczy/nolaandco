import { z } from 'zod';

export const birthDataSchema = z.object({
  babyName: z.string().min(2, 'Minimum 2 karakter').max(50),
  birthDate: z.string().min(1, 'Kötelező mező').max(20),
  birthWeight: z.string().min(1, 'Kötelező mező').max(20),
  birthHeight: z.string().min(1, 'Kötelező mező').max(20),
  birthTime: z.string().max(10).optional(),
  customNote: z.string().max(200).optional(),
});

export const shippingSchema = z.object({
  email: z.string().email('Érvényes e-mail cím szükséges').max(120),
  phone: z.string().max(30).optional(),
  shippingName: z.string().min(3, 'Név megadása kötelező').max(120),
  shippingZip: z.string().max(10).optional().default(''),
  shippingCity: z.string().max(80).optional().default(''),
  shippingAddress: z.string().max(200).optional().default(''),
  shippingNote: z.string().max(500).optional(),
  billingZip: z.string().regex(/^\d{4}$/, 'Érvényes irányítószám (4 számjegy)'),
  billingCity: z.string().min(2, 'Város megadása kötelező').max(80),
  billingAddress: z.string().min(5, 'Utca, házszám megadása kötelező').max(200),
});

export const homeDeliverySchema = shippingSchema.extend({
  shippingName: z.string().min(3, 'Név megadása kötelező').max(120),
  shippingZip: z.string().regex(/^\d{4}$/, 'Érvényes irányítószám (4 számjegy)'),
  shippingCity: z.string().min(2, 'Város megadása kötelező').max(80),
  shippingAddress: z.string().min(5, 'Cím megadása kötelező').max(200),
});

export const newsletterSchema = z.object({
  email: z.string().email('Érvényes e-mail cím szükséges').max(120),
  consent: z.literal(true, {
    errorMap: () => ({ message: 'A hírlevél feliratkozáshoz a hozzájárulás megadása kötelező.' }),
  }),
});

// Runtime schema for a cart item arriving at /api/checkout. Prices on
// cart items are NOT authoritative — the server re-derives them using
// the DB product row plus (for poster/giftcard variants) a server-side
// allowlist. We still cap field sizes here to prevent DB-bloat and
// email-size DoS attacks.
export const cartItemSchema = z.object({
  id: z.string().max(120).optional(),
  productId: z.string().min(1).max(40),
  name: z.string().max(200).optional(),
  slug: z.string().max(120).optional(),
  price: z.number().int().nonnegative().max(1_000_000).optional(),
  imageUrl: z.string().max(500).optional(),
  quantity: z.number().int().positive().max(20),
  babyName: z.string().max(50).optional(),
  birthDate: z.string().max(20).optional(),
  birthWeight: z.string().max(20).optional(),
  birthHeight: z.string().max(20).optional(),
  birthTime: z.string().max(10).optional(),
  customNote: z.string().max(500).optional(),
  variant: z.string().max(80).optional(),
  posterLayout: z.string().max(40).optional(),
  posterLayoutLabel: z.string().max(80).optional(),
});

export const checkoutSchema = z.object({
  items: z.array(cartItemSchema).min(1).max(30),
  shipping: z.record(z.unknown()),
  shippingMethod: z.enum(['parcel', 'home']),
  paymentMethod: z.enum(['card', 'transfer']).optional(),
  couponCode: z.string().max(40).nullable().optional(),
  saveData: z.boolean().optional(),
});

export type BirthData = z.infer<typeof birthDataSchema>;
export type ShippingData = z.infer<typeof shippingSchema>;
