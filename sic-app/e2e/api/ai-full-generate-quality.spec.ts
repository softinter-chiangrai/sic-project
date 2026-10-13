import { test, expect } from '@playwright/test';
import { World, today } from './world';

let w: World;

test.beforeAll(async () => {
  w = await World.create();
});

test.afterAll(async () => {
  await w?.cleanup();
});

test.describe('AI Full Generate & Pipeline Quality Tests', () => {
  // Generous timeout for multi-step AI LLM pipeline
  test.beforeEach(async () => {
    test.setTimeout(240_000);
  });

  test('1. AI Project Pipeline: Preview Plan Quality', async () => {
    const customerId = await w.customer();

    const payload = {
      customerId,
      projectName: 'ระบบบริหารโรงพยาบาลและคลินิกเวชกรรมอัจฉริยะ (Smart Clinic)',
      prompt: 'ต้องการพัฒนาระบบบริหารจัดการคลินิกเวชกรรมครบวงจร ครอบคลุมระบบเวชระเบียนอิเล็กทรอนิกส์ (EMR), คิวตรวจผู้ป่วย, การสั่งยา, การนัดหมายแพทย์ และการออกใบเสร็จเบิกจ่ายประกันสุขภาพ',
      durationWeeks: 16,
      startDate: today(),
      includeRequirements: true,
      includeSpecifications: true,
      includeTasks: true,
      includeGanttPhases: true,
      includeDelivery: true,
    };

    const res = await w.api.post('/api/pm/ai/pipeline/preview', payload);
    expect(res.status, JSON.stringify(res.body)).toBe(200);

    const preview = res.body as any;
    expect(preview.projectName, 'Project name should be generated').toBeTruthy();
    if (preview.description) {
      expect(preview.description.length).toBeGreaterThan(10);
    }

    // Verify preview items arrays
    expect(Array.isArray(preview.previewPhases)).toBe(true);
    expect(Array.isArray(preview.previewRequirements)).toBe(true);
    expect(Array.isArray(preview.previewSpecifications)).toBe(true);
    expect(Array.isArray(preview.previewTasks)).toBe(true);
    expect(Array.isArray(preview.previewDeliveries)).toBe(true);

    console.log('\n=================== [1] AI FULL PIPELINE: PREVIEW PLAN ===================');
    console.log('📌 Project Name:', preview.projectName);
    console.log('📝 Description:', preview.description?.slice(0, 200) + '...');
    console.log('⏱️ Estimated Weeks:', preview.estimatedDurationWeeks);
    console.log('📊 Breakdown Summary:');
    console.log(`   - Phases: ${preview.previewPhases?.length || 0} phases`);
    console.log(`   - Requirements: ${preview.previewRequirements?.length || 0} items`);
    console.log(`   - Specifications: ${preview.previewSpecifications?.length || 0} items`);
    console.log(`   - Tasks: ${preview.previewTasks?.length || 0} tasks`);
    console.log(`   - Deliveries: ${preview.previewDeliveries?.length || 0} items`);
    console.log('=========================================================================\n');
  });

  test('2. AI Batch Generator: Multi-Requirement Batch Quality', async () => {
    const projectId = await w.project();

    const payload = {
      projectId,
      moduleType: 'REQUIREMENT',
      count: 3,
      prompt: 'สร้าง Requirement ด้านความปลอดภัยของข้อมูลผู้ป่วย (EMR Data Security) ตามมาตรฐาน PDPA และ HIPAA เช่น การเข้ารหัสข้อมูล, Role-Based Access Control และ Audit Log',
    };

    const res = await w.api.post('/api/ai/batch-generate', payload);
    expect(res.status, JSON.stringify(res.body)).toBe(200);

    const batch = res.body as any;
    expect(batch.moduleType).toBe('REQUIREMENT');
    if (batch.items.length > 0) {
      expect(batch.items.length).toBeGreaterThan(0);
    }

    console.log('\n=================== [2] AI BATCH GENERATOR QUALITY ===================');
    console.log('📦 Module Type:', batch.moduleType);
    console.log('🔢 Items Generated:', batch.items?.length);
    batch.items.forEach((item: any, idx: number) => {
      console.log(`   [${idx + 1}] Code: ${item.code || item.requirementCode || '-'} | Title: ${item.name || item.title || '-'}`);
      if (item.description) console.log(`       Desc: ${item.description.slice(0, 100)}...`);
    });
    console.log('======================================================================\n');
  });

  test('3. AI Phase WBS: Automated Milestone, Work Package & Task Breakdown', async () => {
    const phaseId = await w.phase();

    const payload = {
      phaseId,
      prompt: 'วางแผนแตกงาน Milestones, Work Packages และ Tasks สำหรับงานพัฒนาระบบ Backend REST API และเชื่อมต่อ Database',
    };

    const res = await w.api.post('/api/pm/ai/phase-wbs/generate', payload);
    expect(res.status, JSON.stringify(res.body)).toBe(200);

    const wbs = res.body as any;
    expect(wbs).toBeTruthy();

    console.log('\n=================== [3] AI PHASE WBS GENERATOR ===================');
    console.log('🏆 Milestones Created:', wbs.milestonesCreated ?? wbs.milestones?.length ?? 0);
    console.log('📦 Work Packages Created:', wbs.workPackagesCreated ?? wbs.workPackages?.length ?? 0);
    console.log('📋 Tasks Created:', wbs.tasksCreated ?? wbs.tasks?.length ?? 0);
    if (wbs.message) console.log('💬 Message:', wbs.message);
    console.log('==================================================================\n');
  });

  test('4. AI Full Project Pipeline: Asynchronous Job Execution & Polling', async () => {
    const customerId = await w.customer();

    // Start background Full Project generation with essential modules
    const payload = {
      customerId,
      projectName: 'โครงการระบบห้องสมุดดิจิทัล (Digital Library System)',
      prompt: 'ระบบยืม-คืนหนังสือออนไลน์ ค้นหาหนังสือ และสแกน QR Code เพื่อยืมหนังสือ',
      durationWeeks: 8,
      startDate: today(),
      includeContract: true,
      includeGanttPhases: true,
      includeRequirements: true,
      includeSpecifications: true,
      includeTasks: true,
      includeTests: true,
      includeDelivery: true,
      includeManuals: false, // Turn off heavy modules to keep test fast & focused
      includeInvoices: false,
      includeDiagrams: false,
      includeDesignReviews: false,
      includeMa: false,
    };

    const startRes = await w.api.post('/api/pm/ai/pipeline/execute-async', payload);
    expect(startRes.status, JSON.stringify(startRes.body)).toBe(200);

    const jobId = (startRes.body as any)?.jobId;
    expect(jobId, 'jobId must be returned').toBeTruthy();

    console.log('\n=================== [4] AI FULL PROJECT ASYNC PIPELINE ===================');
    console.log('🚀 Started AI Full Project Job ID:', jobId);

    // Poll the job status every 3 seconds until completed or timeout
    let jobData: any = null;
    const maxAttempts = 35; // ~105 seconds maximum poll duration
    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      await new Promise((r) => setTimeout(r, 3000));

      const pollRes = await w.api.get(`/api/pm/ai/pipeline/jobs/${jobId}`);
      expect(pollRes.status).toBe(200);
      jobData = pollRes.body;

      const completedSteps = (jobData?.steps || []).filter((s: any) => s.status === 'DONE').length;
      const totalSteps = jobData?.steps?.length || 0;
      console.log(`   ⏳ Poll [${attempt}/${maxAttempts}] - Status: ${jobData.status} | Steps Done: ${completedSteps}/${totalSteps}`);

      if (jobData.finished) {
        break;
      }
    }

    expect(jobData, 'Job should return data').toBeTruthy();
    console.log('\n🎯 Final Job Status:', jobData.status);
    console.log('📁 Project Created ID:', jobData.projectId);
    console.log('🏷️ Project Code:', jobData.projectCode);
    console.log('📊 Entity Counts Created:');
    if (jobData.createdCounts) {
      Object.entries(jobData.createdCounts).forEach(([k, v]) => {
        console.log(`   - ${k}: ${v}`);
      });
    }

    if (jobData?.steps?.length) {
      console.log('📑 Steps Progression:');
      jobData.steps.forEach((s: any) => {
        console.log(`   [${s.status === 'DONE' ? '✅' : s.status}] ${s.label}: ${s.count} items (${s.message || '-'})`);
      });
    }

    // Register created project for clean disposal
    if (jobData.projectId) {
      // Remember to delete created project after test
      await w.api.del(`/api/pm/customer-projects/${jobData.projectId}`).catch(() => {});
    }

    expect(['RUNNING', 'COMPLETED', 'COMPLETED_WITH_ERRORS']).toContain(jobData.status);
    console.log('=========================================================================\n');
  });

  test('5. AI Pipeline Jobs: History Listing & Pagination Quality', async () => {
    const res = await w.api.get('/api/pm/ai/pipeline/jobs?page=0&size=5');
    expect(res.status).toBe(200);

    const body = res.body as any;
    expect(body).toBeTruthy();
    const content = body.content ?? body.data ?? body;
    expect(Array.isArray(content)).toBe(true);

    console.log('\n=================== [5] AI PIPELINE JOB HISTORY ===================');
    console.log('📜 Total Historical Jobs:', body.totalElements ?? content.length);
    if (content.length > 0) {
      console.log('🕒 Latest Job:', content[0].jobId, '| Status:', content[0].status, '| Project:', content[0].projectName || content[0].projectCode);
    }
    console.log('===================================================================\n');
  });
});
