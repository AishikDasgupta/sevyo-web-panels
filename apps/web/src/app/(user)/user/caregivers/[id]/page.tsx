'use client';

import { useParams } from 'next/navigation';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import type { Caregiver, Review } from '@sevyo/shared-types';
import { api } from '@/lib/api-client';
import { caregiverTypeLabel } from '@/lib/constants';
import { fmtDate, fmtINR } from '@/lib/format';
import { AvatarOrInitial } from '@/components/avatar-or-initial';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Stars } from '@/components/stars';
import { PageHeader } from '@/components/page-header';
import { DataError } from '@/components/states';

export default function CaregiverDetailPage() {
  const params = useParams();
  const id = String(params.id);

  const caregiverQuery = useQuery({
    queryKey: ['caregivers', id],
    queryFn: () => api.get<Caregiver>(`/caregivers/${id}`),
  });

  const reviewsQuery = useQuery({
    queryKey: ['reviews', id],
    queryFn: () => api.get<Review[]>(`/reviews?caregiverId=${id}`),
    enabled: caregiverQuery.isSuccess,
  });

  const cg = caregiverQuery.data;

  if (caregiverQuery.isPending) {
    return (
      <div className="grid items-start gap-6 lg:grid-cols-[2fr_1fr]">
        <div className="space-y-4">
          <Skeleton className="h-40 w-full" />
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-64 w-full" />
        </div>
        <Skeleton className="h-80 w-full" />
      </div>
    );
  }

  if (caregiverQuery.isError || !cg) {
    return (
      <DataError
        message={caregiverQuery.error?.message ?? 'Could not load this caregiver'}
        onRetry={() => caregiverQuery.refetch()}
      />
    );
  }

  const firstName = cg.name?.split(' ')[0] ?? 'this caregiver';
  const reviews = reviewsQuery.data ?? [];

  return (
    <>
      <PageHeader title={cg.name ?? 'Caregiver'} subtitle={`${cg.vendorName ?? 'Independent'} · ${caregiverTypeLabel(cg.type)}`} />

      <div className="grid items-start gap-6 lg:grid-cols-[2fr_1fr]">
        <div className="space-y-4">
          {/* Profile card */}
          <Card className="flex flex-col items-start gap-4 p-6 sm:flex-row sm:items-center">
            <AvatarOrInitial name={cg.name} avatarUrl={cg.avatarUrl} className="h-20 w-20 text-2xl" />
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="font-heading text-xl font-bold">{cg.name}</h2>
                {cg.verified && <Badge variant="verified">✔ Verified</Badge>}
                <Badge variant="outline">{caregiverTypeLabel(cg.type)}</Badge>
              </div>
              <div className="mt-2 flex flex-wrap items-center gap-2">
                <Stars rating={cg.rating} size="md" />
                <span className="text-sm text-muted-foreground">
                  {cg.rating} ({cg.reviewsCount} reviews)
                </span>
              </div>
              {cg.bio && <p className="mt-3 text-sm text-muted-foreground">{cg.bio}</p>}
            </div>
          </Card>

          {/* Specializations */}
          {cg.specializations && cg.specializations.length > 0 && (
            <Card className="p-6">
              <h3 className="mb-3 font-heading text-base font-bold">Specializations</h3>
              <div className="flex flex-wrap gap-2">
                {cg.specializations.map((s) => (
                  <Badge key={s} variant="confirmed">
                    {s}
                  </Badge>
                ))}
              </div>
            </Card>
          )}

          {/* Reviews */}
          <Card className="p-6">
            <h3 className="mb-4 font-heading text-base font-bold">Patient Reviews</h3>
            {reviewsQuery.isPending ? (
              <div className="space-y-4">
                {[0, 1, 2].map((i) => (
                  <Skeleton key={i} className="h-20 w-full" />
                ))}
              </div>
            ) : reviews.length === 0 ? (
              <p className="text-sm text-muted-foreground">No reviews yet.</p>
            ) : (
              <div className="space-y-4">
                {reviews.map((r) => (
                  <div key={r.id} className="border-b border-border pb-4 last:border-0 last:pb-0">
                    <Stars rating={r.rating} />
                    {r.comment && <p className="mt-2 text-sm text-muted-foreground">{r.comment}</p>}
                    <p className="mt-2 text-xs text-muted-foreground">
                      — {r.userName ?? 'Patient'} · {fmtDate(r.createdAt)}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>

        {/* Booking summary (sticky) */}
        <Card className="p-6 lg:sticky lg:top-4">
          <h3 className="mb-4 font-heading text-base font-bold">Booking Summary</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Experience</span>
              <span className="text-sm font-semibold">{cg.experienceYears} years</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Rate</span>
              <span className="text-sm font-semibold">{fmtINR(cg.pricePerHour)}/hr</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Vendor</span>
              <span className="text-sm font-semibold">{cg.vendorName ?? 'Independent'}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Availability</span>
              <Badge variant={cg.available ? 'active' : 'inactive'}>
                {cg.available ? 'Available' : 'Busy'}
              </Badge>
            </div>
          </div>
          <Button asChild size="lg" className="mt-5 w-full" disabled={!cg.available}>
            <Link href={`/user/booking/${cg.id}`}>Book {firstName}</Link>
          </Button>
          {!cg.available && (
            <p className="mt-2 text-center text-xs text-muted-foreground">
              This caregiver is currently busy.
            </p>
          )}
        </Card>
      </div>
    </>
  );
}