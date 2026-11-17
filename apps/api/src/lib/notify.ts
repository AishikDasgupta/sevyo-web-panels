import { prisma } from './prisma';

export interface NotifyInput {
  title: string;
  body?: string | null;
  link?: string | null;
}

/**
 * Best-effort fan-out: creates one notification row per user.
 * Notification failures are logged, never thrown — they must not break
 * the booking/payment operation that triggered them.
 */
export async function notifyUsers(userIds: Array<bigint | null | undefined>, input: NotifyInput): Promise<void> {
  const unique = [...new Set(userIds.filter((id): id is bigint => typeof id === 'bigint' && id > 0n))];
  if (unique.length === 0) return;
  try {
    await prisma.notification.createMany({
      data: unique.map((userId) => ({
        userId,
        title: input.title.slice(0, 200),
        body: input.body?.slice(0, 500) ?? null,
        link: input.link ?? null,
      })),
    });
  } catch (err) {
    console.error('[notify] failed to create notifications:', err);
  }
}

/** Admin user ids — every admin gets operational notifications. */
export async function adminUserIds(): Promise<bigint[]> {
  try {
    const admins = await prisma.user.findMany({ where: { role: 'admin' }, select: { id: true } });
    return admins.map((a) => a.id);
  } catch (err) {
    console.error('[notify] failed to load admin users:', err);
    return [];
  }
}
