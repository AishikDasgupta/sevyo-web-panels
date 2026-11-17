import { z } from 'zod';
import { USER_ROLES } from '@sevyo/shared-types';

const phoneRegex = /^[+\d][\d\s-]{5,19}$/;

export const registerSchema = z.object({
  name: z.string().trim().min(1).max(150),
  email: z.string().trim().toLowerCase().email().max(255),
  password: z.string().min(8).max(72),
  phone: z.string().regex(phoneRegex, 'Invalid phone number').optional(),
  role: z.enum(USER_ROLES),
});

export const loginSchema = z.object({
  email: z.string().trim().toLowerCase().email(),
  password: z.string().min(1),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;