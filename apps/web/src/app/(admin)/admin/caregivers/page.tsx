'use client';

import { useEffect, useMemo, useState, type FormEvent } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import type { Caregiver, CaregiverType } from '@sevyo/shared-types';
import { api } from '@/lib/api-client';
import { fmtINR } from '@/lib/format';
import { AvatarOrInitial } from '@/components/avatar-or-initial';
import { PageHeader } from '@/components/page-header';
import { Stars } from '@/components/stars';
import { DataError, EmptyState, LoadingCenter } from '@/components/states';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Textarea } from '@/components/ui/textarea';
import { Pencil } from 'lucide-react';

const CAREGIVER_TYPE_LABELS: Record<CaregiverType, string> = {
  nurse: 'Nurse',
  caregiver: 'Caregiver',
  physiotherapist: 'Physiotherapist',
  lab: 'Lab',
  mental_health: 'Mental Health',
  elder_care: 'Elder Care',
  pediatric: 'Pediatric',
};

const CAREGIVER_TYPE_OPTIONS = Object.entries(CAREGIVER_TYPE_LABELS) as Array<[CaregiverType, string]>;

type EditPayload = {
  type: CaregiverType;
  pricePerHour: number;
  experienceYears?: number;
  bio?: string;
  available: boolean;
  verified: boolean;
  specializations?: string[];
};

export default function AdminCaregiversPage() {
  const queryClient = useQueryClient();
  const [typeFilter, setTypeFilter] = useState<CaregiverType | 'all'>('all');
  const [q, setQ] = useState('');
  const [editing, setEditing] = useState<Caregiver | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  const caregiversQuery = useQuery({
    queryKey: ['caregivers'],
    queryFn: () => api.get<Caregiver[]>('/caregivers'),
  });

  const toggleMutation = useMutation({
    mutationFn: (cg: Caregiver) => api.patch<Caregiver>(`/caregivers/${cg.id}`, { available: !cg.available }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['caregivers'] });
      toast.success('Availability updated');
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const saveMutation = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: EditPayload }) =>
      api.patch<Caregiver>(`/caregivers/${id}`, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['caregivers'] });
      setEditing(null);
      setDialogOpen(false);
      toast.success('Caregiver updated');
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase();
    return (caregiversQuery.data ?? []).filter((cg) => {
      if (typeFilter !== 'all' && cg.type !== typeFilter) return false;
      if (!term) return true;
      return (
        (cg.name ?? '').toLowerCase().includes(term) ||
        (cg.vendorName ?? '').toLowerCase().includes(term) ||
        (cg.specializations ?? []).some((s) => s.toLowerCase().includes(term))
      );
    });
  }, [caregiversQuery.data, typeFilter, q]);

  return (
    <>
      <PageHeader title="Caregivers" subtitle="All registered healthcare professionals" />

      <div className="mb-4 grid gap-3 rounded-xl border border-border bg-card p-4 sm:grid-cols-2">
        <div>
          <Label htmlFor="caregiver-search">Search</Label>
          <Input
            id="caregiver-search"
            placeholder="Search by name, vendor, or specialization…"
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
        </div>
        <div>
          <Label>Type</Label>
          <Select value={typeFilter} onValueChange={(v) => setTypeFilter(v === 'all' ? 'all' : (v as CaregiverType))}>
            <SelectTrigger>
              <SelectValue placeholder="All types" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All types</SelectItem>
              {CAREGIVER_TYPE_OPTIONS.map(([value, label]) => (
                <SelectItem key={value} value={value}>
                  {label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <CaregiverEditDialog
        open={dialogOpen}
        onOpenChange={(open) => {
          setDialogOpen(open);
          if (!open) setEditing(null);
        }}
        caregiver={editing}
        isSubmitting={saveMutation.isPending}
        onSubmit={(payload) => editing && saveMutation.mutate({ id: editing.id, payload })}
      />

      {caregiversQuery.isPending ? (
        <LoadingCenter />
      ) : caregiversQuery.isError ? (
        <DataError message={caregiversQuery.error.message} onRetry={() => caregiversQuery.refetch()} />
      ) : filtered.length === 0 ? (
        <EmptyState
          message="No caregivers found"
          hint="Try adjusting your filters or search term."
        />
      ) : (
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Caregiver</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Vendor</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>Experience</TableHead>
                  <TableHead>Rating</TableHead>
                  <TableHead>Availability</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((cg) => (
                  <TableRow key={cg.id}>
                    <TableCell>
                      <div className="flex items-center gap-2.5">
                        <AvatarOrInitial name={cg.name} avatarUrl={cg.avatarUrl} className="h-9 w-9" />
                        <div>
                          <p className="text-sm font-semibold">{cg.name}</p>
                          {cg.verified && <Badge variant="verified">Verified</Badge>}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary">{CAREGIVER_TYPE_LABELS[cg.type]}</Badge>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">{cg.vendorName ?? '—'}</TableCell>
                    <TableCell className="text-sm font-semibold">{fmtINR(cg.pricePerHour)}/hr</TableCell>
                    <TableCell className="text-sm text-muted-foreground">{cg.experienceYears} yrs</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1.5">
                        <Stars rating={cg.rating} />
                        <span className="text-xs text-muted-foreground">
                          {cg.rating.toFixed(1)} ({cg.reviewsCount})
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Switch
                          checked={cg.available}
                          disabled={toggleMutation.isPending}
                          onCheckedChange={() => toggleMutation.mutate(cg)}
                        />
                        <span className="text-xs font-medium text-muted-foreground">
                          {cg.available ? 'Available' : 'Busy'}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setEditing(cg);
                          setDialogOpen(true);
                        }}
                      >
                        <Pencil className="h-3.5 w-3.5" />
                        Edit
                      </Button>
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

function CaregiverEditDialog({
  open,
  onOpenChange,
  caregiver,
  isSubmitting,
  onSubmit,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  caregiver: Caregiver | null;
  isSubmitting: boolean;
  onSubmit: (payload: EditPayload) => void;
}) {
  const [type, setType] = useState<CaregiverType>('nurse');
  const [price, setPrice] = useState('');
  const [experience, setExperience] = useState('');
  const [bio, setBio] = useState('');
  const [available, setAvailable] = useState(true);
  const [verified, setVerified] = useState(false);
  const [specializations, setSpecializations] = useState('');

  useEffect(() => {
    if (!open) return;
    setType(caregiver?.type ?? 'nurse');
    setPrice(caregiver ? String(caregiver.pricePerHour) : '');
    setExperience(caregiver ? String(caregiver.experienceYears) : '');
    setBio(caregiver?.bio ?? '');
    setAvailable(caregiver?.available ?? true);
    setVerified(caregiver?.verified ?? false);
    setSpecializations(caregiver?.specializations?.join(', ') ?? '');
  }, [open, caregiver]);

  const submit = (e: FormEvent) => {
    e.preventDefault();
    const priceNum = Number(price);
    if (!Number.isFinite(priceNum) || priceNum <= 0) {
      toast.error('Enter a valid price per hour');
      return;
    }
    const specs = specializations
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);
    onSubmit({
      type,
      pricePerHour: priceNum,
      experienceYears: experience.trim() ? Number(experience) : undefined,
      bio: bio.trim() || undefined,
      available,
      verified,
      specializations: specs.length ? specs : undefined,
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Edit Caregiver</DialogTitle>
          <DialogDescription>Update the details for this caregiver.</DialogDescription>
        </DialogHeader>
        <form onSubmit={submit} className="space-y-4">
          <div className="space-y-1.5">
            <Label>Type</Label>
            <Select value={type} onValueChange={(v) => setType(v as CaregiverType)}>
              <SelectTrigger>
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent>
                {CAREGIVER_TYPE_OPTIONS.map(([value, label]) => (
                  <SelectItem key={value} value={value}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="cg-price">Price / hr (₹)</Label>
              <Input
                id="cg-price"
                type="number"
                min={0}
                value={price}
                onChange={(e) => setPrice(e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="cg-experience">Experience (yrs)</Label>
              <Input
                id="cg-experience"
                type="number"
                min={0}
                value={experience}
                onChange={(e) => setExperience(e.target.value)}
              />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="cg-specializations">Specializations</Label>
            <Input
              id="cg-specializations"
              placeholder="Wound care, IV therapy — comma separated"
              value={specializations}
              onChange={(e) => setSpecializations(e.target.value)}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="cg-bio">Bio</Label>
            <Textarea
              id="cg-bio"
              rows={3}
              placeholder="Short introduction for patients…"
              value={bio}
              onChange={(e) => setBio(e.target.value)}
            />
          </div>
          <label className="flex cursor-pointer items-center justify-between rounded-lg border border-border px-3 py-2.5">
            <span className="text-sm font-medium">Available for bookings</span>
            <Switch checked={available} onCheckedChange={setAvailable} />
          </label>
          <label className="flex cursor-pointer items-center justify-between rounded-lg border border-border px-3 py-2.5">
            <span className="text-sm font-medium">Verified professional</span>
            <Switch checked={verified} onCheckedChange={setVerified} />
          </label>
          <DialogFooter>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Saving…' : 'Save changes'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}