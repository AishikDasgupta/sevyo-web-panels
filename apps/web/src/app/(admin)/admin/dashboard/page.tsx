'use client';

import { useQuery } from '@tanstack/react-query';
import type { AdminStats } from '@sevyo/shared-types';
import { api } from '@/lib/api-client';
import { fmtINR } from '@/lib/format';
import { PageHeader } from '@/components/page-header';
import { StatCard } from '@/components/stat-card';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { DataError, EmptyState, LoadingCenter } from '@/components/states';
import {
  Building2,
  CalendarCheck2,
  ClipboardList,
  HeartPulse,
  IndianRupee,
  Star,
  TrendingUp,
  Users,
} from 'lucide-react';

export default function AdminDashboardPage() {
  const statsQuery = useQuery({
    queryKey: ['admin', 'stats'],
    queryFn: () => api.get<AdminStats>('/admin/stats'),
  });

  if (statsQuery.isPending) return <LoadingCenter />;
  if (statsQuery.isError || !statsQuery.data) {
    return (
      <DataError
        message={statsQuery.error?.message ?? 'Could not load dashboard'}
        onRetry={() => statsQuery.refetch()}
      />
    );
  }

  const stats = statsQuery.data;
  const maxRevenue = Math.max(0, ...stats.revenueByMonth.map((m) => m.revenue));

  const totalBooked = stats.bookingsByType.reduce((sum, d) => sum + d.value, 0);
  let acc = 0;
  const donutStops = stats.bookingsByType
    .map((d) => {
      const start = totalBooked > 0 ? (acc / totalBooked) * 360 : 0;
      acc += d.value;
      const end = totalBooked > 0 ? (acc / totalBooked) * 360 : 0;
      return `${d.color} ${start}deg ${end}deg`;
    })
    .join(', ');

  return (
    <>
      <PageHeader title="Admin Dashboard" subtitle="Platform overview and analytics" />

      <div className="mb-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard
          label="Total Revenue"
          value={fmtINR(stats.totalRevenue)}
          icon={<IndianRupee className="h-5 w-5" />}
          tone="emerald"
        />
        <StatCard
          label="Monthly Revenue"
          value={fmtINR(stats.monthlyRevenue)}
          icon={<TrendingUp className="h-5 w-5" />}
          tone="blue"
        />
        <StatCard
          label="Total Bookings"
          value={stats.totalBookings}
          icon={<ClipboardList className="h-5 w-5" />}
          tone="primary"
        />
        <StatCard
          label="Active Bookings"
          value={stats.activeBookings}
          icon={<CalendarCheck2 className="h-5 w-5" />}
          tone="amber"
        />
        <StatCard label="Total Users" value={stats.totalUsers} icon={<Users className="h-5 w-5" />} tone="violet" />
        <StatCard
          label="Total Caregivers"
          value={stats.totalCaregivers}
          icon={<HeartPulse className="h-5 w-5" />}
          tone="blue"
        />
        <StatCard
          label="Total Vendors"
          value={stats.totalVendors}
          icon={<Building2 className="h-5 w-5" />}
          tone="violet"
        />
        <StatCard
          label="Satisfaction Rate"
          value={`${stats.satisfactionRate.toFixed(1)} ⭐`}
          icon={<Star className="h-5 w-5" />}
          tone="rose"
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Revenue Trend</CardTitle>
            <CardDescription>Monthly revenue collected on the platform.</CardDescription>
          </CardHeader>
          <CardContent>
            {stats.revenueByMonth.length === 0 ? (
              <EmptyState message="No revenue data yet" hint="Revenue will show up here once bookings are completed." />
            ) : (
              <div className="flex h-56 items-end gap-2 sm:gap-4">
                {stats.revenueByMonth.map((m) => (
                  <div key={m.month} className="flex h-full flex-1 flex-col justify-end gap-2">
                    <div className="flex flex-1 items-end" title={fmtINR(m.revenue)}>
                      <div
                        className="w-full rounded-t-md bg-primary/80 transition-all duration-300"
                        style={{ height: maxRevenue > 0 ? `${Math.max((m.revenue / maxRevenue) * 100, 2)}%` : '0%' }}
                      />
                    </div>
                    <span className="text-center text-xs font-medium text-muted-foreground">{m.month}</span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Bookings by Type</CardTitle>
            <CardDescription>Distribution of bookings across service types.</CardDescription>
          </CardHeader>
          <CardContent>
            {stats.bookingsByType.length === 0 ? (
              <EmptyState message="No booking data yet" hint="Bookings will appear here as patients use the platform." />
            ) : (
              <div className="flex flex-col items-center gap-6 sm:flex-row sm:justify-center">
                <div
                  className="relative h-44 w-44 shrink-0 rounded-full"
                  style={{ background: `conic-gradient(${donutStops})` }}
                >
                  <div className="absolute inset-5 flex flex-col items-center justify-center rounded-full bg-card">
                    <span className="font-heading text-2xl font-bold">{totalBooked}%</span>
                    <span className="text-xs text-muted-foreground">Total</span>
                  </div>
                </div>
                <ul className="w-full max-w-[220px] space-y-2 sm:w-auto">
                  {stats.bookingsByType.map((d) => (
                    <li key={d.name} className="flex items-center gap-2 text-sm">
                      <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ background: d.color }} />
                      <span className="flex-1 font-medium">{d.name}</span>
                      <span className="text-muted-foreground">{d.value}%</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </>
  );
}