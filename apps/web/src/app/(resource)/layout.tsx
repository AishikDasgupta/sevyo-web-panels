import { requirePortal } from '@/lib/auth';
import { PortalShell } from '@/components/portal-shell';

export default async function ResourceLayout({ children }: { children: React.ReactNode }) {
  const user = await requirePortal('resource');
  return <PortalShell user={user}>{children}</PortalShell>;
}