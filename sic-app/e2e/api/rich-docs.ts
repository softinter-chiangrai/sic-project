import { World, today, inDays, firstOf } from './world';
import { mock, userId } from '../api';

/**
 * Every report that prints Tiptap (rich text) fields: how to create a document whose rich fields hold the given HTML
 * and which export URL prints it. Shared by the rich-content and image-layout specs.
 */
export type RichReport = {
  name: string;
  /** rich-text fields of this report; the spec supplies HTML for each */
  fields: string[];
  create: (w: World, html: Record<string, string>) => Promise<{ path: string; params?: Record<string, string | number>; id?: string }>;
  /** how the browser reaches the same document: its edit page, and the API read that returns the stored rich HTML */
  ui?: { edit: (id: string) => string; get: (id: string) => string; field: string };
};

const contractLov = async (w: World) => ({
  contractType: firstOf((await w.api.get('/api/pm/contracts/lov-contract-type')).body),
  signStatus: firstOf((await w.api.get('/api/pm/contracts/lov-sign-status')).body),
});
const invoiceBase = async (w: World, projectId: string, customerId: string) => ({
  customerId, projectId, billingType: 'FIXED_PRICE', issueDate: today(), dueDate: inDays(30), subtotalAmount: 1000, vatRate: 7, vatAmount: 70, totalAmount: 1070,
});

export const RICH_REPORTS: RichReport[] = [
  {
    name: 'requirement', fields: ['description', 'acceptanceCriteria'],
    ui: { edit: (id) => `/feature/pm/requirement/${id}/edit`, get: (id) => `/api/pm/requirement/${id}`, field: 'description' },
    create: async (w, h) => {
      const requirementType = firstOf((await w.api.get('/api/pm/requirement/lov-type')).body); // the edit form requires type and priority
      const priority = firstOf((await w.api.get('/api/pm/requirement/lov-priority')).body);
      const id = await w.make('/api/pm/requirement/save', { requirementCode: mock('R'), title: 'Rich req', projectId: await w.project(), requirementType, priority, state: 4, isActive: true, ...h }, '/api/pm/requirement/{id}');
      return { id, path: `/api/pm/requirement/${id}/export`, params: { format: 'pdf' } };
    },
  },
  {
    name: 'specification', fields: ['description'],
    ui: { edit: (id) => `/feature/pm/specification/${id}/edit`, get: (id) => `/api/pm/specifications/${id}`, field: 'description' },
    create: async (w, h) => {
      const id = await w.make('/api/pm/specifications', { specificationCode: mock('S'), title: 'Rich spec', specificationType: 'UI Specification', priority: 'Medium', projectId: await w.project(), requirementId: await w.requirement(), state: 4, isActive: true, ...h }, '/api/pm/specifications/{id}');
      return { id, path: `/api/pm/specifications/${id}/export-pdf` };
    },
  },
  {
    name: 'change request', fields: ['description'],
    ui: { edit: (id) => `/feature/pm/change-request/${id}/edit`, get: (id) => `/api/pm/change-requests/${id}`, field: 'description' },
    create: async (w, h) => {
      const id = await w.make('/api/pm/change-requests', { projectId: await w.project(), targetType: 'SPECIFICATION', targetId: await w.approvedSpec(), title: 'Rich CR', changeReason: 'e2e', priority: 'MEDIUM', assigneeId: await userId(), ...h }, '/api/pm/change-requests/{id}');
      return { id, path: `/api/pm/change-requests/${id}/export-pdf` };
    },
  },
  {
    name: 'contract', fields: ['paymentTerms', 'scopeSummary'],
    ui: { edit: (id) => `/feature/pm/contract/${id}/edit`, get: (id) => `/api/pm/contracts/${id}`, field: 'paymentTerms' },
    create: async (w, h) => {
      const id = await w.make('/api/pm/contracts/save', { contractNo: mock('CT'), ...(await contractLov(w)), customerId: await w.customer(), projectId: await w.project(), startDate: today(), endDate: inDays(365), contractValue: 1000, ...h }, '/api/pm/contracts/{id}');
      return { id, path: `/api/pm/contracts/${id}/export-pdf` };
    },
  },
  {
    name: 'delivery', fields: ['deliverySummary', 'releaseNote'],
    ui: { edit: (id) => `/feature/pm/delivery/${id}/edit`, get: (id) => `/api/pm/delivery/${id}`, field: 'releaseNote' },
    create: async (w, h) => {
      const id = await w.make('/api/pm/delivery/save', { projectId: await w.project(), deliveryCode: mock('D'), deliveryTitle: 'Rich delivery', deliveryDate: today(), state: 4, ...h }, '/api/pm/delivery/{id}');
      return { id, path: `/api/pm/delivery/${id}/export-pdf` };
    },
  },
  {
    name: 'invoice', fields: ['remark'],
    ui: { edit: (id) => `/feature/pm/invoice/${id}/edit`, get: (id) => `/api/pm/invoices/${id}`, field: 'remark' },
    create: async (w, h) => {
      const base = await invoiceBase(w, await w.project(), await w.customer());
      const id = await w.make('/api/pm/invoices/save', { ...base, state: 4, items: [{ itemName: 'Item 1', amount: 1000, sortOrder: 1, state: 4 }], ...h }, '/api/pm/invoices/{id}');
      return { id, path: `/api/pm/invoices/${id}/export-pdf` };
    },
  },
  {
    name: 'ma ticket', fields: ['description', 'resolutionSummary'],
    ui: { edit: (id) => `/feature/pm/ma-ticket/${id}/edit`, get: (id) => `/api/pm/ma-tickets/${id}`, field: 'description' },
    create: async (w, h) => {
      const id = await w.make('/api/pm/ma-tickets/save', { customerId: await w.customer(), projectId: await w.project(), ticketType: 'BUG_SUPPORT', severity: 'LOW', status: 'OPEN', title: 'Rich ticket', state: 4, ...h }, '/api/pm/ma-tickets/{id}');
      return { id, path: `/api/pm/ma-tickets/${id}/export-pdf` };
    },
  },
  {
    name: 'user manual', fields: ['content'],
    create: async (w, h) => {
      const section = { sectionCode: 'S1', sectionTitle: 'Rich section', content: h['content'], sortOrder: 1, state: 4 };
      const id = await w.make('/api/pm/manual/save', { projectId: await w.project(), manualCode: mock('M'), manualTitle: 'Rich manual', state: 4, sections: [section] }, '/api/pm/manual/{id}');
      return { id, path: `/api/pm/manual/${id}/export-pdf` };
    },
  },
  {
    name: 'design review', fields: ['description'],
    ui: { edit: (id) => `/feature/pm/design-review/${id}/edit`, get: (id) => `/api/pm/design-reviews/${id}`, field: 'description' },
    create: async (w, h) => {
      // the edit form requires an assignee (a member of the business) and a due date
      const assignedTo = String((await w.api.get('/api/business/combobox-members', { businessId: w.api.businessId! })).body?.[0]?.value ?? (await userId()));
      const id = await w.make('/api/pm/design-reviews', { projectId: await w.project(), reviewCode: mock('DR'), title: 'Rich review', assignedTo, dueDate: inDays(7), ...h }, '/api/pm/design-reviews/{id}');
      return { id, path: `/api/pm/design-reviews/${id}/export-pdf` };
    },
  },
  {
    name: 'uat', fields: ['testStep', 'expectedResult', 'actualResult'],
    ui: { edit: (id) => `/feature/pm/test-case/${id}/edit`, get: (id) => `/api/pm/test-cases/${id}`, field: 'testStep' },
    create: async (w, h) => {
      const projectId = await w.project();
      const id = await w.make('/api/pm/test-cases/save', { projectId, scenarioId: await w.testScenario(), taskId: await w.task(), testCaseCode: mock('TC'), title: 'Rich case', testType: 'UAT', testStatus: 'Pass', state: 4, ...h }, '/api/pm/test-cases/{id}');
      return { id, path: '/api/pm/test-cases/export-uat-report', params: { projectId, testType: 'ALL' } };
    },
  },
  {
    name: 'project report',
    fields: ['projectDescription', 'requirementDescription', 'requirementAcceptance', 'requirementBusinessValue', 'contractPaymentTerms', 'contractScope', 'deliverySummary', 'deliveryReleaseNote', 'invoiceRemark', 'ticketDescription', 'ticketResolution', 'specificationDescription', 'designReviewDescription', 'manualContent'],
    create: async (w, h) => {
      const customerId = await w.customer();
      const projectId = await w.make('/api/pm/customer-projects', { customerId, projectCode: mock('P'), projectName: `${w.projectName} rich`, description: h['projectDescription'] }, '/api/pm/customer-projects/{id}');
      const requirementId = await w.make('/api/pm/requirement/save', { requirementCode: mock('R'), title: 'Rich req', projectId, state: 4, isActive: true, description: h['requirementDescription'], acceptanceCriteria: h['requirementAcceptance'], businessValue: h['requirementBusinessValue'] }, '/api/pm/requirement/{id}');
      await w.make('/api/pm/specifications', { specificationCode: mock('S'), title: 'Rich spec', specificationType: 'UI Specification', projectId, requirementId, state: 4, isActive: true, description: h['specificationDescription'] }, '/api/pm/specifications/{id}');
      await w.make('/api/pm/contracts/save', { contractNo: mock('CT'), ...(await contractLov(w)), customerId, projectId, startDate: today(), endDate: inDays(365), contractValue: 1000, paymentTerms: h['contractPaymentTerms'], scopeSummary: h['contractScope'] }, '/api/pm/contracts/{id}');
      await w.make('/api/pm/delivery/save', { projectId, deliveryCode: mock('D'), deliveryTitle: 'Rich delivery', deliveryDate: today(), state: 4, deliverySummary: h['deliverySummary'], releaseNote: h['deliveryReleaseNote'] }, '/api/pm/delivery/{id}');
      await w.make('/api/pm/invoices/save', { ...(await invoiceBase(w, projectId, customerId)), state: 4, items: [{ itemName: 'Item 1', amount: 1000, sortOrder: 1, state: 4 }], remark: h['invoiceRemark'] }, '/api/pm/invoices/{id}');
      await w.make('/api/pm/ma-tickets/save', { customerId, projectId, ticketType: 'BUG_SUPPORT', severity: 'LOW', status: 'OPEN', title: 'Rich ticket', state: 4, description: h['ticketDescription'], resolutionSummary: h['ticketResolution'] }, '/api/pm/ma-tickets/{id}');
      await w.make('/api/pm/design-reviews', { projectId, reviewCode: mock('DR'), title: 'Rich review', description: h['designReviewDescription'] }, '/api/pm/design-reviews/{id}');
      await w.make('/api/pm/manual/save', { projectId, manualCode: mock('M'), manualTitle: 'Rich manual', state: 4, sections: [{ sectionCode: 'S1', sectionTitle: 'Rich section', content: h['manualContent'], sortOrder: 1, state: 4 }] }, '/api/pm/manual/{id}');
      return { id: projectId, path: `/api/pm/customer-projects/${projectId}/export` };
    },
  },
];
