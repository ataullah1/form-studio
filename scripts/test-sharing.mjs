import { spawnSync } from 'node:child_process';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { createServer } from 'node:net';
import { randomBytes } from 'node:crypto';

// Every write targets a newly created, localhost-only test cluster. Never uses project DB credentials.
const directory = mkdtempSync(join(tmpdir(), 'form-studio-share-test-'));
const data = join(directory, 'data');
const listener = createServer();
await new Promise(resolve => listener.listen(0, '127.0.0.1', resolve));
const port = listener.address().port;
await new Promise(resolve => listener.close(resolve));
const admin = `postgresql://form_studio_admin@127.0.0.1:${port}/form_studio_step7`;
const runtime = `postgresql://form_studio_runtime@127.0.0.1:${port}/form_studio_step7`;
const adminWeb = `postgresql://form_studio_admin_web@127.0.0.1:${port}/form_studio_step7`;
const environment = { ...process.env, DIRECT_URL: admin, DATABASE_URL: runtime, TEST_DATABASE_URL: admin, ADMIN_DATABASE_URL: adminWeb, ADMIN_ORIGIN: 'http://127.0.0.1:4173', ADMIN_GOOGLE_SUB_IDS: '123456789012345678901', GOOGLE_CLIENT_ID: 'local-test-client', GOOGLE_CLIENT_SECRET: 'local-test-only-secret', SHARE_RATE_LIMIT_SECRET: randomBytes(32).toString('hex'), CRON_SECRET: randomBytes(32).toString('hex') };
function run(command, args, env = environment) {
  const result = spawnSync(command, args, { stdio: 'inherit', env });
  if (result.error || result.status !== 0) throw new Error(`${command} failed; check the output above. PostgreSQL tools must be on PATH.`);
}
let started = false;
try {
  run('initdb', ['-D', data, '--auth=trust', '--username=form_studio_admin', '--no-locale', '--encoding=UTF8']);
  run('pg_ctl', ['-D', data, '-l', join(directory, 'postgres.log'), '-o', `-h 127.0.0.1 -p ${port}`, 'start']); started = true;
  run('createdb', ['-h', '127.0.0.1', '-p', String(port), '-U', 'form_studio_admin', 'form_studio_step7']);
  run('psql', [admin, '-v', 'ON_ERROR_STOP=1', '-c', 'CREATE ROLE anon NOLOGIN; CREATE ROLE authenticated NOLOGIN;']);
  run('pnpm', ['db:migrate']);
  run('psql', [admin, '-v', 'ON_ERROR_STOP=1', '-c', 'ALTER ROLE form_studio_runtime LOGIN; ALTER ROLE form_studio_admin_web LOGIN;']);
  run('pnpm', ['build']);
  run('pnpm', ['exec', 'playwright', 'test', ...(process.argv.includes('--all') ? [] : process.argv.includes('--account') ? ['tests/e2e/account.spec.ts', 'tests/e2e/admin.spec.ts', 'tests/e2e/sharing.spec.ts', 'tests/e2e/quotes.spec.ts', 'tests/e2e/discovery.spec.ts', 'tests/e2e/foundation.spec.ts'] : process.argv.includes('--admin') ? ['tests/e2e/admin.spec.ts'] : ['tests/e2e/sharing.spec.ts', 'tests/e2e/quotes.spec.ts', 'tests/e2e/admin.spec.ts', 'tests/e2e/account.spec.ts'])]);
} catch (error) { console.error(error.message); process.exitCode = 1; }
finally {
  if (started) spawnSync('pg_ctl', ['-D', data, '-m', 'fast', 'stop'], { stdio: 'inherit' });
  rmSync(directory, { recursive: true, force: true });
}
