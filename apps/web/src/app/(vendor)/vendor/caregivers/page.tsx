'use client';

import { useEffect, useState, type FormEvent } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import type { Caregiver, CaregiverType } from '@sevyo/shared-types';
import { api } from '@/lib/api-client';
import { fmtINR } from '@/lib/format';
import { AvatarOrInitial } from '@/components/avatar-or-initial';
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
import { PageHeader } from '@/components/page-header';
import { Stars } from '@/components/stars';
import { DataError, EmptyState, LoadingCenter } from '@/components/states';
import { CAREGIVER_TYPE_OPTIONS, caregiverTypeLabel } from '../_lib/constants';
import { isVendorMissing, useVendor } from '../_lib/use-vendor';
import { VendorUnavailable } from '../_lib/vendor-unavailable';
import { Pencil, Plus } from 'lucide-react';

type CaregiverPayload = {
  type: CaregiverType;
  pricePerHour: number;
  bio?: string;
  experienceYears?: number;
  available: boolean;
  specializations?: string[];
};

export default function VendorCaregiversPage() {
  const vendorQuery = useVendor();
  const queryClient = useQueryClient();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Caregiver | null>(null);

  const rosterQuery = useQuery({
    queryKey: ['caregivers', 'roster', vendorQuery.data?.id],
    queryFn: () => api.get<Caregiver[]>(`/caregivers?vendorId=${vendorQuery.data?.id}`),
    enabled: !!vendorQuery.data,
  });

  const saveMutation = useMutation({
    mutationFn: (payload: CaregiverPayload) =>
      editing
        ? api.patch<Caregiver>(`/caregivers/${editing.id}`, payload)
        : api.post<Caregiver>('/caregivers', payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['caregivers', 'roster', vendorQuery.data?.id] });
      setDialogOpen(false);
      setEditing(null);
      toast.success(editing ? 'Caregiver updated' : 'Caregiver added');
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const toggleMutation = useMutation({
    mutationFn: (cg: Caregiver) => api.patch<Caregiver>(`/caregivers/${cg.id}`, { available: !cg.available }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['caregivers', 'roster', vendorQuery.data?.id] });
      toast.success('Availability updated');
    },
    onError: (err: Error) => toast.error(err.message),
  });

  if (vendorQuery.isPending) return <LoadingCenter />;
  if (vendorQuery.isError || !vendorQuery.data) {
    const missing = vendorQuery.isError ? isVendorMissing(vendorQuery.error) : true;
    return missing ? (
      <VendorUnavailable onRetry={() => vendorQuery.refetch()} />
    ) : (
      <DataError message="Could not load your vendor profile" onRetry={() => vendorQuery.refetch()} />
    );
  }

  return (
    <>
      <PageHeader
        title="My Caregivers"
        subtitle="Manage your team of healthcare professionals"
        actions={
          <Button
            onClick={() => {
              setEditing(null);
              setDialogOpen(true);
            }}
          >
            <Plus className="h-4 w-4" />
            Add Caregiver
          </Button>
        }
      />

      <CaregiverFormDialog
        open={dialogOpen}
        onOpenChange={(open) => {
          setDialogOpen(open);
          if (!open) setEditing(null);
        }}
        caregiver={editing}
        isSubmitting={saveMutation.isPending}
        onSubmit={(payload) => saveMutation.mutate(payload)}
      />

      {rosterQuery.isPending ? (
        <LoadingCenter />
      ) : rosterQuery.isError ? (
        <DataError message={rosterQuery.error.message} onRetry={() => rosterQuery.refetch()} />
      ) : !rosterQuery.data?.length ? (
        <EmptyState
          message="No caregivers yet"
          hint="Add your first caregiver to start taking bookings."
        />
      ) : (
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Caregiver</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>Experience</TableHead>
                  <TableHead>Rating</TableHead>
                  <TableHead>Availability</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rosterQuery.data.map((cg) => (
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
                    <TableCell className="text-sm capitalize">{caregiverTypeLabel(cg.type)}</TableCell>
                    <TableCell className="text-sm font-semibold">{fmtINR(cg.pricePerHour)}/hr</TableCell>
                    <TableCell className="text-sm text-muted-foreground">{cg.experienceYears} yrs</TableCell>
                    <TableCell>
                      <Stars rating={cg.rating} />
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

function CaregiverFormDialog({
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
  onSubmit: (payload: CaregiverPayload) => void;
}) {
  const [type, setType] = useState<CaregiverType>('nurse');
  const [price, setPrice] = useState('500');
  const [experience, setExperience] = useState('');
  const [bio, setBio] = useState('');
  const [available, setAvailable] = useState(true);
  const [specializations, setSpecializations] = useState('');

  useEffect(() => {
    if (!open) return;
    setType(caregiver?.type ?? 'nurse');
    setPrice(caregiver ? String(caregiver.pricePerHour) : '500');
    setExperience(caregiver ? String(caregiver.experienceYears) : '');
    setBio(caregiver?.bio ?? '');
    setAvailable(caregiver?.available ?? true);
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
      specializations: specs.length ? specs : undefined,
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{caregiver ? 'Edit Caregiver' : 'Add Caregiver'}</DialogTitle>
          <DialogDescription>
            {caregiver
              ? 'Update the details for this caregiver.'
              : 'Add a healthcare professional to your agency roster.'}
          </DialogDescription>
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
          <DialogFooter>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Saving…' : caregiver ? 'Save changes' : 'Add caregiver'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}