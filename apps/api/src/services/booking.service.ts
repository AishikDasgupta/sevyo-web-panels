import type { BookingStatus } from '@sevyo/shared-types';
import { prisma } from '../lib/prisma';
import { badRequest, forbidden, notFound } from '../lib/errors';
import { serializeBooking } from '../lib/serialize';
import type { CreateBookingBody } from '../schemas/booking.schema';

/**
 * Allowed status transitions (SEVYO_WEBAPP_DOC.md §5).
 * Terminal states (completed, cancelled, expired) have no exits.
 */
export const TRANSITIONS: Record<BookingStatus, BookingStatus[]> = {
  pending: ['broadcast', 'cancelled'],
  broadcast: ['confirmed', 'cancelled'],
  confirmed: ['in_progress', 'cancelled', 'expired'],
  in_progress: ['completed', 'cancelled'],
  completed: [],
  cancelled: [],
  expired: [],
};

/** Flat price for instant/broadcast bookings without a specific caregiver. */
export const DEFAULT_INSTANT_PRICE = 500;

const INCLUDE = {
  user: true,
  caregiver: { include: { user: true } },
  vendor: true,
  service: true,
} as const;

function toDate(dateStr: string): Date {
  return new Date(`${dateStr}T00:00:00.000Z`);
}

function toTime(timeStr: string): Date {
  return new Date(`1970-01-01T${timeStr}:00.000Z`);
}

export async function create(userId: bigint, input: CreateBookingBody) {
  const service = await prisma.service.findUnique({ where: { id: BigInt(input.serviceId) } });
  if (!service || !service.isActive) throw badRequest('Service unavailable');

  let caregiverId: bigint | null = null;
  let vendorId: bigint | null = null;
  let status: BookingStatus;
  let price: number;

  if (input.caregiverId) {
    const caregiver = await prisma.caregiver.findUnique({
      where: { id: BigInt(input.caregiverId) },
    });
    if (!caregiver) throw notFound('Caregiver not found');
    if (!caregiver.available) throw badRequest('Caregiver is not available');

    caregiverId = caregiver.id;
    vendorId = caregiver.vendorId;
    status = 'pending';
    price = Number(caregiver.pricePerHour) * input.durationHours;
  } else {
    // Instant request — broadcast to all matching agencies
    status = 'broadcast';
    price = DEFAULT_INSTANT_PRICE;
  }

  const booking = await prisma.booking.create({
    data: {
      userId,
      caregiverId,
      vendorId,
      serviceId: service.id,
      scheduledDate: toDate(input.scheduledDate),
      scheduledTime: toTime(input.scheduledTime),
      durationHours: input.durationHours,
      visitLocation: input.visitLocation,
      address: input.address ?? null,
      status,
      paymentMethod: input.paymentMethod,
      price,
      notes: input.notes ?? null,
    },
    include: INCLUDE,
  });

  return serializeBooking(booking);
}

export async function listFor(
  requester: { id: bigint; role: string },
  status?: BookingStatus,
) {
  const where: Record<string, unknown> = {};
  if (status) where.status = status;

  if (requester.role === 'user') {
    where.userId = requester.id;
  } else if (requester.role === 'vendor') {
    const vendor = await prisma.vendor.findUnique({ where: { userId: requester.id } });
    where.vendorId = vendor?.id ?? '__none__';
  } else if (requester.role === 'resource') {
    const caregiver = await prisma.caregiver.findUnique({ where: { userId: requester.id } });
    where.caregiverId = caregiver?.id ?? '__none__';
  }
  // admin → no extra scoping

  const bookings = await prisma.booking.findMany({
    where,
    include: INCLUDE,
    orderBy: { createdAt: 'desc' },
  });
  return bookings.map(serializeBooking);
}

export async function transition(
  bookingId: bigint,
  next: BookingStatus,
  requester: { id: bigint; role: string },
  assignCaregiverId?: string,
) {
  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
    include: INCLUDE,
  });
  if (!booking) throw notFound('Booking not found');

  await assertCanTransition(requester, booking, next);

  if (!TRANSITIONS[booking.status].includes(next)) {
    throw badRequest(`Cannot move booking from ${booking.status} to ${next}`);
  }

  const data: Record<string, unknown> = { status: next };

  // Vendor accepts a broadcast by assigning one of their caregivers
  if (assignCaregiverId && next === 'confirmed') {
    const caregiver = await prisma.caregiver.findUnique({
      where: { id: BigInt(assignCaregiverId) },
    });
    if (!caregiver) throw notFound('Caregiver not found');
    data.caregiverId = caregiver.id;
    data.vendorId = caregiver.vendorId;
  }

  // Completing a visit settles payment (cash collected at doorstep / gateway TBD)
  if (next === 'completed') {
    data.paymentStatus = 'paid';
  }

  const updated = await prisma.booking.update({
    where: { id: bookingId },
    data,
    include: INCLUDE,
  });

  if (next === 'completed') {
    await settleRevenue(updated);
  }

  return serializeBooking(updated);
}

async function settleRevenue(booking: {
  vendorId: bigint | null;
  caregiverId: bigint | null;
  price: unknown;
}) {
  const price = Number(booking.price ?? 0);
  if (price <= 0) return;

  if (booking.vendorId) {
    await prisma.vendor.update({
      where: { id: booking.vendorId },
      data: { revenueTotal: { increment: price } },
    });
  }
  if (booking.caregiverId) {
    await prisma.caregiver.update({
      where: { id: booking.caregiverId },
      data: { available: true },
    });
  }
}

type BookingWithRelations = NonNullable<
  Awaited<ReturnType<typeof prisma.booking.findUnique>>
>;

async function assertCanTransition(
  requester: { id: bigint; role: string },
  booking: BookingWithRelations,
  next: BookingStatus,
) {
  switch (requester.role) {
    case 'admin':
      return;
    case 'user':
      if (booking.userId !== requester.id) throw forbidden('Not your booking');
      if (next !== 'cancelled') throw forbidden('Users may only cancel bookings');
      return;
    case 'vendor': {
      // Broadcasts are unassigned — any active vendor may claim or decline them
      if (booking.vendorId === null) {
        if (next === 'confirmed' || next === 'cancelled') return;
        throw forbidden('Vendor cannot perform this transition on an unclaimed request');
      }
      const vendor = await prisma.vendor.findUnique({ where: { userId: requester.id } });
      if (!vendor || booking.vendorId !== vendor.id) throw forbidden('Not your agency booking');
      return;
    }
    case 'resource': {
      if (
        booking.caregiverId !== null &&
        ['in_progress', 'completed', 'cancelled'].includes(next)
      ) {
        return;
      }
      throw forbidden('Resource cannot perform this transition');
    }
    default:
      throw forbidden('Unknown role');
  }
}
