import { test, expect } from '@playwright/test';
import { World } from '../api/world';
import { userId } from '../api';
import { sql } from '../infra/db';
import { Ui } from '../ui';

// role "ดูได้อย่างเดียว" ของหน้าลูกค้า (PMRT01) และ MA (PMDT17): ปุ่มเพิ่ม/แก้ไข/ลบ/บันทึกต้องไม่แสดง และเข้าหน้า /new ไม่ได้;
// หน้าที่มีสิทธิ์เต็ม (สัญญา PMRT04) ยังเห็นปุ่มตามปกติ
let w: World;
let ui: Ui;
let customerId: string;
let ticketId: string;
let saved: string[] = [];

const scope = async (programs: string[]) => `brp.id IN (
  SELECT x.id FROM su_business_role_program x
  JOIN su_program p ON p.id = x.program_id
  JOIN su_user_business_role ubr ON ubr.business_role_id = x.business_role_id
  JOIN su_user_business ub ON ub.id = ubr.user_business_id
  WHERE p.program_code IN (${programs.map((p) => `'${p}'`).join(',')})
    AND ub.user_id = '${await userId()}' AND ub.business_id = '${w.api.businessId}')`;

/** ทุกปุ่มที่ติด data-perm ชนิดนี้ต้องซ่อน */
const expectAllHidden = async (kind: string) => {
  const icons = ui.page.locator(`[data-perm~="${kind}"]`);
  const n = await icons.count();
  for (let i = 0; i < n; i++) await expect(icons.nth(i), `${kind} #${i}`).toBeHidden();
};

test.beforeAll(async ({ browser }) => {
  w = await World.create();
  customerId = await w.customer();
  ticketId = await w.make('/api/pm/ma-tickets/save', {
    customerId, projectId: await w.project(), ticketType: 'BUG_SUPPORT', severity: 'LOW', status: 'OPEN',
    description: 'e2e issue', title: 'E2E view-only ticket', state: 4,
  }, '/api/pm/ma-tickets/{id}');
  await w.task(); // การ์ดบน Task board
  const where = await scope(['PMRT01', 'PMDT17', 'PMDT10']);
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

test('view-only list: add / edit / delete / print icons are hidden', async () => {
  await ui.visit('/feature/pm/customer');
  await expect(ui.page.locator('[data-perm~="edit"]').first()).toBeAttached({ timeout: 30_000 }); // แถวโหลดแล้ว
  for (const kind of ['add', 'edit', 'remove', 'print']) await expectAllHidden(kind);

  await ui.visit('/feature/pm/ma-ticket');
  await expect(ui.page.locator('sic-table-actions').first()).toBeAttached({ timeout: 30_000 });
  for (const kind of ['add', 'edit', 'remove', 'print']) await expectAllHidden(kind);
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
  await expectAllHidden('form-edit');
});

test('view-only detail page: no "edit" / print buttons', async () => {
  await ui.visit(`/feature/pm/ma-ticket/${ticketId}/view`);
  await expect(ui.page.locator('[data-perm~="edit"]').first()).toBeAttached({ timeout: 30_000 }); // ปุ่มแก้ไขของหน้า view
  for (const kind of ['edit', 'print', 'remove', 'form-edit']) await expectAllHidden(kind);
});

test('view-only task board: cards cannot be dragged', async () => {
  await ui.visit('/feature/pm/task-board');
  const cards = ui.page.locator('sic-kanban .cdk-drag');
  await expect.poll(() => cards.count(), { timeout: 30_000, message: 'no task cards rendered' }).toBeGreaterThan(0);
  expect(await ui.page.locator('sic-kanban .cdk-drag:not(.cdk-drag-disabled)').count()).toBe(0);
});

test('full-right page still shows its buttons', async () => {
  await ui.visit('/feature/pm/contract');
  await expect(ui.page.locator('[data-perm~="add"]').first()).toBeVisible({ timeout: 30_000 });
});

test('rights change applies without a page refresh', async () => {
  // เหมือน admin แก้สิทธิ์: backend ส่ง PERMISSION_CHANGED -> sidebar.reloadMenuPermissions()
  await ui.visit('/feature/pm/contract');
  const add = ui.page.locator('[data-perm~="add"]').first();
  await expect(add).toBeVisible({ timeout: 30_000 });
  const where = await scope(['PMRT04']);
  const before = sql(`SELECT brp.id || ',' || brp.is_add || ',' || brp.is_save FROM su_business_role_program brp WHERE ${where}`).split('\n').filter(Boolean);
  try {
    sql(`UPDATE su_business_role_program brp SET is_add = false, is_save = false WHERE ${where}`);
    await ui.page.evaluate(() => (window as any).ng.getComponent(document.querySelector('sic-sidebar')).reloadMenuPermissions());
    await expect(add).toBeHidden({ timeout: 15_000 });
  } finally {
    for (const row of before) {
      const [id, a, s] = row.split(',');
      sql(`UPDATE su_business_role_program SET is_add = ${a}, is_save = ${s} WHERE id = '${id}'`);
    }
  }
});
