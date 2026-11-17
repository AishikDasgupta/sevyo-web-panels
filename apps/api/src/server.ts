import { app } from './app';
import { env } from './config/env';
import { prisma } from './lib/prisma';

async function main() {
  try {
    await prisma.$connect();
    console.log('[api] MySQL connected');
  } catch (err) {
    console.error('[api] Failed to connect to MySQL — is it running? (docker compose up -d mysql)');
    console.error(err);
    process.exit(1);
  }

  app.listen(env.port, () => {
    console.log(`[api] Sevyo API listening on http://localhost:${env.port} (${env.nodeEnv})`);
  });
}

main().catch((err) => {
  console.error('[api] fatal startup error', err);
  process.exit(1);
});