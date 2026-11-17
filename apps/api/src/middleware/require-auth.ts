import crypto from 'crypto';
import type { NextFunction, Request, Response } from 'express';
import type { UserRole } from '@sevyo/shared-types';
import { verifyAccessToken } from '../lib/jwt';
import { prisma } from '../lib/prisma';
import { unauthorized, forbidden } from '../lib/errors';
import { env } from '../config/env';

export interface AuthenticatedUser {
  id: bigint;
  name: string;
  email: string;
  role: UserRole;
  status: string;
  phone: string | null;
  avatarUrl: string | null;
}

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      user?: AuthenticatedUser;
    }
  }
}

export async function requireAuth(req: Request, _res: Response, next: NextFunction) {
  try {
    const token = req.cookies?.[env.accessCookie];
    if (!token) throw unauthorized();

    let payload;
    try {
      payload = verifyAccessToken(token);
    } catch {
      throw unauthorized('Session expired — sign in again');
    }

    const user = await prisma.user.findUnique({
      where: { id: BigInt(payload.sub) },
    });
    if (!user || user.status !== 'active') throw unauthorized('Account unavailable');

    req.user = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      status: user.status,
      phone: user.phone,
      avatarUrl: user.avatarUrl,
    };
    next();
  } catch (err) {
    next(err);
  }
}

export function requireRole(...roles: UserRole[]) {
  return (req: Request, _res: Response, next: NextFunction) => {
    if (!req.user) {
      next(unauthorized());
      return;
    }
    if (roles.length > 0 && !roles.includes(req.user.role)) {
      next(forbidden(`Requires role: ${roles.join(' or ')}`));
      return;
    }
    next();
  };
}

export function clearAuthCookies(res: Response) {
  const base = {
    httpOnly: true,
    secure: env.isProd,
    sameSite: 'strict' as const,
    domain: env.cookieDomain,
    path: '/',
  };
  res.clearCookie(env.accessCookie, base);
  res.clearCookie(env.refreshCookie, base);
}

export function hashToken(token: string): string {
  return crypto.createHash('sha256').update(token).digest('hex');
}
