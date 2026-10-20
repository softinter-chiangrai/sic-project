import { test, expect } from '@playwright/test';
import { Ui } from '../ui';

let ui: Ui;
test.beforeAll(async ({ browser }) => {
  ui = await Ui.open(browser);
});
test.afterAll(async () => {
  await ui?.close();
});

// สลับภาษาสดจากปุ่มใน sidebar แล้ว option ของ combobox ต้องเปลี่ยนตาม (ไม่ reload)
test.describe('Combobox follows the system language', () => {
  for (const { path, th, en } of [
    { path: '/feature/pm/design-review', th: 'เปิดรายการ', en: 'Open' },
    { path: '/feature/pm/requirement', th: 'ฉบับร่าง', en: 'Draft' },
  ]) {
    test(`options switch language live on ${path}`, async () => {
      test.setTimeout(120_000);
      await ui.visit(path);
      await ui.page.evaluate(() => localStorage.setItem('app-lang', 'th'));
      await ui.page.reload();
      await ui.expectHealthy(path);

      const field = ui.page.locator('sic-combobox .sic-combobox__field-input').first();
      const option = ui.page.locator('.sic-combobox__option-label');

      await field.click();
      await expect(option.filter({ hasText: th }).first()).toBeVisible();
      await ui.page.keyboard.press('Escape');

      await ui.page.locator('button:has(img[src*="language.png"]):visible').first().click();
      await field.click();
      await expect(option.filter({ hasText: new RegExp(`^${en}$`) }).first()).toBeVisible();
      await ui.page.keyboard.press('Escape');

      expect(ui.errors).toEqual([]);
    });
  }
});
