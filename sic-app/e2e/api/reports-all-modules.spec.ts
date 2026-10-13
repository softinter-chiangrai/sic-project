import { test, expect } from '@playwright/test';
import { World, today, inDays, firstOf } from './world';
import { mock, userId } from '../api';
import { probe } from './rich';

// Every module that exports a Jasper PDF, in both languages. The backend asks report-service first and falls back
// to the local templates in sic-spring/src/main/resources/reports, so this guards the SQL/params of those templates.
// A response counts as a real PDF when its body starts with the %PDF magic bytes (an empty or JSON error body fails).
test.describe.configure({ mode: 'serial' });
test.setTimeout(240_000);

let w: World;
test.beforeAll(async () => { w = await World.create(); });
test.afterAll(async () => { await w.cleanup(); });

const isPdf = (b: unknown) => typeof b === 'string' && b.startsWith('%PDF');

async function expectPdf(path: string, lang: 'th' | 'en') {
  const r = await w.api.get(path, { lang });
  expect(r.status, `${path}?lang=${lang} -> ${r.status} ${JSON.stringify(r.body).slice(0, 200)}`).toBe(200);
  expect(isPdf(r.body), `${path}?lang=${lang} did not return a PDF: ${String(r.body).slice(0, 80)}`).toBeTruthy();
}

async function both(path: string) {
  await expectPdf(path, 'th');
  await expectPdf(path, 'en');
}

test('requirement', async () => both(`/api/pm/requirement/${await w.requirement()}/export?format=pdf`));
test('specification', async () => both(`/api/pm/specifications/${await w.specification()}/export-pdf`));
test('project', async () => both(`/api/pm/customer-projects/${await w.project()}/export`));

test('contract', async () => {
  const id = await w.contract();
  await both(`/api/pm/contracts/${id}/export-pdf`);
});

test('delivery', async () => {
  const id = await w.make('/api/pm/delivery/save', { projectId: await w.project(), deliveryCode: mock('D'), deliveryTitle: 'Export delivery', deliveryDate: today(), state: 4 }, '/api/pm/delivery/{id}');
  await both(`/api/pm/delivery/${id}/export-pdf`);
});

test('user manual', async () => {
  const section = { sectionCode: 'S1', sectionTitle: 'Intro', content: 'hello', sortOrder: 1, state: 4 };
  const id = await w.make('/api/pm/manual/save', { projectId: await w.project(), manualCode: mock('M'), manualTitle: 'Export manual', state: 4, sections: [section] }, '/api/pm/manual/{id}');
  await both(`/api/pm/manual/${id}/export-pdf`);
});

test('invoice', async () => {
  const base = { customerId: await w.customer(), projectId: await w.project(), billingType: 'FIXED_PRICE', issueDate: today(), dueDate: inDays(30), subtotalAmount: 1000, vatRate: 7, vatAmount: 70, totalAmount: 1070 };
  const id = await w.make('/api/pm/invoices/save', { ...base, state: 4, items: [{ itemName: 'Item 1', amount: 1000, sortOrder: 1, state: 4 }] }, '/api/pm/invoices/{id}');
  await both(`/api/pm/invoices/${id}/export-pdf`);
});

test('ma ticket', async () => {
  const id = await w.make('/api/pm/ma-tickets/save', { customerId: await w.customer(), projectId: await w.project(), ticketType: 'BUG_SUPPORT', severity: 'LOW', status: 'OPEN', description: 'e2e issue', title: 'Export ticket', state: 4 }, '/api/pm/ma-tickets/{id}');
  await both(`/api/pm/ma-tickets/${id}/export-pdf`);
});

test('design review', async () => {
  const id = await w.make('/api/pm/design-reviews', { projectId: await w.project(), reviewCode: mock('DR'), title: 'Export review' }, '/api/pm/design-reviews/{id}');
  await both(`/api/pm/design-reviews/${id}/export-pdf`);
});

test('change request', async () => {
  const targetId = await w.approvedSpec();
  const id = await w.make('/api/pm/change-requests', { projectId: await w.project(), targetType: 'SPECIFICATION', targetId, title: 'Export CR', description: 'd', changeReason: 'e2e', priority: 'MEDIUM', assigneeId: await userId() }, '/api/pm/change-requests/{id}');
  await both(`/api/pm/change-requests/${id}/export-pdf`);
});

test('UAT / test report', async () => {
  const projectId = await w.project();
  for (const lang of ['th', 'en'] as const) {
    const r = await w.api.get('/api/pm/test-cases/export-uat-report', { projectId, testType: 'UAT', lang });
    expect(r.status, `uat ${lang} -> ${r.status} ${JSON.stringify(r.body).slice(0, 200)}`).toBe(200);
    expect(isPdf(r.body), `uat ${lang} did not return a PDF`).toBeTruthy();
  }
});

test('a non-existent record never crashes with 500', async () => {
  const fake = '00000000-0000-0000-0000-000000000000';
  for (const p of [`/api/pm/contracts/${fake}/export-pdf`, `/api/pm/delivery/${fake}/export-pdf`, `/api/pm/manual/${fake}/export-pdf`, `/api/pm/invoices/${fake}/export-pdf`, `/api/pm/ma-tickets/${fake}/export-pdf`, `/api/pm/design-reviews/${fake}/export-pdf`, `/api/pm/change-requests/${fake}/export-pdf`, `/api/pm/specifications/${fake}/export-pdf`]) {
    const r = await w.api.get(p);
    expect(r.status, p).not.toBe(500);
    expect([200, 400, 404], p).toContain(r.status);
  }
});

// A report whose main query returns no rows (a document without items / sections / cases) must still print its header
// and the document fields, not an empty page.
test.describe('documents without child rows are not blank pages', () => {
  const printed = (pdf: Buffer, mustContain: string) => {
    const p = probe(pdf);
    expect(p.pageCount).toBeGreaterThan(0);
    expect(p.text.replace(/\s+/g, ''), 'PDF has no text at all (blank page)').toContain(mustContain);
  };

  test('delivery without items or checklist', async () => {
    const id = await w.make('/api/pm/delivery/save', { projectId: await w.project(), deliveryCode: mock('D'), deliveryTitle: 'Blank check delivery', deliveryDate: today(), state: 4 }, '/api/pm/delivery/{id}');
    printed((await w.api.bytes(`/api/pm/delivery/${id}/export-pdf`, { lang: 'th' })).data, 'SOFTINTER');
  });

  test('user manual without sections', async () => {
    const id = await w.make('/api/pm/manual/save', { projectId: await w.project(), manualCode: mock('M'), manualTitle: 'Blank check manual', state: 4, sections: [] }, '/api/pm/manual/{id}');
    printed((await w.api.bytes(`/api/pm/manual/${id}/export-pdf`, { lang: 'th' })).data, 'SOFTINTER');
  });

  test('invoice without items', async () => {
    const base = { customerId: await w.customer(), projectId: await w.project(), billingType: 'FIXED_PRICE', issueDate: today(), dueDate: inDays(30), subtotalAmount: 0, vatRate: 7, vatAmount: 0, totalAmount: 0 };
    const id = await w.make('/api/pm/invoices/save', { ...base, state: 4, items: [] }, '/api/pm/invoices/{id}');
    printed((await w.api.bytes(`/api/pm/invoices/${id}/export-pdf`, { lang: 'th' })).data, 'SOFTINTER');
  });

  test('test report of a project without test cases', async () => {
    const projectId = await w.make('/api/pm/customer-projects', { customerId: await w.customer(), projectCode: mock('P'), projectName: `${w.projectName} empty` }, '/api/pm/customer-projects/{id}');
    printed((await w.api.bytes('/api/pm/test-cases/export-uat-report', { projectId, testType: 'ALL', lang: 'th' })).data, 'SOFTINTER');
  });
});
