import { seededApi, mock, userId, type Api } from '../api';

/** Create endpoints answer: raw uuid | {id} | {data: uuid} | {data: {id}} */
export const idOf = (b: any): string => {
  const d = typeof b?.data === 'string' ? b.data : b?.data?.id;
  return typeof b === 'string' ? b : (b?.id ?? d);
};
export const today = () => new Date().toISOString().slice(0, 10);
export const inDays = (n: number) => new Date(Date.now() + n * 864e5).toISOString().slice(0, 10);
/** First value of a LOV/combobox response ({value}|{code}|{id}, possibly wrapped in {data}). */
export const firstOf = (b: any): string => {
  const l = Array.isArray(b) ? b : b?.data;
  return l[0].value ?? l[0].code ?? l[0].id;
};

/** Mock-data factory: every created record is registered and deleted (reverse order) by cleanup(). */
export class World {
  /** unique per World so UI tests pick this run's project, not one left behind by an earlier run */
  readonly projectName = `E2E Project ${Math.random().toString(36).slice(2, 6)}`;
  private stack: string[] = [];
  private memo = new Map<string, Promise<string>>();
  private constructor(readonly api: Api) {}

  static async create() {
    return new World(await seededApi());
  }

  /** POST body to path, remember DELETE path (use `{id}` placeholder), return new id. */
  async make(path: string, body: unknown, delPath: string): Promise<string> {
    const r = await this.api.post(path, body);
    if (r.status >= 300) throw new Error(`POST ${path} -> ${r.status} ${JSON.stringify(r.body).slice(0, 300)}`);
    const id = idOf(r.body);
    if (!id) throw new Error(`POST ${path}: no id in ${JSON.stringify(r.body).slice(0, 200)}`);
    this.stack.push(delPath.replace('{id}', id));
    return id;
  }

  /** Parent record created once per World. */
  once(key: string, f: () => Promise<string>): Promise<string> {
    if (!this.memo.has(key)) this.memo.set(key, f());
    return this.memo.get(key)!;
  }

  async cleanup() {
    for (const p of this.stack.reverse()) await this.api.del(p).catch(() => {});
    this.stack = [];
  }

  // ---- parents, in dependency order ----
  customer = () => this.once('customer', () => this.make('/api/pm/customers', { customerCode: mock('C'), companyNameEn: 'E2E Co' }, '/api/pm/customers/{id}'));

  project = () =>
    this.once('project', async () =>
      this.make('/api/pm/customer-projects', { customerId: await this.customer(), projectCode: mock('P'), projectName: this.projectName }, '/api/pm/customer-projects/{id}'));

  contract = () =>
    this.once('contract', async () => {
      const contractType = firstOf((await this.api.get('/api/pm/contracts/lov-contract-type')).body);
      const signStatus = firstOf((await this.api.get('/api/pm/contracts/lov-sign-status')).body);
      return this.make('/api/pm/contracts/save', { contractNo: mock('CT'), contractType, signStatus, customerId: await this.customer(), projectId: await this.project(), startDate: today(), endDate: inDays(365), contractValue: 1000 }, '/api/pm/contracts/{id}');
    });

  phase = () =>
    this.once('phase', async () => {
      const pid = await this.project();
      return this.make(`/api/pm/projects/${pid}/phases`, { projectId: pid, phaseCode: mock('PH'), phaseName: 'E2E Phase', startDate: today(), endDate: inDays(30) }, '/api/pm/phases/{id}');
    });

  milestone = () =>
    this.once('milestone', async () =>
      this.make('/api/pm/milestones', { phaseId: await this.phase(), milestoneName: 'E2E Milestone', dueDate: inDays(15) }, '/api/pm/milestones/{id}'));

  workPackage = () =>
    this.once('workPackage', async () =>
      this.make('/api/pm/work-packages', { milestoneId: await this.milestone(), packageName: 'E2E WP', startDate: today(), endDate: inDays(10) }, '/api/pm/work-packages/{id}'));

  task = () =>
    this.once('task', async () =>
      this.make('/api/pm/tasks', { workPackageId: await this.workPackage(), taskCode: mock('T'), taskName: 'E2E Task', startDate: today(), endDate: inDays(5), estimateManday: 1 }, '/api/pm/tasks/{id}'));

  requirement = () =>
    this.once('requirement', async () =>
      this.make('/api/pm/requirement/save', { requirementCode: mock('R'), title: 'E2E Requirement', description: 'd', specificationType: 'UI Specification', projectId: await this.project(), state: 4, isActive: true }, '/api/pm/requirement/{id}'));

  specification = () =>
    this.once('specification', async () =>
      this.make('/api/pm/specifications', { specificationCode: mock('S'), title: 'E2E Spec', description: 'd', specificationType: 'UI Specification', projectId: await this.project(), requirementId: await this.requirement(), state: 4, isActive: true }, '/api/pm/specifications/{id}'));

  testScenario = () =>
    this.once('testScenario', async () =>
      this.make('/api/pm/test-scenarios/save', { projectId: await this.project(), taskId: await this.task(), scenarioCode: mock('TS'), scenarioName: 'E2E Scenario', state: 4 }, '/api/pm/test-scenarios/{id}'));

  /** Approved specification (change requests are refused on DRAFT documents). */
  approvedSpec = () =>
    this.once('approvedSpec', async () => {
      const projectId = await this.project();
      const base = { specificationCode: mock('S'), title: 'Approved spec', description: 'd', specificationType: 'UI Specification', projectId, isActive: true };
      const id = await this.make('/api/pm/specifications', { ...base, state: 4 }, '/api/pm/specifications/{id}');
      const sp = (await this.api.get(`/api/pm/specifications/${id}`)).body;
      await this.api.post('/api/pm/specifications', { ...base, specificationCode: sp.specificationCode, id, state: 3, rowVersion: sp.rowVersion, status: 'APPROVED' });
      // the change-request target list only offers documents approved through the approval flow:
      // a flow whose only approver is the submitter approves at submit time
      const flowId = await this.make('/api/pm/approval-flows', { flowCode: mock('F'), flowName: 'Spec self-approval', documentType: 'SPECIFICATION', approvalMode: 'CHAIN', isActive: true, steps: [{ stepOrder: 1, stepName: 'Self', approverUserId: await userId(), isRequired: true }] }, '/api/pm/approval-flows/{id}');
      await this.api.post('/api/pm/approvals/submit', { documentType: 'SPECIFICATION', documentId: id, flowId, documentCode: sp.specificationCode, documentTitle: 'Approved spec' });
      return id;
    });
}
