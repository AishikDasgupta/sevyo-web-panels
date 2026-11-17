import 'dotenv/config';
import path from 'path';

function required(name: string, fallback?: string): string {
  const value = process.env[name] ?? fallback;
  if (!value) {
    throw new Error(`[env] Missing required environment variable: ${name}`);
  }
  return value;
}

export const env = {
  databaseUrl: required('DATABASE_URL', 'mysql://sevyo:sevyo_pass@localhost:3306/sevyo'),
  jwtAccessSecret: required('JWT_ACCESS_SECRET', 'dev-access-secret-change-me'),
  jwtRefreshSecret: required('JWT_REFRESH_SECRET', 'dev-refresh-secret-change-me'),
  accessTokenTtl: process.env.ACCESS_TOKEN_TTL ?? '15m',
  refreshTokenTtl: process.env.REFRESH_TOKEN_TTL ?? '7d',
  port: Number(process.env.PORT ?? 4000),
  nodeEnv: process.env.NODE_ENV ?? 'development',
  corsOrigin: (process.env.CORS_ORIGIN ?? 'http://localhost:3000')
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean),
  uploadsDir: path.resolve(process.cwd(), process.env.UPLOAD_DIR ?? 'uploads'),
  cookieDomain: process.env.COOKIE_DOMAIN || undefined,
  razorpayKeyId: process.env.RAZORPAY_KEY_ID ?? '',
  razorpayKeySecret: process.env.RAZORPAY_KEY_SECRET ?? '',

  // Cookie names shared with the web client (see apps/web/src/lib/auth.ts)
  accessCookie: 'access_token',
  refreshCookie: 'refresh_token',

  isProd: (process.env.NODE_ENV ?? 'development') === 'production',
};

export type AppEnv = typeof env;