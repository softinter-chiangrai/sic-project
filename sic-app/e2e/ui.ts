import * as fs from 'node:fs';
import { expect, test, type Browser, type Page } from '@playwright/test';

const session = () => (fs.existsSync('e2e/.auth/session.json') ? fs.readFileSync('e2e/.auth/session.json', 'utf8') : '{}');

/**
 * One logged-in browser page shared by all tests of a file: oauth tokens rotate on refresh,
 * so a fresh copy of the saved session per test would expire mid-run.
 */
export class Ui {
  errors: string[] = [];
  private constructor(readonly page: Page) {}

  static async open(browser: Browser): Promise<Ui> {
    const context = await browser.newContext({ storageState: 'e2e/.auth/user.json' });
    await context.addInitScript((data) => {
      try {
        if (sessionStorage.length) return; // keep rotated tokens after the first load
        for (const [k, v] of Object.entries(JSON.parse(data))) sessionStorage.setItem(k, v as string);
      } catch {} // opaque-origin frames deny sessionStorage
    }, session());
    await context.route((u) => u.hostname !== 'localhost', (r) => r.abort()); // external fonts/CDN can hang rendering
    const ui = new Ui(await context.newPage());
    ui.page.on('pageerror', (e) => ui.errors.push(`pageerror: ${e.message}`));
    ui.page.on('response', (r) => {
      if (r.status() >= 500) ui.errors.push(`${r.status()} ${r.request().method()} ${r.url()}`);
    });
    return ui;
  }

  close() {
    return this.page.context().close();
  }

  /** Open a route, log in again if the session expired (recorded as annotation), wait until the page settles. */
  async visit(path: string) {
    const { page } = this;
    this.errors = [];
    await page.goto(path);
    await page.waitForLoadState('networkidle');
    if (page.url().includes('/realms/sic-project')) {
      test.info().annotations.push({ type: 'relogin', description: path });
      await page.locator('input[name=username]').fill(process.env['E2E_USER']!);
      await page.locator('input[name=password]').fill(process.env['E2E_PASS']!);
      await page.getByRole('button', { name: 'Sign In' }).click();
      await page.waitForURL((u) => u.origin === 'http://localhost:4200' && !u.pathname.startsWith('/auth'));
      this.errors = [];
      await page.goto(path);
      await page.waitForLoadState('networkidle');
    }
  }

  /** The page rendered something, kept the session and caused no JS error / 5xx. */
  async expectHealthy(path: string) {
    expect.soft(this.page.url(), 'session lost').not.toContain('/realms/sic-project');
    await expect.soft(this.page.locator('body')).not.toBeEmpty({ timeout: 20_000 }); // lazy route may render late
    expect.soft(this.errors, `${path} -> ${this.page.url()}`).toEqual([]);
  }
}
