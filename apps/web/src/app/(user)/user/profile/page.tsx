'use client';

import { useEffect, useState, type FormEvent } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import type { AuthUser, FamilyContact } from '@sevyo/shared-types';
import { api, apiUpload } from '@/lib/api-client';
import { useMe } from '@/lib/use-me';
import { assetUrl, fmtDate } from '@/lib/format';
import { AvatarOrInitial } from '@/components/avatar-or-initial';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { PageHeader } from '@/components/page-header';
import { DataError, EmptyState, LoadingCenter } from '@/components/states';
import { Phone, Trash2, Upload, UserPlus } from 'lucide-react';

export default function UserProfilePage() {
  const queryClient = useQueryClient();
  const meQuery = useMe();

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');

  const [contactName, setContactName] = useState('');
  const [contactPhone, setContactPhone] = useState('');

  const me = meQuery.data;

  useEffect(() => {
    if (me) {
      setName(me.name);
      setPhone(me.phone ?? '');
      setAddress(me.defaultAddress ?? '');
    }
  }, [me]);

  const saveMutation = useMutation({
    mutationFn: () => api.patch('/users/me', { name, phone, defaultAddress: address }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['me'] });
      toast.success('Profile saved');
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const avatarMutation = useMutation({
    mutationFn: async (file: File) => {
      const { url } = await apiUpload<{ url: string }>('/uploads/avatar', file);
      return api.patch('/users/me', { avatarUrl: url });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['me'] });
      setAvatarPreview(null);
      toast.success('Avatar updated');
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const passwordMutation = useMutation({
    mutationFn: () => api.post<{ user: AuthUser }>('/users/me/password', { currentPassword, newPassword }),
    onSuccess: () => {
      setCurrentPassword('');
      setNewPassword('');
      toast.success('Password changed — you have been signed back in');
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const contactsQuery = useQuery({
    queryKey: ['family-contacts'],
    queryFn: () => api.get<FamilyContact[]>('/family-contacts'),
  });

  const addContactMutation = useMutation({
    mutationFn: (payload: { name: string; phone: string }) => api.post<FamilyContact>('/family-contacts', payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['family-contacts'] });
      setContactName('');
      setContactPhone('');
      toast.success('Contact added');
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const deleteContactMutation = useMutation({
    mutationFn: (contactId: string) => api.delete(`/family-contacts/${contactId}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['family-contacts'] });
      toast.success('Contact removed');
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const saveProfile = (e: FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error('Name cannot be empty');
      return;
    }
    saveMutation.mutate();
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

  const addContact = (e: FormEvent) => {
    e.preventDefault();
    if (!contactName.trim() || !contactPhone.trim()) {
      toast.error('Name and phone are required');
      return;
    }
    addContactMutation.mutate({ name: contactName.trim(), phone: contactPhone.trim() });
  };

  if (meQuery.isPending) return <LoadingCenter />;
  if (meQuery.isError || !me) {
    return (
      <DataError
        message={meQuery.error?.message ?? 'Could not load your profile'}
        onRetry={() => meQuery.refetch()}
      />
    );
  }

  const avatarSrc = avatarPreview ?? assetUrl(me.avatarUrl);

  return (
    <>
      <PageHeader title="My Profile" subtitle="Your account information" />

      <div className="grid items-start gap-6 lg:grid-cols-2">
        {/* Profile form */}
        <Card>
          <CardHeader>
            <CardTitle>Profile</CardTitle>
            <CardDescription>
              {me.email} · {me.role} · joined {fmtDate(me.createdAt)}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={saveProfile} className="space-y-4">
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
                <Label htmlFor="pf-address">Default Address</Label>
                <Input
                  id="pf-address"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Home address used for bookings"
                />
              </div>
              <Button type="submit" disabled={saveMutation.isPending}>
                {saveMutation.isPending ? 'Saving…' : 'Save Changes'}
              </Button>
            </form>
          </CardContent>
        </Card>

        <div className="space-y-6">
          {/* Change password */}
          <Card>
            <CardHeader>
              <CardTitle>Change Password</CardTitle>
              <CardDescription>Use at least 8 characters.</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={changePassword} className="space-y-4">
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

          {/* Family contacts (SOS) */}
          <Card>
            <CardHeader>
              <CardTitle>Family Contacts (SOS)</CardTitle>
              <CardDescription>
                These contacts are alerted via the SOS button in emergencies.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {contactsQuery.isPending ? (
                <LoadingCenter />
              ) : contactsQuery.isError ? (
                <DataError
                  message={contactsQuery.error.message}
                  onRetry={() => contactsQuery.refetch()}
                />
              ) : contactsQuery.data && contactsQuery.data.length > 0 ? (
                <div className="space-y-2">
                  {contactsQuery.data.map((c) => (
                    <div
                      key={c.id}
                      className="flex items-center gap-3 rounded-lg border border-border px-3 py-2.5"
                    >
                      <Phone className="h-4 w-4 shrink-0 text-muted-foreground" />
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-semibold">{c.name}</p>
                        <p className="truncate text-xs text-muted-foreground">{c.phone}</p>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon-sm"
                        className="text-destructive hover:bg-rose-50"
                        disabled={deleteContactMutation.isPending}
                        onClick={() => deleteContactMutation.mutate(String(c.id))}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              ) : (
                <EmptyState message="No family contacts yet" hint="Add one so SOS can reach them." />
              )}

              <form onSubmit={addContact} className="grid grid-cols-2 gap-2 border-t border-border pt-4">
                <div className="space-y-1.5">
                  <Label htmlFor="fc-name">Name</Label>
                  <Input
                    id="fc-name"
                    placeholder="Spouse, sibling…"
                    value={contactName}
                    onChange={(e) => setContactName(e.target.value)}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="fc-phone">Phone</Label>
                  <Input
                    id="fc-phone"
                    placeholder="+91 …"
                    value={contactPhone}
                    onChange={(e) => setContactPhone(e.target.value)}
                  />
                </div>
                <Button type="submit" size="sm" className="col-span-2" disabled={addContactMutation.isPending}>
                  <UserPlus className="h-4 w-4" />
                  {addContactMutation.isPending ? 'Adding…' : 'Add Contact'}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}