import type { Request, Response } from 'express';
import * as authService from '../services/auth.service';
import { unauthorized } from '../lib/errors';
import { env } from '../config/env';

const cookieBase = {
  httpOnly: true,
  secure: env.isProd,
  sameSite: 'strict' as const,
  ...(env.cookieDomain ? { domain: env.cookieDomain } : {}),
  path: '/',
};

const ACCESS_MAX_AGE = 15 * 60 * 1000;
const REFRESH_MAX_AGE = 7 * 24 * 60 * 60 * 1000;

function setAuthCookies(res: Response, tokens: { accessToken: string; refreshToken: string }) {
  res.cookie(env.accessCookie, tokens.accessToken, { ...cookieBase, maxAge: ACCESS_MAX_AGE });
  res.cookie(env.refreshCookie, tokens.refreshToken, { ...cookieBase, maxAge: REFRESH_MAX_AGE });
}

export async function register(req: Request, res: Response) {
  const { accessToken, refreshToken, user } = await authService.register(req.body);
  setAuthCookies(res, { accessToken, refreshToken });
  res.status(201).json({ user });
}

export async function login(req: Request, res: Response) {
  const { accessToken, refreshToken, user } = await authService.login(req.body);
  setAuthCookies(res, { accessToken, refreshToken });
  res.json({ user });
}

export async function refresh(req: Request, res: Response) {
  const token = req.cookies?.[env.refreshCookie];
  if (!token) throw unauthorized('No refresh token');
  const { accessToken, refreshToken: next, user } = await authService.refresh(token);
  setAuthCookies(res, { accessToken, refreshToken: next });
  res.json({ user });
}

export async function logout(req: Request, res: Response) {
  const token = req.cookies?.[env.refreshCookie];
  await authService.logout(token);
  res.clearCookie(env.accessCookie, cookieBase);
  res.clearCookie(env.refreshCookie, cookieBase);
  res.status(204).send();
}