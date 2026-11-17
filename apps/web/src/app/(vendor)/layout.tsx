import { requirePortal } from '@/lib/auth';
import { PortalShell } from '@/components/portal-shell';

export default async function VendorLayout({ children }: { children: React.ReactNode }) {
  const user = await requirePortal('vendor');
  return <PortalShell user={user}>{children}</PortalShell>;
}