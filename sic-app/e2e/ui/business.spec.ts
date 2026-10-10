import { test, expect } from '@playwright/test';
import { World } from '../api/world';
import { mock } from '../api';
import { sql } from '../infra/db';
import { Ui } from '../ui';
import { fillAndSave } from './forms';

// Business-level screens driven by hand: member invites and creating a business.
let w: World;
let ui: Ui;
test.beforeAll(async ({ browser }) => {
  w = await World.create();
  ui = await Ui.open(browser);
});
test.afterAll(async () => {
  await ui?.close();
  await w?.cleanup();
});

const rows = (b: any): any[] => (Array.isArray(b) ? b : (b?.data ?? []));

test('invite a member by e-mail: create, listed, delete', async () => {
  test.setTimeout(240_000);
  const email = `${mock('inv').toLowerCase()}@example.test`;
  await ui.visit('/feature/bu/team/add');
  await fillAndSave(ui.page, { inviteEmail: email }); // role = first option (required)
  const list = async () => rows((await w.api.get('/api/business/invite', { page: 0, size: 500, pageSize: 500, keyword: email })).body).filter((i) => i.inviteEmail === email || JSON.stringify(i).includes(email));
  await expect.poll(async () => (await list()).length, { message: 'invite not stored' }).toBe(1);

  // close the success dialog, then the page lists the invite; Delete removes it
  await ui.page.getByRole('button', { name: 'Close', exact: true }).first().click({ timeout: 3000 }).catch(() => {});
  const row = ui.page.locator('tr, .sic-gridpanel__row').filter({ hasText: email }).first();
  await expect(row).toBeVisible({ timeout: 20_000 });
  await row.getByRole('button', { name: /delete/i }).click();
  await ui.page.getByRole('button', { name: 'Confirm', exact: true }).click();
  await expect.poll(async () => (await list()).length, { timeout: 15_000, message: 'invite still exists after delete' }).toBe(0);
});

test('create a business through the form', async () => {
  test.setTimeout(240_000);
  const code = `E${Math.random().toString(36).slice(2, 6)}`; // maxLength(5) on this form
  const before = new Set(rows((await w.api.get('/api/business/my-business')).body).map((b) => b.id));
  await ui.visit('/management/business/create');
  await fillAndSave(ui.page, { businessCode: code }); // businessCode is required on this form but not flagged invalid
  const created = rows((await w.api.get('/api/business/my-business')).body).filter((b) => !before.has(b.id));
  try {
    expect(created.length, 'new business should appear in my-business').toBe(1);
  } finally {
    // keep runs that keep the DB tidy: hide what the form made (FKs forbid a hard delete)
    for (const b of created) {
      sql(`UPDATE su_user_business SET is_delete=true WHERE business_id='${b.id}'`);
      sql(`UPDATE su_business SET is_delete=true, is_active=false WHERE id='${b.id}'`);
    }
  }
});
