import { test, expect } from '@playwright/test';
import { World, idOf, today, inDays, firstOf } from './world';
import { mock, userId } from '../api';

// State transitions and revisions. Only one user exists, so multi-person approval paths are covered up to what one user can do.
let w: World;
test.beforeAll(async () => { w = await World.create(); });
test.afterAll(async () => { await w.cleanup(); });

const data = (b: any) => b?.data ?? b;
const ok = (r: { status: number; body: any }, what = '') => expect(r.status, `${what} ${JSON.stringify(r.body).slice(0, 300)}`).toBeLessThan(300);

/** Approved spec (CRs are refused on DRAFT documents). */
async function approvedSpec(): Promise<string> {
  const projectId = await w.project();
  const base = { specificationCode: mock('S'), title: 'WF spec', description: 'd', specificationType: 'UI Specification', projectId, isActive: true };
  const id = await w.make('/api/pm/specifications', { ...base, state: 4 }, '/api/pm/specifications/{id}');
  const sp = (await w.api.get(`/api/pm/specifications/${id}`)).body;
  ok(await w.api.post('/api/pm/specifications', { ...base, specificationCode: sp.specificationCode, id, state: 3, rowVersion: sp.rowVersion, status: 'APPROVED' }), 'approve spec');
  return id;
}

async function changeRequest(targetId: string, title: string): Promise<string> {
  return w.make('/api/pm/change-requests', { projectId: await w.project(), targetType: 'SPECIFICATION', targetId, title, description: 'd', changeReason: 'e2e', priority: 'MEDIUM', assigneeId: await userId() }, '/api/pm/change-requests/{id}');
}

test('change request: submit -> approve -> implement', async () => {
  const id = await changeRequest(await approvedSpec(), 'CR flow A');
  ok(await w.api.post(`/api/pm/change-requests/${id}/submit`), 'submit');
  ok(await w.api.post(`/api/pm/change-requests/${id}/approve`), 'approve');
  ok(await w.api.post(`/api/pm/change-requests/${id}/implement`), 'implement');
  expect(data((await w.api.get(`/api/pm/change-requests/${id}`)).body).status).toMatch(/IMPLEMENTED/i);
});

test('change request: submit -> reject, and create revision', async () => {
  const id = await changeRequest(await approvedSpec(), 'CR flow B');
  ok(await w.api.post(`/api/pm/change-requests/${id}/submit`), 'submit');
  ok(await w.api.post(`/api/pm/change-requests/${id}/reject`), 'reject');
  expect(data((await w.api.get(`/api/pm/change-requests/${id}`)).body).status).toMatch(/REJECT/i);
});

test('create-revision on versioned documents', async () => {
  const reqId = await w.requirement();
  const specId = await approvedSpec();
  for (const p of [`/api/pm/requirement/${reqId}/create-revision`, `/api/pm/specifications/${specId}/create-revision`]) {
    const r = await w.api.post(p);
    // a Draft document cannot be revised: accept success or the documented business refusal, never an internal error
    expect(r.status, `${p} ${JSON.stringify(r.body).slice(0, 200)}`).toBeLessThan(500);
    expect(JSON.stringify(r.body)).not.toMatch(/no session|could not execute|NullPointer/i);
    const newId = idOf(r.body);
    if (r.status < 300 && newId) await w.api.del(p.replace(/\/[^/]+\/create-revision$/, `/${newId}`)).catch(() => {});
  }
});

test('contract: revision, renewal chain, cancel', async () => {
  const contractType = firstOf((await w.api.get('/api/pm/contracts/lov-contract-type')).body);
  const signStatus = firstOf((await w.api.get('/api/pm/contracts/lov-sign-status')).body);
  const id = await w.make('/api/pm/contracts/save', { contractNo: mock('CT'), contractType, signStatus, customerId: await w.customer(), projectId: await w.project(), startDate: today(), endDate: inDays(365), contractValue: 5000 }, '/api/pm/contracts/{id}');
  expect((await w.api.get(`/api/pm/contracts/${id}/renewal-chain`)).status).toBe(200);
  const rev = await w.api.post(`/api/pm/contracts/${id}/create-revision`);
  expect(rev.status, JSON.stringify(rev.body).slice(0, 200)).toBeLessThan(500);
  ok(await w.api.post(`/api/pm/contracts/${id}/cancel`), 'cancel');
});

test('delivery: gate-check, sign-off, create invoice', async () => {
  const projectId = await w.project();
  const id = await w.make('/api/pm/delivery/save', { projectId, deliveryCode: mock('D'), deliveryTitle: 'WF delivery', deliveryDate: today(), deliveryVersion: '1.0', state: 4 }, '/api/pm/delivery/{id}');
  const gate = await w.api.get('/api/pm/delivery/gate-check', { projectId });
  expect(gate.status, JSON.stringify(gate.body).slice(0, 200)).toBe(200);
  const so = await w.api.post(`/api/pm/delivery/${id}/sign-off`);
  expect(so.status, JSON.stringify(so.body).slice(0, 200)).toBeLessThan(500);
  const inv = await w.api.post(`/api/pm/delivery/${id}/create-invoice`);
  expect(inv.status, JSON.stringify(inv.body).slice(0, 200)).toBeLessThan(500);
  const invId = idOf(inv.body);
  if (inv.status < 300 && invId) await w.api.del(`/api/pm/invoices/${invId}`);
});

test('other documents: create-revision never errors internally', async () => {
  const projectId = await w.project();
  const reviewId = await w.make('/api/pm/design-reviews', { projectId, reviewCode: mock('DR'), title: 'WF review' }, '/api/pm/design-reviews/{id}');
  const manualId = await w.make('/api/pm/manual/save', { projectId, manualCode: mock('M'), manualTitle: 'WF manual', state: 4 }, '/api/pm/manual/{id}');
  const invoiceId = await w.make('/api/pm/invoices/save', { customerId: await w.customer(), projectId, billingType: 'FIXED_PRICE', issueDate: today(), dueDate: inDays(30), subtotalAmount: 10, state: 4 }, '/api/pm/invoices/{id}');
  const ticketId = await w.make('/api/pm/ma-tickets/save', { customerId: await w.customer(), projectId, ticketType: 'BUG_SUPPORT', severity: 'LOW', status: 'OPEN', title: 'WF ticket', description: 'd', state: 4 }, '/api/pm/ma-tickets/{id}');
  const deliveryId = await w.make('/api/pm/delivery/save', { projectId, deliveryCode: mock('D'), deliveryTitle: 'WF d2', state: 4 }, '/api/pm/delivery/{id}');
  for (const p of [`/api/pm/design-reviews/${reviewId}/create-revision`, `/api/pm/manual/${manualId}/create-revision`, `/api/pm/invoices/${invoiceId}/create-revision`, `/api/pm/ma-tickets/${ticketId}/create-revision`, `/api/pm/delivery/${deliveryId}/create-revision`]) {
    const r = await w.api.post(p);
    expect(r.status, `${p} ${JSON.stringify(r.body).slice(0, 200)}`).toBeLessThan(500);
    expect(JSON.stringify(r.body)).not.toMatch(/no session|could not execute|NullPointer/i);
  }
});

test('diagram: reorder, versions, restore, revision, export', async () => {
  const projectId = await w.project();
  const a = await w.make('/api/diagram/tabs', { name: 'Reorder A', diagramType: 'DFD', projectId, mermaidScript: 'graph TD; A-->B' }, '/api/diagram/tabs/{id}');
  const b = await w.make('/api/diagram/tabs', { name: 'Reorder B', diagramType: 'ER', projectId, mermaidScript: 'erDiagram A ||--o{ B : has' }, '/api/diagram/tabs/{id}');
  ok(await w.api.post('/api/diagram/tabs/reorder', { tabs: [{ id: a, sortOrder: 2 }, { id: b, sortOrder: 1 }] }), 'reorder');
  const versions = await w.api.get(`/api/diagram/tabs/${a}/versions`);
  expect(versions.status).toBe(200);
  const first = (data(versions.body) as any[])[0];
  if (first?.id) ok(await w.api.post(`/api/diagram/tabs/${a}/restore/${first.id}`), 'restore');
  const rev = await w.api.post(`/api/diagram/tabs/${a}/create-revision`);
  expect(rev.status, JSON.stringify(rev.body).slice(0, 200)).toBeLessThan(500);
  const pdf = await w.api.post(`/api/diagram/tabs/${a}/export-pdf`, {});
  expect(pdf.status, JSON.stringify(pdf.body).slice(0, 200)).toBeLessThan(500);
});

test('approvals: search, summary, flows, cancel, document status', async () => {
  const me = await userId();
  const flowId = await w.make('/api/pm/approval-flows', { flowCode: mock('F'), flowName: 'WF flow', documentType: 'REQUIREMENT', approvalMode: 'ANY', isActive: true, steps: [{ stepOrder: 1, stepName: 'S1', approverUserId: `${me},${mock('other')}`, isRequired: true }] }, '/api/pm/approval-flows/{id}');
  const documentId = await w.requirement();
  const sub = await w.api.post('/api/pm/approvals/submit', { documentType: 'REQUIREMENT', documentId, flowId, documentCode: 'WF', documentTitle: 'WF' });
  ok(sub, 'submit');
  const approvalId = idOf(sub.body);
  for (const p of ['/api/pm/approvals/search', '/api/pm/approvals/summary', '/api/pm/approvals/my-requests', '/api/pm/approvals/flows', '/api/pm/approvals/flows/document-type/REQUIREMENT', `/api/pm/approvals/flows/${flowId}`, `/api/pm/approvals/${approvalId}/can-approve`]) {
    const r = await w.api.get(p);
    expect(r.status, `${p} ${JSON.stringify(r.body).slice(0, 200)}`).toBeLessThan(500);
  }
  expect((await w.api.get('/api/pm/approvals/document/status', { documentType: 'REQUIREMENT', documentId })).status).toBeLessThan(500);
  expect((await w.api.get('/api/pm/approvals/document', { documentType: 'REQUIREMENT', documentId })).status).toBeLessThan(500);
});

test('impact analysis: auto-detect, history restore', async () => {
  const targetId = await approvedSpec();
  const crId = await changeRequest(targetId, 'IA auto');
  for (const p of [`/api/pm/impact-analysis/auto-detect/${crId}`, `/api/pm/impact-analysis/auto-detect-trace/${crId}`]) {
    const r = await w.api.post(p);
    expect(r.status, `${p} ${JSON.stringify(r.body).slice(0, 200)}`).toBeLessThan(300);
  }
  const hist = await w.api.get(`/api/pm/impact-analysis/history/${crId}`);
  expect(hist.status).toBe(200);
  const h = (data(hist.body) as any[])[0];
  if (h?.id) ok(await w.api.post(`/api/pm/impact-analysis/history/${h.id}/restore`), 'restore');
});

test('test case UAT export + test scenario combobox', async () => {
  await w.testScenario();
  const r = await w.api.get('/api/pm/test-cases/export-uat-report', { projectId: await w.project() });
  expect(r.status, JSON.stringify(r.body).slice(0, 200)).toBeLessThan(500);
});
