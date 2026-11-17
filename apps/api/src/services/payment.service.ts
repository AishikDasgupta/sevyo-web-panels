import { prisma } from '../lib/prisma';
import { badRequest, conflict, forbidden, notFound, unprocessable } from '../lib/errors';
import { AppError } from '../lib/errors';
import { env } from '../config/env';
import { createOrder, razorpayConfigured, verifyPaymentSignature } from '../lib/razorpay';
import { serializeBooking } from '../lib/serialize';
import type { VerifyRazorpayPaymentBody } from '../schemas/payment.schema';

const INCLUDE = {
  user: true,
  caregiver: { include: { user: true } },
  vendor: true,
  service: true,
} as const;

async function loadBookingForPayment(bookingId: string, requester: { id: bigint; role: string }) {
  const booking = await prisma.booking.findUnique({
    where: { id: BigInt(bookingId) },
    include: INCLUDE,
  });
  if (!booking) throw notFound('Booking not found');
  if (requester.role !== 'admin' && booking.userId !== requester.id) {
    throw forbidden('You can only pay for your own bookings');
  }
  return booking;
}

/**
 * Create (or reuse) a Razorpay order for a booking and return the checkout
 * payload. The order id is stored on the booking so retries are idempotent.
 */
export async function createRazorpayOrder(bookingId: string, requester: { id: bigint; role: string }) {
  if (!razorpayConfigured()) {
    throw new AppError('Online payments are not configured on this server', 503, 'PAYMENT_NOT_CONFIGURED');
  }

  const booking = await loadBookingForPayment(bookingId, requester);

  if (booking.paymentStatus === 'paid') throw conflict('This booking is already paid');
  if (booking.status === 'cancelled' || booking.status === 'expired') {
    throw badRequest('Cannot pay for a cancelled or expired booking');
  }

  const amountPaise = Math.round(Number(booking.price) * 100);
  if (!Number.isFinite(amountPaise) || amountPaise < 100) {
    throw badRequest('Booking amount is too small for online payment');
  }

  let orderId = booking.razorpayOrderId;
  if (!orderId) {
    const order = await createOrder(amountPaise, `booking${booking.id}`, {
      bookingId: String(booking.id),
      service: booking.service?.name ?? 'Sevyo booking',
    });
    orderId = order.id;
    await prisma.booking.update({
      where: { id: booking.id },
      data: { razorpayOrderId: orderId, paymentMethod: 'online', paymentStatus: 'pending' },
    });
  }

  return {
    orderId,
    amount: amountPaise,
    currency: 'INR',
    keyId: env.razorpayKeyId,
    bookingId: String(booking.id),
  };
}

/**
 * Verify the Razorpay checkout signature and mark the booking paid.
 * Idempotent: re-verifying an already-paid booking succeeds without changes.
 */
export async function verifyRazorpayPayment(
  input: VerifyRazorpayPaymentBody,
  requester: { id: bigint; role: string },
) {
  const booking = await loadBookingForPayment(input.bookingId, requester);

  if (booking.paymentStatus === 'paid') {
    return serializeBooking(booking);
  }
  if (!booking.razorpayOrderId || booking.razorpayOrderId !== input.razorpayOrderId) {
    throw badRequest('Payment order does not match this booking');
  }
  if (!razorpayConfigured()) {
    throw new AppError('Online payments are not configured on this server', 503, 'PAYMENT_NOT_CONFIGURED');
  }
  if (!verifyPaymentSignature(input.razorpayOrderId, input.razorpayPaymentId, input.razorpaySignature)) {
    throw unprocessable('Invalid payment signature — payment not accepted');
  }

  const updated = await prisma.booking.update({
    where: { id: booking.id },
    data: { paymentStatus: 'paid', paymentMethod: 'online' },
    include: INCLUDE,
  });
  return serializeBooking(updated);
}
