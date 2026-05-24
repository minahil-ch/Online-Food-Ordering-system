import { z } from 'zod';

export const checkoutSchema = z.object({
  street: z.string().min(1, 'Street is required'),
  city: z.string().min(1, 'City is required'),
  zipCode: z.string().regex(/^\d{5}$/, 'ZIP code must be 5 digits'),
  paymentMethod: z.enum(['cash', 'card']),
});

export type CheckoutForm = z.infer<typeof checkoutSchema>;
