'use client';

import { useQuery } from '@tanstack/react-query';
import type { UserProfile } from '@sevyo/shared-types';
import { api } from '@/lib/api-client';

export function useMe() {
  return useQuery({
    queryKey: ['me'],
    queryFn: () => api.get<UserProfile>('/users/me'),
  });
}