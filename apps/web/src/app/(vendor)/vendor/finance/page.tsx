'use client';

import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import type { Booking } from '@sevyo/shared-types';
import { api } from '@/lib/api-client';
import { fmtDate, fmtINR } from '@/lib/format';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { PageHeader } from '@/components/page-header';
import { StatCard } from '@/components/stat-card';
import { StatusBadge } from '@/components/status-badge';
import { DataError, LoadingCenter } from '@/components/states';
import { isVendorMissing, useVendor } from '../_lib/use-vendor';
import { VendorUnavailable } from '../_lib/vendor-unavailable';
import { ClipboardList, Hourglass, IndianRupee, Wallet } from 'lucide-react';

const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

function monthLabel(month: string): string {
  const [year, m] = month.split('-');
  const idx = Number(m) - 1;
  return `${MONTH_NAMES[idx] ?? m} ${year}`;
}

export default function VendorFinancePage() {
  const vendorQuery = useVendor();

  const bookingsQuery = useQuery({
    queryKey: ['bookings'],
    queryFn: () => api.get<Booking[]>('/bookings'),
    enabled: !!vendorQuery.data,
  });

  const bookings = bookingsQuery.data ?? [];

  const monthly = useMemo(() => {
    const byMonth: Record<string, number> = {};
    for (const b of bookings) {
      const key = b.scheduledDate.slice(0, 7);
      byMonth[key] = (byMonth[key] ?? 0) + b.price;
    }
    return Object.entries(byMonth)
      .sort((a, b) => b[0].localeCompare(a[0]))
      .map(([month, revenue]) => ({ month, revenue }));
  }, [bookings]);

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
  const paidCount = bookings.filter((b) => b.paymentStatus === 'paid').length;
  const pendingAmount = bookings.filter((b) => b.paymentStatus !== 'paid').reduce((sum, b) => sum + b.price, 0);

  return (
    <>
      <PageHeader title="Finance" subtitle="Revenue and payout overview" />

      <div className="mb-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard
          label="Total Revenue"
          value={fmtINR(vendor.revenueTotal)}
          icon={<IndianRupee className="h-5 w-5" />}
          tone="emerald"
        />
        <StatCard label="Paid Bookings" value={paidCount} icon={<Wallet className="h-5 w-5" />} tone="blue" />
        <StatCard label="Pending Amount" value={fmtINR(pendingAmount)} icon={<Hourglass className="h-5 w-5" />} tone="amber" />
        <StatCard label="Bookings" value={bookings.length} icon={<ClipboardList className="h-5 w-5" />} tone="rose" />
      </div>

      {bookingsQuery.isPending ? (
        <LoadingCenter />
      ) : bookingsQuery.isError ? (
        <DataError message={bookingsQuery.error.message} onRetry={() => bookingsQuery.refetch()} />
      ) : (
        <div className="grid items-start gap-6 lg:grid-cols-3">
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Transaction History</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Booking</TableHead>
                    <TableHead>Patient</TableHead>
                    <TableHead>Service</TableHead>
                    <TableHead>Caregiver</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                    <TableHead>Payment</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {bookings.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="py-10 text-center text-sm text-muted-foreground">
                        No transactions yet
                      </TableCell>
                    </TableRow>
                  ) : (
                    bookings.map((b) => (
                      <TableRow key={b.id}>
                        <TableCell className="text-sm font-semibold text-primary">{b.id}</TableCell>
                        <TableCell className="text-sm">{b.userName ?? '—'}</TableCell>
                        <TableCell className="text-sm">{b.serviceName ?? 'Service'}</TableCell>
                        <TableCell className="text-sm text-muted-foreground">{b.caregiverName ?? '—'}</TableCell>
                        <TableCell className="text-sm">{fmtDate(b.scheduledDate)}</TableCell>
                        <TableCell className="text-right text-sm font-semibold">{fmtINR(b.price)}</TableCell>
                        <TableCell>
                          <StatusBadge status={b.paymentStatus} />
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Monthly Revenue</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Month</TableHead>
                    <TableHead className="text-right">Revenue</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {monthly.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={2} className="py-10 text-center text-sm text-muted-foreground">
                        No revenue yet
                      </TableCell>
                    </TableRow>
                  ) : (
                    monthly.map((m) => (
                      <TableRow key={m.month}>
                        <TableCell className="text-sm font-medium">{monthLabel(m.month)}</TableCell>
                        <TableCell className="text-right text-sm font-semibold">{fmtINR(m.revenue)}</TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      )}
    </>
  );
}