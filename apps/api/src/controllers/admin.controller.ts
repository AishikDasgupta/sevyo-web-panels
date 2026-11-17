import type { Request, Response } from 'express';
import * as vendorService from '../services/vendor.service';
import { adminStats } from '../services/stats.service';
import { prisma } from '../lib/prisma';
import { serializeUser } from '../lib/serialize';
import { notFound } from '../lib/errors';
import { USER_ROLES, USER_STATUSES } from '@sevyo/shared-types';

export async function stats(_req: Request, res: Response) {
  res.json(await adminStats());
}

export async function users(req: Request, res: Response) {
  const q = req.query as Record<string, string | undefined>;

  const rows = await prisma.user.findMany({
    where: {
      ...(q.role && (USER_ROLES as readonly string[]).includes(q.role)
        ? { role: q.role as (typeof USER_ROLES)[number] }
        : {}),
      ...(q.status && (USER_STATUSES as readonly string[]).includes(q.status)
        ? { status: q.status as (typeof USER_STATUSES)[number] }
        : {}),
      ...(q.q
        ? {
            // MySQL collation (utf8mb4_unicode_ci) is case-insensitive already
            OR: [{ name: { contains: q.q } }, { email: { contains: q.q } }],
          }
        : {}),
    },
    include: {
      _count: { select: { bookings: true } },
      bookings: { where: { status: 'completed' }, select: { price: true } },
    },
    orderBy: { createdAt: 'desc' },
  });

  res.json(
    rows.map((user) => ({
      ...serializeUser(user),
      bookingsCount: user._count.bookings,
      spent: Math.round(
        user.bookings.reduce((sum, booking) => sum + Number(booking.price ?? 0), 0),
      ),
    })),
  );
}

export async function setUserStatus(req: Request, res: Response) {
  const id = BigInt(req.params.id);
  const user = await prisma.user.findUnique({ where: { id } });
  if (!user) throw notFound('User not found');

  const updated = await prisma.user.update({
    where: { id },
    data: { status: req.body.status },
  });
  res.json(serializeUser(updated));
}

export async function vendors(req: Request, res: Response) {
  res.json(await vendorService.adminListVendors());
}

export async function setVendorStatus(req: Request, res: Response) {
  res.json(await vendorService.adminSetStatus(BigInt(req.params.id), req.body.status));
}