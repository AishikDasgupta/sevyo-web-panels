'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import type { Booking, BookingStatus, Caregiver } from '@sevyo/shared-types';
import { api } from '@/lib/api-client';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

type Role = 'user' | 'vendor' | 'resource' | 'admin';

const CANCELABLE: BookingStatus[] = ['pending', 'broadcast', 'confirmed', 'in_progress'];

/** Role-appropriate booking status actions (wired to PATCH /bookings/:id/status). */
export function BookingActions({
  booking,
  role,
  vendorId,
}: {
  booking: Booking;
  role: Role;
  vendorId?: string | null;
}) {
  const queryClient = useQueryClient();
  const router = useRouter();
  const [caregiverId, setCaregiverId] = useState<string>(booking.caregiverId ?? 'none');

  const rosterQuery = useQuery({
    queryKey: ['caregivers', 'roster', vendorId],
    queryFn: () => api.get<Caregiver[]>(`/caregivers?available=true${vendorId ? `&vendorId=${vendorId}` : ''}`),
    enabled: role === 'vendor' && booking.status === 'broadcast',
  });

  const mutation = useMutation({
    mutationFn: ({ status, caregiverId: cgId }: { status: BookingStatus; caregiverId?: string | null }) =>
      api.patch<Booking>(`/bookings/${booking.id}/status`, {
        status,
        caregiverId: cgId && cgId !== 'none' ? Number(cgId) : null,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bookings'] });
      toast.success('Booking updated');
      router.refresh();
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const act = (status: BookingStatus, caregiverId?: string | null) =>
    mutation.mutate({ status, caregiverId });

  const disabled = mutation.isPending;

  if (role === 'user') {
    if (!CANCELABLE.includes(booking.status)) return null;
    return (
      <Button
        variant="outline"
        size="sm"
        className="text-destructive hover:bg-rose-50"
        disabled={disabled}
        onClick={() => act('cancelled')}
      >
        Cancel booking
      </Button>
    );
  }

  if (role === 'resource') {
    if (booking.status === 'confirmed')
      return (
        <Button size="sm" disabled={disabled} onClick={() => act('in_progress')}>
          Start visit
        </Button>
      );
    if (booking.status === 'in_progress')
      return (
        <Button size="sm" disabled={disabled} onClick={() => act('completed')}>
          Complete visit
        </Button>
      );
    return null;
  }

  if (role === 'vendor') {
    if (booking.status === 'broadcast') {
      return (
        <Dialog>
          <DialogTrigger asChild>
            <Button size="sm">Accept booking</Button>
          </DialogTrigger>
          <DialogContent className="max-w-sm">
            <DialogHeader>
              <DialogTitle>Accept broadcast booking</DialogTitle>
              <DialogDescription>
                Assign one of your available caregivers to {booking.serviceName ?? 'this booking'}.
              </DialogDescription>
            </DialogHeader>
            <Select value={caregiverId} onValueChange={setCaregiverId}>
              <SelectTrigger>
                <SelectValue placeholder="Select a caregiver" />
              </SelectTrigger>
              <SelectContent>
                {rosterQuery.data?.length ? (
                  rosterQuery.data.map((cg) => (
                    <SelectItem key={cg.id} value={cg.id}>
                      {cg.name} · {cg.type.replace('_', ' ')}
                    </SelectItem>
                  ))
                ) : (
                  <SelectItem value="none" disabled>
                    No available caregivers
                  </SelectItem>
                )}
                <SelectItem value="none">No caregiver yet</SelectItem>
              </SelectContent>
            </Select>
            <DialogFooter>
              <Button disabled={disabled} onClick={() => act('confirmed', caregiverId)}>
                Confirm booking
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      );
    }
    if (booking.status === 'confirmed')
      return (
        <Button size="sm" disabled={disabled} onClick={() => act('in_progress')}>
          Start visit
        </Button>
      );
    if (booking.status === 'in_progress')
      return (
        <Button size="sm" disabled={disabled} onClick={() => act('completed')}>
          Complete visit
        </Button>
      );
    if (CANCELABLE.includes(booking.status))
      return (
        <Button variant="outline" size="sm" disabled={disabled} onClick={() => act('cancelled')}>
          Cancel
        </Button>
      );
    return null;
  }

  // admin — full control
  const actions: { label: string; status: BookingStatus }[] = [];
  if (booking.status === 'pending') {
    actions.push({ label: 'Broadcast', status: 'broadcast' }, { label: 'Cancel', status: 'cancelled' });
  } else if (booking.status === 'broadcast') {
    actions.push({ label: 'Confirm', status: 'confirmed' }, { label: 'Cancel', status: 'cancelled' });
  } else if (booking.status === 'confirmed') {
    actions.push({ label: 'Start', status: 'in_progress' }, { label: 'Cancel', status: 'cancelled' });
  } else if (booking.status === 'in_progress') {
    actions.push({ label: 'Complete', status: 'completed' }, { label: 'Cancel', status: 'cancelled' });
  }
  if (actions.length === 0) return null;
  return (
    <div className="flex gap-2">
      {actions.map((a) => (
        <Button
          key={a.status}
          size="sm"
          variant={a.status === 'cancelled' ? 'outline' : 'default'}
          disabled={disabled}
          onClick={() => act(a.status)}
        >
          {a.label}
        </Button>
      ))}
    </div>
  );
}