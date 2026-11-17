import { Badge } from '@/components/ui/badge';
import { capitalize } from '@/lib/format';

const VARIANT_MAP: Record<string, 'confirmed' | 'pending' | 'broadcast' | 'in_progress' | 'completed' | 'cancelled' | 'expired' | 'active' | 'inactive' | 'suspended' | 'paid' | 'unpaid' | 'verified' | 'unverified'> = {
  confirmed: 'confirmed',
  pending: 'pending',
  broadcast: 'broadcast',
  in_progress: 'in_progress',
  completed: 'completed',
  cancelled: 'cancelled',
  expired: 'expired',
  active: 'active',
  inactive: 'inactive',
  suspended: 'suspended',
  paid: 'paid',
  unpaid: 'unpaid',
  verified: 'verified',
};

const LABEL_OVERRIDES: Record<string, string> = {
  in_progress: 'In Progress',
  pending_v: 'Pending',
};

export function StatusBadge({ status }: { status: string }) {
  const label = LABEL_OVERRIDES[status] ?? capitalize(status);
  const variant = VARIANT_MAP[status] ?? 'secondary';
  return (
    <Badge variant={variant} className="status-label">
      {label}
    </Badge>
  );
}