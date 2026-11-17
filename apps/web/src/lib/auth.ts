import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import type { UserProfile, UserRole } from '@sevyo/shared-types';
import { API_BASE_URL } from '@/lib/api-client';

export const PORTAL_HOMES: Record<UserRole, string> = {
  user: '/user/home',
  vendor: '/vendor/dashboard',
  resource: '/resource/dashboard',
  admin: '/admin/dashboard',
};

async function fetchMe(accessToken: string): Promise<UserProfile | null> {
  try {
    const res = await fetch(`${API_BASE_URL}/api/users/me`, {
      headers: { cookie: `access_token=${accessToken}` },
      cache: 'no-store',
    });
    if (!res.ok) return null;
    return (await res.json()) as UserProfile;
  } catch {
    return null;
  }
}

export async function requirePortal(role: UserRole): Promise<UserProfile> {
  const token = cookies().get('access_token')?.value;
  if (!token) redirect('/auth');
  const user = await fetchMe(token);
  if (!user) redirect('/auth');
  if (user.role !== role) redirect(PORTAL_HOMES[user.role]);
  return user;
}

export async function redirectIfAuthenticated(): Promise<void> {
  const token = cookies().get('access_token')?.value;
  if (!token) return;
  const user = await fetchMe(token);
  if (user) redirect(PORTAL_HOMES[user.role]);
}