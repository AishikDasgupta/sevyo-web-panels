'use client';

import { useState, type FormEvent } from 'react';
import Link from 'next/link';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import type { Booking, BookingStatus, Vendor } from '@sevyo/shared-types';
import { api, apiUpload } from '@/lib/api-client';
import { fmtDate, fmtINR, fmtTime24 } from '@/lib/format';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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
import { DataError, EmptyState, LoadingCenter } from '@/components/states';
import { isVendorMissing, useVendor } from '../_lib/use-vendor';
import { CalendarCheck2, IndianRupee, Star, Upload, Users } from 'lucide-react';

const ACTIVE_STATUSES: BookingStatus[] = ['pending', 'confirmed', 'in_progress'];

export default function VendorDashboardPage() {
  const vendorQuery = useVendor();

  const bookingsQuery = useQuery({
    queryKey: ['bookings'],
    queryFn: () => api.get<Booking[]>('/bookings'),
    enabled: !!vendorQuery.data,
  });

  if (vendorQuery.isPending) return <LoadingCenter />;
  if (vendorQuery.isError || !vendorQuery.data) {
    const missing = vendorQuery.isError ? isVendorMissing(vendorQuery.error) : true;
    if (missing) return <VendorSetup />;
    return <DataError message="Could not load your vendor profile" onRetry={() => vendorQuery.refetch()} />;
  }

  const vendor = vendorQuery.data;
  const bookings = bookingsQuery.data ?? [];
  const recent = bookings.slice(0, 5);
  const activeCount = bookings.filter((b) => ACTIVE_STATUSES.includes(b.status)).length;

  return (
    <>
      <PageHeader
        title={`Hi, ${vendor.agencyName}`}
        subtitle="Here is what is happening at your agency today."
        actions={<StatusBadge status={vendor.status} />}
      />

      <div className="mb-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard
          label="Total Revenue"
          value={fmtINR(vendor.revenueTotal)}
          icon={<IndianRupee className="h-5 w-5" />}
          tone="emerald"
        />
        <StatCard
          label="Active Bookings"
          value={activeCount}
          icon={<CalendarCheck2 className="h-5 w-5" />}
          tone="blue"
        />
        <StatCard
          label="Total Caregivers"
          value={vendor.caregiverCount ?? 0}
          icon={<Users className="h-5 w-5" />}
          tone="violet"
        />
        <StatCard label="Rating" value={`${vendor.rating} ⭐`} icon={<Star className="h-5 w-5" />} tone="amber" />
      </div>

      <div className="mb-6 flex flex-wrap gap-3">
        <Button asChild>
          <Link href="/vendor/caregivers">Add caregiver</Link>
        </Button>
        <Button asChild variant="outline">
          <Link href="/vendor/bookings">View all bookings</Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Bookings</CardTitle>
          <CardDescription>The latest bookings for your agency.</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          {bookingsQuery.isPending ? (
            <LoadingCenter className="py-12" />
          ) : bookingsQuery.isError ? (
            <div className="p-6">
              <DataError message={bookingsQuery.error.message} onRetry={() => bookingsQuery.refetch()} />
            </div>
          ) : recent.length === 0 ? (
            <div className="p-6">
              <EmptyState
                message="No bookings yet"
                hint="New bookings will show up here once patients book your caregivers."
              />
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Service</TableHead>
                  <TableHead>Caregiver</TableHead>
                  <TableHead>Patient</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Time</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Price</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recent.map((b) => (
                  <TableRow key={b.id}>
                    <TableCell className="text-sm font-semibold text-primary">{b.id}</TableCell>
                    <TableCell className="text-sm font-medium">{b.serviceName ?? 'Service'}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">{b.caregiverName ?? '—'}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">{b.userName ?? '—'}</TableCell>
                    <TableCell className="text-sm">{fmtDate(b.scheduledDate)}</TableCell>
                    <TableCell className="text-sm">{fmtTime24(b.scheduledTime)}</TableCell>
                    <TableCell>
                      <StatusBadge status={b.status} />
                    </TableCell>
                    <TableCell className="text-right text-sm font-semibold">{fmtINR(b.price)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </>
  );
}

function VendorSetup() {
  const queryClient = useQueryClient();
  const [agencyName, setAgencyName] = useState('');
  const [location, setLocation] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [logoFile, setLogoFile] = useState<File | null>(null);

  const createMutation = useMutation({
    mutationFn: () =>
      api.post<Vendor>('/vendors', {
        agencyName: agencyName.trim(),
        location: location.trim() || undefined,
        contactEmail: contactEmail.trim() || undefined,
        contactPhone: contactPhone.trim() || undefined,
      }),
    onSuccess: async (created) => {
      if (logoFile) {
        try {
          const uploaded = await apiUpload<{ url: string }>('/uploads/logo', logoFile);
          await api.patch(`/vendors/${created.id}`, { logoUrl: uploaded.url });
        } catch (err) {
          toast.error(err instanceof Error ? err.message : 'Logo upload failed');
        }
      }
      queryClient.invalidateQueries({ queryKey: ['vendor', 'me'] });
      toast.success('Agency profile created');
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const submit = (e: FormEvent) => {
    e.preventDefault();
    if (!agencyName.trim()) {
      toast.error('Agency name is required');
      return;
    }
    createMutation.mutate();
  };

  return (
    <Card className="mx-auto max-w-md">
      <CardHeader>
        <CardTitle>Set up your agency</CardTitle>
        <CardDescription>
          Create your vendor profile to start managing caregivers and bookings.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={submit} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="vs-name">Agency name</Label>
            <Input
              id="vs-name"
              value={agencyName}
              onChange={(e) => setAgencyName(e.target.value)}
              placeholder="HealthFirst Agency"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="vs-location">Location</Label>
            <Input
              id="vs-location"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="City / area"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="vs-email">Contact email</Label>
            <Input
              id="vs-email"
              type="email"
              value={contactEmail}
              onChange={(e) => setContactEmail(e.target.value)}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="vs-phone">Contact phone</Label>
            <Input
              id="vs-phone"
              value={contactPhone}
              onChange={(e) => setContactPhone(e.target.value)}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="vs-logo">Logo</Label>
            <Input
              id="vs-logo"
              type="file"
              accept="image/*"
              onChange={(e) => setLogoFile(e.target.files?.[0] ?? null)}
            />
          </div>
          <Button type="submit" className="w-full" disabled={createMutation.isPending}>
            <Upload className="h-4 w-4" />
            {createMutation.isPending ? 'Creating…' : 'Create agency'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}