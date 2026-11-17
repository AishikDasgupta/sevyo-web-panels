'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { cn } from '@/lib/utils';
import { capitalize } from '@/lib/format';

const STATUSES = ['all', 'pending', 'broadcast', 'confirmed', 'in_progress', 'completed', 'cancelled', 'expired'];

export function BookingStatusFilter() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const current = searchParams.get('status') ?? 'all';

  const setStatus = (status: string) => {
    const params = new URLSearchParams(searchParams);
    if (status === 'all') params.delete('status');
    else params.set('status', status);
    router.replace(`?${params.toString()}`);
  };

  return (
    <div className="mb-4 flex flex-wrap gap-2">
      {STATUSES.map((s) => (
        <button
          key={s}
          onClick={() => setStatus(s)}
          className={cn(
            'rounded-full border border-border bg-card px-3.5 py-1.5 text-xs font-semibold text-muted-foreground transition-all hover:bg-muted',
            current === s && 'border-primary bg-primary text-primary-foreground hover:bg-primary',
          )}
        >
          {s === 'all' ? 'All' : capitalize(s)}
        </button>
      ))}
    </div>
  );
}