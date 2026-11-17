'use client';

import { useMemo } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { CalendarDays, CheckCircle2, Clock3, Star } from 'lucide-react';
import { toast } from 'sonner';
import type { Booking, Caregiver } from '@sevyo/shared-types';
import { api } from '@/lib/api-client';
import { capitalize } from '@/lib/format';
import { PageHeader } from '@/components/page-header';
import { StatCard } from '@/components/stat-card';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BookingSummaryCard } from '@/components/booking/booking-summary-card';
import { BookingActions } from '@/components/booking/booking-actions';
import { DataError, EmptyState, LoadingCenter } from '@/components/states';

function dateKey(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

export default function ResourceDashboardPage() {
  const queryClient = useQueryClient();

  const caregiverQuery = useQuery({
    queryKey: ['caregiver', 'me'],
    queryFn: () => api.get<Caregiver>('/caregivers/me'),
  });

  const bookingsQuery = useQuery({
    queryKey: ['bookings'],
    queryFn: () => api.get<Booking[]>('/bookings'),
  });

  const availabilityMutation = useMutation({
    mutationFn: (available: boolean) =>
      api.patch<Caregiver>(`/caregivers/${caregiverQuery.data?.id}`, { available }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['caregiver', 'me'] });
      queryClient.invalidateQueries({ queryKey: ['bookings'] });
      toast.success('Availability updated');
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const stats = useMemo(() => {
    const bookings = bookingsQuery.data ?? [];
    const today = dateKey(new Date());
    const month = today.slice(0, 7);
    return {
      today: bookings.filter(
        (b) => b.scheduledDate === today && (b.status === 'confirmed' || b.status === 'in_progress'),
      ).length,
      inProgress: bookings.filter((b) => b.status === 'in_progress').length,
      completedMonth: bookings.filter((b) => b.status === 'completed' && b.scheduledDate.startsWith(month)).length,
    };
  }, [bookingsQuery.data]);

  const upcoming = useMemo(
    () =>
      (bookingsQuery.data ?? [])
        .filter((b) => b.status === 'confirmed' || b.status === 'in_progress')
        .sort((a, b) => `${a.scheduledDate}T${a.scheduledTime}`.localeCompare(`${b.scheduledDate}T${b.scheduledTime}`))
        .slice(0, 5),
    [bookingsQuery.data],
  );

  if (caregiverQuery.isPending || bookingsQuery.isPending) return <LoadingCenter />;
  if (caregiverQuery.isError || bookingsQuery.isError) {
    return (
      <DataError
        message={caregiverQuery.error?.message ?? bookingsQuery.error?.message ?? 'Could not load your dashboard'}
        onRetry={() => {
          caregiverQuery.refetch();
          bookingsQuery.refetch();
        }}
      />
    );
  }

  const caregiver = caregiverQuery.data;

  return (
    <>
      <PageHeader
        title={`Welcome, ${caregiver.name ?? 'Caregiver'}`}
        subtitle={`${capitalize(caregiver.type.replace('_', ' '))} · ${caregiver.vendorName ?? 'Sevyo'}`}
        actions={
          <label className="flex cursor-pointer items-center gap-2 text-sm font-medium">
            <Switch
              checked={caregiver.available}
              disabled={availabilityMutation.isPending}
              onCheckedChange={(checked) => availabilityMutation.mutate(checked)}
            />
            Available for bookings
          </label>
        }
      />

      <div className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Today's Visits" value={stats.today} icon={<CalendarDays className="h-5 w-5" />} tone="blue" />
        <StatCard label="In Progress" value={stats.inProgress} icon={<Clock3 className="h-5 w-5" />} tone="amber" />
        <StatCard
          label="Completed This Month"
          value={stats.completedMonth}
          icon={<CheckCircle2 className="h-5 w-5" />}
          tone="emerald"
        />
        <StatCard label="Rating" value={`${caregiver.rating.toFixed(1)} / 5`} icon={<Star className="h-5 w-5" />} tone="rose" />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Upcoming Visits</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {upcoming.length === 0 ? (
            <EmptyState message="No upcoming visits" hint="You're all caught up — enjoy the break!" />
          ) : (
            upcoming.map((b) => (
              <div key={b.id} className="space-y-2">
                <BookingSummaryCard booking={b} />
                <div className="flex justify-end">
                  <BookingActions booking={b} role="resource" />
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </>
  );
}