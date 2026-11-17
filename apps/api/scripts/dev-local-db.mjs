/**
 * Starts an ephemeral in-memory MySQL 8 for local development (no Docker needed).
 *
 * Usage: npm run db:local
 *   LOCAL_DB_PORT     pin the port (default: random free port)
 *   LOCAL_DB_VERSION  MySQL version range (default: 8.0.x)
 *
 * Behavior:
 *   - Creates a fresh `sevyo` database on a random free port
 *   - Rewrites DATABASE_URL in apps/api/.env to point at it
 *   - Keeps running; Ctrl+C stops the database (data is ephemeral — reseed after restart)
 *   - First run downloads the MySQL binary (~200 MB) from cdn.mysql.com
 */
import { createDB } from 'mysql-memory-server';
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const apiRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const envPath = path.join(apiRoot, '.env');

const version = process.env.LOCAL_DB_VERSION ?? '8.0.x';
const port = Number(process.env.LOCAL_DB_PORT ?? 0);

console.log(`[dev-db] Starting MySQL ${version} — first run downloads the binary (can take a few minutes)…`);

const db = await createDB({ version, dbName: 'sevyo', port });
const url = `mysql://${db.username}:@127.0.0.1:${db.port}/${db.dbName}`;
console.log(`[dev-db] MySQL ${db.mysql.version} ready on port ${db.port} (db: ${db.dbName}, user: ${db.username})`);

if (existsSync(envPath)) {
  const current = readFileSync(envPath, 'utf8');
  const next = /^DATABASE_URL=/m.test(current)
    ? current.replace(/^DATABASE_URL=.*$/m, `DATABASE_URL="${url}"`)
    : `${current.trimEnd()}\nDATABASE_URL="${url}"\n`;
  writeFileSync(envPath, next);
  console.log('[dev-db] Wrote DATABASE_URL to apps/api/.env');
} else {
  writeFileSync(envPath, `DATABASE_URL="${url}"\n`);
  console.log('[dev-db] Created apps/api/.env with DATABASE_URL');
}

console.log('[dev-db] Next steps (separate terminals):');
console.log('[dev-db]   npm run db:deploy --prefix apps/api   # apply migrations');
console.log('[dev-db]   npm run db:seed   --prefix apps/api   # load demo data');
console.log('[dev-db]   npm run dev       --prefix apps/api   # API on :4000');
console.log('[dev-db] Ctrl+C to stop (all data is discarded)');

const shutdown = async () => {
  console.log('\n[dev-db] Stopping MySQL…');
  await db.stop();
  process.exit(0);
};
process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
