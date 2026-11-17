import { z } from 'zod';
import { CAREGIVER_TYPES } from '@sevyo/shared-types';

const specializationList = z
  .array(z.string().trim().min(1).max(100))
  .max(12)
  .optional();

export const createCaregiverSchema = z.object({
  type: z.enum(CAREGIVER_TYPES),
  pricePerHour: z.coerce.number().min(0).max(100000),
  bio: z.string().trim().max(2000).optional(),
  experienceYears: z.coerce.number().int().min(0).max(60).default(0),
  available: z.boolean().default(true),
  specializations: specializationList,
});

export const updateCaregiverSchema = createCaregiverSchema.partial().extend({
  verified: z.boolean().optional(),
});

export type CreateCaregiverBody = z.infer<typeof createCaregiverSchema>;
export type UpdateCaregiverBody = z.infer<typeof updateCaregiverSchema>;