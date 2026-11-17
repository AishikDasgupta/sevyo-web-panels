import type { BookingStatus } from '@sevyo/shared-types';
import { prisma } from '../lib/prisma';
import { badRequest, forbidden, notFound } from '../lib/errors';
import { serializeBooking } from '../lib/serialize';
import { adminUserIds, notifyUsers } from '../lib/notify';
import type { CreateBookingBody } from '../schemas/booking.schema';

/**
 * Allowed status transitions (SEVYO_WEBAPP_DOC.md §5).
 * Terminal states (completed, cancelled, expired) have no exits.
 */
export const TRANSITIONS: Record<BookingStatus, BookingStatus[]> = {
  pending: ['broadcast', 'confirmed', 'cancelled'],
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
    if (caregiver.vendorId) {
      const vendor = await prisma.vendor.findUnique({ where: { id: caregiver.vendorId } });
      if (!vendor || vendor.status !== 'active') {
        throw badRequest('Caregiver is temporarily unavailable');
      }
    }
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

  await notifyBookingParties(booking, 'created');

  return serializeBooking(booking);
}

export async function listFor(
  requester: { id: bigint; role: string },
  status?: BookingStatus,
) {
  const where: Record<string, unknown> = status ? { status } : {};

  if (requester.role === 'user') {
    where.userId = requester.id;
  } else if (requester.role === 'vendor') {
    const vendor = await prisma.vendor.findUnique({ where: { userId: requester.id } });
    const own = { vendorId: vendor?.id ?? '__none__' };
    // Active agencies also see the unclaimed broadcast inbox; pending agencies
    // cannot claim, so there is nothing for them to list there.
    const agencyScope =
      vendor?.status === 'active'
        ? { OR: [own, { status: 'broadcast', vendorId: null }] }
        : own;
    if (status) {
      where.AND = [agencyScope, { status }];
      delete where.status;
    } else {
      Object.assign(where, agencyScope);
    }
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

  if (assignCaregiverId !== undefined && !/^\d+$/.test(assignCaregiverId)) {
    throw badRequest('Invalid caregiver id');
  }

  const data: Record<string, unknown> = { status: next };

  // Vendor accepts a broadcast by assigning one of their caregivers
  if (assignCaregiverId && next === 'confirmed') {
    const caregiver = await prisma.caregiver.findUnique({
      where: { id: BigInt(assignCaregiverId) },
    });
    if (!caregiver) throw notFound('Caregiver not found');
    if (requester.role === 'vendor') {
      const vendor = await prisma.vendor.findUnique({ where: { userId: requester.id } });
      if (!vendor || caregiver.vendorId !== vendor.id) {
        throw forbidden('You can only assign caregivers from your own roster');
      }
    }
    if (!caregiver.available) throw badRequest('Caregiver is currently marked busy');
    data.caregiverId = caregiver.id;
    data.vendorId = caregiver.vendorId;
    // Mark the caregiver busy so they are not double-booked
    await prisma.caregiver.update({ where: { id: caregiver.id }, data: { available: false } });
  }

  // Completing a visit collects payment: cash is taken at the doorstep.
  // Online bookings are paid via Razorpay and are untouched here.
  if (next === 'completed' && booking.paymentMethod === 'cash' && booking.paymentStatus !== 'paid') {
    data.paymentStatus = 'paid';
  }

  // Free the caregiver up when the booking falls through or finishes
  if ((next === 'cancelled' || next === 'expired') && booking.caregiverId) {
    await prisma.caregiver.update({ where: { id: booking.caregiverId }, data: { available: true } });
  }

  const updated = await prisma.booking.update({
    where: { id: bookingId },
    data,
    include: INCLUDE,
  });

  await notifyBookingParties(updated, next, requester.role);

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
      const unclaimed = booking.vendorId === null && booking.caregiverId === null;
      if (unclaimed) {
        const claimant = await prisma.vendor.findUnique({ where: { userId: requester.id } });
        if (!claimant) throw forbidden('No agency profile for this account');
        if (claimant.status !== 'active') {
          throw forbidden('Your agency is not active yet — an admin must approve it first');
        }
        if (next === 'confirmed' || next === 'cancelled') return;
        throw forbidden('Vendor cannot perform this transition on an unclaimed request');
      }
      // Agency-owned booking — only the owning (and active) agency may act
      const vendor = await prisma.vendor.findUnique({ where: { userId: requester.id } });
      if (!vendor || booking.vendorId !== vendor.id) throw forbidden('Not your agency booking');
      return;
    }
    case 'resource': {
      const caregiver = await prisma.caregiver.findUnique({ where: { userId: requester.id } });
      if (!caregiver) throw forbidden('No caregiver profile for this account');
      if (booking.caregiverId === null || booking.caregiverId !== caregiver.id) {
        throw forbidden('This visit is not assigned to you');
      }
      if (!['confirmed', 'in_progress', 'completed', 'cancelled'].includes(next)) {
        throw forbidden('Resource cannot perform this transition');
      }
      return;
    }
    default:
      throw forbidden('Unknown role');
  }
}

interface BookingForNotify {
  id: bigint;
  userId: bigint;
  caregiverId: bigint | null;
  vendorId: bigint | null;
  scheduledDate: Date;
  scheduledTime: Date;
  visitLocation: string;
  price: unknown;
  paymentMethod: string;
  paymentStatus: string;
  user?: { id: bigint; name: string } | null;
  caregiver?: { user?: { id: bigint; name: string } | null } | null;
  vendor?: { id: bigint; userId: bigint; agencyName: string } | null;
  service?: { name: string } | null;
}

function formatWhen(b: BookingForNotify): string {
  const date = b.scheduledDate.toISOString().slice(0, 10);
  const t = b.scheduledTime;
  const time = `${String(t.getUTCHours()).padStart(2, '0')}:${String(t.getUTCMinutes()).padStart(2, '0')}`;
  return `${date} at ${time}`;
}

/**
 * Fan out an in-app notification to everyone who needs to know about a
 * booking lifecycle event. Best-effort — never throws into the caller.
 */
async function notifyBookingParties(
  booking: BookingForNotify,
  event: 'created' | BookingStatus,
  actorRole?: string,
): Promise<void> {
  const serviceName = booking.service?.name ?? 'Service';
  const when = formatWhen(booking);
  const summary = `${serviceName} — ${when}`;
  const patient = booking.userId;
  const caregiverUserId = booking.caregiver?.user?.id ?? null;
  const caregiverName = booking.caregiver?.user?.name ?? null;
  const vendorUserId = booking.vendor?.userId ?? null;
  const admins = await adminUserIds();

  if (event === 'created') {
    if (booking.caregiverId) {
      await notifyUsers([caregiverUserId], { title: 'New booking assigned', body: summary, link: '/resource/schedule' });
      await notifyUsers([vendorUserId], { title: 'New booking on your roster', body: summary, link: '/vendor/bookings' });
      await notifyUsers(admins, { title: 'New booking', body: summary, link: '/admin/bookings' });
    } else {
      const agencies = await prisma.vendor.findMany({ where: { status: 'active' }, select: { userId: true } });
      await notifyUsers(agencies.map((a) => a.userId), { title: 'New instant booking request', body: summary, link: '/vendor/bookings' });
      await notifyUsers(admins, { title: 'New instant booking broadcast', body: summary, link: '/admin/bookings' });
    }
    return;
  }

  const cancelReason = event === 'cancelled' ? 'cancelled' : 'expired';

  switch (event) {
    case 'confirmed':
      await notifyUsers([patient], { title: 'Booking confirmed', body: `${caregiverName ?? 'Your caregiver'} arrives ${when}`, link: '/user/bookings' });
      if (actorRole !== 'resource') {
        await notifyUsers([caregiverUserId], { title: 'New visit assigned', body: summary, link: '/resource/schedule' });
      }
      if (actorRole !== 'vendor') {
        await notifyUsers([vendorUserId], { title: 'Booking confirmed', body: summary, link: '/vendor/bookings' });
      }
      await notifyUsers(admins, { title: 'Booking confirmed', body: summary, link: '/admin/bookings' });
      break;
    case 'in_progress':
      await notifyUsers([patient], { title: 'Your visit has started', body: summary, link: '/user/bookings' });
      await notifyUsers([vendorUserId], { title: 'Visit in progress', body: summary, link: '/vendor/bookings' });
      await notifyUsers(admins, { title: 'Visit in progress', body: summary, link: '/admin/bookings' });
      break;
    case 'completed':
      await notifyUsers([patient], {
        title: 'Visit completed',
        body: `${summary} · ${booking.paymentMethod} (${booking.paymentStatus})`,
        link: '/user/bookings',
      });
      await notifyUsers([vendorUserId], { title: 'Visit completed', body: summary, link: '/vendor/bookings' });
      await notifyUsers(admins, { title: 'Visit completed', body: summary, link: '/admin/bookings' });
      break;
    case 'cancelled':
    case 'expired':
      if (actorRole !== 'user') {
        await notifyUsers([patient], { title: `Booking ${cancelReason}`, body: summary, link: '/user/bookings' });
      }
      if (actorRole !== 'resource') {
        await notifyUsers([caregiverUserId], { title: `Booking ${cancelReason}`, body: summary, link: '/resource/schedule' });
      }
      if (actorRole !== 'vendor') {
        await notifyUsers([vendorUserId], { title: `Booking ${cancelReason}`, body: summary, link: '/vendor/bookings' });
      }
      await notifyUsers(admins, { title: `Booking ${cancelReason}`, body: summary, link: '/admin/bookings' });
      break;
    default:
      break;
  }
}
