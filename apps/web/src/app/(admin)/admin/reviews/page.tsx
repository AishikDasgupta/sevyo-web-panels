'use client';

import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import type { Review } from '@sevyo/shared-types';
import { api } from '@/lib/api-client';
import { fmtDate } from '@/lib/format';
import { AvatarOrInitial } from '@/components/avatar-or-initial';
import { PageHeader } from '@/components/page-header';
import { Stars } from '@/components/stars';
import { DataError, EmptyState, LoadingCenter } from '@/components/states';
import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

const MIN_RATING_OPTIONS = [
  { value: 'all', label: 'All ratings' },
  { value: '5', label: '5 stars only' },
  { value: '4', label: '4 stars & up' },
  { value: '3', label: '3 stars & up' },
  { value: '2', label: '2 stars & up' },
];

export default function AdminReviewsPage() {
  const [minRating, setMinRating] = useState('all');

  const reviewsQuery = useQuery({
    queryKey: ['reviews'],
    queryFn: () => api.get<Review[]>('/reviews'),
  });

  const filtered = useMemo(() => {
    const min = minRating === 'all' ? 0 : Number(minRating);
    return (reviewsQuery.data ?? []).filter((r) => r.rating >= min);
  }, [reviewsQuery.data, minRating]);

  return (
    <>
      <PageHeader title="Reviews" subtitle="Patient feedback and ratings" />

      <div className="mb-4 grid gap-3 rounded-xl border border-border bg-card p-4 sm:max-w-xs">
        <div>
          <Label>Minimum rating</Label>
          <Select value={minRating} onValueChange={setMinRating}>
            <SelectTrigger>
              <SelectValue placeholder="All ratings" />
            </SelectTrigger>
            <SelectContent>
              {MIN_RATING_OPTIONS.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {reviewsQuery.isPending ? (
        <LoadingCenter />
      ) : reviewsQuery.isError ? (
        <DataError message={reviewsQuery.error.message} onRetry={() => reviewsQuery.refetch()} />
      ) : filtered.length === 0 ? (
        <EmptyState message="No reviews found" hint="Patient feedback will show up here once visits are completed." />
      ) : (
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Caregiver</TableHead>
                  <TableHead>Vendor</TableHead>
                  <TableHead>Rating</TableHead>
                  <TableHead>Comment</TableHead>
                  <TableHead>Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((r) => (
                  <TableRow key={r.id}>
                    <TableCell>
                      <div className="flex items-center gap-2.5">
                        <AvatarOrInitial name={r.userName} className="h-9 w-9" />
                        <p className="text-sm font-semibold">{r.userName ?? '—'}</p>
                      </div>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">{r.caregiverName ?? '—'}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">{r.vendorName ?? '—'}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1.5">
                        <Stars rating={r.rating} />
                        <span className="text-xs text-muted-foreground">{r.rating}</span>
                      </div>
                    </TableCell>
                    <TableCell className="max-w-md">
                      <p className="line-clamp-2 text-sm text-muted-foreground">{r.comment ?? '—'}</p>
                    </TableCell>
                    <TableCell className="text-sm">{fmtDate(r.createdAt)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </>
  );
}