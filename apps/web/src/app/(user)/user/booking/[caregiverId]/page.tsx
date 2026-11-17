'use client';

import { useMemo, useState, type FormEvent } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import type { Booking, BookingVisitLocation, Caregiver, PaymentMethod, Service } from '@sevyo/shared-types';
import { api } from '@/lib/api-client';
import { caregiverTypeLabel } from '@/lib/constants';
import { fmtINR } from '@/lib/format';
import { cn } from '@/lib/utils';
import { AvatarOrInitial } from '@/components/avatar-or-initial';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Skeleton } from '@/components/ui/skeleton';
import { PageHeader } from '@/components/page-header';
import { DataError } from '@/components/states';

function todayStr(): string {
  const now = new Date();
  const mm = String(now.getMonth() + 1).padStart(2, '0');
  const dd = String(now.getDate()).padStart(2, '0');
  return `${now.getFullYear()}-${mm}-${dd}`;
}

export default function BookCaregiverPage() {
  const params = useParams();
  const router = useRouter();
  const queryClient = useQueryClient();
  const id = String(params.caregiverId);

  const caregiverQuery = useQuery({
    queryKey: ['caregivers', id],
    queryFn: () => api.get<Caregiver>(`/caregivers/${id}`),
  });

  const servicesQuery = useQuery({
    queryKey: ['services'],
    queryFn: () => api.get<Service[]>('/services'),
  });

  // The API requires a valid serviceId for every booking. There is no
  // "generic scheduled visit" service guaranteed to exist, so we pick the
  // first 'scheduled' category service (a regular home visit) and fall
  // back to the first service in the catalog.
  const serviceId = useMemo(() => {
    const list = servicesQuery.data ?? [];
    return list.find((s) => s.category === 'scheduled')?.id ?? list[0]?.id;
  }, [servicesQuery.data]);

  const cg = caregiverQuery.data;

  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [duration, setDuration] = useState(1);
  const [location, setLocation] = useState<BookingVisitLocation>('home');
  const [address, setAddress] = useState('');
  const [payment, setPayment] = useState<PaymentMethod>('cash');
  const [notes, setNotes] = useState('');

  const estimate = cg ? cg.pricePerHour * duration : 0;

  const bookMutation = useMutation({
    mutationFn: () =>
      api.post<Booking>('/bookings', {
        serviceId: Number(serviceId),
        caregiverId: Number(id),
        scheduledDate: date,
        scheduledTime: time,
        durationHours: duration,
        visitLocation: location,
        address: address || undefined,
        paymentMethod: payment,
        notes: notes || undefined,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bookings'] });
      toast.success('Booking placed — see it in My Bookings');
      router.push('/user/bookings');
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const submit = (e: FormEvent) => {
    e.preventDefault();
    if (!serviceId) {
      toast.error('No bookable service available right now');
      return;
    }
    if (!date || !time) {
      toast.error('Please pick a date and time');
      return;
    }
    if (location === 'site' && !address.trim()) {
      toast.error('An address is required for site visits');
      return;
    }
    bookMutation.mutate();
  };

  if (caregiverQuery.isPending) {
    return (
      <div className="max-w-2xl space-y-4">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-96 w-full" />
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

  if (!cg.available) {
    return (
      <DataError message={`${cg.name ?? 'This caregiver'} is currently busy — you cannot book them right now.`} />
    );
  }

  return (
    <>
      <PageHeader title={`Book ${cg.name}`} subtitle={`${cg.vendorName ?? 'Independent'} · ${fmtINR(cg.pricePerHour)}/hr`} />

      <div className="max-w-2xl">
        {/* Caregiver summary */}
        <Card className="mb-6 flex items-center gap-4 p-5">
          <AvatarOrInitial name={cg.name} avatarUrl={cg.avatarUrl} className="h-14 w-14" />
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <p className="font-heading text-lg font-bold">{cg.name}</p>
              <Badge variant="outline">{caregiverTypeLabel(cg.type)}</Badge>
            </div>
            <p className="mt-0.5 text-sm text-muted-foreground">
              {fmtINR(cg.pricePerHour)}/hr · {cg.experienceYears} yrs experience
            </p>
          </div>
          <div className="text-right">
            <p className="text-[0.6875rem] font-semibold uppercase tracking-wider text-muted-foreground">
              Available
            </p>
            <Badge variant={cg.available ? 'active' : 'inactive'} className="mt-1">
              {cg.available ? 'Yes' : 'Busy'}
            </Badge>
          </div>
        </Card>

        <form onSubmit={submit} className="grid gap-4">
          <Card className="grid gap-4 p-6">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="bk-date">Date</Label>
                <Input id="bk-date" type="date" min={todayStr()} value={date} onChange={(e) => setDate(e.target.value)} required />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="bk-time">Time</Label>
                <Input id="bk-time" type="time" value={time} onChange={(e) => setTime(e.target.value)} required />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="bk-duration">Duration (hours)</Label>
              <Input
                id="bk-duration"
                type="number"
                min={0.5}
                max={24}
                step={0.5}
                value={duration}
                onChange={(e) => setDuration(Number(e.target.value))}
              />
            </div>

            <div className="space-y-1.5">
              <Label>Visit location</Label>
              <RadioGroup
                value={location}
                onValueChange={(v) => setLocation(v as BookingVisitLocation)}
                className="grid grid-cols-2 gap-3"
              >
                <label
                  className={cn(
                    'flex cursor-pointer items-center gap-2 rounded-xl border border-border p-3 text-sm font-medium transition-colors',
                    location === 'home' && 'border-primary bg-primary/5',
                  )}
                >
                  <RadioGroupItem value="home" /> 🏠 At Home
                </label>
                <label
                  className={cn(
                    'flex cursor-pointer items-center gap-2 rounded-xl border border-border p-3 text-sm font-medium transition-colors',
                    location === 'site' && 'border-primary bg-primary/5',
                  )}
                >
                  <RadioGroupItem value="site" /> 🏢 At Site
                </label>
              </RadioGroup>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="bk-address">
                Address {location === 'site' && <span className="text-destructive">(required)</span>}
              </Label>
              <Textarea
                id="bk-address"
                placeholder="Flat, street, area, city…"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
              />
            </div>

            <div className="space-y-1.5">
              <Label>Payment method</Label>
              <RadioGroup
                value={payment}
                onValueChange={(v) => setPayment(v as PaymentMethod)}
                className="grid grid-cols-2 gap-3"
              >
                <label
                  className={cn(
                    'flex cursor-pointer items-center gap-2 rounded-xl border border-border p-3 text-sm font-medium transition-colors',
                    payment === 'cash' && 'border-primary bg-primary/5',
                  )}
                >
                  <RadioGroupItem value="cash" /> 💵 Cash on visit
                </label>
                <label
                  className={cn(
                    'flex cursor-pointer items-center gap-2 rounded-xl border border-border p-3 text-sm font-medium transition-colors',
                    payment === 'online' && 'border-primary bg-primary/5',
                  )}
                >
                  <RadioGroupItem value="online" /> 💳 Pay online
                </label>
              </RadioGroup>
              {payment === 'online' && (
                <p className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs font-medium text-amber-700">
                  Payment collected at visit — gateway coming soon
                </p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="bk-notes">Notes</Label>
              <Textarea
                id="bk-notes"
                placeholder="Any special requirements…"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </div>
          </Card>

          {/* Price estimate */}
          <Card className="p-6">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Rate</span>
              <span>{fmtINR(cg.pricePerHour)}/hr</span>
            </div>
            <div className="mt-2 flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Duration</span>
              <span>{duration} hours</span>
            </div>
            <div className="mt-3 flex items-center justify-between border-t border-border pt-3">
              <span className="font-semibold">Estimated total</span>
              <span className="font-heading text-2xl font-bold text-primary">{fmtINR(estimate)}</span>
            </div>
          </Card>

          <Button
            type="submit"
            size="lg"
            disabled={bookMutation.isPending || !serviceId}
          >
            {bookMutation.isPending ? 'Placing booking…' : `Confirm Booking · ${fmtINR(estimate)}`}
          </Button>
        </form>
      </div>
    </>
  );
}