'use client';

import { useState, type FormEvent } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import type { Booking, PaymentMethod, Service } from '@sevyo/shared-types';
import { api } from '@/lib/api-client';
import { useMe } from '@/lib/use-me';
import { serviceEmoji } from '@/lib/constants';
import { payForBooking } from '@/lib/razorpay';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { DataError, EmptyState, LoadingCenter } from '@/components/states';

function todayStr(): string {
  const now = new Date();
  const mm = String(now.getMonth() + 1).padStart(2, '0');
  const dd = String(now.getDate()).padStart(2, '0');
  return `${now.getFullYear()}-${mm}-${dd}`;
}

export default function UserHomePage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const meQuery = useMe();

  const servicesQuery = useQuery({
    queryKey: ['services'],
    queryFn: () => api.get<Service[]>('/services'),
  });

  const instantServices = (servicesQuery.data ?? []).filter((s) => s.category === 'instant');

  const [selected, setSelected] = useState<Service | null>(null);
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [duration, setDuration] = useState(1);
  // Instant services (nurse procedures) are delivered at home only. At-site
  // visits are available for physiotherapy, labs, and mental health.
  const [address, setAddress] = useState('');
  const [payment, setPayment] = useState<PaymentMethod>('cash');
  const [notes, setNotes] = useState('');

  const bookMutation = useMutation({
    mutationFn: () =>
      api.post<Booking>('/bookings', {
        serviceId: Number(selected!.id),
        scheduledDate: date,
        scheduledTime: time,
        durationHours: duration,
        visitLocation: 'home',
        address: address || undefined,
        paymentMethod: payment,
        notes: notes || undefined,
      }),
    onSuccess: async (booking) => {
      queryClient.invalidateQueries({ queryKey: ['bookings'] });
      if (payment === 'online') {
        toast.success('Booking placed — complete payment to confirm');
        try {
          const ok = await payForBooking(booking, {
            name: meQuery.data?.name,
            email: meQuery.data?.email,
            contact: meQuery.data?.phone ?? undefined,
          });
          if (ok) await queryClient.invalidateQueries({ queryKey: ['bookings'] });
        } catch (err) {
          toast.error(err instanceof Error ? err.message : 'Could not start online payment — you can pay later from My Bookings');
        }
        setSelected(null);
        router.push('/user/bookings');
        return;
      }
      toast.success('Booking placed — searching for a nurse');
      setSelected(null);
      router.push('/user/bookings');
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const submit = (e: FormEvent) => {
    e.preventDefault();
    if (!selected) return;
    if (!date || !time) {
      toast.error('Please pick a date and time');
      return;
    }
    bookMutation.mutate();
  };

  const firstName = meQuery.data?.name?.split(' ')[0] ?? 'there';

  return (
    <>
      {/* Hero banner */}
      <section className="relative mb-8 overflow-hidden rounded-3xl bg-gradient-to-br from-[#1e3a8a] to-[#1e2a5e] p-8 sm:p-12">
        <div className="pointer-events-none absolute -right-20 -top-24 h-72 w-72 rounded-full bg-white/5" />
        <div className="pointer-events-none absolute -bottom-28 -left-10 h-64 w-64 rounded-full bg-rose-400/10" />
        <div className="relative">
          <h1 className="font-heading text-2xl font-bold text-white sm:text-3xl">Hello, {firstName} 👋</h1>
          <p className="mt-1 text-sm text-white/75">What care do you need today?</p>
          <div className="mt-6 flex flex-wrap gap-x-6 gap-y-2 text-xs font-medium text-white/70">
            <span>🛡️ Verified professionals</span>
            <span>⏱️ 30-min response</span>
            <span>⭐ 4.8 avg rating</span>
            <span>🏠 Care at home</span>
          </div>
        </div>
      </section>

      {/* Quick actions */}
      <div className="mb-8 grid grid-cols-1 gap-3 sm:grid-cols-2">
        <a href="#instant-services" className="group block rounded-xl border border-border bg-card p-5 shadow-sm transition-all hover:border-primary/40 hover:shadow">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-2xl">⚡</div>
            <div>
              <h3 className="font-heading text-base font-bold">Instant Booking</h3>
              <p className="text-sm text-muted-foreground">Get a nurse within 30–60 mins</p>
            </div>
          </div>
        </a>
        <Link href="/user/browse" className="group block rounded-xl border border-border bg-card p-5 shadow-sm transition-all hover:border-primary/40 hover:shadow">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-rose-50 text-2xl">🔍</div>
            <div>
              <h3 className="font-heading text-base font-bold">Browse Care</h3>
              <p className="text-sm text-muted-foreground">Find nurses &amp; caregivers</p>
            </div>
          </div>
        </Link>
      </div>

      {/* Instant services */}
      <section id="instant-services">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
          <h2 className="font-heading text-xl font-bold">Instant Services</h2>
          <span className="text-xs font-medium text-muted-foreground">⚡ Book now — no app, no waiting room</span>
        </div>

        {servicesQuery.isPending ? (
          <LoadingCenter />
        ) : servicesQuery.isError ? (
          <DataError message={servicesQuery.error.message} onRetry={() => servicesQuery.refetch()} />
        ) : instantServices.length === 0 ? (
          <EmptyState message="No instant services available" hint="Check back soon — new services are added regularly." />
        ) : (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            {instantServices.map((s) => (
              <button
                key={s.id}
                type="button"
                onClick={() => setSelected(s)}
                className="group rounded-xl border border-border bg-card p-4 text-left shadow-sm transition-all hover:border-primary/40 hover:shadow"
              >
                <div className="mb-2.5 flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-lg transition-transform group-hover:scale-110">
                  {serviceEmoji(s.name)}
                </div>
                <p className="text-sm font-semibold leading-snug">{s.name}</p>
                <p className="mt-1 text-xs text-muted-foreground">Book now →</p>
              </button>
            ))}
          </div>
        )}
      </section>

      {/* Instant booking dialog */}
      <Dialog open={selected !== null} onOpenChange={(open) => !open && setSelected(null)}>
        <DialogContent className="max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>⚡ Book {selected?.name}</DialogTitle>
            <DialogDescription>
              No caregiver assigned yet — we broadcast your request to nearby nurses.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={submit} className="grid gap-4">
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
              <p className="flex flex-wrap items-center gap-2 rounded-xl border border-border bg-slate-50/60 p-3 text-sm font-medium">
                🏠 At Home
                <span className="text-[11px] font-normal text-muted-foreground">
                  Need care at your office or site? Book physiotherapy, labs, or mental health — they support on-site visits
                </span>
              </p>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="bk-address">Address (optional)</Label>
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
                <p className="rounded-lg border border-primary/20 bg-primary/5 px-3 py-2 text-xs font-medium text-primary">
                  You&apos;ll complete payment on Razorpay&apos;s secure checkout after placing the booking (test mode).
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

            <DialogFooter>
              <Button type="submit" disabled={bookMutation.isPending}>
                {bookMutation.isPending ? 'Requesting…' : 'Request Now'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}