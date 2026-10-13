import { test, expect } from '@playwright/test';
import { World } from './world';

let w: World;

test.beforeAll(async () => {
  w = await World.create();
});

test.afterAll(async () => {
  await w?.cleanup();
});

const SAMPLE_ER_XML = `
<mxGraphModel>
  <root>
    <mxCell id="0"/>
    <mxCell id="1" parent="0"/>
    <mxCell id="2" value="orders&#xa;id: PK&#xa;customer_id: UUID&#xa;status: varchar&#xa;total_amount: decimal" vertex="1" parent="1"/>
    <mxCell id="3" value="order_items&#xa;id: PK&#xa;order_id: UUID&#xa;product_id: UUID&#xa;quantity: int" vertex="1" parent="1"/>
    <mxCell id="4" edge="1" source="2" target="3" parent="1"/>
  </root>
</mxGraphModel>
`;

test.describe('AI Quality Across All Modules', () => {
  // Increase test timeout for AI LLM generation (180s per test)
  test.beforeEach(async () => {
    test.setTimeout(180_000);
  });

  test('1. Project AI: Draft Generation Quality', async () => {
    const customerId = await w.customer();

    const payload = {
      customerId,
      projectCode: 'PRJ-AI-TEST',
      projectName: 'ระบบบริหารการจัดซื้อและคลังสินค้าอัตโนมัติ',
      prompt: 'สร้างโครงการสำหรับระบบคลังสินค้าอัจฉริยะ พร้อมระบบแจ้งเตือนสต็อกต่ำกว่าเกณฑ์ และเชื่อมโยง ERP',
    };

    const res = await w.api.post('/api/pm/customer-projects/generate/draft', payload);
    expect(res.status, JSON.stringify(res.body)).toBe(200);

    const draft = res.body as any;
    expect(draft.projectName, 'Project name should be generated').toBeTruthy();
    expect(draft.description, 'Description should be comprehensive').toBeTruthy();
    expect(draft.description.length).toBeGreaterThan(20);
    expect(draft.priority).toBeTruthy();

    console.log('\n--- [1] Project AI Draft ---');
    console.log('📌 Project:', draft.projectName);
    console.log('📝 Description:', draft.description?.slice(0, 150) + '...');
    console.log('⚡ Priority:', draft.priority, '| Budget Manday:', draft.budgetManday);
  });

  test('2. Contract AI: Draft Generation Quality', async () => {
    const projectId = await w.project();
    const customerId = await w.customer();

    const payload = {
      projectId,
      customerId,
      contractNo: 'CTR-AI-001',
      contractType: 'FIXED_PRICE',
      contractValue: 500000,
      prompt: 'ร่างสัญญาจ้างพัฒนาระบบคลังสินค้า แบ่งจ่าย 3 งวดงาน พร้อมรับประกันผลงาน (Warrantee) 1 ปี',
    };

    const res = await w.api.post('/api/pm/contracts/generate/draft', payload);
    expect(res.status, JSON.stringify(res.body)).toBe(200);

    const draft = res.body as any;
    expect(draft.contractNo).toBeTruthy();
    expect(draft.scopeSummary, 'Scope summary should be generated').toBeTruthy();
    expect(draft.paymentTerms, 'Payment terms should be generated').toBeTruthy();

    console.log('\n--- [2] Contract AI Draft ---');
    console.log('📌 Contract No:', draft.contractNo);
    console.log('💵 Scope Summary:', draft.scopeSummary?.slice(0, 150) + '...');
    console.log('💳 Payment Terms:', draft.paymentTerms?.slice(0, 150) + '...');
  });

  test('3. Requirement AI: Draft Generation Quality', async () => {
    const projectId = await w.project();

    const payload = {
      projectId,
      title: 'ระบบแจ้งเตือนสินค้าคงคลังใกล้หมด (Low Stock Alert)',
      prompt: 'ต้องการให้ระบบส่งแจ้งเตือนผ่าน Email และ Line Notify เมื่อสต็อกสินค้าน้อยกว่าจุดสั่งซื้อ Reorder Point',
      requirementType: 'FUNCTIONAL',
    };

    const res = await w.api.post('/api/pm/requirement/ai/generate', payload);
    expect(res.status, JSON.stringify(res.body)).toBe(200);

    const draft = res.body as any;
    expect(draft.title, 'Title should be generated').toBeTruthy();
    expect(draft.description, 'Description should be generated').toBeTruthy();
    expect(draft.acceptanceCriteria, 'Acceptance criteria should be generated').toBeTruthy();

    console.log('\n--- [3] Requirement AI Draft ---');
    console.log('📌 Title:', draft.title);
    console.log('📝 Description:', draft.description?.slice(0, 150) + '...');
    console.log('✅ Acceptance Criteria:', draft.acceptanceCriteria?.slice(0, 150) + '...');
    console.log('⭐ Business Value:', draft.businessValue?.slice(0, 100) + '...');
  });

  test('4. Specification AI: Draft Generation Quality', async () => {
    const projectId = await w.project();
    const requirementId = await w.requirement();

    const payload = {
      projectId,
      requirementId,
      specificationType: 'UI Specification',
      prompt: 'หน้าจอแสดงแดชบอร์ดสรุปยอดสต็อกคงเหลือ พร้อมกราฟแท่งและตารางค้นหาด่วน',
    };

    const res = await w.api.post('/api/pm/specifications/generate/draft', payload);
    expect(res.status, JSON.stringify(res.body)).toBe(200);

    const draft = res.body as any;
    expect(draft.title).toBeTruthy();
    expect(draft.estimatedManday, 'Mandays should be calculated').toBeGreaterThan(0);
    expect(draft.generatedHtmlDescription, 'Rich HTML should be provided').toBeTruthy();

    console.log('\n--- [4] Specification AI Draft ---');
    console.log('📌 Title:', draft.title);
    console.log('⏱️ Estimated Manday:', draft.estimatedManday);
    console.log('🎯 Objective:', draft.objective);
    console.log('🎨 HTML Length:', draft.generatedHtmlDescription?.length, 'chars');
  });

  test('5. Test Scenario AI: Draft Generation Quality', async () => {
    const projectId = await w.project();
    const requirementId = await w.requirement();

    const payload = {
      projectId,
      requirementId,
      scenarioName: 'ทดสอบการส่งการแจ้งเตือนเมื่อสต็อกสินค้าต่ำกว่าเกณฑ์',
      prompt: 'ทดสอบทั้งกรณีสินค้าสต็อกปกติ, กรณีสินค้าเท่ากับ Min, และกรณีสินค้าติดลบหรือหมดเกลี้ยง',
    };

    const res = await w.api.post('/api/pm/test-scenarios/generate/draft', payload);
    expect(res.status, JSON.stringify(res.body)).toBe(200);

    const draft = res.body as any;
    expect(draft.scenarioName).toBeTruthy();
    expect(draft.description).toBeTruthy();

    console.log('\n--- [5] Test Scenario AI Draft ---');
    console.log('📌 Scenario Name:', draft.scenarioName);
    console.log('🏷️ Priority:', draft.priority);
    console.log('📝 Description:', draft.description?.slice(0, 150) + '...');
  });

  test('6. Test Case AI: Draft Generation Quality', async () => {
    const projectId = await w.project();
    const scenarioId = await w.testScenario();

    const payload = {
      projectId,
      scenarioId,
      title: 'ตรวจสอบการแจ้งเตือนทาง Line เมื่อสินค้าลดลงเหลือ 0 ชิ้น',
      prompt: 'จำลองการตัดสต็อกสินค้าในฐานข้อมูลให้เหลือ 0 แล้วสังเกตว่ามี Webhook ยิงไปที่ Line Notify และบันทึก Log สำเร็จหรือไม่',
    };

    const res = await w.api.post('/api/pm/test-cases/generate/draft', payload);
    expect(res.status, JSON.stringify(res.body)).toBe(200);

    const draft = res.body as any;
    expect(draft.title).toBeTruthy();
    expect(draft.testStep, 'Test steps should be detailed').toBeTruthy();
    expect(draft.expectedResult, 'Expected result should be defined').toBeTruthy();

    console.log('\n--- [6] Test Case AI Draft ---');
    console.log('📌 Title:', draft.title);
    console.log('🐾 Test Steps:', draft.testStep?.slice(0, 150) + '...');
    console.log('🎯 Expected Result:', draft.expectedResult?.slice(0, 150) + '...');
  });

  test('7. Delivery AI: Draft Generation Quality', async () => {
    const projectId = await w.project();

    const payload = {
      projectId,
      deliveryTitle: 'ส่งมอบระบบบริหารคลังสินค้าระยะที่ 1 (Phase 1 Final Delivery)',
      deliveryType: 'FINAL',
      prompt: 'จัดเตรียมเอกสารส่งมอบ ซอร์สโค้ด คู่มือการติดตั้ง และผลการทดสอบ UAT ที่ผ่านเกณฑ์ 100%',
    };

    const res = await w.api.post('/api/pm/delivery/generate/draft', payload);
    expect(res.status, JSON.stringify(res.body)).toBe(200);

    const draft = res.body as any;
    expect(draft.deliveryTitle).toBeTruthy();
    expect(draft.deliverySummary).toBeTruthy();
    expect(Array.isArray(draft.checklists)).toBe(true);

    console.log('\n--- [7] Delivery AI Draft ---');
    console.log('📌 Delivery Title:', draft.deliveryTitle);
    console.log('📋 Summary:', draft.deliverySummary?.slice(0, 150) + '...');
    console.log('✅ Checklists Count:', draft.checklists?.length, 'items');
  });

  test('8. Invoice AI: Draft Generation Quality', async () => {
    const projectId = await w.project();
    const contractId = await w.contract();

    const payload = {
      projectId,
      contractId,
      invoiceType: 'MILESTONE',
      invoiceTitle: 'ใบแจ้งหนี้งวดที่ 1 - ส่งมอบแบบแปลนและการวิเคราะห์ระบบ (System Analysis & Design)',
      billingPeriod: 'งวดที่ 1',
      prompt: 'เรียกเก็บเงินงวดแรก 30% ของมูลค่าโครงการ สำหรับงาน Requirement, Wireframe และ DB Schema',
    };

    const res = await w.api.post('/api/pm/invoices/generate/draft', payload);
    expect(res.status, JSON.stringify(res.body)).toBe(200);

    const draft = res.body as any;
    expect(draft.invoiceTitle).toBeTruthy();
    expect(Array.isArray(draft.items)).toBe(true);

    console.log('\n--- [8] Invoice AI Draft ---');
    console.log('📌 Invoice Title:', draft.invoiceTitle);
    console.log('💰 Vat Rate:', draft.vatRate);
    console.log('📦 Line Items Count:', draft.items?.length, 'items');
  });

  test('9. User Manual AI: Draft Generation Quality', async () => {
    const projectId = await w.project();

    const payload = {
      projectId,
      manualTitle: 'คู่มือการใช้งานระบบจัดการสต็อกและเบิกจ่ายสินค้าสำหรับเจ้าหน้าที่คลัง',
      manualType: 'USER',
      prompt: 'สร้างคู่มืออธิบายขั้นตอนการ Login, การค้นหารายการสินค้า, การกดเบิกสินค้า และการพิมพ์ใบเสร็จรับเงิน',
    };

    const res = await w.api.post('/api/pm/manual/generate/draft', payload);
    expect(res.status, JSON.stringify(res.body)).toBe(200);

    const draft = res.body as any;
    expect(draft.manualTitle).toBeTruthy();
    expect(Array.isArray(draft.sections)).toBe(true);
    expect(draft.sections.length).toBeGreaterThan(0);

    console.log('\n--- [9] User Manual AI Draft ---');
    console.log('📌 Manual Title:', draft.manualTitle);
    console.log('📖 Summary:', draft.summary?.slice(0, 120) + '...');
    console.log('📑 Sections Count:', draft.sections?.length, 'sections');
    if (draft.sections?.[0]) {
      console.log('   Section 1:', draft.sections[0].sectionTitle, `(${draft.sections[0].content?.length || 0} chars)`);
    }
  });

  test('10. MA Ticket AI: Draft Generation Quality', async () => {
    const projectId = await w.project();

    const payload = {
      projectId,
      title: 'ระบบไม่สามารถออกรายงานสรุปยอดขายสิ้นวันได้ (Report Export Timeout)',
      ticketType: 'BUG',
      severity: 'HIGH',
      prompt: 'ลูกค้าแจ้งว่าเมื่อกดยืนยันพิมพ์รายงาน PDF ระบบขึ้นหน้าจอหมุนค้างและหลุด 504 Gateway Timeout ในช่วงเวลา 18:00 น.',
    };

    const res = await w.api.post('/api/pm/ma-tickets/generate/draft', payload);
    expect(res.status, JSON.stringify(res.body)).toBe(200);

    const draft = res.body as any;
    expect(draft.title).toBeTruthy();
    expect(draft.description).toBeTruthy();
    expect(draft.resolutionSummary, 'Resolution summary should be generated').toBeTruthy();

    console.log('\n--- [10] MA Ticket AI Draft ---');
    console.log('📌 Ticket Title:', draft.title);
    console.log('🔥 Severity:', draft.severity);
    console.log('🛠️ Resolution Proposal:', draft.resolutionSummary?.slice(0, 150) + '...');
  });

  test('11. Mermaid Diagram AI: Architecture / ER Generation Quality', async () => {
    const payload = {
      prompt: 'ออกแบบ ER Diagram สำหรับระบบร้านค้าออนไลน์ ประกอบด้วย User, Order, Product, OrderItem และ Payment พร้อม Foreign Keys',
    };

    const res = await w.api.post('/api/ai/generate-mermaid', payload);
    expect(res.status, JSON.stringify(res.body)).toBe(200);

    const body = res.body as any;
    expect(body.mermaid, 'Mermaid script should be generated').toBeTruthy();
    expect(body.mermaid.length).toBeGreaterThan(30);

    console.log('\n--- [11] Mermaid Diagram AI ---');
    console.log('📊 Mermaid Script Sample:\n', body.mermaid.slice(0, 200) + '...');
  });

  test('12. SQL Generator AI: ER XML to PostgreSQL DDL Quality', async () => {
    const payload = {
      xml: SAMPLE_ER_XML,
      vendor: 'POSTGRESQL',
      mode: 'FULL',
      pageName: 'pmdt04',
    };

    const res = await w.api.post('/api/ai/generate-sql-from-er', payload);
    expect(res.status, JSON.stringify(res.body)).toBe(200);

    const body = res.body as any;
    expect(body.sql, 'SQL script should be generated').toBeTruthy();
    expect(body.sql.toUpperCase()).toContain('CREATE TABLE');

    console.log('\n--- [12] SQL Generator AI ---');
    console.log('🗄️ SQL DDL Generated Sample:\n', body.sql.slice(0, 250) + '...');
  });

  test('13. DB Design Validator AI: Schema Quality & Risk Analysis', async () => {
    const payload = {
      xml: SAMPLE_ER_XML,
      vendor: 'postgresql',
      pageName: 'pmdt04',
      lang: 'th',
    };

    const res = await w.api.post('/api/ai/validate-db-design', payload);
    expect(res.status, JSON.stringify(res.body)).toBe(200);

    const body = res.body as any;
    expect(typeof body.score).toBe('number');
    expect(body.grade).toBeTruthy();
    expect(body.summary).toBeTruthy();

    console.log('\n--- [13] DB Design Validator AI ---');
    console.log('🏆 DB Score:', body.score, '/ 100', `(Grade: ${body.grade})`);
    console.log('💡 AI Summary:', body.summary?.slice(0, 150) + '...');
    if (body.missingIndexes?.length) {
      console.log('🔍 Missing Indexes Count:', body.missingIndexes.length);
    }
  });

  test('14. AI Global Navigator: Workflow Query & Route Assistance', async () => {
    const payload = {
      message: 'อยากเริ่มสร้างโครงการใหม่ และกำหนด Requirement ต้องเข้าไปที่หน้าไหนและมีขั้นตอนอย่างไร',
      currentPath: '/pm/pj/pmpj01',
    };

    const res = await w.api.post('/api/ai/navigator/chat', payload);
    expect(res.status, JSON.stringify(res.body)).toBe(200);

    const body = res.body as any;
    expect(body.answer, 'Navigator answer should be provided').toBeTruthy();
    expect(body.answer.length).toBeGreaterThan(20);

    console.log('\n--- [14] AI Navigator Assistant ---');
    console.log('🧭 AI Navigator Reply:', body.answer?.slice(0, 200) + '...');
    if (body.suggestedRoutes?.length) {
      console.log('📍 Suggested Routes:', body.suggestedRoutes.map((r: any) => r.path).join(', '));
    }
  });

  test('15. AI Smart Bug Resolution: Diagnostic & Suggested Fix', async () => {
    const payload = {
      title: 'Cannot complete checkout when cart has out-of-stock item',
      description: 'User clicks checkout but screen freezes with unhandled promise rejection error',
      stepsToReproduce: '1. Add last item\n2. Wait for item to sell out\n3. Click Checkout',
      environment: 'Staging Chrome 120',
      lang: 'th',
    };

    const res = await w.api.post('/api/pm/bugs/ai-smart-resolution', payload);
    expect(res.status, JSON.stringify(res.body)).toBe(200);

    const body = res.body as any;
    expect(body.rootCause, 'Root cause analysis should be generated').toBeTruthy();
    expect(body.suggestedFix, 'Suggested fix should be generated').toBeTruthy();
    expect(body.recommendedSeverity).toBeTruthy();

    console.log('\n--- [15] AI Smart Bug Resolution ---');
    console.log('🩺 Root Cause:', body.rootCause?.slice(0, 150) + '...');
    console.log('🔧 Suggested Fix:', body.suggestedFix?.slice(0, 150) + '...');
    console.log('⚠️ Recommended Severity:', body.recommendedSeverity);
  });
});
