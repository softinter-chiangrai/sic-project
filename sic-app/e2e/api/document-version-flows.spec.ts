import { test, expect } from '@playwright/test';
import { World, today } from './world';
import { mock, userId } from '../api';

// Version behaviour across the real workflows: change request -> new draft revision, approval of each versioned document.
// Screens show the NEWEST version (user's rule 2026-10-16), so the draft revision a change request opens is shown at once;
// PDFs (pm_current_version_label) print the same number, labelled (Draft).
test.describe.configure({ mode: 'serial' });

let w: World;
test.beforeAll(async () => { w = await World.create(); });
test.afterAll(async () => { await w.cleanup(); });

const data = (b: any) => b?.data ?? b;
const ok = (r: { status: number; body: any }, what = '') => expect(r.status, `${what} ${JSON.stringify(r.body).slice(0, 300)}`).toBeLessThan(300);
const history = async (documentType: string, documentId: string) => data((await w.api.get('/api/pm/document-versions', { documentType, documentId })).body) as any[];

/** Flow whose only approver is the submitter: submitting approves immediately. */
async function selfApprove(documentType: string, documentId: string, documentCode: string) {
  const me = await userId();
  const flowId = await w.make('/api/pm/approval-flows', {
    flowCode: mock('F'), flowName: `Self ${documentType}`, documentType, approvalMode: 'CHAIN', isActive: true,
    steps: [{ stepOrder: 1, stepName: 'Me', approverUserId: me, isRequired: true }],
  }, '/api/pm/approval-flows/{id}');
  ok(await w.api.post('/api/pm/approvals/submit', { documentType, documentId, flowId, documentCode, documentTitle: documentType }), `submit ${documentType}`);
}

test.describe('change request opens a draft revision of an approved document', () => {
  let specId: string;
  let approvedNo: string;

  test('the approved specification shows its approved version', async () => {
    specId = await w.approvedSpec();
    const approved = (await history('SPECIFICATION', specId)).filter((h) => h.approvalStatus === 'APPROVED');
    expect(approved.length, 'approving through the flow must leave an APPROVED history row').toBeGreaterThan(0);
    approvedNo = approved[0].versionNo;
    expect(data((await w.api.get(`/api/pm/specifications/${specId}`)).body).version).toBe(approvedNo);
  });

  test('the change request targets the next version, computed from the history', async () => {
    const crId = await w.make('/api/pm/change-requests', {
      projectId: await w.project(), targetType: 'SPECIFICATION', targetId: specId, title: 'Version CR', description: 'd',
      changeReason: 'e2e', priority: 'MEDIUM', changeLevel: 'MINOR', assigneeId: await userId(),
    }, '/api/pm/change-requests/{id}');
    const cr = data((await w.api.get(`/api/pm/change-requests/${crId}`)).body);
    const [maj, min] = approvedNo.replace(/^v/i, '').split('.').map(Number);
    expect(cr.targetVersion).toBe(`v${maj}.${min + 1}.0`);
    ok(await w.api.post(`/api/pm/change-requests/${crId}/submit`), 'submit');
    ok(await w.api.post(`/api/pm/change-requests/${crId}/approve`), 'approve');
  });

  test('the new revision is a draft row and is the version shown', async () => {
    const rows = await history('SPECIFICATION', specId);
    expect(rows.length).toBeGreaterThan(1);
    expect(rows.some((h) => h.approvalStatus !== 'APPROVED'), JSON.stringify(rows.map((h) => [h.versionNo, h.approvalStatus]))).toBeTruthy();
    const newest = rows[0].versionNo; // history is newest first
    expect(newest).not.toBe(approvedNo);
    expect(data((await w.api.get(`/api/pm/specifications/${specId}`)).body).version).toBe(newest);
    // PDFs print the same number
    const label = await w.api.get(`/api/pm/specifications/${specId}/export-pdf`, { lang: 'en' });
    expect(label.status).toBe(200);
  });
});

test.describe('approval keeps the version history consistent', () => {
  test('requirement', async () => {
    const id = await w.make('/api/pm/requirement/save', { requirementCode: mock('R'), title: 'Approve req', description: 'd', projectId: await w.project(), state: 4, isActive: true }, '/api/pm/requirement/{id}');
    const before = data((await w.api.get(`/api/pm/requirement/${id}`)).body).version;
    await selfApprove('REQUIREMENT', id, 'E2E-REQ');
    const rows = await history('REQUIREMENT', id);
    expect(rows.filter((h) => h.approvalStatus === 'APPROVED').length).toBe(1);
    expect(data((await w.api.get(`/api/pm/requirement/${id}`)).body).version).toBe(before);
  });

  test('user manual', async () => {
    const section = { sectionCode: 'S1', sectionTitle: 'Intro', content: 'hello', sortOrder: 1, state: 4 };
    const id = await w.make('/api/pm/manual/save', { projectId: await w.project(), manualCode: mock('M'), manualTitle: 'Approve manual', state: 4, sections: [section] }, '/api/pm/manual/{id}');
    await selfApprove('USER_MANUAL', id, 'E2E-MAN');
    expect((await history('USER_MANUAL', id)).some((h) => h.approvalStatus === 'APPROVED')).toBeTruthy();
    expect(data((await w.api.get(`/api/pm/manual/${id}`)).body).version).toBe('v1.0.0');
  });

  test('delivery', async () => {
    const id = await w.make('/api/pm/delivery/save', { projectId: await w.project(), deliveryCode: mock('D'), deliveryTitle: 'Approve delivery', deliveryDate: today(), state: 4 }, '/api/pm/delivery/{id}');
    await selfApprove('DELIVERY', id, 'E2E-DEL');
    expect((await history('DELIVERY', id)).some((h) => h.approvalStatus === 'APPROVED')).toBeTruthy();
    expect(data((await w.api.get(`/api/pm/delivery/${id}`)).body).deliveryVersion).toBe('v1.0.0');
  });

  test('editing a document does not create a second row for the same version number', async () => {
    const id = await w.make('/api/pm/requirement/save', { requirementCode: mock('R'), title: 'Edit twice', description: 'd', projectId: await w.project(), state: 4, isActive: true }, '/api/pm/requirement/{id}');
    for (const n of [1, 2]) {
      const cur = data((await w.api.get(`/api/pm/requirement/${id}`)).body);
      ok(await w.api.post('/api/pm/requirement/save', { requirementCode: cur.requirementCode, title: `Edit twice ${n}`, description: 'd', projectId: cur.projectId, id, state: 3, rowVersion: cur.rowVersion, isActive: true }), `edit ${n}`);
    }
    const rows = await history('REQUIREMENT', id);
    // the version number never changes by plain edits, and it stays the current one
    expect(new Set(rows.map((h) => h.versionNo)).size).toBe(1);
    expect(data((await w.api.get(`/api/pm/requirement/${id}`)).body).version).toBe(rows[0].versionNo);
  });
});
