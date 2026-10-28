import { test, expect } from '@playwright/test';
import { World, today, inDays, firstOf, idOf } from './world';
import { Api, mock, userId, secondApi, SECOND_TOKEN } from '../api';

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

test.afterAll(async () => {
  await w?.cleanup();
});

const data = (b: any) => b?.data ?? b;
const statusOf = (b: any) => String(data(b)?.status ?? b?.status ?? '').trim();

/** Helper to create an approval flow with given approvers */
async function createFlow(docType: string, approvers: string[]): Promise<string> {
  const steps = approvers.map((a, i) => ({
    stepOrder: i + 1,
    stepName: `Step ${i + 1}`,
    approverUserId: a,
    isRequired: true,
  }));
  return w.make(
    '/api/pm/approval-flows',
    {
      flowCode: mock('FL'),
      flowName: `Auto Test Flow ${docType}`,
      documentType: docType,
      approvalMode: 'CHAIN',
      isActive: true,
      steps,
    },
    '/api/pm/approval-flows/{id}',
  );
}

test.describe('Automatic Document Status Transitions (Playwright)', () => {

  test('TC-1: Submit Flow Sync - Document status changes automatically to In Review / Sent on submit', async () => {
    const projectId = await w.project();
    const customerId = await w.customer();
    const flowId = await createFlow('REQUIREMENT', [id2]);
    const contractFlowId = await createFlow('CONTRACT', [id2]);

    // 1. Requirement Draft -> Submit -> In Review
    const reqCode = mock('REQ');
    const reqId = await w.make(
      '/api/pm/requirement/save',
      { requirementCode: reqCode, title: 'Req Auto Submit', description: 'Testing submit sync', projectId, state: 4, isActive: true },
      '/api/pm/requirement/{id}',
    );
    const initialReq = (await w.api.get(`/api/pm/requirement/${reqId}`)).body;
    expect(statusOf(initialReq)).toMatch(/Draft/i);

    const submitReqRes = await w.api.post('/api/pm/approvals/submit', {
      documentType: 'REQUIREMENT',
      documentId: reqId,
      flowId,
      documentCode: reqCode,
      documentTitle: 'Req Auto Submit',
    });
    expect(submitReqRes.status).toBeLessThan(300);

    const submittedReq = (await w.api.get(`/api/pm/requirement/${reqId}`)).body;
    expect(statusOf(submittedReq)).toBe('In Review');

    // 2. Contract Draft -> Submit -> Sent
    const contractType = firstOf((await w.api.get('/api/pm/contracts/lov-contract-type')).body);
    const contractNo = mock('CT-SUB');
    const contractId = await w.make(
      '/api/pm/contracts/save',
      {
        contractNo,
        contractType,
        signStatus: 'Draft',
        customerId,
        projectId,
        startDate: today(),
        endDate: inDays(365),
        contractValue: 50000,
        autoRenew: false,
      },
      '/api/pm/contracts/{id}',
    );

    const submitContractRes = await w.api.post('/api/pm/approvals/submit', {
      documentType: 'CONTRACT',
      documentId: contractId,
      flowId: contractFlowId,
      documentCode: contractNo,
      documentTitle: 'Contract Auto Submit',
    });
    expect(submitContractRes.status).toBeLessThan(300);

    const submittedContract = (await w.api.get(`/api/pm/contracts/${contractId}`)).body;
    expect(data(submittedContract).signStatus).toBe('Sent');
  });

  test('TC-2: Final Approve Sync - Document status changes automatically to Approved / Signed + creates version', async () => {
    const projectId = await w.project();
    const customerId = await w.customer();
    const flowId = await createFlow('REQUIREMENT', [id2]);
    const contractFlowId = await createFlow('CONTRACT', [id2]);

    // 1. Requirement In Review -> Final Approve -> Approved
    const reqCode = mock('REQ-APP');
    const reqId = await w.make(
      '/api/pm/requirement/save',
      { requirementCode: reqCode, title: 'Req Auto Approve', description: 'Testing approve sync', projectId, state: 4, isActive: true },
      '/api/pm/requirement/{id}',
    );
    const submitReq = await w.api.post('/api/pm/approvals/submit', {
      documentType: 'REQUIREMENT',
      documentId: reqId,
      flowId,
      documentCode: reqCode,
      documentTitle: 'Req Auto Approve',
    });
    const reqApprovalId = idOf(submitReq.body);

    const approveReqRes = await u2.post(`/api/pm/approvals/${reqApprovalId}/approve`, {
      approvalId: reqApprovalId,
      comment: 'Approved by tester',
    });
    expect(approveReqRes.status).toBeLessThan(300);

    const approvedReq = (await w.api.get(`/api/pm/requirement/${reqId}`)).body;
    expect(statusOf(approvedReq)).toBe('Approved');

    // Check Auto-generated Document Version for Requirement
    const reqVersions = (await w.api.get(`/api/pm/document-versions?documentType=REQUIREMENT&documentId=${reqId}`)).body;
    const reqVersionList = Array.isArray(reqVersions) ? reqVersions : (reqVersions?.items || reqVersions?.data || []);
    expect(reqVersionList.length).toBeGreaterThan(0);

    // 2. Contract Sent -> Final Approve -> Signed
    const contractType = firstOf((await w.api.get('/api/pm/contracts/lov-contract-type')).body);
    const contractNo = mock('CT-APP');
    const contractId = await w.make(
      '/api/pm/contracts/save',
      {
        contractNo,
        contractType,
        signStatus: 'Draft',
        customerId,
        projectId,
        startDate: today(),
        endDate: inDays(365),
        contractValue: 100000,
      },
      '/api/pm/contracts/{id}',
    );

    const submitContract = await w.api.post('/api/pm/approvals/submit', {
      documentType: 'CONTRACT',
      documentId: contractId,
      flowId: contractFlowId,
      documentCode: contractNo,
      documentTitle: 'Contract Auto Approve',
    });
    const contractApprovalId = idOf(submitContract.body);

    const approveContractRes = await u2.post(`/api/pm/approvals/${contractApprovalId}/approve`, {
      approvalId: contractApprovalId,
      comment: 'Contract signed',
    });
    expect(approveContractRes.status).toBeLessThan(300);

    const approvedContract = (await w.api.get(`/api/pm/contracts/${contractId}`)).body;
    expect(data(approvedContract).signStatus).toBe('Signed');
  });

  test('TC-3: Reject & Cancel Rollback - Document status automatically rolls back to Draft', async () => {
    const projectId = await w.project();
    const flowId = await createFlow('REQUIREMENT', [id2]);

    // 1. Reject rollback
    const reqCode1 = mock('REQ-REJ');
    const reqId1 = await w.make(
      '/api/pm/requirement/save',
      { requirementCode: reqCode1, title: 'Req Auto Reject', description: 'Testing reject', projectId, state: 4, isActive: true },
      '/api/pm/requirement/{id}',
    );
    const sub1 = await w.api.post('/api/pm/approvals/submit', {
      documentType: 'REQUIREMENT',
      documentId: reqId1,
      flowId,
      documentCode: reqCode1,
      documentTitle: 'Req Reject',
    });
    const app1Id = idOf(sub1.body);

    const rejectRes = await u2.post(`/api/pm/approvals/${app1Id}/reject`, {
      approvalId: app1Id,
      comment: 'Not approved',
    });
    expect(rejectRes.status).toBeLessThan(300);

    const rejectedReq = (await w.api.get(`/api/pm/requirement/${reqId1}`)).body;
    expect(statusOf(rejectedReq)).toMatch(/Draft/i);

    // 2. Cancel rollback
    const reqCode2 = mock('REQ-CAN');
    const reqId2 = await w.make(
      '/api/pm/requirement/save',
      { requirementCode: reqCode2, title: 'Req Auto Cancel', description: 'Testing cancel', projectId, state: 4, isActive: true },
      '/api/pm/requirement/{id}',
    );
    const sub2 = await w.api.post('/api/pm/approvals/submit', {
      documentType: 'REQUIREMENT',
      documentId: reqId2,
      flowId,
      documentCode: reqCode2,
      documentTitle: 'Req Cancel',
    });
    const app2Id = idOf(sub2.body);

    const cancelRes = await w.api.post(`/api/pm/approvals/${app2Id}/cancel`, {
      approvalId: app2Id,
      comment: 'Requester cancelled',
    });
    expect(cancelRes.status).toBeLessThan(300);

    const cancelledReq = (await w.api.get(`/api/pm/requirement/${reqId2}`)).body;
    expect(statusOf(cancelledReq)).toMatch(/Draft/i);
  });

  test('TC-4: Edit Pending Document - Auto Status to "Changed" and Invalidate Approval Flow', async () => {
    const projectId = await w.project();
    const flowId = await createFlow('REQUIREMENT', [id2]);

    // Create and submit document into approval flow (In Review)
    const reqCodePending = mock('REQ-PND');
    const reqIdPending = await w.make(
      '/api/pm/requirement/save',
      { requirementCode: reqCodePending, title: 'Req Pending Test', description: 'desc', projectId, state: 4, isActive: true },
      '/api/pm/requirement/{id}',
    );
    const subPending = await w.api.post('/api/pm/approvals/submit', {
      documentType: 'REQUIREMENT',
      documentId: reqIdPending,
      flowId,
      documentCode: reqCodePending,
      documentTitle: 'Req Pending Test',
    });
    expect(subPending.status).toBeLessThan(300);
    const pendingApprovalId = idOf(subPending.body);

    const reqBefore = (await w.api.get(`/api/pm/requirement/${reqIdPending}`)).body;
    expect(statusOf(reqBefore)).toBe('In Review');

    // Edit the document while it is In Review
    const editPendingRes = await w.api.post('/api/pm/requirement/save', {
      id: reqIdPending,
      requirementCode: reqCodePending,
      title: 'Req Pending but Modified Mid-flight',
      description: 'Modified while pending review',
      projectId,
      state: 4,
      rowVersion: reqBefore.rowVersion,
    });
    expect(editPendingRes.status).toBeLessThan(300);

    // Verify status changed automatically to "Changed"
    const afterEditPending = (await w.api.get(`/api/pm/requirement/${reqIdPending}`)).body;
    expect(statusOf(afterEditPending)).toBe('Changed');

    // The old approval must now be invalidated / CANCELLED automatically
    const appCheck = (await w.api.get(`/api/pm/approvals/${pendingApprovalId}`)).body;
    expect(statusOf(appCheck)).toMatch(/CANCELLED/i);
  });

  test('TC-5: Target Document Approval - Automatically Implements Linked Change Requests', async () => {
    const projectId = await w.project();
    const flowId = await createFlow('SPECIFICATION', [id2]);

    // 1. Create Specification and Approve it
    const specCode = mock('SPC-CR');
    const specId = await w.make(
      '/api/pm/specifications',
      { specificationCode: specCode, title: 'Spec with CR', description: 'Initial spec', specificationType: 'UI Specification', projectId, state: 4, isActive: true },
      '/api/pm/specifications/{id}',
    );
    const subSpec = await w.api.post('/api/pm/approvals/submit', {
      documentType: 'SPECIFICATION',
      documentId: specId,
      flowId,
      documentCode: specCode,
      documentTitle: 'Spec with CR',
    });
    await u2.post(`/api/pm/approvals/${idOf(subSpec.body)}/approve`, { approvalId: idOf(subSpec.body) });

    // 2. Create Change Request targeting this Spec
    const crId = await w.make(
      '/api/pm/change-requests',
      {
        projectId,
        targetType: 'SPECIFICATION',
        targetId: specId,
        title: 'CR for Spec Update',
        description: 'Need to add field X',
        changeReason: 'Client request',
        priority: 'HIGH',
        assigneeId: id1,
      },
      '/api/pm/change-requests/{id}',
    );

    // 3. Submit and Approve the Change Request
    const crSubmit = await w.api.post(`/api/pm/change-requests/${crId}/submit`);
    expect(crSubmit.status).toBeLessThan(300);

    const crApprove = await w.api.post(`/api/pm/change-requests/${crId}/approve`);
    expect(crApprove.status).toBeLessThan(300);

    // When CR is approved, target document is unlocked and set to "Changed"
    const specAfterCr = (await w.api.get(`/api/pm/specifications/${specId}`)).body;
    expect(statusOf(specAfterCr)).toBe('Changed');

    // 4. Now modify the Spec and submit/approve it again
    const updateSpecRes = await w.api.post('/api/pm/specifications', {
      id: specId,
      specificationCode: specCode,
      title: 'Spec with CR (Updated and Re-approved)',
      description: 'Added field X as requested',
      specificationType: 'UI Specification',
      projectId,
      state: 4,
      rowVersion: specAfterCr.rowVersion,
    });
    expect(updateSpecRes.status).toBeLessThan(300);

    const subSpec2 = await w.api.post('/api/pm/approvals/submit', {
      documentType: 'SPECIFICATION',
      documentId: specId,
      flowId,
      documentCode: specCode,
      documentTitle: 'Spec with CR (Re-approved)',
    });
    await u2.post(`/api/pm/approvals/${idOf(subSpec2.body)}/approve`, { approvalId: idOf(subSpec2.body) });

    // 5. Verify the linked Change Request is now automatically IMPLEMENTED!
    const crFinal = (await w.api.get(`/api/pm/change-requests/${crId}`)).body;
    expect(statusOf(crFinal)).toBe('IMPLEMENTED');
  });

  test('TC-6: Contract Dynamic Lifecycle Transitions - ACTIVE, EXPIRING, EXPIRED calculated dynamically', async () => {
    const customerId = await w.customer();
    const projectId = await w.project();
    const contractType = firstOf((await w.api.get('/api/pm/contracts/lov-contract-type')).body);

    // 1. Signed with > 60 days left -> ACTIVE
    const idActive = await w.make(
      '/api/pm/contracts/save',
      {
        contractNo: mock('CT-ACT'),
        contractType,
        signStatus: 'Signed',
        customerId,
        projectId,
        startDate: inDays(-30),
        endDate: inDays(150),
        contractValue: 10000,
      },
      '/api/pm/contracts/{id}',
    );
    const ctActive = (await w.api.get(`/api/pm/contracts/${idActive}`)).body;
    expect(data(ctActive).lifecycleStatus).toBe('ACTIVE');

    // 2. Signed with <= 60 days left -> EXPIRING
    const idExpiring = await w.make(
      '/api/pm/contracts/save',
      {
        contractNo: mock('CT-EXP'),
        contractType,
        signStatus: 'Signed',
        customerId,
        projectId,
        startDate: inDays(-300),
        endDate: inDays(30),
        contractValue: 10000,
      },
      '/api/pm/contracts/{id}',
    );
    const ctExpiring = (await w.api.get(`/api/pm/contracts/${idExpiring}`)).body;
    expect(data(ctExpiring).lifecycleStatus).toBe('EXPIRING');

    // 3. Signed with end date passed -> EXPIRED
    const idExpired = await w.make(
      '/api/pm/contracts/save',
      {
        contractNo: mock('CT-PASSED'),
        contractType,
        signStatus: 'Signed',
        customerId,
        projectId,
        startDate: inDays(-400),
        endDate: inDays(-5),
        contractValue: 10000,
      },
      '/api/pm/contracts/{id}',
    );
    const ctExpired = (await w.api.get(`/api/pm/contracts/${idExpired}`)).body;
    expect(data(ctExpired).lifecycleStatus).toBe('EXPIRED');
  });

  test('TC-7: Contract Scheduled Auto-Renew Job - Automatically generates -R1 draft contract', async () => {
    const customerId = await w.customer();
    const projectId = await w.project();
    const contractType = firstOf((await w.api.get('/api/pm/contracts/lov-contract-type')).body);
    const contractNo = mock('CT-RENEW');

    // Contract with autoRenew = true and expiring in 25 days
    const contractId = await w.make(
      '/api/pm/contracts/save',
      {
        contractNo,
        contractType,
        signStatus: 'Signed',
        customerId,
        projectId,
        startDate: inDays(-340),
        endDate: inDays(25),
        contractValue: 80000,
        autoRenew: true,
      },
      '/api/pm/contracts/{id}',
    );

    // Trigger daily lifecycle scheduler run
    const runRes = await w.api.post('/api/pm/contracts/run-lifecycle', undefined, { date: today() });
    expect(runRes.status).toBe(200);

    // Retrieve renewal chain to find generated -R1 contract
    const chainRes = await w.api.get(`/api/pm/contracts/${contractId}/renewal-chain`);
    expect(chainRes.status).toBe(200);
    const chainList = Array.isArray(chainRes.body) ? chainRes.body : (chainRes.body?.data || []);
    const renewalContract = chainList.find((c: any) => c.parentContractId === contractId || c.contractNo === `${contractNo}-R1`);

    expect(renewalContract, 'Renewal draft contract must be created automatically in chain').toBeDefined();
    expect(renewalContract.contractNo).toBe(`${contractNo}-R1`);
    expect(renewalContract.signStatus).toBe('Draft');
    expect(renewalContract.parentContractId).toBe(contractId);
  });

  test('TC-8: Renewal Chain Parent Status Sync - Parent contract renewalStatus becomes "ต่อแล้ว"', async () => {
    const customerId = await w.customer();
    const projectId = await w.project();
    const contractType = firstOf((await w.api.get('/api/pm/contracts/lov-contract-type')).body);
    const contractFlowId = await createFlow('CONTRACT', [id2]);

    // Parent contract Signed
    const parentNo = mock('CT-PARENT');
    const parentId = await w.make(
      '/api/pm/contracts/save',
      {
        contractNo: parentNo,
        contractType,
        signStatus: 'Signed',
        customerId,
        projectId,
        startDate: inDays(-365),
        endDate: inDays(-1),
        contractValue: 50000,
      },
      '/api/pm/contracts/{id}',
    );

    // Renewal child contract referencing parent
    const childNo = `${parentNo}-R1`;
    const childId = await w.make(
      '/api/pm/contracts/save',
      {
        contractNo: childNo,
        contractType,
        signStatus: 'Draft',
        customerId,
        projectId,
        startDate: today(),
        endDate: inDays(365),
        contractValue: 50000,
        parentContractId: parentId,
      },
      '/api/pm/contracts/{id}',
    );

    // Approve child contract to Signed
    const subChild = await w.api.post('/api/pm/approvals/submit', {
      documentType: 'CONTRACT',
      documentId: childId,
      flowId: contractFlowId,
      documentCode: childNo,
      documentTitle: 'Renewal Contract',
    });
    await u2.post(`/api/pm/approvals/${idOf(subChild.body)}/approve`, { approvalId: idOf(subChild.body) });

    // Verify parent contract renewalStatus is now "ต่อแล้ว" and lifecycleStatus is "RENEWED"
    const parentAfter = (await w.api.get(`/api/pm/contracts/${parentId}`)).body;
    expect(data(parentAfter).renewalStatus).toBe('ต่อแล้ว');
    expect(data(parentAfter).lifecycleStatus).toBe('RENEWED');
  });

  test('TC-9: Test Case Execution to Task Status Sync - Testing -> Waiting Fix -> Done', async () => {
    const projectId = await w.project();
    const wpId = await w.workPackage();

    // 1. Create Task
    const taskCode = mock('TSK-STATUS');
    const taskRes = await w.api.post('/api/pm/tasks', {
      workPackageId: wpId,
      taskCode,
      taskName: 'Task Status Sync Test',
      startDate: today(),
      endDate: inDays(5),
      estimateManday: 2,
      status: 'Testing',
    });
    const taskId = typeof taskRes.body === 'string' ? taskRes.body : (taskRes.body as any).id || (taskRes.body as any).data;

    // 2. Create Test Scenario & Test Case
    const scenarioRes = await w.api.post('/api/pm/test-scenarios/save', {
      projectId,
      taskId,
      scenarioCode: mock('TSC'),
      scenarioName: 'Scenario Auto Sync',
      state: 4,
    });
    const scenarioId = typeof scenarioRes.body === 'string' ? scenarioRes.body : (scenarioRes.body as any).id || (scenarioRes.body as any).data;

    const tcCode = mock('TC');
    const tcRes = await w.api.post('/api/pm/test-cases/save', {
      projectId,
      scenarioId,
      taskId,
      testCaseCode: tcCode,
      title: 'Case to verify task sync',
      testStep: '1. Step to execute test',
      expectedResult: 'Expected success result',
      priority: 'Medium',
      testStatus: 'Pending',
      state: 4,
    });
    const tcId = typeof tcRes.body === 'string' ? tcRes.body : (tcRes.body as any).id || (tcRes.body as any).data;

    // 3. Mark Test Case as Fail -> Task should automatically become "Waiting Fix"
    const failUpdate = await w.api.post('/api/pm/test-cases/save', {
      id: tcId,
      projectId,
      scenarioId,
      taskId,
      testCaseCode: tcCode,
      title: 'Case to verify task sync',
      testStep: '1. Step to execute test',
      expectedResult: 'Expected success result',
      actualResult: 'Failure observed in step',
      testStatus: 'FAIL',
      state: 4,
    });
    expect(failUpdate.status).toBeLessThan(300);

    const taskAfterFail = (await w.api.get(`/api/pm/tasks/${taskId}`)).body;
    expect(taskAfterFail.status).toBe('Waiting Fix');

    // 4. Re-test and mark Test Case as Pass -> Task should automatically become "Done"
    const passUpdate = await w.api.post('/api/pm/test-cases/save', {
      id: tcId,
      projectId,
      scenarioId,
      taskId,
      testCaseCode: tcCode,
      title: 'Case to verify task sync',
      testStep: '1. Step to execute test',
      expectedResult: 'Expected success result',
      actualResult: 'Now passed successfully',
      testStatus: 'PASS',
      state: 4,
    });
    expect(passUpdate.status).toBeLessThan(300);

    const taskAfterPass = (await w.api.get(`/api/pm/tasks/${taskId}`)).body;
    expect(taskAfterPass.status).toBe('Done');
    expect(taskAfterPass.actualEnd).toBeTruthy();
  });

  test('TC-10: Delivery Sign-off Auto-Transition - Customer sign-off sets status to ACCEPTED and locks document', async () => {
    const projectId = await w.project();
    const flowId = await createFlow('DELIVERY', [id2]);

    // 1. Create Delivery via /api/pm/delivery/save
    const deliveryCode = mock('DEL-SIGN');
    const delId = await w.make(
      '/api/pm/delivery/save',
      {
        projectId,
        deliveryCode,
        deliveryTitle: 'Delivery Auto Accept Test',
        deliveryDate: today(),
        scopeSummary: 'Delivery summary',
        status: 'DRAFT',
      },
      '/api/pm/delivery/{id}',
    );

    // 2. Submit & Approve Delivery -> CONFIRMED & isLocked = true
    const subDel = await w.api.post('/api/pm/approvals/submit', {
      documentType: 'DELIVERY',
      documentId: delId,
      flowId,
      documentCode: deliveryCode,
      documentTitle: 'Delivery Auto Accept Test',
    });
    await u2.post(`/api/pm/approvals/${idOf(subDel.body)}/approve`, { approvalId: idOf(subDel.body) });

    const confirmedDel = (await w.api.get(`/api/pm/delivery/${delId}`)).body;
    expect(data(confirmedDel).status).toBe('CONFIRMED');
    expect(data(confirmedDel).isLocked).toBe(true);

    // 3. Customer Sign-off
    const signOffRes = await w.api.post(`/api/pm/delivery/${delId}/sign-off?signedBy=Customer%20Representative`);
    expect(signOffRes.status).toBeLessThan(300);

    const acceptedDel = (await w.api.get(`/api/pm/delivery/${delId}`)).body;
    expect(data(acceptedDel).status).toBe('ACCEPTED');
    expect(data(acceptedDel).isLocked).toBe(true);
    expect(data(acceptedDel).customerSignedBy).toBe('Customer Representative');
  });

});
