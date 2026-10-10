// Throwaway test database: backend (:5265) is re-pointed to sic_app_e2e, then restored and the DB dropped.
//   npm run e2e:down   (or: node e2e/infra/cli.cjs up | down | status)
// The real DB (sic_app) is never touched: only the literal E2E_DB below is created/dropped.
import { execFileSync } from 'node:child_process';
import * as path from 'node:path';

const E2E_DB = 'sic_app_e2e';
const root = path.resolve(process.cwd(), '..'); // repo root (docker-compose.yml); always run from sic-app
// spawnSync can fail transiently on Windows under memory pressure (UNKNOWN) -> retry
const sh = (cmd: string, args: string[], env: Record<string, string> = {}) => {
  for (let i = 0; ; i++) {
    try {
      return execFileSync(cmd, args, { cwd: root, env: { ...process.env, ...env }, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] });
    } catch (e: any) {
      if (i >= 3 || e.status != null) throw e;
    }
  }
};
const psql = (sql: string) => sh('docker', ['exec', 'sic-database', 'psql', '-U', 'administrator', '-d', 'postgres', '-tAc', sql]).trim();

export function isUp() {
  try {
    return sh('docker', ['inspect', '-f', '{{range .Config.Env}}{{println .}}{{end}}', 'sic-spring-backend']).includes(`/${E2E_DB}`);
  } catch {
    return false;
  }
}

async function waitBackend() {
  for (let i = 0; i < 90; i++) {
    try {
      const r = await fetch('http://localhost:5265/api/business/activation');
      if (r.status === 401) return; // up (auth required)
    } catch {}
    await new Promise((r) => setTimeout(r, 4000));
  }
  throw new Error('backend did not come up');
}

export async function up() {
  if (isUp()) return;
  if (!psql(`select 1 from pg_database where datname='${E2E_DB}'`)) psql(`CREATE DATABASE ${E2E_DB} OWNER "sic-app"`);
  sh('docker', ['compose', 'up', '-d', 'sic-spring'], { SIC_APP_DB_NAME: E2E_DB });
  await waitBackend();
}

export async function down() {
  const env: NodeJS.ProcessEnv = { ...process.env };
  delete env.SIC_APP_DB_NAME;
  execFileSync('docker', ['compose', 'up', '-d', 'sic-spring'], { cwd: root, env, stdio: 'ignore' }); // back to real DB
  await waitBackend();
  psql(`DROP DATABASE IF EXISTS ${E2E_DB} WITH (FORCE)`);
}

/** Run SQL against the throwaway DB only (seeding what the API cannot, e.g. profile e-mail verification). */
export const sql = (query: string) =>
  sh('docker', ['exec', 'sic-database', 'psql', '-U', 'administrator', '-d', E2E_DB, '-tAc', query]).trim();
