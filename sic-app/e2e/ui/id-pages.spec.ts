import { test } from '@playwright/test';
import { World, today, inDays, firstOf, idOf } from '../api/world';
import { mock, userId } from '../api';
import { Ui } from '../ui';

// Pages that need a real record id (edit / view / detail). Records are mock data created through the API and deleted afterwards.
let w: World;
let ui: Ui;
let ids: Record<string, string> = {};

test.beforeAll(async ({ browser }) => {
  test.setTimeout(180_000);
  w = await World.create();
  ui = await Ui.open(browser);
  const projectId = await w.project();
  const customerId = await w.customer();
  const me = await userId();
  const specBase = { specificationCode: mock('S'), title: 'UI spec', description: 'd', specificationType: 'UI Specification', projectId, isActive: true };
  const contractType = firstOf((await w.api.get('/api/pm/contracts/lov-contract-type')).body);
  const signStatus = firstOf((await w.api.get('/api/pm/contracts/lov-sign-status')).body);
  const flowId = await w.make('/api/pm/approval-flows', { flowCode: mock('F'), flowName: 'UI flow', documentType: 'REQUIREMENT', approvalMode: 'CHAIN', isActive: true, steps: [{ stepOrder: 1, stepName: 'S1', approverUserId: me, isRequired: true }] }, '/api/pm/approval-flows/{id}');
  const requirement = await w.requirement();
  const approval = await w.api.post('/api/pm/approvals/submit', { documentType: 'REQUIREMENT', documentId: requirement, flowId, documentCode: 'UI', documentTitle: 'UI' });
  const specification = await w.make('/api/pm/specifications', { ...specBase, state: 4 }, '/api/pm/specifications/{id}');
  const sp = (await w.api.get(`/api/pm/specifications/${specification}`)).body;
  await w.api.post('/api/pm/specifications', { ...specBase, specificationCode: sp.specificationCode, id: specification, state: 3, rowVersion: sp.rowVersion, status: 'APPROVED' });
  const versionNo = mock('v');
  const docVersion = await w.make('/api/pm/document-versions', { documentType: 'REQUIREMENT', documentId: requirement, versionNo, projectId, changeSummary: 'ui' }, '/api/pm/document-versions/{id}');
  const roleId = await w.make('/api/su/business-roles/save', { businessId: w.api.businessId, roleCode: mock('ROLE'), roleNameEn: 'UI role', roleNameLocal: 'UI role', sortOrder: 99, isActive: true, state: 4 }, '/api/su/business-roles/{id}');
  const members = await w.api.get('/api/su-user-business/members', { businessId: w.api.businessId! });
  const memberRows = members.body?.data ?? members.body?.content ?? members.body;

  ids = {
    customer: customerId,
    project: projectId,
    contract: await w.make('/api/pm/contracts/save', { contractNo: mock('CT'), contractType, signStatus, customerId, projectId, startDate: today(), endDate: inDays(365), contractValue: 1000 }, '/api/pm/contracts/{id}'),
    phase: await w.phase(),
    milestone: await w.milestone(),
    workPackage: await w.workPackage(),
    task: await w.task(),
    approval: idOf(approval.body),
    requirement,
    specification,
    changeRequest: await w.make('/api/pm/change-requests', { projectId, targetType: 'SPECIFICATION', targetId: specification, title: 'UI CR', description: 'd', changeReason: 'e2e', priority: 'MEDIUM', assigneeId: me }, '/api/pm/change-requests/{id}'),
    designReview: await w.make('/api/pm/design-reviews', { projectId, reviewCode: mock('DR'), title: 'UI review' }, '/api/pm/design-reviews/{id}'),
    testScenario: await w.testScenario(),
    testCase: await w.make('/api/pm/test-cases/save', { projectId, scenarioId: await w.testScenario(), taskId: await w.task(), testCaseCode: mock('TC'), title: 'UI case', testStep: '1', expectedResult: 'ok', state: 4 }, '/api/pm/test-cases/{id}'),
    bug: await w.make('/api/pm/bugs/save', { projectId, bugCode: mock('B'), title: 'UI bug', state: 4 }, '/api/pm/bugs/{id}'),
    delivery: await w.make('/api/pm/delivery/save', { projectId, deliveryCode: mock('D'), deliveryTitle: 'UI delivery', deliveryDate: today(), state: 4 }, '/api/pm/delivery/{id}'),
    manual: await w.make('/api/pm/manual/save', { projectId, manualCode: mock('M'), manualTitle: 'UI manual', state: 4 }, '/api/pm/manual/{id}'),
    invoice: await w.make('/api/pm/invoices/save', { customerId, projectId, billingType: 'FIXED_PRICE', issueDate: today(), dueDate: inDays(30), subtotalAmount: 10, state: 4 }, '/api/pm/invoices/{id}'),
    maTicket: await w.make('/api/pm/ma-tickets/save', { customerId, projectId, ticketType: 'BUG_SUPPORT', severity: 'LOW', status: 'OPEN', title: 'UI ticket', description: 'd', state: 4 }, '/api/pm/ma-tickets/{id}'),
    docVersion,
    versionNo,
    role: roleId,
    program: await w.make('/api/su/programs/save', { programCode: mock('PRG'), programNameEn: 'UI prog', programNameLocal: 'UI prog', routePath: '/e2e-ui', sortOrder: 99, isActive: true, state: 4 }, '/api/su/programs/{id}'),
    flow: flowId,
    aiModel: await w.make('/api/ai-model-config', { modelCode: mock('model'), displayName: 'UI model', providerLabel: 'e2e', apiFormat: 'OPENAI_COMPATIBLE', apiUrl: 'http://localhost:1/none', apiKey: 'x', maxTokens: 100, isActive: true, isDefault: false, isRecommended: false, sortOrder: 99 }, '/api/ai-model-config/{id}'),
    member: (Array.isArray(memberRows) ? memberRows : [])[0]?.id,
  };
});

test.afterAll(async () => {
  await ui?.close();
  await w?.cleanup();
});

// [route template, key in ids]
const routes: [string, string][] = [
  ['/feature/pm/customer/:id/edit', 'customer'],
  ['/feature/pm/project/:id/edit', 'project'],
  ['/feature/pm/dt/pmdt03/:id', 'project'],
  ['/feature/pm/gantt/:id/update', 'project'],
  ['/feature/pm/contract/:id/edit', 'contract'],
  ['/feature/pm/contract/:id/view', 'contract'],
  ['/feature/pm/contract/renew/:id', 'contract'],
  ['/feature/pm/phase/:id', 'phase'],
  ['/feature/pm/phase/:id/edit', 'phase'],
  ['/feature/pm/phase/:id/gantt', 'phase'],
  ['/feature/pm/phase/:id/calendar', 'phase'],
  ['/feature/pm/milestone/:id/edit', 'milestone'],
  ['/feature/pm/work-package/:id/edit', 'workPackage'],
  ['/feature/pm/task/:id/edit', 'task'],
  ['/feature/pm/approval/:id', 'approval'],
  ['/feature/pm/requirement/:id/edit', 'requirement'],
  ['/feature/pm/requirement/:id/view', 'requirement'],
  ['/feature/pm/requirement/:id/approval', 'requirement'],
  ['/feature/pm/change-request/:id/edit', 'changeRequest'],
  ['/feature/pm/change-request/:id/view', 'changeRequest'],
  ['/feature/pm/specification/:id/edit', 'specification'],
  ['/feature/pm/specification/:id/view', 'specification'],
  ['/feature/pm/design-review/:id/edit', 'designReview'],
  ['/feature/pm/test-case/:id/edit', 'testCase'],
  ['/feature/pm/test-case/:id/view', 'testCase'],
  ['/feature/pm/test-execution/:id', 'testCase'],
  ['/feature/pm/test-scenario/:id/edit', 'testScenario'],
  ['/feature/pm/test-scenario/:id/view', 'testScenario'],
  ['/feature/pm/bug/:id/edit', 'bug'],
  ['/feature/pm/bug/:id/view', 'bug'],
  ['/feature/pm/delivery/:id/edit', 'delivery'],
  ['/feature/pm/delivery/:id/view', 'delivery'],
  ['/feature/pm/manual/:id/edit', 'manual'],
  ['/feature/pm/invoice/:id/edit', 'invoice'],
  ['/feature/pm/invoice/:id/view', 'invoice'],
  ['/feature/pm/ma-ticket/:id/edit', 'maTicket'],
  ['/feature/pm/ma-ticket/:id/view', 'maTicket'],
  ['/feature/pm/version/:id/edit', 'docVersion'],
  ['/feature/pm/version/:id/view', 'docVersion'],
  ['/feature/pm/version/:id/content', 'docVersion'],
  ['/feature/pm/version/history/:id', 'versionNo'],
  ['/feature/bu/permission/:id', 'role'],
  ['/feature/bu/team/:id/edit', 'member'],
  ['/feature/bu/program/:id/edit', 'program'],
  ['/feature/bu/approval-flow/:id/edit', 'flow'],
  ['/feature/bu/ai-model-config/:id/edit', 'aiModel'],
];

for (const [template, key] of routes) {
  test(template, async () => {
    test.skip(!ids[key], `no mock ${key} could be created`);
    const path = template.replace(':id', ids[key]);
    await ui.visit(path);
    await ui.expectHealthy(template);
  });
}
