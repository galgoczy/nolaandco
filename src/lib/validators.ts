import { z } from 'zod';

export const birthDataSchema = z.object({
  babyName: z.string().min(2, 'Minimum 2 karakter').max(50),
  birthDate: z.string().min(1, 'Kötelező mező'),
  birthWeight: z.string().min(1, 'Kötelező mező'),
  birthHeight: z.string().min(1, 'Kötelező mező'),
  birthTime: z.string().optional(),
  customNote: z.string().max(200).optional(),
});

export const shippingSchema = z.object({
  email: z.string().email('Érvényes e-mail cím szükséges'),
  phone: z.string().optional(),
  shippingName: z.string().min(3, 'Név megadása kötelező'),
  shippingZip: z.string().optional().default(''),
  shippingCity: z.string().optional().default(''),
  shippingAddress: z.string().optional().default(''),
  shippingNote: z.string().max(500).optional(),
});

export const homeDeliverySchema = shippingSchema.extend({
  shippingName: z.string().min(3, 'Név megadása kötelező'),
  shippingZip: z.string().regex(/^\d{4}$/, 'Érvényes irányítószám (4 számjegy)'),
  shippingCity: z.string().min(2, 'Város megadása kötelező'),
  shippingAddress: z.string().min(5, 'Cím megadása kötelező'),
});

export const newsletterSchema = z.object({
  email: z.string().email('Érvényes e-mail cím szükséges'),
});

export type BirthData = z.infer<typeof birthDataSchema>;
export type ShippingData = z.infer<typeof shippingSchema>;
