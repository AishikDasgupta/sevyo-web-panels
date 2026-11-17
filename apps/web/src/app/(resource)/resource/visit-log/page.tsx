'use client';

import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { CheckCircle2, Download, XCircle } from 'lucide-react';
import type { Booking } from '@sevyo/shared-types';
import { api } from '@/lib/api-client';
import { fmtDate, fmtINR, fmtTime24 } from '@/lib/format';
import { PageHeader } from '@/components/page-header';
import { Button } from '@/components/ui/button';
import { StatusBadge } from '@/components/status-badge';
import { DataError, EmptyState, LoadingCenter } from '@/components/states';

function dateKey(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function csvCell(value: string) {
  return /[",\n]/.test(value) ? `"${value.replace(/"/g, '""')}"` : value;
}

export default function ResourceVisitLogPage() {
  const bookingsQuery = useQuery({
    queryKey: ['bookings'],
    queryFn: () => api.get<Booking[]>('/bookings'),
  });

  const rows = useMemo(
    () =>
      (bookingsQuery.data ?? [])
        .filter((b) => b.status === 'completed' || b.status === 'cancelled')
        .sort((a, b) =>
          `${b.scheduledDate}T${b.scheduledTime}`.localeCompare(`${a.scheduledDate}T${a.scheduledTime}`),
        ),
    [bookingsQuery.data],
  );

  const month = dateKey(new Date()).slice(0, 7);
  const completedThisMonth = rows.filter(
    (b) => b.status === 'completed' && b.scheduledDate.startsWith(month),
  ).length;
  const cancelledThisMonth = rows.filter(
    (b) => b.status === 'cancelled' && b.scheduledDate.startsWith(month),
  ).length;

  const exportCsv = () => {
    const header = [
      'Booking ID',
      'Date',
      'Time',
      'Patient',
      'Service',
      'Address',
      'Payment Method',
      'Payment Status',
      'Price (INR)',
      'Status',
    ];
    const lines = rows.map((b) =>
      [
        String(b.id),
        fmtDate(b.scheduledDate),
        fmtTime24(b.scheduledTime),
        b.userName ?? '',
        b.serviceName ?? '',
        b.address ?? '',
        b.paymentMethod,
        b.paymentStatus,
        String(b.price),
        b.status,
      ]
        .map(csvCell)
        .join(','),
    );
    const blob = new Blob([[header.join(','), ...lines].join('\n')], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `visit-log-${dateKey(new Date())}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <>
      <PageHeader
        title="Visit Log"
        subtitle="Completed and cancelled visits"
        actions={
          <Button size="sm" variant="outline" onClick={exportCsv} disabled={rows.length === 0}>
            <Download className="h-4 w-4" />
            Export CSV
          </Button>
        }
      />

      <div className="mb-6 flex flex-wrap gap-3">
        <span className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-4 py-2 text-xs font-semibold text-emerald-700">
          <CheckCircle2 className="h-4 w-4" />
          {completedThisMonth} completed this month
        </span>
        <span className="inline-flex items-center gap-2 rounded-full border border-rose-200 bg-rose-50 px-4 py-2 text-xs font-semibold text-rose-700">
          <XCircle className="h-4 w-4" />
          {cancelledThisMonth} cancelled this month
        </span>
      </div>

      {bookingsQuery.isPending ? (
        <LoadingCenter />
      ) : bookingsQuery.isError ? (
        <DataError message={bookingsQuery.error.message} onRetry={() => bookingsQuery.refetch()} />
      ) : rows.length === 0 ? (
        <EmptyState message="No visits logged yet" hint="Completed and cancelled visits will appear here." />
      ) : (
        <div className="overflow-x-auto rounded-xl border border-border bg-card">
          <table className="w-full min-w-[880px] text-left text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/60 text-[0.6875rem] uppercase tracking-wider text-muted-foreground">
                <th className="px-4 py-3 font-semibold">ID</th>
                <th className="px-4 py-3 font-semibold">Date</th>
                <th className="px-4 py-3 font-semibold">Time</th>
                <th className="px-4 py-3 font-semibold">Patient</th>
                <th className="px-4 py-3 font-semibold">Service</th>
                <th className="px-4 py-3 font-semibold">Address</th>
                <th className="px-4 py-3 font-semibold">Payment</th>
                <th className="px-4 py-3 font-semibold">Price</th>
                <th className="px-4 py-3 font-semibold">Status</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((b) => (
                <tr key={b.id} className="border-b border-border/60 last:border-0 hover:bg-muted/40">
                  <td className="px-4 py-3 font-medium text-primary">{b.id}</td>
                  <td className="px-4 py-3">{fmtDate(b.scheduledDate)}</td>
                  <td className="px-4 py-3">{fmtTime24(b.scheduledTime)}</td>
                  <td className="px-4 py-3 font-medium">{b.userName ?? '—'}</td>
                  <td className="px-4 py-3">{b.serviceName ?? '—'}</td>
                  <td className="max-w-[220px] truncate px-4 py-3 text-muted-foreground">{b.address ?? '—'}</td>
                  <td className="px-4 py-3 capitalize">
                    {b.paymentMethod} ·{' '}
                    <span className={b.paymentStatus === 'paid' ? 'font-medium text-emerald-600' : 'font-medium text-amber-600'}>
                      {b.paymentStatus}
                    </span>
                  </td>
                  <td className="px-4 py-3 font-semibold">{fmtINR(b.price)}</td>
                  <td className="px-4 py-3">
                    <StatusBadge status={b.status} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}