import { test, expect } from '@playwright/test';
import { World, today, inDays, firstOf } from './world';
import { mock, userId } from '../api';

// Optimistic locking (rowVersion = postgres xmin) per module:
//  1. save with the current rowVersion works
//  2. rowVersion changes after a save, and any rowVersion the save answers with equals the stored one
//  3. a stale rowVersion is rejected
//  4. a second save with the fresh rowVersion works
test.describe.configure({ mode: 'default', retries: 0 });

let w: World;
/** body of the last POST, to check the rowVersion a create answers with */
let lastPost: any;
test.beforeAll(async () => {
  w = await World.create();
  const post = w.api.post;
  w.api.post = async (path: string, data?: unknown, params?: Record<string, string | number>) => {
    const r = await post(path, data, params);
    lastPost = r.body;
    return r;
  };
});
test.afterAll(async () => { await w.cleanup(); });

const data = (b: any) => b?.data ?? b;

type Mod = {
  name: string;
  create: () => Promise<string>;
  get: (id: string) => string;
  save: (id: string, got: any, label: string) => Promise<{ status: number; body: any }>;
};

async function probe(m: Mod) {
  lastPost = undefined;
  const id = await m.create();
  const created = data(lastPost);
  const g1 = data((await w.api.get(m.get(id))).body);
  expect.soft(g1.rowVersion, `${m.name}: GET returns rowVersion`).toBeTruthy();
  if (created && typeof created === 'object' && created.rowVersion != null) {
    expect.soft(created.rowVersion, `${m.name}: rowVersion in the create response equals the stored one`).toBe(g1.rowVersion);
  }

  const r1 = await m.save(id, g1, 'B');
  expect.soft(r1.status, `${m.name}: save with current rowVersion -> ${JSON.stringify(r1.body).slice(0, 200)}`).toBeLessThan(300);

  const g2 = data((await w.api.get(m.get(id))).body);
  expect.soft(g2.rowVersion, `${m.name}: rowVersion changes after save`).not.toBe(g1.rowVersion);
  const answered = data(r1.body)?.rowVersion;
  if (answered != null) {
    expect.soft(answered, `${m.name}: rowVersion in the save response equals the stored one`).toBe(g2.rowVersion);
  }

  const stale = await m.save(id, g1, 'C');
  expect.soft(stale.status, `${m.name}: stale rowVersion is rejected`).toBeGreaterThanOrEqual(400);

  const r3 = await m.save(id, g2, 'D');
  expect.soft(r3.status, `${m.name}: second save with fresh rowVersion -> ${JSON.stringify(r3.body).slice(0, 200)}`).toBeLessThan(300);
}

test('requirement', async () => {
  const projectId = await w.project();
  const b = (title: string) => ({ title, description: 'd', projectId, isActive: true });
  await probe({
    name: 'requirement',
    create: () => w.make('/api/pm/requirement/save', { ...b('A'), requirementCode: mock('R'), state: 4 }, '/api/pm/requirement/{id}'),
    get: (id) => `/api/pm/requirement/${id}`,
    save: (id, g, t) => w.api.post('/api/pm/requirement/save', { ...b(t), id, state: 3, rowVersion: g.rowVersion, requirementCode: g.requirementCode }),
  });
});

test('specification', async () => {
  const projectId = await w.project();
  const requirementId = await w.requirement();
  const b = (title: string) => ({ title, description: 'd', specificationType: 'UI Specification', projectId, requirementId, isActive: true });
  await probe({
    name: 'specification',
    create: () => w.make('/api/pm/specifications', { ...b('A'), specificationCode: mock('S'), state: 4 }, '/api/pm/specifications/{id}'),
    get: (id) => `/api/pm/specifications/${id}`,
    save: (id, g, t) => w.api.post('/api/pm/specifications', { ...b(t), id, state: 3, rowVersion: g.rowVersion, specificationCode: g.specificationCode }),
  });
});

test('test scenario', async () => {
  const base = { projectId: await w.project(), taskId: await w.task() };
  await probe({
    name: 'test scenario',
    create: () => w.make('/api/pm/test-scenarios/save', { ...base, scenarioCode: mock('TS'), scenarioName: 'A', state: 4 }, '/api/pm/test-scenarios/{id}'),
    get: (id) => `/api/pm/test-scenarios/${id}`,
    save: (id, g, t) => w.api.post('/api/pm/test-scenarios/save', { ...base, id, state: 3, rowVersion: g.rowVersion, scenarioCode: g.scenarioCode, scenarioName: t }),
  });
});

test('test case', async () => {
  const base = { projectId: await w.project(), scenarioId: await w.testScenario(), taskId: await w.task(), testStep: '1. open', expectedResult: 'ok' };
  await probe({
    name: 'test case',
    create: () => w.make('/api/pm/test-cases/save', { ...base, testCaseCode: mock('TC'), title: 'A', state: 4 }, '/api/pm/test-cases/{id}'),
    get: (id) => `/api/pm/test-cases/${id}`,
    save: (id, g, t) => w.api.post('/api/pm/test-cases/save', { ...base, id, state: 3, rowVersion: g.rowVersion, testCaseCode: g.testCaseCode, title: t }),
  });
});

test('bug', async () => {
  const projectId = await w.project();
  await probe({
    name: 'bug',
    create: () => w.make('/api/pm/bugs/save', { projectId, bugCode: mock('B'), title: 'A', state: 4 }, '/api/pm/bugs/{id}'),
    get: (id) => `/api/pm/bugs/${id}`,
    save: (id, g, t) => w.api.post('/api/pm/bugs/save', { projectId, id, state: 3, rowVersion: g.rowVersion, bugCode: g.bugCode, title: t }),
  });
});

test('invoice', async () => {
  const base = { customerId: await w.customer(), projectId: await w.project(), billingType: 'FIXED_PRICE', issueDate: today(), dueDate: inDays(30), subtotalAmount: 1000, vatRate: 7, vatAmount: 70, totalAmount: 1070 };
  await probe({
    name: 'invoice',
    create: () => w.make('/api/pm/invoices/save', { ...base, state: 4, items: [{ itemName: 'Item 1', amount: 1000, sortOrder: 1, state: 4 }] }, '/api/pm/invoices/{id}'),
    get: (id) => `/api/pm/invoices/${id}`,
    save: (id, g, t) => w.api.post('/api/pm/invoices/save', { ...base, id, state: 3, rowVersion: g.rowVersion, invoiceNo: g.invoiceNo, remark: t, items: [] }),
  });
});

test('payment', async () => {
  const invoiceId = await w.make('/api/pm/invoices/save', { customerId: await w.customer(), projectId: await w.project(), billingType: 'FIXED_PRICE', issueDate: today(), dueDate: inDays(30), subtotalAmount: 1000, vatRate: 7, vatAmount: 70, totalAmount: 1070, state: 4, items: [{ itemName: 'Item 1', amount: 1000, sortOrder: 1, state: 4 }] }, '/api/pm/invoices/{id}');
  const b = (amount: number) => ({ invoiceId, paymentDate: today(), paymentMethod: 'CASH', amount });
  await probe({
    name: 'payment',
    create: () => w.make('/api/pm/payments/save', { ...b(100), state: 4 }, '/api/pm/payments/{id}'),
    get: (id) => `/api/pm/payments/${id}`,
    save: (id, g, t) => w.api.post('/api/pm/payments/save', { ...b(t === 'B' ? 200 : t === 'C' ? 300 : 400), id, state: 3, rowVersion: g.rowVersion, paymentNo: g.paymentNo }),
  });
});

test('MA ticket', async () => {
  const base = { customerId: await w.customer(), projectId: await w.project(), ticketType: 'BUG_SUPPORT', severity: 'LOW', status: 'OPEN', description: 'e2e issue' };
  await probe({
    name: 'MA ticket',
    create: () => w.make('/api/pm/ma-tickets/save', { ...base, title: 'A', state: 4 }, '/api/pm/ma-tickets/{id}'),
    get: (id) => `/api/pm/ma-tickets/${id}`,
    save: (id, g, t) => w.api.post('/api/pm/ma-tickets/save', { ...base, title: t, id, state: 3, rowVersion: g.rowVersion, ticketNo: g.ticketNo }),
  });
});

test('user manual', async () => {
  const projectId = await w.project();
  await probe({
    name: 'user manual',
    create: () => w.make('/api/pm/manual/save', { projectId, manualCode: mock('M'), manualTitle: 'A', state: 4, sections: [{ sectionCode: 'S1', sectionTitle: 'Intro', content: 'hello', sortOrder: 1, state: 4 }] }, '/api/pm/manual/{id}'),
    get: (id) => `/api/pm/manual/${id}`,
    save: (id, g, t) => w.api.post('/api/pm/manual/save', { projectId, manualCode: g.manualCode, manualTitle: t, id, state: 3, rowVersion: g.rowVersion, sections: [] }),
  });
});

test('contract', async () => {
  const contractType = firstOf((await w.api.get('/api/pm/contracts/lov-contract-type')).body);
  const signStatus = firstOf((await w.api.get('/api/pm/contracts/lov-sign-status')).body);
  const b = { contractType, signStatus, customerId: await w.customer(), projectId: await w.project(), startDate: today(), endDate: inDays(365) };
  await probe({
    name: 'contract',
    create: () => w.make('/api/pm/contracts/save', { ...b, contractNo: mock('CT'), contractValue: 1000 }, '/api/pm/contracts/{id}'),
    get: (id) => `/api/pm/contracts/${id}`,
    save: (id, g, t) => w.api.post('/api/pm/contracts/save', { ...b, id, contractNo: g.contractNo, rowVersion: g.rowVersion, contractValue: t === 'B' ? 2000 : t === 'C' ? 3000 : 4000 }),
  });
});

test('diagram', async () => {
  const projectId = await w.project();
  const requirementId = await w.requirement();
  const b = (name: string) => ({ name, diagramType: 'DFD', projectId, requirementId });
  await probe({
    name: 'diagram',
    create: () => w.make('/api/diagram/tabs', { ...b('A'), mermaidScript: 'graph TD; A-->B' }, '/api/diagram/tabs/{id}'),
    get: (id) => `/api/diagram/tabs/${id}`,
    // a rename (no graph/script in the body): the path that enforces rowVersion
    save: (id, g, t) => w.api.put(`/api/diagram/tabs/${id}`, { ...b(t), id, rowVersion: g.rowVersion }),
  });
});

test('phase', async () => {
  const projectId = await w.project();
  const b = (phaseName: string) => ({ projectId, phaseName, startDate: today(), endDate: inDays(30) });
  await probe({
    name: 'phase',
    create: () => w.make(`/api/pm/projects/${projectId}/phases`, { ...b('A'), phaseCode: mock('PH') }, '/api/pm/phases/{id}'),
    get: (id) => `/api/pm/phases/${id}`,
    save: (id, g, t) => w.api.put(`/api/pm/phases/${id}`, { ...b(t), phaseCode: g.phaseCode, rowVersion: g.rowVersion }),
  });
});

test('milestone', async () => {
  const phaseId = await w.phase();
  const b = (milestoneName: string) => ({ phaseId, milestoneName, dueDate: inDays(15) });
  await probe({
    name: 'milestone',
    create: () => w.make('/api/pm/milestones', b('A'), '/api/pm/milestones/{id}'),
    get: (id) => `/api/pm/milestones/${id}`,
    save: (id, g, t) => w.api.put(`/api/pm/milestones/${id}`, { ...b(t), rowVersion: g.rowVersion }),
  });
});

test('work package', async () => {
  const milestoneId = await w.milestone();
  const b = (packageName: string) => ({ milestoneId, packageName, startDate: today(), endDate: inDays(10) });
  await probe({
    name: 'work package',
    create: () => w.make('/api/pm/work-packages', b('A'), '/api/pm/work-packages/{id}'),
    get: (id) => `/api/pm/work-packages/${id}`,
    save: (id, g, t) => w.api.put(`/api/pm/work-packages/${id}`, { ...b(t), rowVersion: g.rowVersion }),
  });
});

test('task', async () => {
  const workPackageId = await w.workPackage();
  const b = (taskName: string) => ({ workPackageId, taskName, startDate: today(), endDate: inDays(5), estimateManday: 1 });
  await probe({
    name: 'task',
    create: () => w.make('/api/pm/tasks', { ...b('A'), taskCode: mock('T') }, '/api/pm/tasks/{id}'),
    get: (id) => `/api/pm/tasks/${id}`,
    save: (id, g, t) => w.api.put(`/api/pm/tasks/${id}`, { ...b(t), taskCode: g.taskCode, rowVersion: g.rowVersion }),
  });
  // automatic status syncs send no rowVersion and must still go through
  const id = await w.make('/api/pm/tasks', { ...b('Sync'), taskCode: mock('T') }, '/api/pm/tasks/{id}');
  const g = data((await w.api.get(`/api/pm/tasks/${id}`)).body);
  const sync = await w.api.put(`/api/pm/tasks/${id}`, { ...g, status: 'Testing', rowVersion: undefined });
  expect(sync.status, JSON.stringify(sync.body).slice(0, 200)).toBeLessThan(300);
});

test('design review', async () => {
  const projectId = await w.project();
  const base = { projectId, description: 'd', dueDate: inDays(7) };
  await probe({
    name: 'design review',
    create: () => w.make('/api/pm/design-reviews', { ...base, reviewCode: mock('DR'), title: 'A' }, '/api/pm/design-reviews/{id}'),
    get: (id) => `/api/pm/design-reviews/${id}`,
    save: (id, g, t) => w.api.post('/api/pm/design-reviews', { ...base, id, reviewCode: g.reviewCode, title: t, rowVersion: g.rowVersion }),
  });
});

test('project', async () => {
  const customerId = await w.customer();
  const b = (projectName: string) => ({ customerId, projectName });
  await probe({
    name: 'project',
    create: () => w.make('/api/pm/customer-projects', { ...b('A'), projectCode: mock('P') }, '/api/pm/customer-projects/{id}'),
    get: (id) => `/api/pm/customer-projects/${id}`,
    save: (id, g, t) => w.api.put(`/api/pm/customer-projects/${id}`, { ...b(t), projectCode: g.projectCode, rowVersion: g.rowVersion }),
  });
});

test('delivery', async () => {
  const projectId = await w.project();
  const b = (deliveryTitle: string) => ({ projectId, deliveryTitle, deliveryDate: today(), deliveryVersion: '1.0' });
  await probe({
    name: 'delivery',
    create: () => w.make('/api/pm/delivery/save', { ...b('A'), deliveryCode: mock('D'), state: 4 }, '/api/pm/delivery/{id}'),
    get: (id) => `/api/pm/delivery/${id}`,
    save: (id, g, t) => w.api.post('/api/pm/delivery/save', { ...b(t), id, state: 3, deliveryCode: g.deliveryCode, rowVersion: g.rowVersion }),
  });
});

test('change request', async () => {
  const projectId = await w.project();
  const targetId = await w.approvedSpec(); // CRs are refused on DRAFT documents
  const me = await userId();
  const b = (title: string) => ({ projectId, targetType: 'SPECIFICATION', targetId, title, description: 'd', changeReason: 'e2e', priority: 'MEDIUM', assigneeId: me });
  await probe({
    name: 'change request',
    create: () => w.make('/api/pm/change-requests', b('A'), '/api/pm/change-requests/{id}'),
    get: (id) => `/api/pm/change-requests/${id}`,
    save: (id, g, t) => w.api.put(`/api/pm/change-requests/${id}`, { ...b(t), rowVersion: g.rowVersion }),
  });
});

test('approval flow', async () => {
  const me = await userId();
  const code = mock('F');
  const b = (flowName: string) => ({ flowCode: code, flowName, documentType: 'REQUIREMENT', approvalMode: 'CHAIN', isActive: true, steps: [{ stepOrder: 1, stepName: 'Step 1', approverUserId: me, isRequired: true }] });
  await probe({
    name: 'approval flow',
    create: () => w.make('/api/pm/approval-flows', b('A'), '/api/pm/approval-flows/{id}'),
    get: (id) => `/api/pm/approval-flows/${id}`,
    save: (id, g, t) => w.api.put(`/api/pm/approval-flows/${id}`, { ...b(t), id, rowVersion: g.rowVersion }),
  });
});

test('impact analysis', async () => {
  const projectId = await w.project();
  const targetId = await w.approvedSpec();
  const crId = await w.make('/api/pm/change-requests', { projectId, targetType: 'SPECIFICATION', targetId, title: 'IA', description: 'd', changeReason: 'e2e', priority: 'MEDIUM', assigneeId: await userId() }, '/api/pm/change-requests/{id}');
  // one analysis per change request: create it, then probe it through the change request
  const b = (uiImpact: string) => ({ changeRequestId: crId, uiImpact, mandayImpact: 1 });
  expect((await w.api.post('/api/pm/impact-analysis/save', b('A'))).status).toBeLessThan(300);
  await probe({
    name: 'impact analysis',
    create: async () => crId,
    get: (id) => `/api/pm/impact-analysis/change-request/${id}`,
    save: (_id, g, t) => w.api.post('/api/pm/impact-analysis/save', { ...b(t), rowVersion: g.rowVersion }),
  });
});

test('customer', async () => {
  const b = (companyNameEn: string) => ({ companyNameEn, email: 'e2e@example.test' });
  await probe({
    name: 'customer',
    create: () => w.make('/api/pm/customers', { ...b('A'), customerCode: mock('C') }, '/api/pm/customers/{id}'),
    get: (id) => `/api/pm/customers/${id}`,
    save: (id, g, t) => w.api.put(`/api/pm/customers/${id}`, { ...b(t), customerCode: g.customerCode, rowVersion: g.rowVersion }),
  });
});

test('business', async () => {
  // the seeded business of the test user (throwaway DB): saved with its own values, so nothing changes but xmin
  const bizId = w.api.businessId!;
  await probe({
    name: 'business',
    create: async () => bizId,
    get: () => `/api/business/me`, // what the business settings page (BURT01) loads
    save: (id, g) => w.api.post('/api/business/save', { ...g, id, state: 3, rowVersion: g.rowVersion }),
  });
});

test('AI model config', async () => {
  const code = mock('model');
  const b = (name: string) => ({ modelCode: code, displayName: name, providerLabel: 'e2e', apiFormat: 'OPENAI_COMPATIBLE', apiUrl: 'http://localhost:1/none', apiKey: 'x', maxTokens: 100, isActive: true, isDefault: false, isRecommended: false, sortOrder: 99 });
  await probe({
    name: 'AI model config',
    create: () => w.make('/api/ai-model-config', b('A'), '/api/ai-model-config/{id}'),
    get: (id) => `/api/ai-model-config/${id}`,
    save: (id, g, t) => w.api.post('/api/ai-model-config', { ...b(t), modelCode: g.modelCode, id, rowVersion: g.rowVersion }),
  });
});
