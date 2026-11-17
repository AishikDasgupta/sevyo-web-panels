import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { DataError } from '@/components/states';

export function VendorUnavailable({ onRetry }: { onRetry: () => void }) {
  return (
    <div className="space-y-3">
      <DataError message="Vendor profile not found — complete onboarding" onRetry={onRetry} />
      <div className="flex justify-center">
        <Button asChild size="sm">
          <Link href="/vendor/dashboard">Complete onboarding</Link>
        </Button>
      </div>
    </div>
  );
}