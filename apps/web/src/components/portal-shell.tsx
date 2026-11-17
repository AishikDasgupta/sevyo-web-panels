'use client';

import { useState } from 'react';
import type { AuthUser } from '@sevyo/shared-types';
import { Sidebar } from './sidebar';
import { Topbar } from './topbar';
import { SosButton, SosDialog } from './sos-dialog';
import { SupportWidgets } from './support-widgets';

export function PortalShell({ user, children }: { user: AuthUser; children: React.ReactNode }) {
  const [sosOpen, setSosOpen] = useState(false);
  const isUser = user.role === 'user';

  return (
    <div className="min-h-screen bg-background">
      <Sidebar role={user.role} userName={user.name} />
      <main className="min-h-screen lg:ml-64">
        <div className="p-4 pb-8 lg:p-8">
          <Topbar
            userName={user.name}
            avatarUrl={null}
            profileHref={
              user.role === 'user'
                ? '/user/profile'
                : user.role === 'resource'
                  ? '/resource/profile'
                  : user.role === 'vendor'
                    ? '/vendor/dashboard'
                    : '/admin/dashboard'
            }
          />
          {children}
        </div>
      </main>

      {isUser && <SosButton onClick={() => setSosOpen(true)} />}
      {isUser && <SosDialog open={sosOpen} onOpenChange={setSosOpen} />}
      {isUser && <SupportWidgets />}
    </div>
  );
}