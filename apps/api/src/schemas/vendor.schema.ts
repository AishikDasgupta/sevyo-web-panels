import { z } from 'zod';

export const upsertVendorSchema = z.object({
  agencyName: z.string().trim().min(1).max(200),
  location: z.string().trim().max(255).optional(),
  contactEmail: z.string().trim().toLowerCase().email().optional(),
  contactPhone: z.string().trim().min(6).max(20).optional(),
  logoUrl: z.string().trim().max(500).optional(),
});

export type UpsertVendorInput = z.infer<typeof upsertVendorSchema>;