// Second test user in the real Keycloak realm (Keycloak has no throwaway copy): created for multi-person approval tests,
// deleted in teardown. Only the user named SECOND_USER is ever created or deleted here.
const KC = 'http://localhost:8080';
const REALM = 'sic-project';
export const SECOND_USER = 'e2e-second';
export const SECOND_PASS = 'E2e-Second-Pass-2026';

async function adminToken(): Promise<string> {
  const r = await fetch(`${KC}/realms/master/protocol/openid-connect/token`, {
    method: 'POST',
    headers: { 'content-type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'password',
      client_id: 'admin-cli',
      username: process.env['KEYCLOAK_ADMIN'] ?? 'administrator',
      password: process.env['KEYCLOAK_ADMIN_PASSWORD'] ?? 'Sicr@2026',
    }),
  });
  if (!r.ok) throw new Error(`Keycloak admin login failed (${r.status}); set KEYCLOAK_ADMIN / KEYCLOAK_ADMIN_PASSWORD`);
  return (await r.json()).access_token;
}

async function findUser(token: string): Promise<string | undefined> {
  const r = await fetch(`${KC}/admin/realms/${REALM}/users?username=${SECOND_USER}&exact=true`, { headers: { authorization: `Bearer ${token}` } });
  return (await r.json())[0]?.id;
}

/** Create the second user (idempotent) and return its Keycloak id. */
export async function ensureSecondUser(): Promise<string> {
  const token = await adminToken();
  const existing = await findUser(token);
  if (existing) return existing;
  const r = await fetch(`${KC}/admin/realms/${REALM}/users`, {
    method: 'POST',
    headers: { authorization: `Bearer ${token}`, 'content-type': 'application/json' },
    body: JSON.stringify({
      username: SECOND_USER,
      email: 'e2e-second@example.test',
      firstName: 'E2E',
      lastName: 'Second',
      enabled: true,
      emailVerified: true,
      credentials: [{ type: 'password', value: SECOND_PASS, temporary: false }],
    }),
  });
  if (!r.ok) throw new Error(`create ${SECOND_USER} failed: ${r.status} ${await r.text()}`);
  return (await findUser(token))!;
}

export async function deleteSecondUser(): Promise<void> {
  try {
    const token = await adminToken();
    const id = await findUser(token);
    if (id) await fetch(`${KC}/admin/realms/${REALM}/users/${id}`, { method: 'DELETE', headers: { authorization: `Bearer ${token}` } });
  } catch {} // Keycloak down: nothing to clean
}
