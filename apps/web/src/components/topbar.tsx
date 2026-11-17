'use client';

import { useRouter } from 'next/navigation';
import { Bell, LogOut, UserRound } from 'lucide-react';
import { api, ApiClientError } from '@/lib/api-client';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { assetUrl, initials } from '@/lib/format';
import { toast } from 'sonner';

interface TopbarProps {
  userName: string;
  avatarUrl?: string | null;
  profileHref?: string;
  notifications?: { title: string; detail: string }[];
}

export function Topbar({ userName, avatarUrl, profileHref = '/profile', notifications = [] }: TopbarProps) {
  const router = useRouter();

  async function handleLogout() {
    try {
      await api.post('/auth/logout');
    } catch (err) {
      if (!(err instanceof ApiClientError && err.status === 0)) {
        toast.error('Could not sign out cleanly');
      }
    }
    router.push('/auth');
    router.refresh();
  }

  return (
    <div className="mb-4 flex items-center justify-end gap-2 pt-12 lg:pt-0">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="relative" aria-label="Notifications">
            <Bell className="h-4 w-4" />
            {notifications.length > 0 && (
              <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-accent px-1 text-[0.625rem] font-bold text-accent-foreground">
                {notifications.length}
              </span>
            )}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-80">
          <DropdownMenuLabel>Notifications</DropdownMenuLabel>
          <DropdownMenuSeparator />
          {notifications.length === 0 && (
            <p className="px-2 py-3 text-center text-sm text-muted-foreground">You&apos;re all caught up.</p>
          )}
          {notifications.map((n, i) => (
            <div key={i} className="flex items-start gap-3 px-2 py-2.5">
              <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <Bell className="h-4 w-4" />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-semibold">{n.title}</p>
                <p className="truncate text-xs text-muted-foreground">{n.detail}</p>
              </div>
            </div>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button className="flex items-center gap-2 rounded-lg p-1.5 transition-colors hover:bg-muted" aria-label="Account menu">
            <Avatar className="h-8 w-8">
              {avatarUrl && <AvatarImage src={assetUrl(avatarUrl) ?? undefined} alt={userName} />}
              <AvatarFallback>{initials(userName)}</AvatarFallback>
            </Avatar>
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48">
          <DropdownMenuLabel className="truncate">{userName}</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => router.push(profileHref)}>
            <UserRound /> Profile
          </DropdownMenuItem>
          <DropdownMenuItem onClick={handleLogout} className="text-destructive focus:text-destructive">
            <LogOut /> Sign out
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}