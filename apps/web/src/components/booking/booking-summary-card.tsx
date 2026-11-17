import type { Booking } from '@sevyo/shared-types';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { StatusBadge } from '@/components/status-badge';
import { fmtDate, fmtINR, fmtTime24 } from '@/lib/format';

export function BookingSummaryCard({ booking }: { booking: Booking }) {
  return (
    <Card className="p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-sm font-semibold text-primary">{booking.id}</span>
            <StatusBadge status={booking.status} />
            <Badge variant={booking.paymentStatus === 'paid' ? 'paid' : 'unpaid'}>
              {booking.paymentMethod} · {booking.paymentStatus}
            </Badge>
          </div>
          <p className="mt-2 font-heading text-lg font-bold">{booking.serviceName ?? 'Service'}</p>
          <p className="mt-0.5 text-sm text-muted-foreground">
            {booking.caregiverName ?? 'Awaiting caregiver'} · {booking.vendorName ?? '—'}
          </p>
        </div>
        <div className="text-right">
          <p className="font-heading text-xl font-bold">{fmtINR(booking.price)}</p>
          <p className="text-xs text-muted-foreground">{booking.durationHours} hr(s)</p>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3 border-t border-border pt-4 text-sm sm:grid-cols-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Date</p>
          <p className="mt-0.5 font-medium">{fmtDate(booking.scheduledDate)}</p>
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Time</p>
          <p className="mt-0.5 font-medium">{fmtTime24(booking.scheduledTime)}</p>
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Location</p>
          <p className="mt-0.5 font-medium capitalize">{booking.visitLocation}</p>
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Patient</p>
          <p className="mt-0.5 font-medium">{booking.userName ?? '—'}</p>
        </div>
      </div>

      {booking.address && (
        <p className="mt-3 text-xs text-muted-foreground">
          <span className="font-semibold">Address:</span> {booking.address}
        </p>
      )}
      {booking.notes && (
        <p className="mt-1 text-xs text-muted-foreground">
          <span className="font-semibold">Notes:</span> {booking.notes}
        </p>
      )}
    </Card>
  );
}