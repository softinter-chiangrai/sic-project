import { test, expect } from '@playwright/test';
import { pages } from './pages';

for (const path of pages) {
  test(`page ${path}`, async ({ page }) => {
    const errors: string[] = [];
    page.on('pageerror', (e) => errors.push(`pageerror: ${e.message}`));
    page.on('response', (r) => {
      if (r.status() >= 500) errors.push(`${r.status()} ${r.request().method()} ${r.url()}`);
    });

    await page.goto(path);
    await page.waitForLoadState('networkidle');

    await expect(page).not.toHaveURL(/realms\/sic-project/); // session ok
    await expect(page.locator('body')).not.toBeEmpty();
    expect(errors, `final url: ${page.url()}`).toEqual([]);
  });
}
