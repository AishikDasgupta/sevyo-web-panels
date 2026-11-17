/**
 * Vitest global setup — provides deterministic env vars for unit tests.
 * No MySQL connection is required: these suites exercise pure logic only.
 */
process.env.NODE_ENV = 'test';
process.env.JWT_ACCESS_SECRET = 'test-access-secret';
process.env.JWT_REFRESH_SECRET = 'test-refresh-secret';
process.env.ACCESS_TOKEN_TTL = '15m';
process.env.REFRESH_TOKEN_TTL = '7d';
process.env.PORT = '0';
process.env.UPLOAD_DIR = '.tmp-test-uploads';
process.env.DATABASE_URL = process.env.DATABASE_URL ?? 'mysql://test:test@localhost:3306/test';