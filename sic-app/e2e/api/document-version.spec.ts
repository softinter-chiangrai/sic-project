import { test, expect } from '@playwright/test';
import { World, today } from './world';
import { mock, userId } from '../api';
import { sql } from '../infra/db';

// The version of a document lives in pm_document_version only (no copy column on the document table).
// Screens (API "version" field) show the NEWEST version row whatever its status (user's rule 2026-10-16).
// PDFs keep pm_current_version / pm_current_version_label: latest APPROVED version, else the latest draft.
test.describe.configure({ mode: 'serial' });

let w: World;
test.beforeAll(async () => { w = await World.create(); });
test.afterAll(async () => { await w.cleanup(); });

const data = (b: any) => b?.data ?? b;

/** Add a version row to a document's history through the public API. */
async function addVersion(documentType: string, documentId: string, versionNo: string, approvalStatus: string) {
  const r = await w.api.post('/api/pm/document-versions', { documentType, documentId, versionNo, approvalStatus, changeSummary: 'e2e' });
  expect(r.status, JSON.stringify(r.body)).toBeLessThan(300);
  // rows created in the same millisecond would make "newest" ambiguous
  await new Promise((res) => setTimeout(res, 15));
}

const versionOf = async (path: string, field = 'version') => String(data((await w.api.get(path)).body)[field]);

test.describe('schema', () => {
  test('the duplicated version columns are gone and the current-version functions exist', () => {
    const cols = sql(
      `select count(*) from information_schema.columns where (table_name, column_name) in
        (('pm_requirement','version'),('pm_specification','version'),('pm_user_manual','version'),('pm_delivery','delivery_version'))`,
    );
    expect(cols).toBe('0');
    const fns = sql(`select count(*) from pg_proc where proname in ('pm_current_version','pm_current_version_label')`);
    expect(fns).toBe('2');
  });
});

test.describe('current version rule (requirement)', () => {
  let reqId: string;
  const current = () => versionOf(`/api/pm/requirement/${reqId}`);

  test('a new document starts at v1.0.0 and the API shows the plain number', async () => {
    reqId = await w.make('/api/pm/requirement/save', {
      requirementCode: mock('R'), title: 'Version rule', description: 'd', projectId: await w.project(), state: 4, isActive: true,
    }, '/api/pm/requirement/{id}');
    expect(await current()).toBe('v1.0.0'); // plain number, no "(Draft)" suffix in the screen API
    // the history is where the number is stored
    const hist = data((await w.api.get('/api/pm/document-versions', { documentType: 'REQUIREMENT', documentId: reqId })).body);
    expect(hist.map((h: any) => h.versionNo)).toContain('v1.0.0');
  });

  test('never approved: the newest draft is the current version, labelled (Draft) in documents', async () => {
    await addVersion('REQUIREMENT', reqId, 'v1.1.0', 'DRAFT');
    expect(await current()).toBe('v1.1.0');
    expect(sql(`select pm_current_version_label('REQUIREMENT', '${reqId}')`)).toBe('v1.1.0 (Draft)');
  });

  test('screens show the newest version even when it is a draft or rejected; PDFs keep the approved one', async () => {
    await addVersion('REQUIREMENT', reqId, 'v1.0.5', 'APPROVED');
    expect(await current()).toBe('v1.0.5');
    await addVersion('REQUIREMENT', reqId, 'v1.2.0', 'DRAFT');
    expect(await current()).toBe('v1.2.0');
    await addVersion('REQUIREMENT', reqId, 'v1.3.0', 'REJECTED');
    expect(await current()).toBe('v1.3.0'); // newest row, whatever its status
    expect(sql(`select pm_current_version('REQUIREMENT', '${reqId}')`)).toBe('v1.0.5');
    expect(sql(`select pm_current_version_label('REQUIREMENT', '${reqId}')`)).toBe('v1.0.5'); // approved: no suffix
  });

  test('a newer approved version is shown', async () => {
    await addVersion('REQUIREMENT', reqId, 'v2.0.0', 'APPROVED');
    expect(await current()).toBe('v2.0.0');
  });

  test('deleted versions are ignored', async () => {
    const rows = data((await w.api.get('/api/pm/document-versions', { documentType: 'REQUIREMENT', documentId: reqId })).body);
    const top = rows.find((r: any) => r.versionNo === 'v2.0.0');
    expect((await w.api.del(`/api/pm/document-versions/${top.id}`)).status).toBeLessThan(300);
    expect(await current()).toBe('v1.3.0'); // back to the newest row that is left
  });

  test('a document with no history row yields null in SQL (reports show "-")', () => {
    expect(sql(`select coalesce(pm_current_version('REQUIREMENT', gen_random_uuid()), 'null')`)).toBe('null');
  });
});

test.describe('approval through the real flow', () => {
  test('approving records an APPROVED history row and the document shows that version', async () => {
    const projectId = await w.project();
    const id = await w.make('/api/pm/requirement/save', {
      requirementCode: mock('R'), title: 'Approve me', description: 'd', projectId, state: 4, isActive: true,
    }, '/api/pm/requirement/{id}');
    // a flow whose only approver is the submitter approves at submit time
    const me = await userId();
    const flowId = await w.make('/api/pm/approval-flows', {
      flowCode: mock('F'), flowName: 'Self approval', documentType: 'REQUIREMENT', approvalMode: 'CHAIN', isActive: true,
      steps: [{ stepOrder: 1, stepName: 'Me', approverUserId: me, isRequired: true }],
    }, '/api/pm/approval-flows/{id}');
    const sub = await w.api.post('/api/pm/approvals/submit', { documentType: 'REQUIREMENT', documentId: id, flowId, documentCode: 'E2E', documentTitle: 'Approve me' });
    expect(sub.status, JSON.stringify(sub.body)).toBeLessThan(300);

    const hist = data((await w.api.get('/api/pm/document-versions', { documentType: 'REQUIREMENT', documentId: id })).body);
    expect(hist.some((h: any) => h.approvalStatus === 'APPROVED'), JSON.stringify(hist)).toBeTruthy();
    const approved = hist.find((h: any) => h.approvalStatus === 'APPROVED');
    expect(await versionOf(`/api/pm/requirement/${id}`)).toBe(approved.versionNo);

    // a draft revision created afterwards is what the screens show from then on
    await addVersion('REQUIREMENT', id, 'v9.9.9', 'DRAFT');
    expect(await versionOf(`/api/pm/requirement/${id}`)).toBe('v9.9.9');
  });
});

test.describe('the other three documents read the same history', () => {
  test('specification', async () => {
    const id = await w.specification();
    expect(await versionOf(`/api/pm/specifications/${id}`)).toMatch(/^v\d+\.\d+\.\d+$/);
    await addVersion('SPECIFICATION', id, 'v3.0.0', 'APPROVED');
    await addVersion('SPECIFICATION', id, 'v3.1.0', 'DRAFT');
    expect(await versionOf(`/api/pm/specifications/${id}`)).toBe('v3.1.0');
  });

  test('user manual', async () => {
    const projectId = await w.project();
    const section = { sectionCode: 'S1', sectionTitle: 'Intro', content: 'hello', sortOrder: 1, state: 4 };
    const id = await w.make('/api/pm/manual/save', { projectId, manualCode: mock('M'), manualTitle: 'Manual', state: 4, sections: [section] }, '/api/pm/manual/{id}');
    expect(await versionOf(`/api/pm/manual/${id}`)).toBe('v1.0.0');
    await addVersion('USER_MANUAL', id, 'v1.4.0', 'APPROVED');
    await addVersion('USER_MANUAL', id, 'v1.5.0', 'DRAFT');
    expect(await versionOf(`/api/pm/manual/${id}`)).toBe('v1.5.0');
  });

  test('delivery (field deliveryVersion)', async () => {
    const projectId = await w.project();
    const id = await w.make('/api/pm/delivery/save', { projectId, deliveryCode: mock('D'), deliveryTitle: 'Delivery', deliveryDate: today(), state: 4 }, '/api/pm/delivery/{id}');
    expect(await versionOf(`/api/pm/delivery/${id}`, 'deliveryVersion')).toBe('v1.0.0');
    await addVersion('DELIVERY', id, 'v1.2.0', 'APPROVED');
    await addVersion('DELIVERY', id, 'v1.3.0', 'DRAFT');
    expect(await versionOf(`/api/pm/delivery/${id}`, 'deliveryVersion')).toBe('v1.3.0');
  });

  test('a version sent in the request body is ignored (history is the only writer)', async () => {
    const projectId = await w.project();
    const id = await w.make('/api/pm/manual/save', { projectId, manualCode: mock('M'), manualTitle: 'Ignore body version', version: 'v7.7.7', state: 4, sections: [] }, '/api/pm/manual/{id}');
    expect(await versionOf(`/api/pm/manual/${id}`)).toBe('v1.0.0');
  });
});

test.describe('list screens use the same rule', () => {
  test('requirement paging shows the newest version, also when it is a draft', async () => {
    const projectId = await w.project();
    const id = await w.make('/api/pm/requirement/save', {
      requirementCode: mock('R'), title: 'List rule', description: 'd', projectId, state: 4, isActive: true,
    }, '/api/pm/requirement/{id}');
    await addVersion('REQUIREMENT', id, 'v1.0.9', 'APPROVED');
    await addVersion('REQUIREMENT', id, 'v1.1.9', 'DRAFT');
    const rows = (await w.api.get('/api/pm/requirement', { page: 1, size: 100, projectId, keyword: 'List rule' })).body.data;
    const row = rows.find((r: any) => r.id === id);
    expect(row, JSON.stringify(rows).slice(0, 300)).toBeTruthy();
    expect(row.version).toBe('v1.1.9');
  });

  test('searching by version number finds the document (version search moved to the history table)', async () => {
    const projectId = await w.project();
    const id = await w.make('/api/pm/specifications', {
      specificationCode: mock('S'), title: 'Search by version', description: 'd', specificationType: 'UI Specification', projectId,
      requirementId: await w.requirement(), state: 4, isActive: true,
    }, '/api/pm/specifications/{id}');
    await addVersion('SPECIFICATION', id, 'v8.8.8', 'DRAFT');
    const rows = (await w.api.get('/api/pm/specifications', { page: 1, size: 50, keyword: 'v8.8.8' })).body.data;
    expect(rows.map((r: any) => r.id)).toContain(id);
  });
});

test.describe('report PDFs still build on the new schema', () => {
  // The backend calls report-service first and falls back to the local Jasper templates, whose SQL now calls pm_current_version_label.
  test('requirement, specification, user manual and delivery export without a server error', async () => {
    test.setTimeout(180_000);
    const projectId = await w.project();
    const req = await w.requirement();
    const spec = await w.specification();
    const manual = await w.make('/api/pm/manual/save', { projectId, manualCode: mock('M'), manualTitle: 'Export manual', state: 4, sections: [] }, '/api/pm/manual/{id}');
    const del = await w.make('/api/pm/delivery/save', { projectId, deliveryCode: mock('D'), deliveryTitle: 'Export delivery', deliveryDate: today(), state: 4 }, '/api/pm/delivery/{id}');
    for (const path of [
      `/api/pm/requirement/${req}/export`,
      `/api/pm/specifications/${spec}/export-pdf`,
      `/api/pm/manual/${manual}/export-pdf`,
      `/api/pm/delivery/${del}/export-pdf`,
      `/api/pm/customer-projects/${projectId}/export`,
    ]) {
      const r = await w.api.get(path);
      expect(r.status, `${path} -> ${r.status} ${JSON.stringify(r.body).slice(0, 200)}`).toBeLessThan(300);
    }
  });
});
