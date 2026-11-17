'use client';

import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import type { Booking } from '@sevyo/shared-types';
import { Button } from '@/components/ui/button';
import { fmtINR } from '@/lib/format';
import { payForBooking } from '@/lib/razorpay';

/**
 * Inline "Pay now" button for unpaid online bookings.
 * Returns null for cash bookings, paid bookings, and cancelled/expired ones.
 */
export function PayNowButton({ booking }: { booking: Booking }) {
  const queryClient = useQueryClient();
  const [pending, setPending] = useState(false);

  const payable =
    booking.paymentMethod === 'online' &&
    booking.paymentStatus !== 'paid' &&
    booking.status !== 'cancelled' &&
    booking.status !== 'expired';

  if (!payable) return null;

  const pay = async () => {
    setPending(true);
    try {
      const ok = await payForBooking(booking);
      if (ok) await queryClient.invalidateQueries({ queryKey: ['bookings'] });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Could not start payment');
    } finally {
      setPending(false);
    }
  };

  return (
    <Button size="sm" onClick={pay} disabled={pending} className="bg-primary text-primary-foreground">
      {pending ? 'Opening checkout…' : `Pay now — ${fmtINR(booking.price)}`}
    </Button>
  );
}
