import { test, expect, type Page } from '@playwright/test';
import { Ui } from '../ui';
import { selectProject } from './forms';

// Every print / export-PDF button opens its tab at click time, so the PDF still shows when the server takes long to make it.
// The popup blocker is ON here (Playwright turns it off by default) and every export response is held back DELAY ms:
// a button that calls window.open() only after the response would get no tab at all.
// Read-only: it only exports existing documents of PDF_PROJECT.
// Run: PDF_PROJECT="<a project with documents>" npx playwright test e2e/ui/pdf-export-tab.spec.ts --project=ui --no-deps --retries=0
// Manual check only: it needs a project full of real documents, which the throwaway e2e DB does not have, so the regular run skips it.
test.skip(!process.env['PDF_PROJECT'], 'manual check: set PDF_PROJECT to a project that has documents');
test.use({ launchOptions: { ignoreDefaultArgs: ['--disable-popup-blocking'] } });
test.describe.configure({ mode: 'serial' });

const PROJECT = process.env['PDF_PROJECT'] ?? '';
const DELAY = 8_000; // > the few seconds of user activation a browser allows for window.open
const P = '/feature/pm';
const icon = (page: Page, cls: string) => page.locator(`button:has(i.${cls}):visible`).first();

type Case = { name: string; path: string; edit?: boolean; button: (page: Page) => ReturnType<Page['locator']> };
const cases: Case[] = [
  { name: 'project list', path: `${P}/project`, button: (p) => icon(p, 'bi-printer') },
  { name: 'contract list', path: `${P}/contract`, button: (p) => icon(p, 'bi-printer') },
  { name: 'requirement list', path: `${P}/requirement`, button: (p) => icon(p, 'bi-printer') },
  { name: 'requirement form', path: `${P}/requirement`, edit: true, button: (p) => icon(p, 'bi-filetype-pdf') },
  { name: 'change-request list', path: `${P}/change-request`, button: (p) => icon(p, 'bi-printer') },
  { name: 'change-request form', path: `${P}/change-request`, edit: true, button: (p) => icon(p, 'bi-printer') },
  { name: 'specification list', path: `${P}/specification`, button: (p) => icon(p, 'bi-printer') },
  { name: 'specification form', path: `${P}/specification`, edit: true, button: (p) => icon(p, 'bi-filetype-pdf') },
  { name: 'design-review list', path: `${P}/design-review`, button: (p) => icon(p, 'bi-printer') },
  { name: 'design-review form', path: `${P}/design-review`, edit: true, button: (p) => icon(p, 'bi-printer') },
  { name: 'test scenario (UAT)', path: `${P}/test-management`, button: (p) => icon(p, 'bi-printer') },
  { name: 'delivery list', path: `${P}/delivery`, button: (p) => icon(p, 'bi-printer') },
  { name: 'user-manual list', path: `${P}/manual`, button: (p) => icon(p, 'bi-printer') },
  { name: 'user-manual form', path: `${P}/manual`, edit: true, button: (p) => icon(p, 'bi-file-earmark-pdf') },
  { name: 'invoice list', path: `${P}/invoice`, button: (p) => icon(p, 'bi-printer') },
  { name: 'invoice form', path: `${P}/invoice`, edit: true, button: (p) => icon(p, 'bi-file-earmark-pdf') },
  { name: 'ma-ticket list', path: `${P}/ma-ticket`, button: (p) => icon(p, 'bi-printer') },
  { name: 'diagram (current tab)', path: `${P}/diagram`, button: (p) => icon(p, 'bi-file-earmark-pdf-fill') },
  { name: 'diagram (whole project)', path: `${P}/diagram`, button: (p) => icon(p, 'bi-collection-fill') },
];

let ui: Ui;
test.beforeAll(async ({ browser }) => {
  ui = await Ui.open(browser);
  // hold back every PDF export so it takes as long as a big document
  await ui.page.context().route(/\/api\/.*export/, async (route) => {
    const res = await route.fetch({ timeout: 120_000 });
    await new Promise((r) => setTimeout(r, DELAY));
    await route.fulfill({ response: res });
  });
});
test.afterAll(() => ui?.close());

test('the popup blocker is on: window.open long after a click gets no tab', async () => {
  await ui.visit(`${P}/project`);
  const blocked = await ui.page.evaluate(() => new Promise<boolean>((r) => setTimeout(() => r(window.open('about:blank', '_blank') === null), 6_000)));
  expect(blocked).toBe(true);
});

for (const c of cases) {
  test(`${c.name}: the PDF opens in a new tab although it takes ${DELAY / 1000}s`, async () => {
    test.setTimeout(240_000);
    const { page } = ui;
    await ui.visit(c.path);
    await selectProject(page, PROJECT).catch(() => {});
    if (c.edit) {
      await icon(page, 'bi-pencil').click({ timeout: 30_000 });
      await page.waitForLoadState('networkidle').catch(() => {});
    }
    const button = c.button(page);
    await button.waitFor({ timeout: 60_000 });

    const popup = page.context().waitForEvent('page', { timeout: 5_000 }); // opened by the click itself
    await button.click();
    const tab = await popup;
    await expect.poll(() => tab.url(), { timeout: 180_000, message: 'tab never got the PDF' }).toMatch(/^blob:/);
    await tab.close();
    expect(ui.errors).toEqual([]);
  });
}
