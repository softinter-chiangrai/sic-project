import { test, expect } from '@playwright/test';
import { Ui } from '../ui';
import { World } from '../api/world';
import { userId } from '../api';

// Diagrams of every drawing type (not only DFD / ER) show up in a document's trace links with a working link,
// and the change request impact shows one "Diagram:" line. Data from World, removed in afterAll.

let ui: Ui;
let w: World;
test.beforeAll(async ({ browser }) => {
  w = await World.create();
  ui = await Ui.open(browser);
});
test.afterAll(async () => {
  await ui?.close();
  await w?.cleanup();
});

test('a Sequence diagram linked to a requirement is listed and opens the diagram page', async () => {
  const projectId = await w.project();
  const requirementId = await w.requirement();
  const name = `E2E sequence ${Math.random().toString(36).slice(2, 6)}`;
  const diagramId = await w.make('/api/diagram/tabs', { name, diagramType: 'Sequence', projectId, mermaidScript: 'sequenceDiagram\n  A->>B: hi' }, '/api/diagram/tabs/{id}');
  // the link type the picker sends for a diagram is its drawing type
  const link = await w.api.post('/api/trace/links', { projectId, sourceType: 'REQUIREMENT', sourceId: requirementId, targetType: 'Sequence', targetId: diagramId, relationshipType: 'DESIGNED_BY' });
  expect(link.status, JSON.stringify(link.body)).toBeLessThan(300);

  await ui.visit(`/feature/pm/requirement/${requirementId}/edit`);
  await ui.expectHealthy('/feature/pm/requirement/:id/edit');
  const entry = ui.page.locator('sic-trace-link-panel a').filter({ hasText: name });
  await expect(entry).toBeVisible({ timeout: 30_000 });
  await entry.click();
  // the query must survive (a string routerLink used to encode it as %3F)
  await ui.page.waitForURL((u) => u.pathname === '/feature/pm/diagram' && u.searchParams.get('tabId') === diagramId);
});

test('the change request impact shows a single Diagram line', async () => {
  const crId = await w.make(
    '/api/pm/change-requests',
    { projectId: await w.project(), targetType: 'SPECIFICATION', targetId: await w.approvedSpec(), title: 'E2E diagram impact UI', changeReason: 'e2e', priority: 'MEDIUM', assigneeId: await userId() },
    '/api/pm/change-requests/{id}',
  );
  await w.api.post('/api/pm/impact-analysis/save', { changeRequestId: crId, diagramImpact: 'E2E sequence flow changes' });

  await ui.page.evaluate(() => localStorage.setItem('app-lang', 'en'));
  await ui.visit(`/feature/pm/change-request/${crId}/edit`);
  await ui.expectHealthy('/feature/pm/change-request/:id/edit');
  await expect(ui.page.getByText('E2E sequence flow changes')).toBeVisible({ timeout: 30_000 });
  await expect(ui.page.getByText('Diagram:', { exact: true })).toBeVisible();
  await expect(ui.page.getByText(/^(DFD|ER):$/)).toHaveCount(0);
});
