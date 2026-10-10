import { test, expect } from '@playwright/test';
import { World, today, inDays } from './world';
import { mock, userId } from '../api';

// requirement -> specification -> test scenario/case -> bug -> design review -> change request. Full CRUD each.
test.describe.configure({ mode: 'serial' });

let w: World;
test.beforeAll(async () => { w = await World.create(); });
test.afterAll(async () => { await w.cleanup(); });

test('requirement CRUD', async () => {
  const projectId = await w.project();
  const body = (title: string) => ({ requirementCode: mock('R'), title, description: 'd', specificationType: 'UI Specification', projectId, isActive: true });
  const id = await w.make('/api/pm/requirement/save', { ...body('Req A'), state: 4 }, '/api/pm/requirement/{id}');
  const got = await w.api.get(`/api/pm/requirement/${id}`);
  expect(got.status).toBe(200);
  expect(got.body.title).toBe('Req A');
  const upd = await w.api.post('/api/pm/requirement/save', { ...body('Req B'), id, state: 3, rowVersion: got.body.rowVersion, requirementCode: got.body.requirementCode });
  expect(upd.status, JSON.stringify(upd.body)).toBeLessThan(300);
  expect((await w.api.get(`/api/pm/requirement/${id}`)).body.title).toBe('Req B');
  expect((await w.api.get('/api/pm/requirement', { businessId: w.api.businessId!, page: 0, size: 10 })).status).toBe(200);
});

test('specification CRUD', async () => {
  const projectId = await w.project();
  const requirementId = await w.requirement();
  const body = (title: string) => ({ specificationCode: mock('S'), title, description: 'd', specificationType: 'UI Specification', projectId, requirementId, isActive: true });
  const id = await w.make('/api/pm/specifications', { ...body('Spec A'), state: 4 }, '/api/pm/specifications/{id}');
  const got = await w.api.get(`/api/pm/specifications/${id}`);
  expect(got.status).toBe(200);
  const upd = await w.api.post('/api/pm/specifications', { ...body('Spec B'), id, state: 3, rowVersion: got.body.rowVersion, specificationCode: got.body.specificationCode });
  expect(upd.status, JSON.stringify(upd.body)).toBeLessThan(300);
  expect((await w.api.get(`/api/pm/specifications/${id}`)).body.title).toBe('Spec B');
});

test('test scenario CRUD', async () => {
  const base = { projectId: await w.project(), taskId: await w.task() };
  const id = await w.make('/api/pm/test-scenarios/save', { ...base, scenarioCode: mock('TS'), scenarioName: 'Scn A', state: 4 }, '/api/pm/test-scenarios/{id}');
  const got = await w.api.get(`/api/pm/test-scenarios/${id}`);
  expect(got.status).toBe(200);
  const upd = await w.api.post('/api/pm/test-scenarios/save', { ...base, id, state: 3, rowVersion: got.body.rowVersion, scenarioCode: got.body.scenarioCode, scenarioName: 'Scn B' });
  expect(upd.status, JSON.stringify(upd.body)).toBeLessThan(300);
  expect((await w.api.get(`/api/pm/test-scenarios/${id}`)).body.scenarioName).toBe('Scn B');
});

test('test case CRUD', async () => {
  const base = { projectId: await w.project(), scenarioId: await w.testScenario(), taskId: await w.task(), testStep: '1. open', expectedResult: 'ok' };
  const id = await w.make('/api/pm/test-cases/save', { ...base, testCaseCode: mock('TC'), title: 'Case A', state: 4 }, '/api/pm/test-cases/{id}');
  const got = await w.api.get(`/api/pm/test-cases/${id}`);
  expect(got.status).toBe(200);
  const upd = await w.api.post('/api/pm/test-cases/save', { ...base, id, state: 3, rowVersion: got.body.rowVersion, testCaseCode: got.body.testCaseCode, title: 'Case B' });
  expect(upd.status, JSON.stringify(upd.body)).toBeLessThan(300);
  expect((await w.api.get(`/api/pm/test-cases/${id}`)).body.title).toBe('Case B');
  expect((await w.api.get('/api/pm/test-cases/paging', { page: 0, size: 10 })).status).toBe(200);
});

test('bug CRUD', async () => {
  const projectId = await w.project();
  const id = await w.make('/api/pm/bugs/save', { projectId, bugCode: mock('B'), title: 'Bug A', state: 4 }, '/api/pm/bugs/{id}');
  const got = await w.api.get(`/api/pm/bugs/${id}`);
  expect(got.status).toBe(200);
  const upd = await w.api.post('/api/pm/bugs/save', { projectId, id, state: 3, rowVersion: got.body.rowVersion, bugCode: got.body.bugCode, title: 'Bug B' });
  expect(upd.status, JSON.stringify(upd.body)).toBeLessThan(300);
  expect((await w.api.get(`/api/pm/bugs/${id}`)).body.title).toBe('Bug B');
  expect((await w.api.get('/api/pm/bugs/paging', { page: 0, size: 10 })).status).toBe(200);
});

test('design review CRUD + comment', async () => {
  const projectId = await w.project();
  const base = { projectId, description: 'd', dueDate: inDays(7) };
  const id = await w.make('/api/pm/design-reviews', { ...base, reviewCode: mock('DR'), title: 'DR A' }, '/api/pm/design-reviews/{id}');
  const got = await w.api.get(`/api/pm/design-reviews/${id}`);
  expect(got.status).toBe(200);
  const upd = await w.api.post('/api/pm/design-reviews', { ...base, id, reviewCode: got.body.reviewCode, title: 'DR B' });
  expect(upd.status, JSON.stringify(upd.body)).toBeLessThan(300);
  expect((await w.api.get(`/api/pm/design-reviews/${id}`)).body.title).toBe('DR B');
  const c = await w.api.post(`/api/pm/design-reviews/${id}/comments`, { commentText: 'looks fine' });
  expect(c.status, JSON.stringify(c.body)).toBeLessThan(300);
});

test('change request CRUD + workflow', async () => {
  const projectId = await w.project();
  // CR is only allowed on non-DRAFT documents: approve a spec first
  const spec = { specificationCode: mock('S'), title: 'CR target', description: 'd', specificationType: 'UI Specification', projectId, isActive: true };
  const targetId = await w.make('/api/pm/specifications', { ...spec, state: 4 }, '/api/pm/specifications/{id}');
  const sp = (await w.api.get(`/api/pm/specifications/${targetId}`)).body;
  const ap = await w.api.post('/api/pm/specifications', { ...spec, specificationCode: sp.specificationCode, id: targetId, state: 3, rowVersion: sp.rowVersion, status: 'APPROVED' });
  expect(ap.status, JSON.stringify(ap.body)).toBeLessThan(300);
  const me = await userId(); // pm_change_request.assignee_id is NOT NULL
  const b = (title: string) => ({ projectId, targetType: 'SPECIFICATION', targetId, title, description: 'd', changeReason: 'e2e', priority: 'MEDIUM', assigneeId: me });
  const id = await w.make('/api/pm/change-requests', b('CR A'), '/api/pm/change-requests/{id}');
  expect((await w.api.get(`/api/pm/change-requests/${id}`)).status).toBe(200);
  const put = await w.api.put(`/api/pm/change-requests/${id}`, b('CR B'));
  expect(put.status, JSON.stringify(put.body)).toBe(200);
  expect((await w.api.get(`/api/pm/change-requests/${id}`)).body.title).toBe('CR B');
  const sub = await w.api.post(`/api/pm/change-requests/${id}/submit`);
  expect(sub.status, JSON.stringify(sub.body)).toBeLessThan(300);
  expect((await w.api.get('/api/pm/change-requests')).status).toBe(200);
});
