import jwt, { SignOptions } from 'jsonwebtoken';
import type { UserRole } from '@sevyo/shared-types';
import { env } from '../config/env';

export interface AccessPayload {
  sub: string;
  role: UserRole;
}

export function signAccessToken(payload: AccessPayload): string {
  return jwt.sign(payload, env.jwtAccessSecret, {
    expiresIn: env.accessTokenTtl,
  } as SignOptions);
}

export function signRefreshToken(payload: AccessPayload): string {
  return jwt.sign(payload, env.jwtRefreshSecret, {
    expiresIn: env.refreshTokenTtl,
  } as SignOptions);
}

export function verifyAccessToken(token: string): AccessPayload {
  return jwt.verify(token, env.jwtAccessSecret) as AccessPayload;
}

export function verifyRefreshToken(token: string): AccessPayload {
  return jwt.verify(token, env.jwtRefreshSecret) as AccessPayload;
}