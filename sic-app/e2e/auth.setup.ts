import * as fs from 'node:fs';
import * as crypto from 'node:crypto';
import { test as setup, expect, type Page } from '@playwright/test';
import { ensureSecondUser, SECOND_PASS, SECOND_USER } from './infra/keycloak';
import { FIRST_TOKEN, SECOND_TOKEN } from './api';

const KC = 'http://localhost:8080/realms/sic-project/protocol/openid-connect';
const REDIRECT = 'http://localhost:4200/auth/callback';

async function fillLogin(page: Page, user = process.env['E2E_USER']!, pass = process.env['E2E_PASS']!) {
  await page.locator('input[name=username]').fill(user);
  await page.locator('input[name=password]').fill(pass);
  await page.getByRole('button', { name: 'Sign In' }).click();
}

// ---- UI session (needs the Angular dev server) ----
setup('login via Keycloak', async ({ page }) => {
  setup.setTimeout(240_000); // cold Vite dev server re-optimizes deps and reloads
  await page.route((u) => u.hostname !== 'localhost', (r) => r.abort()); // external fonts/CDN can hang rendering
  await page.goto('/feature/dashboard');
  await page.waitForURL(/realms\/sic-project/);
  await fillLogin(page);
  await page.waitForURL(/localhost:4200\/(?!auth)/);
  await expect(page).not.toHaveURL(/realms/);
  await page.context().storageState({ path: 'e2e/.auth/user.json' });
  // oauth tokens live in sessionStorage, which storageState does not keep
  fs.writeFileSync('e2e/.auth/session.json', await page.evaluate(() => JSON.stringify(sessionStorage)));
});

// ---- API session: Keycloak client has no password grant, so do the browser code flow (PKCE) by hand.
// No dev server needed. ----
/** Browser code flow (PKCE) for one user; saves the refresh token to `file`. */
async function apiLogin(page: Page, user: string, pass: string, file: string) {
  const verifier = crypto.randomBytes(32).toString('base64url');
  const challenge = crypto.createHash('sha256').update(verifier).digest('base64url');
  await page.route((u) => u.hostname !== 'localhost', (r) => r.abort());

  const url = `${KC}/auth?response_type=code&client_id=sic-app&redirect_uri=${encodeURIComponent(REDIRECT)}&scope=${encodeURIComponent('openid offline_access')}&code_challenge=${challenge}&code_challenge_method=S256&state=e2e`;
  await page.goto(url);
  // the redirect target (Angular app) may be down: read the code from the request URL, not from a loaded page
  const callback = page.waitForRequest((r) => r.url().startsWith(REDIRECT));
  await fillLogin(page, user, pass);
  const code = new URL((await callback).url()).searchParams.get('code');
  expect(code, 'authorization code missing').toBeTruthy();

  const r = await page.request.post(`${KC}/token`, {
    form: { grant_type: 'authorization_code', client_id: 'sic-app', code: code!, redirect_uri: REDIRECT, code_verifier: verifier },
  });
  expect(r.ok(), await r.text()).toBe(true);
  const j = await r.json();
  expect(j.refresh_token, 'refresh_token missing (offline_access scope?)').toBeTruthy();
  fs.writeFileSync(file, JSON.stringify({ refresh_token: j.refresh_token }));
}

setup('login for API tokens', async ({ page }) => {
  await apiLogin(page, process.env['E2E_USER']!, process.env['E2E_PASS']!, FIRST_TOKEN);
});

// Second user (for multi-person approvals): created in Keycloak, removed again by global teardown.
setup('login second user for API tokens', async ({ page }) => {
  await ensureSecondUser();
  await apiLogin(page, SECOND_USER, SECOND_PASS, SECOND_TOKEN);
});
