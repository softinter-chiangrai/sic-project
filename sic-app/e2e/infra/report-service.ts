// The report service fills every PDF from its own data source (set once by sic-report-service-init to the real DB).
// While tests run on the throwaway DB it must read that DB too, or every report comes out blank; teardown points it back.
// Only the databaseName of the existing data source is changed (the stored password is kept: blank password = unchanged).
import { execFileSync } from 'node:child_process';
import * as fs from 'node:fs';
import * as path from 'node:path';

/** ADMIN_* / REPORT_SERVICE_PORT from the repo's .env, the same values docker compose gives the report service. */
function env(key: string, fallback: string): string {
  if (process.env[key]) return process.env[key]!;
  try {
    const line = fs.readFileSync(path.resolve(process.cwd(), '..', '.env'), 'utf8').split(/\r?\n/).find((l) => l.startsWith(`${key}=`));
    if (line) return line.slice(key.length + 1).trim().replace(/^["']|["']$/g, '');
  } catch {}
  return fallback;
}

const BASE = `http://localhost:${env('REPORT_SERVICE_PORT', '8082')}`;

/** Form login (Spring Security + CSRF): returns the session cookie and a CSRF token for API calls. */
async function login(): Promise<{ cookie: string; csrf: string }> {
  const jar = new Map<string, string>();
  const keep = (r: Response) => r.headers.getSetCookie().forEach((c) => jar.set(c.split('=')[0], c.split(';')[0]));
  const cookie = () => [...jar.values()].join('; ');
  const csrfOf = (html: string) => /name="_csrf"\s+(?:content|value)="([^"]+)"/.exec(html)?.[1] ?? '';

  const page = await fetch(`${BASE}/login`);
  keep(page);
  const form = new URLSearchParams({ username: env('ADMIN_USERNAME', 'admin'), password: env('ADMIN_PASSWORD', 'admin'), _csrf: csrfOf(await page.text()) });
  const res = await fetch(`${BASE}/login`, { method: 'POST', body: form, headers: { cookie: cookie() }, redirect: 'manual' });
  keep(res);
  if (/error/.test(res.headers.get('location') ?? '')) throw new Error('report service admin login failed; set ADMIN_USERNAME / ADMIN_PASSWORD');
  const home = await fetch(`${BASE}/data-sources`, { headers: { cookie: cookie() } });
  keep(home);
  return { cookie: cookie(), csrf: csrfOf(await home.text()) };
}

/** Upload the repo's current .jrxml files (sic-report-service-init): reports must not be tested against old templates. */
export function syncTemplates() {
  execFileSync('docker', ['compose', 'up', 'sic-report-service-init'], { cwd: path.resolve(process.cwd(), '..'), stdio: 'ignore' });
}

/** Point the report service's (single) data source at `db`. */
export async function pointReportsAt(db: string) {
  const { cookie, csrf } = await login();
  const headers = { cookie, 'x-csrf-token': csrf, 'content-type': 'application/json' };
  const list = (await (await fetch(`${BASE}/api/data-sources`, { headers })).json()) as { id: number }[];
  if (!list.length) throw new Error('report service has no data source (run sic-report-service-init)');
  const ds = await (await fetch(`${BASE}/api/data-sources/${list[0].id}`, { headers })).json();
  if (ds.databaseName === db) return;
  const r = await fetch(`${BASE}/api/data-sources/${ds.id}`, { method: 'PUT', headers, body: JSON.stringify({ ...ds, databaseName: db, password: '' }) });
  if (!r.ok) throw new Error(`report service data source -> ${db}: ${r.status} ${await r.text()}`);
}
