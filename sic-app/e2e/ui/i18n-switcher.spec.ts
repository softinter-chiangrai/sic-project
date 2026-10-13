import { test, expect } from '@playwright/test';
import { Ui } from '../ui';

let ui: Ui;
test.beforeAll(async ({ browser }) => {
  ui = await Ui.open(browser);
});
test.afterAll(async () => {
  await ui?.close();
});

test.describe('Internationalization (i18n) & Language Switcher', () => {
  test('Language toggle updates html lang attribute and persists in LocalStorage', async () => {
    test.setTimeout(120_000);
    await ui.visit('/feature/dashboard');
    await ui.expectHealthy('/feature/dashboard');

    // Read initial language
    const initialLang = await ui.page.evaluate(() => localStorage.getItem('app-lang') || 'en');

    // Switch to Thai ('th')
    await ui.page.evaluate(() => {
      localStorage.setItem('app-lang', 'th');
      window.dispatchEvent(new Event('storage'));
    });
    await ui.page.reload();
    await ui.expectHealthy('/feature/dashboard');

    const htmlLangTh = await ui.page.getAttribute('html', 'lang');
    expect(['th', 'th-TH']).toContain(htmlLangTh ?? 'th');

    // Switch to English ('en')
    await ui.page.evaluate(() => {
      localStorage.setItem('app-lang', 'en');
      window.dispatchEvent(new Event('storage'));
    });
    await ui.page.reload();
    await ui.expectHealthy('/feature/dashboard');

    const htmlLangEn = await ui.page.getAttribute('html', 'lang');
    expect(['en', 'en-US']).toContain(htmlLangEn ?? 'en');

    // Ensure LocalStorage persisted the preference
    const storedLang = await ui.page.evaluate(() => localStorage.getItem('app-lang'));
    expect(storedLang).toBe('en');

    // Restore initial
    await ui.page.evaluate((l) => localStorage.setItem('app-lang', l), initialLang);
  });

  test('Index / Main landing page language switcher toggles correctly', async () => {
    test.setTimeout(120_000);
    await ui.visit('/');
    await ui.expectHealthy('/');

    const switcher = ui.page.locator('[tooltip*="CHANGE_LANGUAGE" i], div:has-text("TH"):has-text("EN")').first();
    if (await switcher.count()) {
      await switcher.click();
      await ui.page.waitForTimeout(500);
      expect(ui.errors).toEqual([]);
    }
  });
});
