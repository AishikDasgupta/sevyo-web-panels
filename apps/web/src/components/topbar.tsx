'use client';

import { useRouter } from 'next/navigation';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
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
import { assetUrl, initials, timeAgo } from '@/lib/format';
import { toast } from 'sonner';
import type { NotificationsResponse } from '@sevyo/shared-types';
import { cn } from '@/lib/utils';

interface TopbarProps {
  userName: string;
  avatarUrl?: string | null;
  profileHref?: string;
}

export function Topbar({ userName, avatarUrl, profileHref = '/profile' }: TopbarProps) {
  const router = useRouter();
  const queryClient = useQueryClient();

  const notificationsQuery = useQuery({
    queryKey: ['notifications'],
    queryFn: () => api.get<NotificationsResponse>('/notifications'),
    refetchInterval: 30_000,
    retry: false,
  });

  const markReadMutation = useMutation({
    mutationFn: (id: string) => api.post(`/notifications/${id}/read`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['notifications'] }),
  });

  const markAllReadMutation = useMutation({
    mutationFn: () => api.post('/notifications/read-all'),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['notifications'] }),
  });

  const unread = notificationsQuery.data?.unreadCount ?? 0;
  const notifications = notificationsQuery.data?.notifications ?? [];

  const openNotification = (n: (typeof notifications)[number]) => {
    if (!n.read) markReadMutation.mutate(n.id);
    if (n.link) router.push(n.link);
  };

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
            {unread > 0 && (
              <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-accent px-1 text-[0.625rem] font-bold text-accent-foreground">
                {unread > 99 ? '99+' : unread}
              </span>
            )}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-80">
          <div className="flex items-center justify-between pr-1">
            <DropdownMenuLabel>Notifications</DropdownMenuLabel>
            {unread > 0 && (
              <button
                className="text-xs font-semibold text-primary hover:underline disabled:opacity-50"
                onClick={() => markAllReadMutation.mutate()}
                disabled={markAllReadMutation.isPending}
              >
                Mark all read
              </button>
            )}
          </div>
          <DropdownMenuSeparator />
          {notificationsQuery.isPending ? (
            <p className="px-2 py-3 text-center text-xs text-muted-foreground">Loading…</p>
          ) : notificationsQuery.isError ? (
            <p className="px-2 py-3 text-center text-xs text-destructive">Could not load notifications</p>
          ) : notifications.length === 0 ? (
            <p className="px-2 py-3 text-center text-sm text-muted-foreground">You&apos;re all caught up.</p>
          ) : (
            <div className="max-h-96 overflow-y-auto">
              {notifications.map((n) => (
                <button
                  key={n.id}
                  onClick={() => openNotification(n)}
                  className={cn(
                    'flex w-full items-start gap-3 px-2 py-2.5 text-left transition-colors hover:bg-muted',
                    !n.read && 'bg-primary/5',
                  )}
                >
                  <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <Bell className="h-4 w-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className={cn('text-xs', n.read ? 'font-medium text-foreground' : 'font-semibold')}>{n.title}</p>
                    {n.body && <p className="truncate text-xs text-muted-foreground">{n.body}</p>}
                    <p className="mt-0.5 text-[0.625rem] uppercase tracking-wide text-slate-400">{timeAgo(n.createdAt)}</p>
                  </div>
                  {!n.read && <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-primary" aria-label="Unread" />}
                </button>
              ))}
            </div>
          )}
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
