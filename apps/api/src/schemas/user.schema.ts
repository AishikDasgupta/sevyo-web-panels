import { z } from 'zod';

export const updateProfileSchema = z
  .object({
    name: z.string().trim().min(1).max(150).optional(),
    phone: z.string().trim().min(6).max(20).optional(),
    defaultAddress: z.string().trim().max(500).optional(),
    avatarUrl: z.string().trim().max(500).optional(),
    password: z.string().min(8).max(72).optional(),
  })
  .refine((data) => Object.keys(data).length > 0, { message: 'Nothing to update' });

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1),
  newPassword: z.string().min(8).max(72),
});

export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
export type ChangePasswordInput = z.infer<typeof changePasswordSchema>;