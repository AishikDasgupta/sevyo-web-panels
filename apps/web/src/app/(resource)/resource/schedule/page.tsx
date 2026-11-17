'use client';

import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { X } from 'lucide-react';
import type { Booking } from '@sevyo/shared-types';
import { api } from '@/lib/api-client';
import { PageHeader } from '@/components/page-header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { BookingSummaryCard } from '@/components/booking/booking-summary-card';
import { DataError, EmptyState, LoadingCenter } from '@/components/states';

function dateKey(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function dateHeading(dateStr: string) {
  return new Date(`${dateStr}T00:00:00`).toLocaleDateString('en-IN', {
    weekday: 'long',
    day: 'numeric',
    month: 'short',
  });
}

export default function ResourceSchedulePage() {
  const [from, setFrom] = useState(() => dateKey(new Date()));
  const [to, setTo] = useState('');

  const bookingsQuery = useQuery({
    queryKey: ['bookings'],
    queryFn: () => api.get<Booking[]>('/bookings'),
  });

  const groups = useMemo(() => {
    const bookings = bookingsQuery.data ?? [];
    const inRange = bookings.filter(
      (b) =>
        b.status !== 'cancelled' &&
        (!from || b.scheduledDate >= from) &&
        (!to || b.scheduledDate <= to),
    );
    const byDate = new Map<string, Booking[]>();
    for (const b of inRange) {
      const list = byDate.get(b.scheduledDate);
      if (list) list.push(b);
      else byDate.set(b.scheduledDate, [b]);
    }
    return [...byDate.entries()]
      .map(([date, items]) => ({
        date,
        items: items.sort((a, b) => a.scheduledTime.localeCompare(b.scheduledTime)),
      }))
      .sort((a, b) => a.date.localeCompare(b.date));
  }, [bookingsQuery.data, from, to]);

  const total = groups.reduce((sum, g) => sum + g.items.length, 0);

  const setPreset = (days: number | null) => {
    if (days === null) {
      setFrom('');
      setTo('');
      return;
    }
    setFrom(dateKey(new Date()));
    setTo(dateKey(new Date(Date.now() + (days - 1) * 86400000)));
  };

  const setThisMonth = () => {
    const now = new Date();
    setFrom(dateKey(new Date(now.getFullYear(), now.getMonth(), 1)));
    setTo(dateKey(new Date(now.getFullYear(), now.getMonth() + 1, 0)));
  };

  return (
    <>
      <PageHeader title="Schedule" subtitle="Upcoming and past visits" />

      <div className="mb-6 flex flex-wrap items-end gap-4 rounded-xl border border-border bg-card p-4">
        <div className="space-y-1.5">
          <Label htmlFor="sch-from">From</Label>
          <Input id="sch-from" type="date" value={from} onChange={(e) => setFrom(e.target.value)} />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="sch-to">To</Label>
          <Input id="sch-to" type="date" value={to} onChange={(e) => setTo(e.target.value)} />
        </div>
        <div className="flex flex-wrap items-center gap-2 pb-0.5">
          <Button size="sm" variant="outline" onClick={() => setPreset(7)}>
            Next 7 days
          </Button>
          <Button size="sm" variant="outline" onClick={() => setPreset(14)}>
            Next 14 days
          </Button>
          <Button size="sm" variant="outline" onClick={setThisMonth}>
            This month
          </Button>
          <Button size="sm" variant="ghost" onClick={() => setPreset(null)}>
            All
          </Button>
          {(from || to) && (
            <Button
              size="sm"
              variant="ghost"
              onClick={() => {
                setFrom('');
                setTo('');
              }}
            >
              <X className="h-4 w-4" />
              Clear
            </Button>
          )}
        </div>
      </div>

      {bookingsQuery.isPending ? (
        <LoadingCenter />
      ) : bookingsQuery.isError ? (
        <DataError message={bookingsQuery.error.message} onRetry={() => bookingsQuery.refetch()} />
      ) : groups.length === 0 ? (
        <EmptyState message="No visits in this range" hint="Try widening the date range." />
      ) : (
        <div className="space-y-6">
          <p className="text-sm font-medium text-muted-foreground">
            {total} visit{total === 1 ? '' : 's'} in range
          </p>
          {groups.map((g) => (
            <Card key={g.date}>
              <CardHeader>
                <CardTitle className="text-base">{dateHeading(g.date)}</CardTitle>
                <p className="text-xs text-muted-foreground">
                  {g.items.length} visit{g.items.length === 1 ? '' : 's'}
                </p>
              </CardHeader>
              <CardContent className="space-y-3">
                {g.items.map((b) => (
                  <BookingSummaryCard key={b.id} booking={b} />
                ))}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </>
  );
}