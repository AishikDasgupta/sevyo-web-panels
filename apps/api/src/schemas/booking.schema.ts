import { z } from 'zod';
import { BOOKING_STATUSES, BOOKING_VISIT_LOCATIONS, PAYMENT_METHODS } from '@sevyo/shared-types';

/** Accept ids as string or number (API serializes BigInt ids as strings). */
const idField = z.union([z.string(), z.number()]).transform((v) => String(v));

const dateField = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, 'Use YYYY-MM-DD');

const timeField = z
  .string()
  .regex(/^([01]\d|2[0-3]):[0-5]\d$/, 'Use HH:mm (24h)');

export const createBookingSchema = z
  .object({
    serviceId: idField,
    caregiverId: idField.nullable().optional(),
    scheduledDate: dateField,
    scheduledTime: timeField,
    durationHours: z.coerce.number().positive().max(24).multipleOf(0.5).default(1),
    visitLocation: z.enum(BOOKING_VISIT_LOCATIONS).default('home'),
    address: z.string().trim().max(500).optional(),
    paymentMethod: z.enum(PAYMENT_METHODS).default('cash'),
    notes: z.string().trim().max(1000).optional(),
  })
  .refine((data) => data.visitLocation !== 'site' || Boolean(data.address?.trim()), {
    message: 'Address is required for on-site visits',
    path: ['address'],
  });

export const bookingTransitionSchema = z.object({
  status: z.enum(BOOKING_STATUSES),
  caregiverId: idField.optional(),
});

export const listBookingsQuery = z.object({
  status: z.enum(BOOKING_STATUSES).optional(),
});

export type CreateBookingBody = z.infer<typeof createBookingSchema>;
export type BookingTransitionBody = z.infer<typeof bookingTransitionSchema>;