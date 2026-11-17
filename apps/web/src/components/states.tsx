import { Inbox } from 'lucide-react';
import { cn } from '@/lib/utils';

export function EmptyState({ message = 'Nothing here yet', hint }: { message?: string; hint?: string }) {
  return (
    <div className="rounded-xl border-2 border-dashed border-border p-12 text-center">
      <Inbox className="mx-auto mb-4 h-12 w-12 text-slate-300" />
      <p className="text-sm font-semibold text-foreground">{message}</p>
      {hint && <p className="mt-1 text-sm text-muted-foreground">{hint}</p>}
    </div>
  );
}

export function LoadingCenter({ className }: { className?: string }) {
  return (
    <div className={cn('flex justify-center py-24', className)}>
      <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary/30 border-t-primary" />
    </div>
  );
}

export function DataError({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return (
    <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-6 text-center">
      <p className="text-sm font-semibold text-destructive">{message}</p>
      {onRetry && (
        <button onClick={onRetry} className="mt-3 text-xs font-semibold text-primary underline underline-offset-2">
          Try again
        </button>
      )}
    </div>
  );
}