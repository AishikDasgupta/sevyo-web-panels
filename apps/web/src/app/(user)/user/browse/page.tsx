'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import type { Caregiver, CaregiverType } from '@sevyo/shared-types';
import { api } from '@/lib/api-client';
import { CAREGIVER_TYPE_LABELS, caregiverTypeLabel } from '@/lib/constants';
import { fmtINR } from '@/lib/format';
import { AvatarOrInitial } from '@/components/avatar-or-initial';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Stars } from '@/components/stars';
import { PageHeader } from '@/components/page-header';
import { DataError, EmptyState, LoadingCenter } from '@/components/states';

const TYPE_OPTIONS = Object.entries(CAREGIVER_TYPE_LABELS) as Array<[CaregiverType, string]>;

export default function UserBrowsePage() {
  const [q, setQ] = useState('');
  const [debouncedQ, setDebouncedQ] = useState('');
  const [type, setType] = useState<CaregiverType | 'all'>('all');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [availableOnly, setAvailableOnly] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setDebouncedQ(q.trim()), 400);
    return () => clearTimeout(t);
  }, [q]);

  const filters = useMemo(() => {
    const params = new URLSearchParams();
    if (debouncedQ) params.set('q', debouncedQ);
    if (type !== 'all') params.set('type', type);
    if (minPrice) params.set('minPrice', minPrice);
    if (maxPrice) params.set('maxPrice', maxPrice);
    if (availableOnly) params.set('available', 'true');
    return params.toString();
  }, [debouncedQ, type, minPrice, maxPrice, availableOnly]);

  const caregiversQuery = useQuery({
    queryKey: ['caregivers', filters],
    queryFn: () => api.get<Caregiver[]>(`/caregivers${filters ? `?${filters}` : ''}`),
  });

  return (
    <>
      <PageHeader title="Browse Care" subtitle="Find nurses and caregivers near you" />

      {/* Filters */}
      <div className="mb-6 grid gap-4 rounded-xl border border-border bg-card p-4 sm:grid-cols-2 xl:grid-cols-4">
        <div className="sm:col-span-2 xl:col-span-2">
          <Label htmlFor="search-q">Search</Label>
          <Input
            id="search-q"
            placeholder="🔍 Search by name, specialization, or type…"
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
        </div>
        <div>
          <Label>Caregiver type</Label>
          <Select value={type} onValueChange={(v) => setType(v === 'all' ? 'all' : (v as CaregiverType))}>
            <SelectTrigger>
              <SelectValue placeholder="All types" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All types</SelectItem>
              {TYPE_OPTIONS.map(([value, label]) => (
                <SelectItem key={value} value={value}>
                  {label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label>Price / hour (₹)</Label>
          <div className="grid grid-cols-2 gap-2">
            <Input
              type="number"
              min={0}
              placeholder="Min"
              value={minPrice}
              onChange={(e) => setMinPrice(e.target.value)}
            />
            <Input
              type="number"
              min={0}
              placeholder="Max"
              value={maxPrice}
              onChange={(e) => setMaxPrice(e.target.value)}
            />
          </div>
        </div>
        <div className="flex items-end">
          <label className="flex cursor-pointer items-center gap-2 pb-2 text-sm font-medium">
            <Switch checked={availableOnly} onCheckedChange={setAvailableOnly} />
            Available only
          </label>
        </div>
      </div>

      {/* Results */}
      {caregiversQuery.isPending ? (
        <LoadingCenter />
      ) : caregiversQuery.isError ? (
        <DataError message={caregiversQuery.error.message} onRetry={() => caregiversQuery.refetch()} />
      ) : !caregiversQuery.data?.length ? (
        <EmptyState message="No caregivers found" hint="Try adjusting your filters or search term." />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {caregiversQuery.data.map((cg) => (
            <Card key={cg.id} className="flex flex-col p-5">
              <div className="mb-3 flex items-center gap-3">
                <AvatarOrInitial name={cg.name} avatarUrl={cg.avatarUrl} className="h-12 w-12" />
                <div className="min-w-0 flex-1">
                  <p className="truncate font-semibold">{cg.name}</p>
                  <p className="text-xs capitalize text-muted-foreground">{caregiverTypeLabel(cg.type)}</p>
                </div>
                {cg.verified && <Badge variant="verified">✔ Verified</Badge>}
              </div>

              <div className="mb-2 flex items-center gap-2">
                <Stars rating={cg.rating} />
                <span className="text-xs text-muted-foreground">
                  {cg.rating} ({cg.reviewsCount})
                </span>
              </div>

              <p className="mb-3 line-clamp-2 flex-1 text-xs text-muted-foreground">
                {cg.specializations?.length ? cg.specializations.join(' · ') : cg.bio}
              </p>

              <div className="mb-3 flex items-center justify-between">
                <span className="text-sm font-bold">{fmtINR(cg.pricePerHour)}/hr</span>
                <Badge variant={cg.available ? 'active' : 'inactive'}>
                  {cg.available ? 'Available' : 'Busy'}
                </Badge>
              </div>

              {cg.vendorName && (
                <p className="mb-3 text-xs text-muted-foreground">🏥 {cg.vendorName}</p>
              )}

              <div className="flex gap-2">
                <Button asChild variant="outline" size="sm" className="flex-1">
                  <Link href={`/user/caregivers/${cg.id}`}>View Profile</Link>
                </Button>
                {cg.available ? (
                  <Button asChild size="sm" className="flex-1">
                    <Link href={`/user/booking/${cg.id}`}>Book</Link>
                  </Button>
                ) : (
                  <Button size="sm" className="flex-1" disabled>
                    Book
                  </Button>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}
    </>
  );
}