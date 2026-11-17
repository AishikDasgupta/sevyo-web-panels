import { prisma } from '../lib/prisma';
import { badRequest, forbidden, notFound } from '../lib/errors';
import { serializeReview } from '../lib/serialize';

const INCLUDE = {
  user: true,
  caregiver: { include: { user: true } },
  vendor: true,
} as const;

export async function list(filters: { caregiverId?: string }) {
  const reviews = await prisma.review.findMany({
    where: filters.caregiverId ? { caregiverId: BigInt(filters.caregiverId) } : {},
    include: INCLUDE,
    orderBy: { createdAt: 'desc' },
  });
  return reviews.map(serializeReview);
}

export async function create(
  userId: bigint,
  input: { bookingId: string; rating: number; comment?: string },
) {
  const booking = await prisma.booking.findUnique({
    where: { id: BigInt(input.bookingId) },
    include: INCLUDE,
  });
  if (!booking) throw notFound('Booking not found');
  if (booking.userId !== userId) throw forbidden('Not your booking');
  if (booking.status !== 'completed') throw badRequest('Only completed visits can be reviewed');

  const existing = await prisma.review.findUnique({
    where: { bookingId: booking.id },
  });
  if (existing) throw badRequest('This visit was already reviewed');

  const review = await prisma.review.create({
    data: {
      bookingId: booking.id,
      userId,
      caregiverId: booking.caregiverId,
      vendorId: booking.vendorId,
      rating: input.rating,
      comment: input.comment ?? null,
    },
    include: INCLUDE,
  });

  await recomputeCaregiverRating(review.caregiverId);
  await recomputeVendorRating(review.vendorId);

  return serializeReview(review);
}

async function recomputeCaregiverRating(caregiverId: bigint | null) {
  if (!caregiverId) return;
  const agg = await prisma.review.aggregate({
    where: { caregiverId },
    _avg: { rating: true },
    _count: { rating: true },
  });
  await prisma.caregiver.update({
    where: { id: caregiverId },
    data: {
      rating: agg._avg.rating ?? 0,
      reviewsCount: agg._count.rating,
    },
  });
}

async function recomputeVendorRating(vendorId: bigint | null) {
  if (!vendorId) return;
  const avg = await prisma.review.aggregate({
    where: { vendorId },
    _avg: { rating: true },
  });
  await prisma.vendor.update({
    where: { id: vendorId },
    data: { rating: avg._avg.rating ?? 0 },
  });
}