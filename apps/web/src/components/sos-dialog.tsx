'use client';

import { useCallback, useEffect, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Phone, Plus, X, Siren } from 'lucide-react';
import { api } from '@/lib/api-client';
import type { FamilyContact } from '@sevyo/shared-types';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { initials } from '@/lib/format';
import { cn } from '@/lib/utils';

/**
 * SOS dialog — replaces the legacy localStorage modal.
 * Contacts are now real rows in the `family_contacts` table (API-backed).
 */
export function SosDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (v: boolean) => void }) {
  const queryClient = useQueryClient();
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');

  const { data: contacts = [] } = useQuery({
    queryKey: ['family-contacts'],
    queryFn: () => api.get<FamilyContact[]>('/family-contacts'),
    enabled: open,
  });

  const addMutation = useMutation({
    mutationFn: (body: { name: string; phone: string }) => api.post<FamilyContact>('/family-contacts', body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['family-contacts'] });
      setName('');
      setPhone('');
      toast.success('Family contact added');
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/family-contacts/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['family-contacts'] });
      toast.success('Contact removed');
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const handleAdd = useCallback(() => {
    if (!name.trim() || !phone.trim()) {
      toast.error('Enter a name and phone number');
      return;
    }
    addMutation.mutate({ name: name.trim(), phone: phone.trim() });
  }, [name, phone, addMutation]);

  useEffect(() => {
    if (!open) {
      setName('');
      setPhone('');
    }
  }, [open]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Siren className="h-5 w-5 text-accent" />
            SOS — Call a Family Member
          </DialogTitle>
          <DialogDescription>
            Select a family member to call for help right away. Your contacts are stored securely with your account.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3">
          {contacts.length === 0 && (
            <p className="rounded-lg border border-dashed border-border p-4 text-center text-sm text-muted-foreground">
              No family contacts yet — add one below.
            </p>
          )}
          {contacts.map((c) => (
            <div key={c.id} className="flex items-center gap-3 rounded-xl border border-border p-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-rose-50 font-bold text-rose-600">
                {initials(c.name)}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold">{c.name}</p>
                <p className="truncate text-xs text-muted-foreground">{c.phone}</p>
              </div>
              <a
                href={`tel:${c.phone.replace(/\s+/g, '')}`}
                className="inline-flex h-8 items-center gap-1 rounded-md bg-accent px-3 text-xs font-semibold text-accent-foreground transition-opacity hover:opacity-90"
                onClick={() => onOpenChange(false)}
              >
                <Phone className="h-3.5 w-3.5" /> Call
              </a>
              <button
                className="rounded p-1 text-muted-foreground transition-colors hover:text-destructive"
                onClick={() => deleteMutation.mutate(c.id)}
                aria-label={`Remove ${c.name}`}
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>

        <div className="flex gap-2">
          <Input
            placeholder="Name (e.g. Uncle)"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="flex-1"
          />
          <Input
            placeholder="+91 00000 00000"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="flex-[1.5]"
          />
          <Button variant="outline" size="icon" onClick={handleAdd} disabled={addMutation.isPending} aria-label="Add contact">
            <Plus className="h-4 w-4" />
          </Button>
        </div>

        <Button className={cn('w-full')} onClick={() => onOpenChange(false)}>
          Close
        </Button>
      </DialogContent>
    </Dialog>
  );
}

/** Floating SOS button (fixed bottom-left). */
export function SosButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      aria-label="SOS"
      className="fixed bottom-5 left-5 z-40 flex h-16 w-16 animate-sos-pulse items-center justify-center rounded-full bg-gradient-to-br from-rose-600 to-rose-700 text-sm font-extrabold tracking-widest text-white shadow-lg transition-transform hover:scale-105"
    >
      SOS
    </button>
  );
}