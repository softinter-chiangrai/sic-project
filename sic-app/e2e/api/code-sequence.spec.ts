import { test, expect } from '@playwright/test';
import { World, today, inDays, idOf } from './world';
import { userId } from '../api';

// Generated document codes ("count + 1") must stay unique when several records are saved at the same moment,
// as AI batch create does (forkJoin): it once produced two PH-005.
let w: World;
test.beforeAll(async () => { w = await World.create(); });
test.afterAll(async () => { await w.cleanup(); });

const N = 6;

async function parallelCodes(path: string, body: (i: number) => unknown, del: string, get: (id: string) => string, codeKey: string) {
  const res = await Promise.all(Array.from({ length: N }, (_, i) => w.api.post(path, body(i))));
  for (const r of res) expect(r.status, JSON.stringify(r.body).slice(0, 200)).toBeLessThan(300);
  const ids = res.map((r) => idOf(r.body));
  const codes: string[] = [];
  for (const id of ids) {
    (w as any).stack.push(del.replace('{id}', id));
    const g = (await w.api.get(get(id))).body;
    codes.push((g?.data ?? g)[codeKey]);
  }
  expect(new Set(codes).size, `codes: ${codes.join(', ')}`).toBe(N);
}

test('phase codes', async () => {
  const projectId = await w.project();
  await parallelCodes(`/api/pm/projects/${projectId}/phases`, (i) => ({ projectId, phaseName: `P${i}`, startDate: today(), endDate: inDays(30) }),
    '/api/pm/phases/{id}', (id) => `/api/pm/phases/${id}`, 'phaseCode');
});

test('requirement codes', async () => {
  const projectId = await w.project();
  await parallelCodes('/api/pm/requirement/save', (i) => ({ title: `R${i}`, description: 'd', projectId, state: 4, isActive: true }),
    '/api/pm/requirement/{id}', (id) => `/api/pm/requirement/${id}`, 'requirementCode');
});

test('specification codes', async () => {
  const projectId = await w.project();
  const requirementId = await w.requirement();
  await parallelCodes('/api/pm/specifications', (i) => ({ title: `S${i}`, description: 'd', specificationType: 'UI Specification', projectId, requirementId, state: 4, isActive: true }),
    '/api/pm/specifications/{id}', (id) => `/api/pm/specifications/${id}`, 'specificationCode');
});

test('change request codes', async () => {
  const projectId = await w.project();
  const targetId = await w.approvedSpec();
  const me = await userId();
  await parallelCodes('/api/pm/change-requests', (i) => ({ projectId, targetType: 'SPECIFICATION', targetId, title: `CR${i}`, description: 'd', changeReason: 'e2e', priority: 'MEDIUM', assigneeId: me }),
    '/api/pm/change-requests/{id}', (id) => `/api/pm/change-requests/${id}`, 'crCode');
});

test('task codes', async () => {
  const workPackageId = await w.workPackage();
  await parallelCodes('/api/pm/tasks', (i) => ({ workPackageId, taskName: `T${i}`, startDate: today(), endDate: inDays(5), estimateManday: 1 }),
    '/api/pm/tasks/{id}', (id) => `/api/pm/tasks/${id}`, 'taskCode');
});
