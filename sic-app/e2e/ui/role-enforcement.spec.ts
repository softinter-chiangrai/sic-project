import { test, expect } from '@playwright/test';
import { World } from '../api/world';
import { userId } from '../api';
import { sql } from '../infra/db';
import { Ui } from '../ui';

// role "ดูได้อย่างเดียว" ของหน้าลูกค้า (PMRT01): ปุ่มเพิ่ม/แก้ไข/ลบ/บันทึกต้องไม่แสดง และเข้าหน้า /new ไม่ได้;
// หน้าที่มีสิทธิ์เต็ม (สัญญา PMRT04) ยังเห็นปุ่มตามปกติ
let w: World;
let ui: Ui;
let customerId: string;
let saved: string[] = [];

const scope = async (program: string) => `brp.id IN (
  SELECT x.id FROM su_business_role_program x
  JOIN su_program p ON p.id = x.program_id
  JOIN su_user_business_role ubr ON ubr.business_role_id = x.business_role_id
  JOIN su_user_business ub ON ub.id = ubr.user_business_id
  WHERE p.program_code = '${program}' AND ub.user_id = '${await userId()}' AND ub.business_id = '${w.api.businessId}')`;

test.beforeAll(async ({ browser }) => {
  w = await World.create();
  customerId = await w.customer();
  const where = await scope('PMRT01');
  saved = sql(`SELECT brp.id || ',' || brp.is_add || ',' || brp.is_save || ',' || brp.is_remove || ',' || brp.is_print
               FROM su_business_role_program brp WHERE ${where}`).split('\n').filter(Boolean);
  expect(saved.length).toBeGreaterThan(0);
  sql(`UPDATE su_business_role_program brp SET is_add = false, is_save = false, is_remove = false, is_print = false WHERE ${where}`);
  ui = await Ui.open(browser); // เปิดหลังตั้งสิทธิ์ แอปโหลดสิทธิ์ครั้งเดียวตอนเริ่ม
});

test.afterAll(async () => {
  await ui?.close();
  for (const row of saved) {
    const [id, add, save, remove, print] = row.split(',');
    sql(`UPDATE su_business_role_program SET is_add = ${add}, is_save = ${save}, is_remove = ${remove}, is_print = ${print} WHERE id = '${id}'`);
  }
  await w?.cleanup();
});

test('view-only list: add / edit / delete icons are hidden', async () => {
  await ui.visit('/feature/pm/customer');
  const { page } = ui;
  await expect(page.locator('[data-perm~="edit"]').first()).toBeAttached({ timeout: 30_000 }); // แถวโหลดแล้ว
  for (const kind of ['add', 'edit', 'remove']) {
    const icons = page.locator(`[data-perm~="${kind}"]`);
    const n = await icons.count();
    for (let i = 0; i < n; i++) await expect(icons.nth(i), `${kind} #${i}`).toBeHidden();
  }
});

test('view-only form: /new is blocked, /edit has no save button', async () => {
  const { page } = ui;
  await ui.visit('/feature/pm/customer');
  // นำทางภายในแอป (เหมือนกดปุ่มข้ามหน้า) ให้ router + guard ทำงาน
  await page.evaluate(() => {
    history.pushState({}, '', '/feature/pm/customer/new');
    dispatchEvent(new PopStateEvent('popstate'));
  });
  await expect(page.getByText('คุณไม่มีสิทธิ์เพิ่มข้อมูลในหน้านี้')).toBeVisible({ timeout: 15_000 });
  await expect.poll(() => page.url()).not.toMatch(/\/customer\/new/);

  await ui.visit(`/feature/pm/customer/${customerId}/edit`);
  await expect(page.locator('form').first()).toBeVisible({ timeout: 30_000 });
  await expect(page.locator('form button[type="submit"]').first()).toBeHidden();
});

test('full-right page still shows its buttons', async () => {
  await ui.visit('/feature/pm/contract');
  await expect(ui.page.locator('[data-perm~="add"]').first()).toBeVisible({ timeout: 30_000 });
});
