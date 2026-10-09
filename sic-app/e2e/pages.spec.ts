import { test, expect, type Page } from '@playwright/test';
import * as fs from 'node:fs';
import { pages } from './pages';

const session = fs.existsSync('e2e/.auth/session.json') ? fs.readFileSync('e2e/.auth/session.json', 'utf8') : '{}';

// One page for every route: oauth tokens rotate on refresh, so a fresh copy per test would expire mid-run.

let page: Page;
let errors: string[];

test.beforeAll(async ({ browser }) => {
  const context = await browser.newContext({ storageState: 'e2e/.auth/user.json' });
  await context.addInitScript((data) => {
    try {
      if (sessionStorage.length) return; // keep rotated tokens after the first load
      for (const [k, v] of Object.entries(JSON.parse(data))) sessionStorage.setItem(k, v as string);
    } catch {} // opaque-origin frames deny sessionStorage
  }, session);
  await context.route((u) => u.hostname !== 'localhost', (r) => r.abort()); // external fonts/CDN can hang rendering
  page = await context.newPage();
  page.on('pageerror', (e) => errors.push(`pageerror: ${e.message}`));
  page.on('response', (r) => {
    if (r.status() >= 500) errors.push(`${r.status()} ${r.request().method()} ${r.url()}`);
  });
});

test.afterAll(() => page.context().close());

test('all pages', async () => {
  test.setTimeout(30 * 60_000);
  for (const path of pages) {
    await test.step(path, async () => {
      errors = [];
      await page.goto(path);
      await page.waitForLoadState('networkidle');

      if (page.url().includes('/realms/sic-project')) {
        // session expired mid-run: log in again and record where, so token-refresh problems stay visible
        test.info().annotations.push({ type: 'relogin', description: path });
        await page.locator('input[name=username]').fill(process.env['E2E_USER']!);
        await page.locator('input[name=password]').fill(process.env['E2E_PASS']!);
        await page.getByRole('button', { name: 'Sign In' }).click();
        await page.waitForURL((u) => u.origin === 'http://localhost:4200' && !u.pathname.startsWith('/auth'));
        errors = [];
        await page.goto(path);
        await page.waitForLoadState('networkidle');
      }

      expect.soft(page.url(), 'session lost').not.toContain('/realms/sic-project');
      await expect.soft(page.locator('body')).not.toBeEmpty();
      expect.soft(errors, `${path} -> ${page.url()}`).toEqual([]);
    });
  }
});
