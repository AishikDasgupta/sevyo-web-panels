'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import {
  LayoutDashboard,
  Building2,
  Users,
  CalendarDays,
  Star,
  Wallet,
  Clock,
  FileText,
  User,
  Home,
  Search,
  Menu,
  X,
} from 'lucide-react';
import type { UserRole } from '@sevyo/shared-types';
import { cn } from '@/lib/utils';
import { LogoLink } from './logo';

const ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  dashboard: LayoutDashboard,
  vendors: Building2,
  caregivers: Users,
  bookings: CalendarDays,
  users: Users,
  reviews: Star,
  finance: Wallet,
  schedule: Clock,
  visitLog: FileText,
  profile: User,
  home: Home,
  browse: Search,
};

const SIDEBARS: Record<UserRole, { title: string; items: { label: string; path: string; icon: string }[] }> = {
  admin: {
    title: 'Admin Panel',
    items: [
      { label: 'Dashboard', path: '/admin/dashboard', icon: 'dashboard' },
      { label: 'Vendors', path: '/admin/vendors', icon: 'vendors' },
      { label: 'Caregivers', path: '/admin/caregivers', icon: 'caregivers' },
      { label: 'Bookings', path: '/admin/bookings', icon: 'bookings' },
      { label: 'Users', path: '/admin/users', icon: 'users' },
      { label: 'Reviews', path: '/admin/reviews', icon: 'reviews' },
    ],
  },
  vendor: {
    title: 'Vendor Panel',
    items: [
      { label: 'Dashboard', path: '/vendor/dashboard', icon: 'dashboard' },
      { label: 'Caregivers', path: '/vendor/caregivers', icon: 'caregivers' },
      { label: 'Bookings', path: '/vendor/bookings', icon: 'bookings' },
      { label: 'Finance', path: '/vendor/finance', icon: 'finance' },
    ],
  },
  resource: {
    title: 'Caregiver Panel',
    items: [
      { label: 'Dashboard', path: '/resource/dashboard', icon: 'dashboard' },
      { label: 'Schedule', path: '/resource/schedule', icon: 'schedule' },
      { label: 'Visit Log', path: '/resource/visit-log', icon: 'visitLog' },
      { label: 'Profile', path: '/resource/profile', icon: 'profile' },
    ],
  },
  user: {
    title: 'Patient Portal',
    items: [
      { label: 'Home', path: '/user/home', icon: 'home' },
      { label: 'Browse Care', path: '/user/browse', icon: 'browse' },
      { label: 'My Bookings', path: '/user/bookings', icon: 'bookings' },
      { label: 'Profile', path: '/user/profile', icon: 'profile' },
    ],
  },
};

export function Sidebar({ role, userName }: { role: UserRole; userName: string }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const cfg = SIDEBARS[role];

  return (
    <>
      <button
        className="fixed left-3 top-3 z-50 flex h-10 w-10 items-center justify-center rounded-lg bg-sidebar text-sidebar-foreground shadow lg:hidden"
        onClick={() => setOpen(!open)}
        aria-label="Toggle menu"
      >
        {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </button>

      {open && (
        <div className="fixed inset-0 z-40 bg-black/50 lg:hidden" onClick={() => setOpen(false)} aria-hidden />
      )}

      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-40 flex w-64 flex-col bg-sidebar text-sidebar-foreground transition-transform duration-300 lg:translate-x-0',
          open ? 'translate-x-0' : '-translate-x-full',
        )}
      >
        <div className="border-b border-sidebar-border p-5">
          <LogoLink imgClassName="h-16 w-auto invert brightness-0" />
          <p className="mt-1 text-[0.625rem] font-semibold uppercase tracking-[0.15em] text-sidebar-foreground/60">
            {cfg.title}
          </p>
        </div>

        <nav className="flex-1 space-y-0.5 overflow-y-auto p-3">
          {cfg.items.map((item) => {
            const Icon = ICONS[item.icon] ?? LayoutDashboard;
            const active = pathname === item.path || pathname.startsWith(`${item.path}/`);
            return (
              <Link
                key={item.path}
                href={item.path}
                onClick={() => setOpen(false)}
                className={cn(
                  'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-sidebar-foreground/70 transition-all hover:bg-sidebar-accent hover:text-sidebar-foreground',
                  active && 'bg-sidebar-primary text-sidebar-primary-foreground shadow-sm hover:bg-sidebar-primary',
                )}
              >
                <Icon className="h-4 w-4 shrink-0" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="border-t border-sidebar-border p-4">
          <p className="truncate text-xs font-semibold text-sidebar-foreground">{userName}</p>
          <p className="text-[0.6875rem] capitalize text-sidebar-foreground/50">{role} · Sevyo</p>
        </div>
      </aside>
    </>
  );
}