'use client';

import Link from 'next/link';
import { Phone, Siren } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { EMERGENCY_NUMBERS } from '@/lib/constants';

/**
 * Public SOS pop-up — works without an account.
 * Lists Indian emergency numbers; family contacts require sign-in (they are
 * stored securely with the user's account).
 */
export function PublicSosDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (v: boolean) => void }) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-accent">
            <Siren className="h-5 w-5" />
            SOS — Emergency Numbers
          </DialogTitle>
          <DialogDescription>Tap any number to call right away. Stay calm, help is on the way.</DialogDescription>
        </DialogHeader>

        <ul className="divide-y divide-border overflow-hidden rounded-xl border border-border">
          {EMERGENCY_NUMBERS.map((entry) => (
            <li key={entry.number} className="flex items-center justify-between gap-3 bg-card px-4 py-2.5">
              <span className="text-xs leading-snug text-muted-foreground">{entry.label}</span>
              <a
                href={`tel:${entry.number}`}
                className="inline-flex shrink-0 items-center gap-1.5 rounded-md bg-accent px-3 py-1.5 text-sm font-bold text-accent-foreground transition-opacity hover:opacity-90"
              >
                <Phone className="h-3.5 w-3.5" />
                {entry.number}
              </a>
            </li>
          ))}
        </ul>

        <div className="rounded-xl border border-primary/20 bg-primary/5 px-4 py-3 text-center">
          <p className="text-xs font-medium text-slate-600">
            Have family contacts saved in your account?{' '}
            <Link href="/auth" className="font-semibold text-primary underline underline-offset-2" onClick={() => onOpenChange(false)}>
              Sign in
            </Link>{' '}
            to call them in one tap.
          </p>
        </div>

        <Button className="w-full" onClick={() => onOpenChange(false)}>
          Close
        </Button>
      </DialogContent>
    </Dialog>
  );
}
