import { test, expect } from '@playwright/test';
import { World, idOf, inDays } from './world';
import { mock, userId } from '../api';

// approval flow + approval, document version, diagram tab, discussion, trace link, impact analysis. Full CRUD each.
test.describe.configure({ mode: 'serial' });

let w: World;
test.beforeAll(async () => { w = await World.create(); });
test.afterAll(async () => { await w.cleanup(); });

test('approval flow CRUD', async () => {
  const me = await userId();
  const b = (name: string) => ({ flowCode: mock('F'), flowName: name, documentType: 'REQUIREMENT', approvalMode: 'CHAIN', isActive: true, steps: [{ stepOrder: 1, stepName: 'Step 1', approverUserId: me, isRequired: true }] });
  const id = await w.make('/api/pm/approval-flows', b('Flow A'), '/api/pm/approval-flows/{id}');
  const got = await w.api.get(`/api/pm/approval-flows/${id}`);
  expect(got.status).toBe(200);
  const put = await w.api.put(`/api/pm/approval-flows/${id}`, { ...b('Flow B'), id, rowVersion: got.body.rowVersion ?? got.body.data?.rowVersion, flowCode: got.body.flowCode ?? got.body.data?.flowCode });
  expect(put.status, JSON.stringify(put.body)).toBe(200);
  expect((await w.api.get('/api/pm/approval-flows')).status).toBe(200);
});

test('approval submit (requester is sole approver -> auto-approved) + guards', async () => {
  const me = await userId();
  const flowId = await w.make('/api/pm/approval-flows', { flowCode: mock('F'), flowName: 'Flow for submit', documentType: 'REQUIREMENT', approvalMode: 'CHAIN', isActive: true, steps: [{ stepOrder: 1, stepName: 'Step 1', approverUserId: me, isRequired: true }] }, '/api/pm/approval-flows/{id}');
  const documentId = await w.requirement();
  const sub = await w.api.post('/api/pm/approvals/submit', { documentType: 'REQUIREMENT', documentId, flowId, documentCode: 'E2E', documentTitle: 'E2E Requirement', comment: 'please approve' });
  expect(sub.status, JSON.stringify(sub.body)).toBeLessThan(300);
  const approvalId = idOf(sub.body) ?? sub.body.approvalId;
  expect(approvalId).toBeTruthy();
  expect((await w.api.get(`/api/pm/approvals/${approvalId}`)).status).toBe(200);
  expect((await w.api.get('/api/pm/approvals/pending')).status).toBe(200);
  // only one user exists, so the requester is also the approver: the system approves at submit time
  expect(sub.body.status ?? sub.body.data?.status).toBe('APPROVED');
  // a finished approval cannot be approved or cancelled again
  expect((await w.api.post(`/api/pm/approvals/${approvalId}/approve`, { approvalId, comment: 'again' })).status).toBe(400);
  expect((await w.api.get('/api/pm/approvals/history')).status).toBe(200);
});

test('document version CRUD', async () => {
  const documentId = await w.requirement();
  const id = await w.make('/api/pm/document-versions', { documentType: 'REQUIREMENT', documentId, versionNo: mock('v'), projectId: await w.project(), changeSummary: 'e2e' }, '/api/pm/document-versions/{id}');
  expect((await w.api.get(`/api/pm/document-versions/${id}`)).status).toBe(200);
  const act = await w.api.post(`/api/pm/document-versions/${id}/activate`);
  expect(act.status, JSON.stringify(act.body)).toBeLessThan(300);
  expect((await w.api.get('/api/pm/document-versions', { documentType: 'REQUIREMENT', documentId })).status).toBe(200);
});

test('diagram tab CRUD', async () => {
  const b = (name: string) => ({ name, diagramType: 'DFD', projectId: undefined as unknown as string, requirementId: undefined as unknown as string, mermaidScript: 'graph TD; A-->B' });
  const projectId = await w.project();
  const requirementId = await w.requirement();
  const body = (name: string) => ({ ...b(name), projectId, requirementId });
  const id = await w.make('/api/diagram/tabs', body('Diagram A'), '/api/diagram/tabs/{id}');
  const got = await w.api.get(`/api/diagram/tabs/${id}`);
  expect(got.status).toBe(200);
  const put = await w.api.put(`/api/diagram/tabs/${id}`, { ...body('Diagram B'), id, rowVersion: got.body.rowVersion });
  expect(put.status, JSON.stringify(put.body)).toBeLessThan(300);
  const dup = await w.api.post(`/api/diagram/tabs/${id}/duplicate`);
  expect(dup.status, JSON.stringify(dup.body)).toBeLessThan(300);
  const dupId = idOf(dup.body);
  if (dupId) await w.api.del(`/api/diagram/tabs/${dupId}`);
  expect((await w.api.get(`/api/diagram/tabs/${id}/versions`)).status).toBe(200);
  expect((await w.api.get('/api/diagram/tabs', { projectId })).status).toBe(200);
});

test('discussion post / reply / edit / delete', async () => {
  const projectId = await w.project();
  const post = await w.api.post('/api/discussion/post', { targetId: projectId, subject: 'E2E subject', content: 'first post' });
  expect(post.status, JSON.stringify(post.body)).toBeLessThan(300);
  const postId = idOf(post.body);
  expect(postId).toBeTruthy();
  const rep = await w.api.post('/api/discussion/reply', { postId, content: 'a reply' });
  expect(rep.status, JSON.stringify(rep.body)).toBeLessThan(300);
  const replyId = idOf(rep.body);
  expect((await w.api.get(`/api/discussion/post/${postId}/replies`)).status).toBe(200);
  expect((await w.api.get(`/api/discussion/project/${projectId}`)).status).toBe(200);
  const edit = await w.api.put(`/api/discussion/comment/${replyId}`, { content: 'edited reply' });
  expect(edit.status, JSON.stringify(edit.body)).toBeLessThan(300);
  expect((await w.api.del(`/api/discussion/comment/${replyId}`)).status).toBeLessThan(300);
  expect((await w.api.del(`/api/discussion/comment/${postId}`)).status).toBeLessThan(300);
});

test('trace link create / read / delete', async () => {
  const projectId = await w.project();
  const sourceId = await w.requirement();
  const targetId = await w.specification();
  const r = await w.api.post('/api/trace/links', { projectId, sourceType: 'REQUIREMENT', sourceId, targetType: 'SPECIFICATION', targetId, relationshipType: 'DESIGNED_BY' });
  expect(r.status, JSON.stringify(r.body)).toBeLessThan(300);
  const linkId = idOf(r.body);
  expect((await w.api.get(`/api/trace/links/source/REQUIREMENT/${sourceId}`)).status).toBe(200);
  expect((await w.api.get(`/api/trace/links/target/SPECIFICATION/${targetId}`)).status).toBe(200);
  expect((await w.api.get(`/api/trace/trace/REQUIREMENT/${sourceId}`)).status).toBe(200);
  expect((await w.api.del(`/api/trace/links/${linkId}`)).status).toBeLessThan(300);
});

test('impact analysis save / read / delete', async () => {
  const projectId = await w.project();
  const spec = { specificationCode: mock('S'), title: 'IA target', description: 'd', specificationType: 'UI Specification', projectId, isActive: true };
  const targetId = await w.make('/api/pm/specifications', { ...spec, state: 4 }, '/api/pm/specifications/{id}');
  const sp = (await w.api.get(`/api/pm/specifications/${targetId}`)).body;
  await w.api.post('/api/pm/specifications', { ...spec, specificationCode: sp.specificationCode, id: targetId, state: 3, rowVersion: sp.rowVersion, status: 'APPROVED' });
  const crId = await w.make('/api/pm/change-requests', { projectId, targetType: 'SPECIFICATION', targetId, title: 'IA CR', description: 'd', changeReason: 'e2e', priority: 'MEDIUM', assigneeId: await userId() }, '/api/pm/change-requests/{id}');

  expect((await w.api.get('/api/pm/impact-analysis/preview', { targetType: 'SPECIFICATION', targetId })).status).toBe(200);
  const save = await w.api.post('/api/pm/impact-analysis/save', { changeRequestId: crId, uiImpact: 'minor', apiImpact: 'none', mandayImpact: 2, timelineImpact: 1, costImpact: '1000', impactedSpecIds: [targetId] });
  expect(save.status, JSON.stringify(save.body)).toBeLessThan(300);
  expect((await w.api.get(`/api/pm/impact-analysis/change-request/${crId}`)).status).toBe(200);
  expect((await w.api.get(`/api/pm/impact-analysis/history/${crId}`)).status).toBe(200);
  const iaId = idOf(save.body);
  if (iaId) expect((await w.api.del(`/api/pm/impact-analysis/${iaId}`)).status).toBeLessThan(300);
});
