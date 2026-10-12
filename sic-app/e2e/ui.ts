import * as fs from 'node:fs';
import { expect, test, type Browser, type Page } from '@playwright/test';

import { API_PORT } from './api';

export type Who = 'first' | 'second';
const files = (who: Who) => (who === 'first' ? { storage: 'e2e/.auth/user.json', session: 'e2e/.auth/session.json' } : { storage: 'e2e/.auth/user2.json', session: 'e2e/.auth/session2.json' });
const session = (who: Who) => (fs.existsSync(files(who).session) ? fs.readFileSync(files(who).session, 'utf8') : '{}');

/**
 * One logged-in browser page shared by all tests of a file: oauth tokens rotate on refresh,
 * so a fresh copy of the saved session per test would expire mid-run.
 */
export class Ui {
  errors: string[] = [];
  private constructor(readonly page: Page) {}

  static async open(browser: Browser, who: Who = 'first'): Promise<Ui> {
    const context = await browser.newContext({ storageState: files(who).storage, permissions: ['microphone', 'camera'] });
    await context.addInitScript((data) => {
      try {
        if (sessionStorage.length) return; // keep rotated tokens after the first load
        for (const [k, v] of Object.entries(JSON.parse(data))) sessionStorage.setItem(k, v as string);
      } catch {} // opaque-origin frames deny sessionStorage
    }, session(who));
    if (API_PORT !== '5265') await reroute(context, API_PORT);
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
    await this.go(path);
    if (page.url().includes('/realms/sic-project')) {
      test.info().annotations.push({ type: 'relogin', description: path });
      await page.locator('input[name=username]').fill(process.env['E2E_USER']!);
      await page.locator('input[name=password]').fill(process.env['E2E_PASS']!);
      await page.getByRole('button', { name: 'Sign In' }).click();
      await page.waitForURL((u) => u.origin === 'http://localhost:4200' && !u.pathname.startsWith('/auth'));
      this.errors = [];
      await this.go(path);
    }
  }

  /** goto that survives the app redirecting to the login page / back while loading (navigation "aborted"). */
  private async go(path: string) {
    await this.page.goto(path).catch((e: Error) => {
      if (!/ERR_ABORTED|frame was detached/.test(e.message)) throw e;
    });
    await this.page.waitForLoadState('networkidle').catch(() => {});
  }

  /** The page rendered something, kept the session and caused no JS error / 5xx. */
  async expectHealthy(path: string) {
    expect.soft(this.page.url(), 'session lost').not.toContain('/realms/sic-project');
    await expect.soft(this.page.locator('body')).not.toBeEmpty({ timeout: 20_000 }); // lazy route may render late
    expect.soft(this.errors, `${path} -> ${this.page.url()}`).toEqual([]);
  }
}

/**
 * The Angular app is built against :5265. When the test backend runs on another port (a backend you started yourself owns
 * :5265 and your real DB), send the app's HTTP and WebSocket traffic to the test backend instead.
 */
export async function reroute(context: import('@playwright/test').BrowserContext, port: string = API_PORT) {
  if (port === '5265') return;
  await context.route(/^http:\/\/localhost:5265\//, (r) => r.continue({ url: r.request().url().replace('localhost:5265', `localhost:${port}`) }));
  await context.routeWebSocket(/localhost:5265/, (ws) => {
    const upstream = new WebSocket(ws.url().replace('localhost:5265', `localhost:${port}`));
    const queue: (string | Buffer)[] = [];
    ws.onMessage((m) => (upstream.readyState === WebSocket.OPEN ? upstream.send(m as any) : queue.push(m)));
    upstream.addEventListener('open', () => queue.splice(0).forEach((m) => upstream.send(m as any)));
    upstream.addEventListener('message', (e) => ws.send(e.data as any));
    upstream.addEventListener('close', () => ws.close());
    ws.onClose(() => upstream.close());
  });
}
