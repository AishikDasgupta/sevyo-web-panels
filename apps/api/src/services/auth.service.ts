import type { UserRole } from '@sevyo/shared-types';
import type { UserProfile } from '@sevyo/shared-types';
import { prisma } from '../lib/prisma';
import { hashPassword, verifyPassword } from '../lib/password';
import { conflict, unauthorized } from '../lib/errors';
import { serializeUser } from '../lib/serialize';
import {
  signAccessToken,
  signRefreshToken,
  verifyRefreshToken,
} from '../lib/jwt';
import { hashToken } from '../middleware/require-auth';
import type { RegisterInput, LoginInput } from '../schemas/auth.schema';

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
}

export interface AuthResult extends TokenPair {
  user: UserProfile;
}

/** Refresh token lifetime in ms — must mirror env.refreshTokenTtl ('7d'). */
const REFRESH_TTL_MS = 7 * 24 * 60 * 60 * 1000;

async function issueTokens(userId: bigint, role: UserRole): Promise<TokenPair> {
  const payload = { sub: userId.toString(), role };
  const accessToken = signAccessToken(payload);
  const refreshToken = signRefreshToken(payload);

  await prisma.refreshToken.create({
    data: {
      userId,
      tokenHash: hashToken(refreshToken),
      expiresAt: new Date(Date.now() + REFRESH_TTL_MS),
    },
  });

  return { accessToken, refreshToken };
}

export async function register(input: RegisterInput): Promise<AuthResult> {
  const existing = await prisma.user.findUnique({ where: { email: input.email } });
  if (existing) throw conflict('An account with that email already exists');

  const user = await prisma.user.create({
    data: {
      name: input.name,
      email: input.email,
      passwordHash: await hashPassword(input.password),
      phone: input.phone ?? null,
      role: input.role,
    },
  });

  return { ...(await issueTokens(user.id, user.role)), user: serializeUser(user) };
}

export async function login(input: LoginInput): Promise<AuthResult> {
  const user = await prisma.user.findUnique({ where: { email: input.email } });
  if (!user) throw unauthorized('Invalid email or password');

  const ok = await verifyPassword(input.password, user.passwordHash);
  if (!ok) throw unauthorized('Invalid email or password');

  if (user.status !== 'active') throw unauthorized('Account is not active');

  return { ...(await issueTokens(user.id, user.role)), user: serializeUser(user) };
}

export async function me(userId: bigint): Promise<UserProfile | null> {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  return user ? serializeUser(user) : null;
}

/**
 * Validates a refresh token, revokes it (rotation) and issues a fresh pair.
 */
export async function refresh(refreshToken: string): Promise<AuthResult> {
  let payload;
  try {
    payload = verifyRefreshToken(refreshToken);
  } catch {
    throw unauthorized('Session expired — sign in again');
  }

  const stored = await prisma.refreshToken.findFirst({
    where: { tokenHash: hashToken(refreshToken) },
  });
  if (!stored || stored.revoked || stored.expiresAt < new Date()) {
    throw unauthorized('Session expired — sign in again');
  }

  await prisma.refreshToken.update({
    where: { id: stored.id },
    data: { revoked: true },
  });

  // Defensive: ensure the account still exists and is active
  const user = await prisma.user.findUnique({ where: { id: BigInt(payload.sub) } });
  if (!user || user.status !== 'active') throw unauthorized('Account unavailable');

  return { ...(await issueTokens(user.id, user.role)), user: serializeUser(user) };
}

export async function logout(refreshToken?: string): Promise<void> {
  if (!refreshToken) return;
  await prisma.refreshToken.updateMany({
    where: { tokenHash: hashToken(refreshToken) },
    data: { revoked: true },
  });
}
