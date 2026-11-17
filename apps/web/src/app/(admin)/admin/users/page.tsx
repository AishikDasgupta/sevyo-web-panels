'use client';

import { useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import type { UserRole, UserStatus } from '@sevyo/shared-types';
import { api } from '@/lib/api-client';
import { fmtDate, fmtINR } from '@/lib/format';
import { AvatarOrInitial } from '@/components/avatar-or-initial';
import { PageHeader } from '@/components/page-header';
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
import { MoreHorizontal } from 'lucide-react';

type AdminUser = {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  role: UserRole;
  status: UserStatus;
  createdAt: string;
  bookingsCount: number;
  spent: number;
};

const ROLE_OPTIONS: { value: UserRole | 'all'; label: string }[] = [
  { value: 'all', label: 'All roles' },
  { value: 'user', label: 'User' },
  { value: 'vendor', label: 'Vendor' },
  { value: 'resource', label: 'Resource' },
  { value: 'admin', label: 'Admin' },
];

const STATUS_ACTIONS: { status: UserStatus; label: string }[] = [
  { status: 'active', label: 'Set active' },
  { status: 'suspended', label: 'Set suspended' },
];

export default function AdminUsersPage() {
  const queryClient = useQueryClient();
  const [roleFilter, setRoleFilter] = useState<UserRole | 'all'>('all');
  const [q, setQ] = useState('');

  const usersQuery = useQuery({
    queryKey: ['admin', 'users'],
    queryFn: () => api.get<AdminUser[]>('/admin/users'),
  });

  const statusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: UserStatus }) =>
      api.patch(`/admin/users/${id}/status`, { status }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'users'] });
      toast.success('User status updated');
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase();
    return (usersQuery.data ?? []).filter((u) => {
      if (roleFilter !== 'all' && u.role !== roleFilter) return false;
      if (!term) return true;
      return (
        u.name.toLowerCase().includes(term) ||
        u.email.toLowerCase().includes(term)
      );
    });
  }, [usersQuery.data, roleFilter, q]);

  return (
    <>
      <PageHeader title="Users" subtitle="Registered patients and families" />

      <div className="mb-4 grid gap-3 rounded-xl border border-border bg-card p-4 sm:grid-cols-2">
        <div>
          <Label htmlFor="user-search">Search</Label>
          <Input
            id="user-search"
            placeholder="Search by name or email…"
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
        </div>
        <div>
          <Label>Role</Label>
          <Select value={roleFilter} onValueChange={(v) => setRoleFilter(v === 'all' ? 'all' : (v as UserRole))}>
            <SelectTrigger>
              <SelectValue placeholder="All roles" />
            </SelectTrigger>
            <SelectContent>
              {ROLE_OPTIONS.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {usersQuery.isPending ? (
        <LoadingCenter />
      ) : usersQuery.isError ? (
        <DataError message={usersQuery.error.message} onRetry={() => usersQuery.refetch()} />
      ) : filtered.length === 0 ? (
        <EmptyState message="No users found" hint="Try adjusting your filters or search term." />
      ) : (
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Bookings</TableHead>
                  <TableHead>Total Spent</TableHead>
                  <TableHead>Joined</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((u) => (
                  <TableRow key={u.id}>
                    <TableCell>
                      <div className="flex items-center gap-2.5">
                        <AvatarOrInitial name={u.name} className="h-9 w-9" />
                        <p className="text-sm font-semibold">{u.name}</p>
                      </div>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">{u.email}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">{u.phone ?? '—'}</TableCell>
                    <TableCell>
                      <Badge variant="secondary" className="capitalize">
                        {u.role}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <StatusBadge status={u.status} />
                    </TableCell>
                    <TableCell className="text-sm">{u.bookingsCount}</TableCell>
                    <TableCell className="text-sm font-semibold">{fmtINR(u.spent)}</TableCell>
                    <TableCell className="text-sm">{fmtDate(u.createdAt)}</TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="outline" size="icon" aria-label={`Actions for ${u.name}`}>
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Set status</DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          {STATUS_ACTIONS.filter((a) => a.status !== u.status).map((a) => (
                            <DropdownMenuItem
                              key={a.status}
                              disabled={statusMutation.isPending}
                              onSelect={() => statusMutation.mutate({ id: u.id, status: a.status })}
                            >
                              {a.label}
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