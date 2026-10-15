import { test, expect } from '@playwright/test';
import * as fs from 'node:fs';
import * as path from 'node:path';
import { World, today, inDays } from '../api/world';
import { mock } from '../api';
import { Ui } from '../ui';
import { fillForm, submit } from './forms';

// Project report with everything filled: the project form is typed in the browser (every control), the children
// (phase, task, requirement, spec, test scenario, contract, delivery, invoice) are added, then the project PDF is exported (th + en)
// to scratch/report-pdf/project-full/. Run: E2E_DB=sic_app_e2e npx playwright test e2e/ui/project-report-full.spec.ts --project=ui
test.setTimeout(300_000);

test('project report with every field filled', async ({ browser }) => {
  const w = await World.create();
  const ui = await Ui.open(browser);
  let projectId = '';
  try {
    const customerId = await w.make('/api/pm/customers', {
      customerCode: mock('C'), companyNameEn: 'Siam Retail Commerce Holdings Co., Ltd.', companyNameLocal: 'บริษัท สยาม รีเทล คอมเมิร์ซ โฮลดิ้งส์ จำกัด',
      taxId: '0105553212412', branchCode: '00000', addressLocal: '63 อาคารแอทธินี ทาวเวอร์ ชั้น 22 ถนนวิทยุ ปทุมวัน กรุงเทพฯ 10330', phoneNumber: '02-897-4699',
    }, '/api/pm/customers/{id}');

    // the project, as a user types it
    await ui.visit('/feature/pm/project/new');
    await ui.page.locator('[formcontrolname="projectName"]').first().waitFor({ timeout: 60_000 });
    const CODE = mock('P');
    const NAME = 'ระบบจัดการคำสั่งซื้อออนไลน์ (Omnichannel)';
    await fillForm(ui.page, {
      projectCode: CODE, projectName: NAME, customerId: '', budgetManday: '320',
      description: 'พัฒนาระบบจัดการคำสั่งซื้อแบบ Omnichannel รองรับหน้าร้าน เว็บไซต์ และมาร์เก็ตเพลส พร้อมรายงานสรุปยอดขายรายวัน',
      startDate: '', plannedEndDate: '', priority: '', status: '', approvalFlowId: '', isActive: '',
    });
    expect(await submit(ui.page)).toBe('saved');
    const list = (await w.api.get('/api/pm/customer-projects', { page: 0, size: 200, pageNumber: 1, pageSize: 200 })).body;
    const rows: any[] = list.data?.content ?? list.content ?? list.data ?? list;
    const project = rows.find((r) => r.projectCode === CODE);
    expect(project, 'project saved in the browser was not found').toBeTruthy();
    projectId = project.id;
    w.once('project', async () => project.id); // children below hang on the project the browser made

    await w.phase(); await w.task(); await w.requirement(); await w.specification(); await w.testScenario(); await w.contract();
    await w.make('/api/pm/delivery/save', { projectId: project.id, deliveryCode: mock('D'), deliveryTitle: 'ส่งมอบงวดที่ 1', deliveryDate: today(), state: 4 }, '/api/pm/delivery/{id}');
    await w.make('/api/pm/invoices/save', { customerId, projectId: project.id, billingType: 'MILESTONE', issueDate: today(), dueDate: inDays(30), subtotalAmount: 100000, vatRate: 7, state: 4,
      items: [{ itemName: 'งวดที่ 1', amount: 100000, sortOrder: 1, state: 4 }] }, '/api/pm/invoices/{id}');

    const out = path.resolve('..', 'scratch', 'report-pdf', 'project-full');
    fs.mkdirSync(out, { recursive: true });
    for (const lang of ['th', 'en']) {
      const res = await w.api.bytes(`/api/pm/customer-projects/${project.id}/export`, { lang });
      expect(res.status).toBe(200);
      fs.writeFileSync(path.join(out, `project-${lang}.pdf`), res.data);
    }
  } finally {
    await ui.close();
    await w.cleanup();
    if (projectId) await w.api.del(`/api/pm/customer-projects/${projectId}`).catch(() => {});
  }
});
