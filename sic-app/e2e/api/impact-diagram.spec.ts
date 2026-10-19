import { test, expect } from '@playwright/test';
import { World } from './world';
import { userId } from '../api';

// Impact analysis keeps ONE diagram impact for every drawing type (was separate DFD and ER fields):
// saved, returned, snapshotted into the history and restored from it.

let w: World;
test.beforeAll(async () => {
  w = await World.create();
});
test.afterAll(async () => {
  await w?.cleanup();
});

const changeRequest = async () =>
  w.make(
    '/api/pm/change-requests',
    { projectId: await w.project(), targetType: 'SPECIFICATION', targetId: await w.approvedSpec(), title: 'E2E diagram impact CR', changeReason: 'e2e', priority: 'MEDIUM', assigneeId: await userId() },
    '/api/pm/change-requests/{id}',
  );

test('diagram impact is saved, returned, and no DFD / ER fields are left', async () => {
  const crId = await changeRequest();
  const save = await w.api.post('/api/pm/impact-analysis/save', { changeRequestId: crId, diagramImpact: 'E2E flowchart + sequence change', uiImpact: 'minor' });
  expect(save.status, JSON.stringify(save.body)).toBeLessThan(300);

  const got = await w.api.get(`/api/pm/impact-analysis/change-request/${crId}`);
  expect(got.status).toBe(200);
  const body = got.body.data ?? got.body;
  expect(body.diagramImpact).toBe('E2E flowchart + sequence change');
  expect(body).not.toHaveProperty('dfdImpact');
  expect(body).not.toHaveProperty('erImpact');
});

test('the history keeps the diagram impact and restoring brings it back', async () => {
  const crId = await changeRequest();
  await w.api.post('/api/pm/impact-analysis/save', { changeRequestId: crId, diagramImpact: 'E2E first diagram impact' });
  await w.api.post('/api/pm/impact-analysis/save', { changeRequestId: crId, diagramImpact: 'E2E second diagram impact' });

  const hist = await w.api.get(`/api/pm/impact-analysis/history/${crId}`);
  expect(hist.status).toBe(200);
  const items: any[] = hist.body.data ?? hist.body;
  expect(items.length).toBeGreaterThanOrEqual(2);
  // creating the CR already records an AUTO analysis: our two saves are the two newest versions
  const byVersion = [...items].sort((a, b) => b.versionNo - a.versionNo);
  const first = items.find((h) => h.snapshot?.diagramImpact === 'E2E first diagram impact') ?? byVersion[1];

  const restored = await w.api.post(`/api/pm/impact-analysis/history/${first.historyId ?? first.id}/restore`, {});
  expect(restored.status, JSON.stringify(restored.body)).toBeLessThan(300);
  const now = (await w.api.get(`/api/pm/impact-analysis/change-request/${crId}`)).body;
  expect((now.data ?? now).diagramImpact).toBe('E2E first diagram impact');
});
