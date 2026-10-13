import { test, expect } from '@playwright/test';
import { World, today } from '../api/world';
import { mock } from '../api';
import { Ui } from '../ui';

// The version badge on a document's screen shows the latest APPROVED version, not a newer draft or rejected revision.
test.describe.configure({ mode: 'serial' });

let w: World;
let ui: Ui;
let ids: { requirement: string; specification: string; delivery: string; manual: string };

async function addVersion(documentType: string, documentId: string, versionNo: string, approvalStatus: string) {
  const r = await w.api.post('/api/pm/document-versions', { documentType, documentId, versionNo, approvalStatus, changeSummary: 'ui' });
  expect(r.status, JSON.stringify(r.body)).toBeLessThan(300);
  await new Promise((res) => setTimeout(res, 15));
}

test.beforeAll(async ({ browser }) => {
  test.setTimeout(180_000);
  w = await World.create();
  ui = await Ui.open(browser);
  const projectId = await w.project();
  ids = {
    requirement: await w.make('/api/pm/requirement/save', { requirementCode: mock('R'), title: 'UI version req', description: 'd', projectId, state: 4, isActive: true }, '/api/pm/requirement/{id}'),
    specification: await w.specification(),
    delivery: await w.make('/api/pm/delivery/save', { projectId, deliveryCode: mock('D'), deliveryTitle: 'UI version delivery', deliveryDate: today(), state: 4 }, '/api/pm/delivery/{id}'),
    manual: await w.make('/api/pm/manual/save', { projectId, manualCode: mock('M'), manualTitle: 'UI version manual', state: 4, sections: [] }, '/api/pm/manual/{id}'),
  };
  // approved v4.1.0, then a newer draft and a newer rejected revision
  for (const [type, id] of [['REQUIREMENT', ids.requirement], ['SPECIFICATION', ids.specification], ['DELIVERY', ids.delivery], ['USER_MANUAL', ids.manual]] as const) {
    await addVersion(type, id, 'v4.1.0', 'APPROVED');
    await addVersion(type, id, 'v4.2.0', 'DRAFT');
    await addVersion(type, id, 'v4.3.0', 'REJECTED');
  }
});
test.afterAll(async () => {
  await ui?.close();
  await w?.cleanup();
});

const badge = () => ui.page.locator('sic-version-badge').first();

for (const [name, route, key] of [
  ['requirement', '/feature/pm/requirement/:id/edit', 'requirement'],
  ['specification', '/feature/pm/specification/:id/edit', 'specification'],
  ['delivery', '/feature/pm/delivery/:id/edit', 'delivery'],
  ['user manual', '/feature/pm/manual/:id/edit', 'manual'],
] as const) {
  test(`${name}: the screen shows the approved version`, async () => {
    await ui.visit(route.replace(':id', ids[key]));
    await ui.expectHealthy(route);
    await expect(badge()).toBeVisible({ timeout: 30_000 });
    await expect(badge()).toContainText('v4.1.0');
    await expect(badge()).not.toContainText('v4.2.0');
    await expect(badge()).not.toContainText('v4.3.0');
  });
}

test('requirement list shows the approved version in the Version column', async () => {
  await ui.visit('/feature/pm/requirement');
  await ui.expectHealthy('/feature/pm/requirement');
  const row = ui.page.locator('tr, .sic-gridpanel__row').filter({ hasText: 'UI version req' }).first();
  await expect(row).toBeVisible({ timeout: 30_000 });
  await expect(row).toContainText('v4.1.0');
  await expect(row).not.toContainText('v4.3.0');
});
