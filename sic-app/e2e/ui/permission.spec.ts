import { test, expect } from '@playwright/test';
import { World } from '../api/world';
import { mock } from '../api';
import { Ui } from '../ui';

// Role permission matrix: tick everything, save, check it persisted; clear everything, save, check again.
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

const rowsOf = (b: any): any[] => (Array.isArray(b) ? b : (b?.data ?? b?.content ?? []));

test('role permissions: select all -> save -> clear all -> save', async () => {
  test.setTimeout(240_000);
  const roleId = await w.make('/api/su/business-roles/save', { businessId: w.api.businessId, roleCode: mock('ROLE'), roleNameEn: 'Perm UI role', roleNameLocal: 'Perm UI role', sortOrder: 99, isActive: true, state: 4 }, '/api/su/business-roles/{id}');
  const granted = async () => {
    const r = await w.api.get('/api/su/business-role-programs/paging', { pageNumber: 1, pageSize: 500, businessRoleId: roleId });
    expect(r.status, JSON.stringify(r.body).slice(0, 200)).toBe(200);
    return rowsOf(r.body).filter((x) => x.add === true || x.isAdd === true || x.active === true || x.isActive === true).length;
  };

  await ui.visit(`/feature/bu/permission/${roleId}`);
  await ui.page.getByRole('button', { name: 'Select All', exact: true }).click();
  await ui.page.getByRole('button', { name: /save permissions/i }).click();
  await expect.poll(granted, { timeout: 15_000, message: 'permissions were not stored' }).toBeGreaterThan(0);

  await ui.visit(`/feature/bu/permission/${roleId}`);
  await ui.page.getByRole('button', { name: 'Clear All', exact: true }).click();
  await ui.page.getByRole('button', { name: /save permissions/i }).click();
  await expect.poll(granted, { timeout: 15_000, message: 'permissions were not cleared' }).toBe(0);
});
