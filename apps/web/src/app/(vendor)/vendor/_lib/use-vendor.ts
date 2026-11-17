'use client';

import { useQuery } from '@tanstack/react-query';
import type { Vendor } from '@sevyo/shared-types';
import { api, ApiClientError } from '@/lib/api-client';

export function useVendor() {
  return useQuery({
    queryKey: ['vendor', 'me'],
    queryFn: () => api.get<Vendor>('/vendors/me'),
    retry: false,
  });
}

export function isVendorMissing(err: unknown): boolean {
  return err instanceof ApiClientError && err.status === 404;
}