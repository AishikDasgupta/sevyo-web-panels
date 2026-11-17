import { requirePortal } from '@/lib/auth';
import { PortalShell } from '@/components/portal-shell';

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const user = await requirePortal('admin');
  return <PortalShell user={user}>{children}</PortalShell>;
}