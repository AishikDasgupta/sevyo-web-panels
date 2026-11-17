import { z } from 'zod';

export const createReviewSchema = z.object({
  bookingId: z.union([z.string(), z.number()]).transform((v) => String(v)),
  rating: z.coerce.number().int().min(1).max(5),
  comment: z.string().trim().max(1000).optional(),
});

export const listReviewsQuery = z.object({
  caregiverId: z.union([z.string(), z.number()]).transform((v) => String(v)).optional(),
});

export type CreateReviewBody = z.infer<typeof createReviewSchema>;