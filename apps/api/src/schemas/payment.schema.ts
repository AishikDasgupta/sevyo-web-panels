import { z } from 'zod';

/** Accept ids as string or number (API serializes BigInt ids as strings). */
const idField = z.union([z.string(), z.number()]).transform((v) => String(v));

export const createRazorpayOrderSchema = z.object({
  bookingId: idField,
});

export const verifyRazorpayPaymentSchema = z.object({
  bookingId: idField,
  razorpayOrderId: z.string().min(1),
  razorpayPaymentId: z.string().min(1),
  razorpaySignature: z.string().min(1),
});

export type CreateRazorpayOrderBody = z.infer<typeof createRazorpayOrderSchema>;
export type VerifyRazorpayPaymentBody = z.infer<typeof verifyRazorpayPaymentSchema>;
