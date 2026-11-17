import { requirePortal } from '@/lib/auth';
import { PortalShell } from '@/components/portal-shell';

export default async function UserLayout({ children }: { children: React.ReactNode }) {
  const user = await requirePortal('user');
  return <PortalShell user={user}>{children}</PortalShell>;
}