/**
 * Cross-platform `npm run dev` — starts the API and the web app together.
 * Replaces `a & b` which is not portable to Windows. Ctrl+C stops both.
 */
import { spawn } from 'node:child_process';
import process from 'node:process';

const isWindows = process.platform === 'win32';

function run(name, args) {
  const child = spawn(isWindows ? 'npm.cmd' : 'npm', args, {
    stdio: 'inherit',
    shell: isWindows,
    env: process.env,
  });
  child.on('exit', (code) => {
    if (code && code !== 0) {
      console.error(`[dev] ${name} exited with code ${code}`);
      shutdown(code ?? 1);
    }
  });
  return child;
}

const children = [
  run('api', ['run', 'dev', '--prefix', 'apps/api']),
  run('web', ['run', 'dev', '--prefix', 'apps/web']),
];

let closing = false;
function shutdown(code = 0) {
  if (closing) return;
  closing = true;
  for (const child of children) {
    if (!child.killed) child.kill(isWindows ? undefined : 'SIGTERM');
  }
  process.exit(code);
}

process.on('SIGINT', () => shutdown(0));
process.on('SIGTERM', () => shutdown(0));
