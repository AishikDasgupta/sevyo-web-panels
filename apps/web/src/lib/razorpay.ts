'use client';

import { api } from '@/lib/api-client';
import type { Booking, RazorpayOrderResponse } from '@sevyo/shared-types';
import { toast } from 'sonner';

declare global {
  interface Window {
    Razorpay?: new (options: Record<string, unknown>) => { open: () => void };
  }
}

let scriptPromise: Promise<void> | null = null;

function loadCheckoutScript(): Promise<void> {
  if (window.Razorpay) return Promise.resolve();
  scriptPromise ??= new Promise<void>((resolve, reject) => {
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => {
      scriptPromise = null;
      reject(new Error('Could not load the Razorpay checkout — check your connection and try again'));
    };
    document.body.appendChild(script);
  });
  return scriptPromise;
}

export interface PaymentPrefill {
  name?: string;
  email?: string;
  contact?: string;
}

/**
 * Runs the full online-payment flow for a booking:
 * create/reuse Razorpay order → open checkout → verify signature server-side.
 * Resolves true when the booking is marked paid, false otherwise.
 */
export async function payForBooking(booking: Booking, prefill?: PaymentPrefill): Promise<boolean> {
  const order = await api.post<RazorpayOrderResponse>('/payments/razorpay/order', { bookingId: booking.id });
  await loadCheckoutScript();

  return new Promise<boolean>((resolve) => {
    const rzp = new window.Razorpay!({
      key: order.keyId,
      amount: order.amount,
      currency: order.currency,
      name: 'Sevyo',
      description: `Booking #${booking.id}`,
      order_id: order.orderId,
      prefill: prefill ?? {},
      theme: { color: '#1e3a8a' },
      handler: async (response: {
        razorpay_order_id: string;
        razorpay_payment_id: string;
        razorpay_signature: string;
      }) => {
        try {
          await api.post('/payments/razorpay/verify', {
            bookingId: booking.id,
            razorpayOrderId: response.razorpay_order_id,
            razorpayPaymentId: response.razorpay_payment_id,
            razorpaySignature: response.razorpay_signature,
          });
          toast.success('Payment successful — thank you!');
          resolve(true);
        } catch (err) {
          toast.error(err instanceof Error ? err.message : 'Payment could not be verified');
          resolve(false);
        }
      },
      modal: {
        ondismiss: () => resolve(false),
      },
    });
    rzp.open();
  });
}
