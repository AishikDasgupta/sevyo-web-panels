'use client';

import { useEffect, useState, type FormEvent } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { BadgeCheck, Pencil, Upload } from 'lucide-react';
import { toast } from 'sonner';
import type { Caregiver, CaregiverType, UserProfile } from '@sevyo/shared-types';
import { api, apiUpload } from '@/lib/api-client';
import { assetUrl, fmtINR } from '@/lib/format';
import { PageHeader } from '@/components/page-header';
import { AvatarOrInitial } from '@/components/avatar-or-initial';
import { Stars } from '@/components/stars';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
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
import { Textarea } from '@/components/ui/textarea';
import { DataError, LoadingCenter } from '@/components/states';

const TYPE_LABELS: Record<CaregiverType, string> = {
  nurse: 'Nurse',
  caregiver: 'Caregiver',
  physiotherapist: 'Physiotherapist',
  lab: 'Lab Technician',
  mental_health: 'Mental Health',
  elder_care: 'Elder Care',
  pediatric: 'Pediatric Care',
};

const TYPE_OPTIONS = Object.entries(TYPE_LABELS) as Array<[CaregiverType, string]>;

export default function ResourceProfilePage() {
  const queryClient = useQueryClient();

  const caregiverQuery = useQuery({
    queryKey: ['caregiver', 'me'],
    queryFn: () => api.get<Caregiver>('/caregivers/me'),
  });

  const meQuery = useQuery({
    queryKey: ['me'],
    queryFn: () => api.get<UserProfile>('/users/me'),
  });

  const [type, setType] = useState<CaregiverType>('caregiver');
  const [pricePerHour, setPricePerHour] = useState('');
  const [experienceYears, setExperienceYears] = useState('');
  const [bio, setBio] = useState('');
  const [specializations, setSpecializations] = useState('');

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');

  const caregiver = caregiverQuery.data;
  const me = meQuery.data;

  useEffect(() => {
    if (!caregiver) return;
    setType(caregiver.type);
    setPricePerHour(String(caregiver.pricePerHour));
    setExperienceYears(String(caregiver.experienceYears));
    setBio(caregiver.bio ?? '');
    setSpecializations((caregiver.specializations ?? []).join(', '));
  }, [caregiver]);

  useEffect(() => {
    if (!me) return;
    setName(me.name);
    setPhone(me.phone ?? '');
    setAddress(me.defaultAddress ?? '');
  }, [me]);

  const availabilityMutation = useMutation({
    mutationFn: (available: boolean) =>
      api.patch<Caregiver>(`/caregivers/${caregiver?.id}`, { available }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['caregiver', 'me'] });
      toast.success('Availability updated');
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const professionalMutation = useMutation({
    mutationFn: () =>
      api.patch<Caregiver>(`/caregivers/${caregiver?.id}`, {
        type,
        pricePerHour: Number(pricePerHour),
        experienceYears: Number(experienceYears),
        bio,
        specializations: specializations
          .split(',')
          .map((s) => s.trim())
          .filter(Boolean),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['caregiver', 'me'] });
      toast.success('Professional profile saved');
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const personalMutation = useMutation({
    mutationFn: () => api.patch<UserProfile>('/users/me', { name, phone, defaultAddress: address }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['me'] });
      queryClient.invalidateQueries({ queryKey: ['caregiver', 'me'] });
      toast.success('Profile saved');
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const avatarMutation = useMutation({
    mutationFn: async (file: File) => {
      const res = await apiUpload<{ url: string }>('/uploads/avatar', file);
      await api.patch('/users/me', { avatarUrl: res.url });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['me'] });
      queryClient.invalidateQueries({ queryKey: ['caregiver', 'me'] });
      setAvatarPreview(null);
      toast.success('Avatar updated');
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const passwordMutation = useMutation({
    mutationFn: () => api.post('/users/me/password', { currentPassword, newPassword }),
    onSuccess: () => {
      setCurrentPassword('');
      setNewPassword('');
      toast.success('Password changed');
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const saveProfessional = (e: FormEvent) => {
    e.preventDefault();
    if (Number.isNaN(Number(pricePerHour)) || Number(pricePerHour) < 0) {
      toast.error('Enter a valid price per hour');
      return;
    }
    if (Number.isNaN(Number(experienceYears)) || Number(experienceYears) < 0) {
      toast.error('Enter valid years of experience');
      return;
    }
    professionalMutation.mutate();
  };

  const savePersonal = (e: FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error('Name cannot be empty');
      return;
    }
    personalMutation.mutate();
  };

  const changePassword = (e: FormEvent) => {
    e.preventDefault();
    if (!currentPassword || !newPassword) {
      toast.error('Fill in both password fields');
      return;
    }
    if (newPassword.length < 8) {
      toast.error('New password must be at least 8 characters');
      return;
    }
    passwordMutation.mutate();
  };

  if (caregiverQuery.isPending || meQuery.isPending) return <LoadingCenter />;
  if (caregiverQuery.isError || meQuery.isError || !caregiver || !me) {
    return (
      <DataError
        message={caregiverQuery.error?.message ?? meQuery.error?.message ?? 'Could not load your profile'}
        onRetry={() => {
          caregiverQuery.refetch();
          meQuery.refetch();
        }}
      />
    );
  }

  const avatarSrc = avatarPreview ?? assetUrl(me.avatarUrl);

  return (
    <>
      <PageHeader title="My Profile" subtitle="Caregiver profile and availability" />

      <div className="grid items-start gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Professional Profile</CardTitle>
            <CardDescription>How patients see you</CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="flex items-center gap-4">
              <AvatarOrInitial name={caregiver.name} avatarUrl={caregiver.avatarUrl} className="h-20 w-20 text-2xl" />
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <p className="truncate font-heading text-lg font-bold">{caregiver.name ?? 'Caregiver'}</p>
                  {caregiver.verified && (
                    <Badge variant="verified">
                      <BadgeCheck className="h-3.5 w-3.5" />
                      Verified
                    </Badge>
                  )}
                </div>
                <p className="text-sm capitalize text-muted-foreground">
                  {TYPE_LABELS[caregiver.type]} · {caregiver.vendorName ?? 'Sevyo'}
                </p>
                <div className="mt-1 flex items-center gap-2">
                  <Stars rating={caregiver.rating} />
                  <span className="text-xs text-muted-foreground">
                    {caregiver.rating.toFixed(1)} · {caregiver.reviewsCount} reviews
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between rounded-lg border border-border px-4 py-3">
              <div>
                <p className="text-sm font-semibold">Available for new bookings</p>
                <p className="text-xs text-muted-foreground">
                  {fmtINR(caregiver.pricePerHour)}/hr · {caregiver.experienceYears} yrs experience
                </p>
              </div>
              <Switch
                checked={caregiver.available}
                disabled={availabilityMutation.isPending}
                onCheckedChange={(checked) => availabilityMutation.mutate(checked)}
              />
            </div>

            <Dialog>
              <DialogTrigger asChild>
                <Button variant="outline" className="w-full">
                  <Pencil className="h-4 w-4" />
                  Edit Professional Details
                </Button>
              </DialogTrigger>
              <DialogContent className="max-h-[85vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Edit Professional Details</DialogTitle>
                  <DialogDescription>Update your care profile — patients see this before booking.</DialogDescription>
                </DialogHeader>
                <form onSubmit={saveProfessional} className="space-y-4">
                  <div className="space-y-1.5">
                    <Label>Care type</Label>
                    <Select value={type} onValueChange={(v) => setType(v as CaregiverType)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select care type" />
                      </SelectTrigger>
                      <SelectContent>
                        {TYPE_OPTIONS.map(([value, label]) => (
                          <SelectItem key={value} value={value}>
                            {label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <Label htmlFor="cg-price">Price / hour (₹)</Label>
                      <Input
                        id="cg-price"
                        type="number"
                        min={0}
                        value={pricePerHour}
                        onChange={(e) => setPricePerHour(e.target.value)}
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="cg-exp">Experience (years)</Label>
                      <Input
                        id="cg-exp"
                        type="number"
                        min={0}
                        value={experienceYears}
                        onChange={(e) => setExperienceYears(e.target.value)}
                      />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="cg-specs">Specializations (comma separated)</Label>
                    <Input
                      id="cg-specs"
                      placeholder="Dementia care, Wound dressing…"
                      value={specializations}
                      onChange={(e) => setSpecializations(e.target.value)}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="cg-bio">Bio</Label>
                    <Textarea id="cg-bio" rows={4} value={bio} onChange={(e) => setBio(e.target.value)} />
                  </div>
                  <DialogFooter>
                    <Button type="submit" disabled={professionalMutation.isPending}>
                      {professionalMutation.isPending ? 'Saving…' : 'Save Changes'}
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Personal Information</CardTitle>
            <CardDescription>Your account details</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={savePersonal} className="space-y-4">
              <div className="flex items-center gap-4">
                <AvatarOrInitial name={me.name} avatarUrl={avatarSrc} className="h-20 w-20 text-2xl" />
                <div>
                  <label className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-border bg-background px-3 py-2 text-sm font-semibold transition-colors hover:bg-muted">
                    <Upload className="h-4 w-4" />
                    Upload photo
                    <input
                      type="file"
                      accept="image/*"
                      className="sr-only"
                      disabled={avatarMutation.isPending}
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (!file) return;
                        setAvatarPreview(URL.createObjectURL(file));
                        avatarMutation.mutate(file);
                      }}
                    />
                  </label>
                  {avatarMutation.isPending && (
                    <p className="mt-1 text-xs text-muted-foreground">Uploading…</p>
                  )}
                </div>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="pf-name">Full Name</Label>
                <Input id="pf-name" value={name} onChange={(e) => setName(e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="pf-phone">Phone</Label>
                <Input id="pf-phone" value={phone} onChange={(e) => setPhone(e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="pf-email">Email</Label>
                <Input id="pf-email" value={me.email} disabled />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="pf-address">Default Address</Label>
                <Input
                  id="pf-address"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Home address used for bookings"
                />
              </div>
              <Button type="submit" disabled={personalMutation.isPending}>
                {personalMutation.isPending ? 'Saving…' : 'Save Changes'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Change Password</CardTitle>
          <CardDescription>Use at least 8 characters.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={changePassword} className="max-w-md space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="pw-current">Current Password</Label>
              <Input
                id="pw-current"
                type="password"
                autoComplete="current-password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="pw-new">New Password</Label>
              <Input
                id="pw-new"
                type="password"
                minLength={8}
                autoComplete="new-password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
              />
            </div>
            <Button type="submit" disabled={passwordMutation.isPending}>
              {passwordMutation.isPending ? 'Updating…' : 'Change Password'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </>
  );
}