import { test, expect } from '@playwright/test';
import { World } from './world';

let w: World;
test.beforeAll(async () => {
  w = await World.create();
});
test.afterAll(async () => {
  await w?.cleanup();
});

test.describe('AI Spec Draft Generation & Quality Verification', () => {
  test('AI generates comprehensive Spec Draft using Project & Requirement context', async () => {
    test.setTimeout(180_000); // AI generation can take 15-40s depending on LLM latency

    const projectId = await w.project();
    const reqId = await w.requirement();

    const requestPayload = {
      projectId,
      requirementId: reqId,
      specificationType: 'UI Specification',
      prompt: 'ระบบจัดการลูกค้าและตรวจสอบสิทธิ์การเข้าใช้งาน พร้อมแสดงผลแบบ Responsive',
    };

    const res = await w.api.post('/api/pm/specifications/generate/draft', requestPayload);
    expect(res.status, JSON.stringify(res.body)).toBe(200);

    const draft = res.body as any;

    // Verify Output Structure and Quality
    expect(draft).toBeTruthy();
    expect(draft.title, 'Title should be generated').toBeTruthy();
    expect(typeof draft.title).toBe('string');
    expect(draft.title.length).toBeGreaterThan(3);

    expect(draft.specificationType).toBe('UI Specification');
    expect(draft.description, 'Description should be generated').toBeTruthy();

    // Verify Manday calculation
    expect(draft.estimatedManday, 'Estimated manday should be a positive number').toBeGreaterThan(0);

    // Verify Rich HTML generated for Tiptap editor
    expect(draft.generatedHtmlDescription, 'Generated HTML description should exist').toBeTruthy();
    expect(draft.generatedHtmlDescription.length).toBeGreaterThan(50);

    // Print summary to test output so user can evaluate quality
    console.log('\n=================== AI GENERATED SPEC DRAFT ===================');
    console.log('📌 Title:', draft.title);
    console.log('⏱️ Estimated Manday:', draft.estimatedManday);
    console.log('🎯 Objective:', draft.objective);
    console.log('📐 Scope:', draft.scope);
    console.log('📝 Description (sample):', draft.description?.slice(0, 300));
    console.log('🎨 HTML Length:', draft.generatedHtmlDescription?.length, 'chars');
    console.log('===============================================================\n');
  });
});
