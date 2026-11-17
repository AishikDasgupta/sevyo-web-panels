'use client';

import { useSearchParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import type { Booking } from '@sevyo/shared-types';
import { api } from '@/lib/api-client';
import { BookingActions } from '@/components/booking/booking-actions';
import { BookingStatusFilter } from '@/components/booking/booking-status-filter';
import { BookingSummaryCard } from '@/components/booking/booking-summary-card';
import { PageHeader } from '@/components/page-header';
import { StatCard } from '@/components/stat-card';
import { DataError, EmptyState, LoadingCenter } from '@/components/states';
import { isVendorMissing, useVendor } from '../_lib/use-vendor';
import { VendorUnavailable } from '../_lib/vendor-unavailable';
import { CalendarCheck2, CheckCheck, ClipboardList, Zap } from 'lucide-react';

export default function VendorBookingsPage() {
  const vendorQuery = useVendor();
  const searchParams = useSearchParams();
  const status = searchParams.get('status') ?? '';

  const allQuery = useQuery({
    queryKey: ['bookings'],
    queryFn: () => api.get<Booking[]>('/bookings'),
    enabled: !!vendorQuery.data,
  });

  const listQuery = useQuery({
    queryKey: ['bookings', status || 'all'],
    queryFn: () => api.get<Booking[]>(status ? `/bookings?status=${status}` : '/bookings'),
    enabled: !!vendorQuery.data,
  });

  if (vendorQuery.isPending) return <LoadingCenter />;
  if (vendorQuery.isError || !vendorQuery.data) {
    const missing = vendorQuery.isError ? isVendorMissing(vendorQuery.error) : true;
    return missing ? (
      <VendorUnavailable onRetry={() => vendorQuery.refetch()} />
    ) : (
      <DataError message="Could not load your vendor profile" onRetry={() => vendorQuery.refetch()} />
    );
  }

  const vendor = vendorQuery.data;
  const all = allQuery.data ?? [];
  const counts = {
    broadcast: all.filter((b) => b.status === 'broadcast').length,
    pending: all.filter((b) => b.status === 'pending').length,
    active: all.filter((b) => b.status === 'confirmed' || b.status === 'in_progress').length,
    completed: all.filter((b) => b.status === 'completed').length,
  };

  return (
    <>
      <PageHeader title="Bookings" subtitle="Manage your agency's bookings and broadcasts" />

      <div className="mb-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard label="Broadcast" value={counts.broadcast} icon={<Zap className="h-5 w-5" />} tone="amber" />
        <StatCard label="Pending" value={counts.pending} icon={<ClipboardList className="h-5 w-5" />} tone="blue" />
        <StatCard label="Active" value={counts.active} icon={<CalendarCheck2 className="h-5 w-5" />} tone="emerald" />
        <StatCard label="Completed" value={counts.completed} icon={<CheckCheck className="h-5 w-5" />} tone="emerald" />
      </div>

      <BookingStatusFilter />

      {listQuery.isPending ? (
        <LoadingCenter />
      ) : listQuery.isError ? (
        <DataError message={listQuery.error.message} onRetry={() => listQuery.refetch()} />
      ) : !listQuery.data?.length ? (
        <EmptyState message="No bookings here" hint="Broadcast bookings will appear here so you can accept them." />
      ) : (
        <div className="space-y-4">
          {listQuery.data.map((b) => (
            <div key={b.id}>
              <BookingSummaryCard booking={b} />
              <div className="mt-2 flex justify-end">
                <BookingActions booking={b} role="vendor" vendorId={String(vendor.id)} />
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  );
}