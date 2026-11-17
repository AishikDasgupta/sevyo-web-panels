import type { AppNotification, NotificationsResponse } from '@sevyo/shared-types';
import { prisma } from '../lib/prisma';
import { forbidden, notFound } from '../lib/errors';

const s = (value: BigInt): string => value.toString();

function serialize(n: {
  id: bigint;
  userId: bigint;
  title: string;
  body: string | null;
  link: string | null;
  read: boolean;
  createdAt: Date;
}): AppNotification {
  return {
    id: s(n.id),
    userId: s(n.userId),
    title: n.title,
    body: n.body,
    link: n.link,
    read: n.read,
    createdAt: n.createdAt.toISOString(),
  };
}

export async function listMine(requester: { id: bigint }): Promise<NotificationsResponse> {
  const [rows, unreadCount] = await Promise.all([
    prisma.notification.findMany({
      where: { userId: requester.id },
      orderBy: { createdAt: 'desc' },
      take: 30,
    }),
    prisma.notification.count({ where: { userId: requester.id, read: false } }),
  ]);
  return { notifications: rows.map(serialize), unreadCount };
}

export async function markRead(id: bigint, requester: { id: bigint }): Promise<AppNotification> {
  const row = await prisma.notification.findUnique({ where: { id } });
  if (!row) throw notFound('Notification not found');
  if (row.userId !== requester.id) throw forbidden('Not your notification');
  const updated = row.read
    ? row
    : await prisma.notification.update({ where: { id }, data: { read: true } });
  return serialize(updated);
}

export async function markAllRead(requester: { id: bigint }): Promise<{ updated: number }> {
  const result = await prisma.notification.updateMany({
    where: { userId: requester.id, read: false },
    data: { read: true },
  });
  return { updated: result.count };
}
