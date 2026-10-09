import * as fs from 'node:fs';
import { test as setup, expect } from '@playwright/test';

setup('login via Keycloak', async ({ page }) => {
  setup.setTimeout(240_000); // cold Vite dev server re-optimizes deps and reloads
  await page.route((u) => u.hostname !== 'localhost', (r) => r.abort()); // external fonts/CDN can hang rendering
  await page.goto('/feature/dashboard');
  await page.waitForURL(/realms\/sic-project/);
  await page.locator('input[name=username]').fill(process.env['E2E_USER']!);
  await page.locator('input[name=password]').fill(process.env['E2E_PASS']!);
  await page.getByRole('button', { name: 'Sign In' }).click();
  await page.waitForURL(/localhost:4200\/(?!auth)/);
  await expect(page).not.toHaveURL(/realms/);
  await page.context().storageState({ path: 'e2e/.auth/user.json' });
  // oauth tokens live in sessionStorage, which storageState does not keep
  fs.writeFileSync('e2e/.auth/session.json', await page.evaluate(() => JSON.stringify(sessionStorage)));
});
