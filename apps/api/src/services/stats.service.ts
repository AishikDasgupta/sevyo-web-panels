import { prisma } from '../lib/prisma';
import type { AdminStats } from '@sevyo/shared-types';

const ACTIVE_STATUSES = ['pending', 'broadcast', 'confirmed', 'in_progress'] as const;

const TYPE_COLORS: Record<string, string> = {
  nurse: '#2563eb',
  caregiver: '#0ea5e9',
  physiotherapist: '#8b5cf6',
  lab: '#f59e0b',
  mental_health: '#ec4899',
  elder_care: '#10b981',
  pediatric: '#f43f5e',
};

export async function adminStats(): Promise<AdminStats> {
  const now = new Date();
  const monthStart = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1));
  const sixMonthsAgo = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - 5, 1));

  const [
    revenueAgg,
    monthlyAgg,
    totalBookings,
    activeBookings,
    totalUsers,
    totalCaregivers,
    totalVendors,
    ratingAgg,
    completedByMonth,
    byType,
  ] = await Promise.all([
    prisma.booking.aggregate({
      where: { status: 'completed' },
      _sum: { price: true },
    }),
    prisma.booking.aggregate({
      where: { status: 'completed', updatedAt: { gte: monthStart } },
      _sum: { price: true },
    }),
    prisma.booking.count(),
    prisma.booking.count({ where: { status: { in: [...ACTIVE_STATUSES] } } }),
    prisma.user.count({ where: { role: 'user' } }),
    prisma.caregiver.count(),
    prisma.vendor.count(),
    prisma.review.aggregate({ _avg: { rating: true }, _count: { rating: true } }),
    prisma.booking.findMany({
      where: { status: 'completed', updatedAt: { gte: sixMonthsAgo } },
      select: { price: true, updatedAt: true },
    }),
    prisma.caregiver.groupBy({
      by: ['type'],
      _count: { type: true },
    }),
  ]);

  // Last 6 months of revenue
  const monthKeys: string[] = [];
  const monthMap = new Map<string, number>();
  for (let i = 5; i >= 0; i--) {
    const d = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - i, 1));
    const key = d.toISOString().slice(0, 7); // YYYY-MM
    monthKeys.push(key);
    monthMap.set(key, 0);
  }
  for (const booking of completedByMonth) {
    const key = booking.updatedAt.toISOString().slice(0, 7);
    if (monthMap.has(key)) {
      monthMap.set(key, (monthMap.get(key) ?? 0) + Number(booking.price ?? 0));
    }
  }

  const totalReviews = ratingAgg._count.rating;

  return {
    totalRevenue: Number(revenueAgg._sum.price ?? 0),
    monthlyRevenue: Number(monthlyAgg._sum.price ?? 0),
    totalBookings,
    activeBookings,
    totalUsers,
    totalCaregivers,
    totalVendors,
    satisfactionRate:
      totalReviews > 0 ? Math.round((ratingAgg._avg.rating ?? 0) * 20) : 0,
    revenueByMonth: monthKeys.map((key) => ({
      month: key,
      revenue: Math.round(monthMap.get(key) ?? 0),
    })),
    bookingsByType: byType.map((row) => ({
      name: row.type,
      value: row._count.type,
      color: TYPE_COLORS[row.type] ?? '#64748b',
    })),
  };
}