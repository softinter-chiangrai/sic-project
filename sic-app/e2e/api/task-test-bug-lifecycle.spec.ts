import { test, expect } from '@playwright/test';
import { World, today, inDays } from './world';
import { mock } from '../api';

let w: World;

test.beforeAll(async () => {
  w = await World.create();
});

test.afterAll(async () => {
  await w?.cleanup();
});

test.describe('Task <-> Test Management <-> Bug End-to-End Lifecycle', () => {
  test('Complete Task -> Test Failure -> Bug Creation -> Traceability -> Re-test Pass -> Task Complete', async () => {
    test.setTimeout(90_000);

    const projectId = await w.project();
    const wpId = await w.workPackage();

    // 1. Create a parent feature Task
    const taskCode = mock('TSK');
    const taskRes = await w.api.post('/api/pm/tasks', {
      workPackageId: wpId,
      taskCode,
      taskName: 'พัฒนาระบบตรวจสอบสิทธิ์การเข้าใช้งาน (Authentication)',
      startDate: today(),
      endDate: inDays(5),
      estimateManday: 3,
      status: 'In Progress',
    });
    expect([200, 201], 'Parent task creation').toContain(taskRes.status);
    const taskId = typeof taskRes.body === 'string' ? taskRes.body : (taskRes.body as any).id || (taskRes.body as any).data;
    expect(taskId).toBeTruthy();

    // 2. Developer finishes coding -> moves task to 'Testing'
    const moveTestingRes = await w.api.put(`/api/pm/tasks/${taskId}`, {
      workPackageId: wpId,
      taskCode,
      taskName: 'พัฒนาระบบตรวจสอบสิทธิ์การเข้าใช้งาน (Authentication)',
      startDate: today(),
      endDate: inDays(5),
      estimateManday: 3,
      status: 'Testing',
    });
    expect([200, 204], 'Move task to Testing').toContain(moveTestingRes.status);

    // Verify task is now in 'Testing'
    const getTaskRes1 = await w.api.get(`/api/pm/tasks/${taskId}`);
    expect(getTaskRes1.status).toBe(200);
    expect((getTaskRes1.body as any).status).toBe('Testing');

    // 3. QA creates a Test Scenario linked to this Task
    const scenarioCode = mock('TSC');
    const scenarioRes = await w.api.post('/api/pm/test-scenarios/save', {
      projectId,
      taskId,
      scenarioCode,
      scenarioName: 'ทดสอบการ Login ด้วยอีเมลและรหัสผ่าน',
      description: 'ตรวจสอบทั้งกรณีข้อมูลถูกต้อง และรหัสผ่านไม่ถูกต้อง',
      state: 4,
    });
    expect(scenarioRes.status, 'Create test scenario').toBe(200);
    const scenarioId = typeof scenarioRes.body === 'string' ? scenarioRes.body : (scenarioRes.body as any).id || (scenarioRes.body as any).data;
    expect(scenarioId).toBeTruthy();

    // 4. QA creates a Test Case under the scenario linked to the Task
    const tcCode = mock('TC');
    const tcRes = await w.api.post('/api/pm/test-cases/save', {
      projectId,
      scenarioId,
      taskId,
      testCaseCode: tcCode,
      title: 'กรอกรหัสผ่านผิด 3 ครั้ง บัญชีต้องถูกล็อคชั่วคราว',
      testStep: '1. กรอกอีเมล\n2. กรอกรหัสผ่านผิด 3 ครั้ง\n3. กดเข้าสู่ระบบ',
      expectedResult: 'ระบบแสดงข้อความแจ้งเตือน และล็อคบัญชี 15 นาที',
      priority: 'High',
      testStatus: 'PENDING',
      state: 4,
    });
    expect(tcRes.status, 'Create test case').toBe(200);
    const tcId = typeof tcRes.body === 'string' ? tcRes.body : (tcRes.body as any).id || (tcRes.body as any).data;
    expect(tcId).toBeTruthy();

    // 5. QA executes Test Case and finds a BUG -> Test Fails!
    const executeFailRes = await w.api.post('/api/pm/test-cases/save', {
      id: tcId,
      projectId,
      scenarioId,
      taskId,
      testCaseCode: tcCode,
      title: 'กรอกรหัสผ่านผิด 3 ครั้ง บัญชีต้องถูกล็อคชั่วคราว',
      testStep: '1. กรอกอีเมล\n2. กรอกรหัสผ่านผิด 3 ครั้ง\n3. กดเข้าสู่ระบบ',
      expectedResult: 'ระบบแสดงข้อความแจ้งเตือน และล็อคบัญชี 15 นาที',
      actualResult: 'ระบบไม่ล็อคบัญชี ยังคงอนุญาตให้ยิง Brute Force รหัสผ่านต่อไปได้เรื่อยๆ',
      testStatus: 'FAIL',
      tester: 'QA Automation',
      testDate: today(),
      state: 3,
    });
    expect(executeFailRes.status, 'Execute test case with FAIL').toBe(200);

    // 6. Bug Creation:
    // 6.1 Create Bug Task in Kanban 'To Do' column
    const bugTaskCode = 'BUG-' + Math.floor(1000 + Math.random() * 9000);
    const bugTaskRes = await w.api.post('/api/pm/tasks', {
      workPackageId: wpId,
      taskCode: bugTaskCode,
      taskName: `[BUG] ${tcCode} ระบบไม่ล็อคบัญชีเมื่อรหัสผ่านผิดเกินกำหนด`,
      description: `<b>[จากผลการทดสอบ: ${tcCode}]</b><br/>ไม่ล็อคบัญชี 15 นาทีตามสเปก`,
      priority: 'Critical',
      status: 'To Do',
      startDate: today(),
      endDate: today(),
      estimateManday: 1,
    });
    expect([200, 201], 'Create bug task').toContain(bugTaskRes.status);
    const bugTaskId = typeof bugTaskRes.body === 'string' ? bugTaskRes.body : (bugTaskRes.body as any).id || (bugTaskRes.body as any).data;

    // 6.2 Move Parent Task to 'bugfix' / 'waiting fix'
    const moveBugfixRes = await w.api.put(`/api/pm/tasks/${taskId}`, {
      workPackageId: wpId,
      taskCode,
      taskName: 'พัฒนาระบบตรวจสอบสิทธิ์การเข้าใช้งาน (Authentication)',
      startDate: today(),
      endDate: inDays(5),
      estimateManday: 3,
      status: 'bugfix',
    });
    expect([200, 204], 'Move parent task to bugfix').toContain(moveBugfixRes.status);

    // 6.3 Create dedicated PmBug entity
    const bugPayload = {
      projectId,
      taskId,
      testCaseId: tcId,
      bugCode: bugTaskCode,
      title: `[BUG] ${tcCode} ระบบไม่ล็อคบัญชีเมื่อรหัสผ่านผิดเกินกำหนด`,
      description: 'ระบบไม่ล็อคบัญชีหลังจากกรอกผิด 3 ครั้ง',
      stepsToReproduce: '1. Login ด้วยรหัสผิด 3 ครั้ง',
      severity: 'High',
      priority: 'High',
      status: 'Open',
      foundBy: 'QA Tester',
    };
    const createBugRes = await w.api.post('/api/pm/bugs/save', bugPayload);
    expect(createBugRes.status, 'Create PmBug entity').toBe(200);
    const bugEntityId = typeof createBugRes.body === 'string' ? createBugRes.body : (createBugRes.body as any).id || (createBugRes.body as any).data;
    expect(bugEntityId).toBeTruthy();

    // 6.4 Create Trace Link: TEST_CASE -> TASK (FAILED_BY)
    const traceRes = await w.api.post('/api/trace/links', {
      projectId,
      sourceType: 'TEST_CASE',
      sourceId: tcId,
      targetType: 'TASK',
      targetId: bugTaskId,
      relationshipType: 'FAILED_BY',
      description: `Test Case ${tcCode} failed and generated Bug ${bugTaskCode}`,
    });
    expect([200, 201]).toContain(traceRes.status);

    // 7. Verification: Verify Bug in Paging API & Traceability
    const getBugRes = await w.api.get(`/api/pm/bugs/${bugEntityId}`);
    expect(getBugRes.status).toBe(200);
    expect((getBugRes.body as any).bugCode).toBe(bugTaskCode);
    expect((getBugRes.body as any).testCaseId).toBe(tcId);
    expect((getBugRes.body as any).status).toBe('Open');

    const bugListRes = await w.api.get(`/api/pm/bugs/paging?projectId=${projectId}`);
    expect(bugListRes.status).toBe(200);
    const bugItems = (bugListRes.body as any)?.data || (bugListRes.body as any)?.content || [];
    expect(bugItems.some((b: any) => b.id === bugEntityId || b.bugCode === bugTaskCode)).toBe(true);

    // 8. Developer fixes the Bug:
    // 8.1 Complete the Bug task
    await w.api.put(`/api/pm/tasks/${bugTaskId}`, {
      workPackageId: wpId,
      taskCode: bugTaskCode,
      taskName: `[BUG] ${tcCode} ระบบไม่ล็อคบัญชีเมื่อรหัสผ่านผิดเกินกำหนด`,
      startDate: today(),
      endDate: today(),
      estimateManday: 1,
      status: 'complete',
    });

    // 8.2 Move Parent Task back to 'Testing' for QA to Re-test
    await w.api.put(`/api/pm/tasks/${taskId}`, {
      workPackageId: wpId,
      taskCode,
      taskName: 'พัฒนาระบบตรวจสอบสิทธิ์การเข้าใช้งาน (Authentication)',
      startDate: today(),
      endDate: inDays(5),
      estimateManday: 3,
      status: 'Testing',
    });

    // 8.3 Close the PmBug entity
    await w.api.post('/api/pm/bugs/save', {
      ...bugPayload,
      id: bugEntityId,
      status: 'Resolved',
    });

    // 9. QA Re-tests: Test Case Passes!
    const retestPassRes = await w.api.post('/api/pm/test-cases/save', {
      id: tcId,
      projectId,
      scenarioId,
      taskId,
      testCaseCode: tcCode,
      title: 'กรอกรหัสผ่านผิด 3 ครั้ง บัญชีต้องถูกล็อคชั่วคราว',
      testStep: '1. กรอกอีเมล\n2. กรอกรหัสผ่านผิด 3 ครั้ง\n3. กดเข้าสู่ระบบ',
      expectedResult: 'ระบบแสดงข้อความแจ้งเตือน และล็อคบัญชี 15 นาที',
      actualResult: 'ระบบล็อคบัญชีสำเร็จและแสดงเวลานับถอยหลัง 15 นาทีอย่างถูกต้อง',
      testStatus: 'PASS',
      tester: 'QA Automation',
      testDate: today(),
      state: 3,
    });
    expect(retestPassRes.status, 'Retest passed').toBe(200);

    // 10. Automatically / Synchronously transition Parent Task to 'complete'
    await w.api.put(`/api/pm/tasks/${taskId}`, {
      workPackageId: wpId,
      taskCode,
      taskName: 'พัฒนาระบบตรวจสอบสิทธิ์การเข้าใช้งาน (Authentication)',
      startDate: today(),
      endDate: inDays(5),
      estimateManday: 3,
      status: 'complete',
    });

    const finalTaskCheck = await w.api.get(`/api/pm/tasks/${taskId}`);
    expect(finalTaskCheck.status).toBe(200);
    expect((finalTaskCheck.body as any).status).toBe('complete');

    console.log('\n======================================================');
    console.log('✅ End-to-End Task <-> Test <-> Bug Lifecycle Succeeded!');
    console.log('📌 Parent Task:', taskCode, '-> Complete');
    console.log('🎯 Test Case:', tcCode, '-> PASS (after Re-test)');
    console.log('🐛 Bug Ticket:', bugTaskCode, '-> Resolved');
    console.log('🔗 Traceability: TEST_CASE -> FAILED_BY -> TASK Linked');
    console.log('======================================================\n');
  });
});
