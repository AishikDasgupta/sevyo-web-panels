'use client';

import { useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import type { Vendor, VendorStatus } from '@sevyo/shared-types';
import { api } from '@/lib/api-client';
import { capitalize, fmtDate, fmtINR } from '@/lib/format';
import { AvatarOrInitial } from '@/components/avatar-or-initial';
import { PageHeader } from '@/components/page-header';
import { Stars } from '@/components/stars';
import { StatusBadge } from '@/components/status-badge';
import { DataError, EmptyState, LoadingCenter } from '@/components/states';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
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
import { MoreHorizontal } from 'lucide-react';

const STATUS_FILTERS = ['all', 'active', 'pending', 'suspended'] as const;
type StatusFilter = (typeof STATUS_FILTERS)[number];

export default function AdminVendorsPage() {
  const queryClient = useQueryClient();
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [q, setQ] = useState('');

  const vendorsQuery = useQuery({
    queryKey: ['admin', 'vendors'],
    queryFn: () => api.get<Vendor[]>('/admin/vendors'),
  });

  const statusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: VendorStatus }) =>
      api.patch(`/admin/vendors/${id}/status`, { status }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'vendors'] });
      toast.success('Vendor status updated');
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase();
    return (vendorsQuery.data ?? []).filter((v) => {
      if (statusFilter !== 'all' && v.status !== statusFilter) return false;
      if (!term) return true;
      return (
        v.agencyName.toLowerCase().includes(term) ||
        (v.location ?? '').toLowerCase().includes(term)
      );
    });
  }, [vendorsQuery.data, statusFilter, q]);

  return (
    <>
      <PageHeader title="Vendors" subtitle="Manage nursing agencies and partners" />

      <div className="mb-4 grid gap-3 rounded-xl border border-border bg-card p-4 sm:grid-cols-2">
        <div>
          <Label htmlFor="vendor-search">Search</Label>
          <Input
            id="vendor-search"
            placeholder="Search by agency or location…"
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
        </div>
        <div className="flex items-end">
          <div className="flex flex-wrap gap-2">
            {STATUS_FILTERS.map((s) => (
              <button
                key={s}
                onClick={() => setStatusFilter(s)}
                className={`rounded-full border border-border bg-card px-3.5 py-1.5 text-xs font-semibold text-muted-foreground transition-all hover:bg-muted ${
                  statusFilter === s
                    ? 'border-primary bg-primary text-primary-foreground hover:bg-primary'
                    : ''
                }`}
              >
                {s === 'all' ? 'All' : capitalize(s)}
              </button>
            ))}
          </div>
        </div>
      </div>

      {vendorsQuery.isPending ? (
        <LoadingCenter />
      ) : vendorsQuery.isError ? (
        <DataError message={vendorsQuery.error.message} onRetry={() => vendorsQuery.refetch()} />
      ) : filtered.length === 0 ? (
        <EmptyState message="No vendors found" hint="Try adjusting your filters or search term." />
      ) : (
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Agency</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Rating</TableHead>
                  <TableHead>Revenue</TableHead>
                  <TableHead>Caregivers</TableHead>
                  <TableHead>Member Since</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((v) => (
                  <TableRow key={v.id}>
                    <TableCell>
                      <div className="flex items-center gap-2.5">
                        <AvatarOrInitial name={v.agencyName} avatarUrl={v.logoUrl} className="h-9 w-9" />
                        <div>
                          <p className="text-sm font-semibold">{v.agencyName}</p>
                          {v.status === 'pending' && <Badge variant="pending">Pending</Badge>}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">{v.location ?? '—'}</TableCell>
                    <TableCell className="text-sm">
                      <p>{v.contactEmail ?? '—'}</p>
                      <p className="text-xs text-muted-foreground">{v.contactPhone ?? '—'}</p>
                    </TableCell>
                    <TableCell>
                      <StatusBadge status={v.status} />
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1.5">
                        <Stars rating={v.rating} />
                        <span className="text-xs text-muted-foreground">{v.rating.toFixed(1)}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-sm font-semibold">{fmtINR(v.revenueTotal)}</TableCell>
                    <TableCell className="text-sm">{v.caregiverCount ?? 0}</TableCell>
                    <TableCell className="text-sm">{v.memberSince ? fmtDate(v.memberSince) : '—'}</TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="outline" size="icon" aria-label={`Actions for ${v.agencyName}`}>
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Set status</DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          {(['active', 'pending', 'suspended'] as VendorStatus[])
                            .filter((s) => s !== v.status)
                            .map((s) => (
                              <DropdownMenuItem
                                key={s}
                                disabled={statusMutation.isPending}
                                onSelect={() => statusMutation.mutate({ id: v.id, status: s })}
                              >
                                {capitalize(s)}
                              </DropdownMenuItem>
                            ))}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
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