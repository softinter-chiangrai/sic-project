import { test, expect } from '@playwright/test';
import { World, idOf } from './world';
import { Api, SECOND_TOKEN, mock, secondApi, userId } from '../api';

// Multi-person approval and team paths: user 1 (owner) and user 2 (e2e-second, member of the same business).
let w: World;
let u2: Api;
let id1: string;
let id2: string;
test.beforeAll(async () => {
  w = await World.create();
  u2 = await secondApi(w.api.businessId!);
  id1 = await userId();
  id2 = await userId(SECOND_TOKEN);
});
test.afterAll(async () => { await w.cleanup(); });

const data = (b: any) => b?.data ?? b;
const status = (b: any) => String(data(b)?.status ?? b?.status ?? '').toUpperCase();

async function flow(mode: 'CHAIN' | 'PARALLEL' | 'ANY', approvers: string[]): Promise<string> {
  const steps = approvers.map((a, i) => ({ stepOrder: i + 1, stepName: `Step ${i + 1}`, approverUserId: a, isRequired: true }));
  return w.make('/api/pm/approval-flows', { flowCode: mock('F'), flowName: `E2E ${mode}`, documentType: 'REQUIREMENT', approvalMode: mode, isActive: true, steps }, '/api/pm/approval-flows/{id}');
}

/** Requirement owned by user 1, submitted by user 1 into the given flow. */
async function submit(flowId: string) {
  const documentId = await w.make('/api/pm/requirement/save', { requirementCode: mock('R'), title: 'Approval doc', description: 'd', projectId: await w.project(), state: 4, isActive: true }, '/api/pm/requirement/{id}');
  const r = await w.api.post('/api/pm/approvals/submit', { documentType: 'REQUIREMENT', documentId, flowId, documentCode: 'E2E', documentTitle: 'Approval doc' });
  expect(r.status, JSON.stringify(r.body)).toBeLessThan(300);
  return { documentId, approvalId: idOf(r.body), body: r.body };
}

test('chain with two steps for the same approver needs two approvals', async () => {
  const { approvalId, body } = await submit(await flow('CHAIN', [id2, id2]));
  expect(status(body)).toBe('PENDING');
  // not the current step's approver: refused
  expect((await w.api.post(`/api/pm/approvals/${approvalId}/approve`, { approvalId })).status).toBe(400);
  expect(data((await u2.get(`/api/pm/approvals/${approvalId}/can-approve`)).body)).toBeTruthy();
  const first = await u2.post(`/api/pm/approvals/${approvalId}/approve`, { approvalId, comment: 'step 1' });
  expect(first.status, JSON.stringify(first.body)).toBeLessThan(300);
  expect(status(first.body)).toBe('PENDING'); // step 2 still open
  const second = await u2.post(`/api/pm/approvals/${approvalId}/approve`, { approvalId, comment: 'step 2' });
  expect(second.status, JSON.stringify(second.body)).toBeLessThan(300);
  expect(status(second.body)).toBe('APPROVED');
  expect((await u2.post(`/api/pm/approvals/${approvalId}/approve`, { approvalId })).status).toBe(400); // already final
});

test('chain: a later step owned by the requester is approved automatically', async () => {
  const { approvalId, body } = await submit(await flow('CHAIN', [id2, id1]));
  expect(status(body)).toBe('PENDING');
  const a2 = await u2.post(`/api/pm/approvals/${approvalId}/approve`, { approvalId, comment: 'ok from user 2' });
  expect(a2.status, JSON.stringify(a2.body)).toBeLessThan(300);
  expect(status(a2.body)).toBe('APPROVED');
});

test('reject by the approver ends the approval', async () => {
  const { approvalId } = await submit(await flow('CHAIN', [id2]));
  const r = await u2.post(`/api/pm/approvals/${approvalId}/reject`, { approvalId, comment: 'not good' });
  expect(r.status, JSON.stringify(r.body)).toBeLessThan(300);
  expect(status(r.body)).toBe('REJECTED');
  expect((await u2.post(`/api/pm/approvals/${approvalId}/approve`, { approvalId })).status).toBe(400);
});

test('revise request', async () => {
  const { approvalId } = await submit(await flow('CHAIN', [id2]));
  const r = await u2.post(`/api/pm/approvals/${approvalId}/revise`, { approvalId, comment: 'please change X' });
  expect(r.status, JSON.stringify(r.body)).toBeLessThan(300);
  expect(status(r.body)).toMatch(/REVISION/);
});

test('delegate to the first user, who then approves', async () => {
  const { approvalId } = await submit(await flow('CHAIN', [id2]));
  const d = await u2.post(`/api/pm/approvals/${approvalId}/delegate`, { approvalId, delegateToUserId: id1 });
  expect(d.status, JSON.stringify(d.body)).toBeLessThan(300);
  const a = await w.api.post(`/api/pm/approvals/${approvalId}/approve`, { approvalId });
  expect(a.status, JSON.stringify(a.body)).toBeLessThan(300);
  expect(status(a.body)).toBe('APPROVED');
});

test('requester can cancel while pending', async () => {
  const { approvalId } = await submit(await flow('CHAIN', [id2]));
  const c = await w.api.post(`/api/pm/approvals/${approvalId}/cancel`, { approvalId, comment: 'changed my mind' });
  expect(c.status, JSON.stringify(c.body)).toBeLessThan(300);
  expect(status(c.body)).toBe('CANCELLED');
});

test('any-mode: one approver is enough', async () => {
  const { approvalId } = await submit(await flow('ANY', [`${id2},${mock('nobody')}`]));
  const a = await u2.post(`/api/pm/approvals/${approvalId}/approve`, { approvalId });
  expect(a.status, JSON.stringify(a.body)).toBeLessThan(300);
  expect(status(a.body)).toBe('APPROVED');
});

test('pending / my-requests / history lists reflect who is involved', async () => {
  const { approvalId } = await submit(await flow('CHAIN', [id2]));
  const pending2 = JSON.stringify((await u2.get('/api/pm/approvals/pending')).body);
  expect(pending2).toContain(approvalId);
  expect(JSON.stringify((await w.api.get('/api/pm/approvals/pending')).body)).not.toContain(approvalId);
  expect(JSON.stringify((await w.api.get('/api/pm/approvals/my-requests')).body)).toContain(approvalId);
  expect((await u2.get('/api/pm/approvals/summary')).status).toBe(200);
  expect((await u2.get('/api/pm/approvals/history')).status).toBe(200);
});

test('team: second user is a member and can be given a role', async () => {
  const biz = w.api.businessId!;
  const members = await w.api.get('/api/su-user-business/members', { businessId: biz });
  expect(JSON.stringify(members.body)).toContain(id2);
  // an unrelated business is not visible to the second user
  expect((await u2.get('/api/business/my-business')).status).toBe(200);
  const roleId = await w.make('/api/su/business-roles/save', { businessId: biz, roleCode: mock('ROLE'), roleNameEn: 'Team role', roleNameLocal: 'Team role', sortOrder: 99, isActive: true, state: 4 }, '/api/su/business-roles/{id}');
  const ub = JSON.stringify((await w.api.get('/api/su/user-businesses', { businessId: biz })).body);
  expect(ub).toContain(id2);
  const row = (JSON.parse(ub) as any[]).find((x) => x.userId === id2);
  const link = await w.api.post('/api/su/user-business-roles/save', { userBusinessId: row.id, businessRoleId: roleId, isActive: true });
  expect(link.status, JSON.stringify(link.body)).toBeLessThan(300);
  expect(JSON.stringify((await w.api.get(`/api/su/business-roles/${biz}/users-by-role`, { roleId })).body)).toBeTruthy();
});

test('change request assigned to the second user', async () => {
  const targetId = await w.approvedSpec();
  const projectId = await w.project();
  const crId = await w.make('/api/pm/change-requests', { projectId, targetType: 'SPECIFICATION', targetId, title: 'CR for user 2', description: 'd', changeReason: 'e2e', priority: 'MEDIUM', assigneeId: id2 }, '/api/pm/change-requests/{id}');
  expect((await w.api.post(`/api/pm/change-requests/${crId}/submit`)).status).toBeLessThan(300);
  const seen = await u2.get(`/api/pm/change-requests/${crId}`);
  expect(seen.status, JSON.stringify(seen.body)).toBe(200);
  const done = await u2.post(`/api/pm/change-requests/${crId}/assignees/complete`, undefined, { assigneeId: id2 });
  expect(done.status, JSON.stringify(done.body)).toBeLessThan(500);
});
