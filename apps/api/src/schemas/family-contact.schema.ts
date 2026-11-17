import { z } from 'zod';

export const familyContactSchema = z.object({
  name: z.string().trim().min(1).max(150),
  phone: z.string().trim().regex(/^[+\d][\d\s-]{5,19}$/, 'Invalid phone number'),
});

export type FamilyContactInput = z.infer<typeof familyContactSchema>;