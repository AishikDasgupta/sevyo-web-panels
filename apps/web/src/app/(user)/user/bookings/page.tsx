'use client';

import { useSearchParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import type { Booking } from '@sevyo/shared-types';
import { api } from '@/lib/api-client';
import { BookingSummaryCard } from '@/components/booking/booking-summary-card';
import { BookingActions } from '@/components/booking/booking-actions';
import { BookingStatusFilter } from '@/components/booking/booking-status-filter';
import { StatCard } from '@/components/stat-card';
import { PageHeader } from '@/components/page-header';
import { DataError, EmptyState, LoadingCenter } from '@/components/states';
import { CalendarCheck2, CheckCheck, ClipboardList, XCircle } from 'lucide-react';

export default function UserBookingsPage() {
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
  const counts = {
    total: all.length,
    confirmed: all.filter((b) => b.status === 'confirmed').length,
    completed: all.filter((b) => b.status === 'completed').length,
    cancelled: all.filter((b) => b.status === 'cancelled').length,
  };

  return (
    <>
      <PageHeader title="My Bookings" subtitle="Your booking history and active appointments" />

      <div className="mb-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard label="Total" value={counts.total} icon={<ClipboardList className="h-5 w-5" />} tone="blue" />
        <StatCard label="Confirmed" value={counts.confirmed} icon={<CalendarCheck2 className="h-5 w-5" />} tone="primary" />
        <StatCard label="Completed" value={counts.completed} icon={<CheckCheck className="h-5 w-5" />} tone="emerald" />
        <StatCard label="Cancelled" value={counts.cancelled} icon={<XCircle className="h-5 w-5" />} tone="rose" />
      </div>

      <BookingStatusFilter />

      {listQuery.isPending ? (
        <LoadingCenter />
      ) : listQuery.isError ? (
        <DataError message={listQuery.error.message} onRetry={() => listQuery.refetch()} />
      ) : !listQuery.data?.length ? (
        <EmptyState message="No bookings found" hint="Browse caregivers to book your first visit." />
      ) : (
        <div className="space-y-4">
          {listQuery.data.map((b) => (
            <div key={b.id}>
              <BookingSummaryCard booking={b} />
              <div className="mt-2 flex justify-end">
                <BookingActions booking={b} role="user" />
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  );
}