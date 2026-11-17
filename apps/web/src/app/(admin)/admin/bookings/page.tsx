'use client';

import { useSearchParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import type { Booking, BookingStatus } from '@sevyo/shared-types';
import { api } from '@/lib/api-client';
import { capitalize } from '@/lib/format';
import { BookingSummaryCard } from '@/components/booking/booking-summary-card';
import { BookingActions } from '@/components/booking/booking-actions';
import { BookingStatusFilter } from '@/components/booking/booking-status-filter';
import { PageHeader } from '@/components/page-header';
import { DataError, EmptyState, LoadingCenter } from '@/components/states';

const STATUSES: BookingStatus[] = ['pending', 'broadcast', 'confirmed', 'in_progress', 'completed', 'cancelled', 'expired'];

export default function AdminBookingsPage() {
  const searchParams = useSearchParams();
  const status = searchParams.get('status') ?? '';

  const allQuery = useQuery({
    queryKey: ['bookings'],
    queryFn: () => api.get<Booking[]>('/bookings'),
  });

  const listQuery = useQuery({
    queryKey: ['bookings', status || 'all'],
    queryFn: () => api.get<Booking[]>(status ? `/bookings?status=${status}` : '/bookings'),
  });

  const all = allQuery.data ?? [];

  return (
    <>
      <PageHeader title="Bookings" subtitle="All platform bookings" />

      <div className="mb-4 flex flex-wrap gap-2">
        <span className="rounded-full border border-border bg-card px-3.5 py-1.5 text-xs font-semibold text-muted-foreground">
          Total <span className="text-foreground">{all.length}</span>
        </span>
        {STATUSES.map((s) => (
          <span key={s} className="rounded-full border border-border bg-card px-3.5 py-1.5 text-xs font-semibold text-muted-foreground">
            {capitalize(s)} <span className="text-foreground">{all.filter((b) => b.status === s).length}</span>
          </span>
        ))}
      </div>

      <BookingStatusFilter />

      {listQuery.isPending ? (
        <LoadingCenter />
      ) : listQuery.isError ? (
        <DataError message={listQuery.error.message} onRetry={() => listQuery.refetch()} />
      ) : !listQuery.data?.length ? (
        <EmptyState message="No bookings found" hint="Bookings across all users will show up here." />
      ) : (
        <div className="space-y-4">
          {listQuery.data.map((b) => (
            <div key={b.id}>
              <BookingSummaryCard booking={b} />
              <div className="mt-2 flex justify-end">
                <BookingActions booking={b} role="admin" />
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  );
}