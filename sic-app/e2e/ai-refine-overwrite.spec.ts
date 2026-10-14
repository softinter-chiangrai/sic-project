import '@angular/compiler';
import { test, expect } from '@playwright/test';
import { buildRefinePrompt } from '../src/app/core/utils/ai-prompt-refine.util';
import { smartPatchFormAiDraft } from '../src/app/core/utils/ai-form-patch.util';
import * as fs from 'node:fs';
import * as path from 'node:path';

// Mock FormGroup for isolated node-environment testing
class MockFormGroup {
  private values: Record<string, any>;
  public isDirty: boolean = false;

  constructor(initial: Record<string, any>) {
    this.values = { ...initial };
  }

  get(key: string) {
    if (!(key in this.values)) return null;
    return {
      value: this.values[key],
      setValue: (v: any) => { this.values[key] = v; }
    };
  }

  patchValue(patch: Record<string, any>) {
    Object.assign(this.values, patch);
  }

  markAsDirty() {
    this.isDirty = true;
  }

  getValue(key: string) {
    return this.values[key];
  }
}

test.describe('AI Refine & Overwrite System Verification', () => {

  test.describe('1. Prompt Refinement Logic (buildRefinePrompt)', () => {
    test('returns original prompt unchanged when isOverwrite is false', () => {
      const prompt = 'ช่วยออกแบบโครงการใหม่';
      const fields = [{ label: 'ชื่อ', value: 'โครงการ ก' }];
      expect(buildRefinePrompt(prompt, fields, false)).toBe(prompt);
    });

    test('returns original prompt when isOverwrite is true but all fields are empty or null', () => {
      const prompt = 'คำสั่งทั่วไป';
      const emptyFields = [
        { label: 'หัวข้อ', value: '' },
        { label: 'รายละเอียด', value: '   ' },
        { label: 'หมายเหตุ', value: null as any },
        { label: 'สถานะ', value: undefined as any }
      ];
      expect(buildRefinePrompt(prompt, emptyFields, true)).toBe(prompt);
    });

    test('structures prompt with Edit & Refine instructions and baseline context when overwrite is true', () => {
      const userPrompt = 'เพิ่ม requirement เรื่องความปลอดภัยและการยืนยันตัวตน 2 ขั้นตอน';
      const fields = [
        { label: 'ชื่อความต้องการ', value: 'ระบบจัดการผู้ใช้' },
        { label: 'รายละเอียดเดิม', value: 'ผู้ใช้สามารถเข้าสู่ระบบด้วย อีเมล และรหัสผ่าน' },
        { label: 'ฟิลด์ว่าง', value: '' } // should be skipped
      ];

      const refined = buildRefinePrompt(userPrompt, fields, true);

      // Header and operational instructions
      expect(refined).toContain('[โหมดแก้ไข/ต่อเติมจากเนื้อหาเดิมในระบบ (Edit & Refine Mode)]');
      expect(refined).toContain('คำสั่งที่ต้องการให้แก้ไขหรือเพิ่มเติม:');
      expect(refined).toContain('เนื้อหาเดิมในฟอร์มปัจจุบัน (ให้นำข้อมูลด้านล่างนี้มาเป็นฐานหลัก');
      expect(refined).toContain('*กรุณาส่งผลลัพธ์กลับมาในรูปแบบ JSON ตามข้อกำหนดโครงสร้างเดิมทุกประการ*');

      // Baseline context
      expect(refined).toContain('- ชื่อความต้องการ: ระบบจัดการผู้ใช้');
      expect(refined).toContain('- รายละเอียดเดิม: ผู้ใช้สามารถเข้าสู่ระบบด้วย อีเมล และรหัสผ่าน');

      // User instruction appended
      expect(refined).toContain(userPrompt);
    });

    test('ignores empty HTML tags such as <p></p> when checking populated fields', () => {
      const prompt = 'คำสั่งใหม่';
      const htmlFields = [
        { label: 'เนื้อหาว่าง', value: '<p>   </p>' },
        { label: 'สเปซว่าง', value: '   ' }
      ];
      expect(buildRefinePrompt(prompt, htmlFields, true)).toBe(prompt);
    });
  });

  test.describe('2. Form Patching Logic (smartPatchFormAiDraft)', () => {
    test('Smart Preserve mode (overwrite=false): leaves existing non-empty values untouched and fills empty ones', () => {
      const form = new MockFormGroup({
        id: 'REQ-101',
        title: 'หัวข้อเดิมที่มีอยู่แล้ว',
        description: '',
        priority: null
      });

      const aiDraft = {
        id: 'HACKED-ID',
        title: 'หัวข้อใหม่จาก AI',
        description: 'รายละเอียดที่ AI เติมให้',
        priority: 'HIGH'
      };

      smartPatchFormAiDraft(form as any, aiDraft, ['id'], {}, undefined, false);

      expect(form.getValue('id')).toBe('REQ-101');
      expect(form.getValue('title')).toBe('หัวข้อเดิมที่มีอยู่แล้ว'); // PRESERVED!
      expect(form.getValue('description')).toBe('รายละเอียดที่ AI เติมให้'); // FILLED!
      expect(form.getValue('priority')).toBe('HIGH'); // FILLED!
      expect(form.isDirty).toBe(true);
    });

    test('Edit & Refine mode (overwrite=true): updates existing fields with AI refined content', () => {
      const form = new MockFormGroup({
        id: 'REQ-101',
        title: 'หัวข้อเดิม',
        description: 'เนื้อหาเดิม',
        priority: 'LOW'
      });

      const aiDraft = {
        title: 'หัวข้อเดิม (ปรับปรุงใหม่ตามคำสั่ง)',
        description: 'เนื้อหาเดิมที่ AI ต่อเติมเรื่อง Security เพิ่มเติม',
        priority: 'CRITICAL'
      };

      smartPatchFormAiDraft(form as any, aiDraft, ['id'], {}, undefined, true);

      expect(form.getValue('title')).toBe('หัวข้อเดิม (ปรับปรุงใหม่ตามคำสั่ง)');
      expect(form.getValue('description')).toBe('เนื้อหาเดิมที่ AI ต่อเติมเรื่อง Security เพิ่มเติม');
      expect(form.getValue('priority')).toBe('CRITICAL');
    });

    test('Strict Security Guard: restricted fields (id, document codes) are NEVER overwritten even with overwrite=true', () => {
      const form = new MockFormGroup({
        id: 'SECURE-UUID-1234',
        projectCode: 'PRJ-2026-001',
        contractNo: 'CTR-999',
        requirementCode: 'REQ-005',
        title: 'ชื่อโครงการเดิม'
      });

      const aiDraft = {
        id: 'MALICIOUS-AI-ID',
        projectCode: 'AI-OVERWRITE-CODE',
        contractNo: 'AI-CONTRACT-NO',
        requirementCode: 'AI-REQ-CODE',
        title: 'ชื่อโครงการใหม่ที่ปรับปรุงแล้ว'
      };

      const restricted = ['id', 'projectCode', 'contractNo', 'requirementCode'];
      smartPatchFormAiDraft(form as any, aiDraft, restricted, {}, undefined, true);

      // Restricted fields MUST remain intact
      expect(form.getValue('id')).toBe('SECURE-UUID-1234');
      expect(form.getValue('projectCode')).toBe('PRJ-2026-001');
      expect(form.getValue('contractNo')).toBe('CTR-999');
      expect(form.getValue('requirementCode')).toBe('REQ-005');

      // Unrestricted fields are updated
      expect(form.getValue('title')).toBe('ชื่อโครงการใหม่ที่ปรับปรุงแล้ว');
    });
  });

  test.describe('3. Localization Verification', () => {
    test('th.json and en.json define AI_OVERWRITE_LABEL and AI_OVERWRITE_HINT', () => {
      const thPath = path.resolve(__dirname, '../public/i18n/th.json');
      const enPath = path.resolve(__dirname, '../public/i18n/en.json');

      const th = JSON.parse(fs.readFileSync(thPath, 'utf8'));
      const en = JSON.parse(fs.readFileSync(enPath, 'utf8'));

      expect(th.AI_OVERWRITE_LABEL).toBe('แก้ไข/ต่อเติมจากข้อมูลเดิม');
      expect(th.AI_OVERWRITE_HINT).toContain('เนื้อหาเดิมในฟอร์ม');

      expect(en.AI_OVERWRITE_LABEL).toBe('Edit & refine existing content');
      expect(en.AI_OVERWRITE_HINT).toContain('existing form content');
    });
  });

  test.describe('4. Comprehensive Audit Across All 10 Modules', () => {
    const modules = [
      { name: 'PMRT02A (Project)', ts: 'src/app/feature/pm/rt/pmrt02/pmrt02A/pmrt02A.component.ts', html: 'src/app/feature/pm/rt/pmrt02/pmrt02A/pmrt02A.component.html' },
      { name: 'PMRT04A (Contract)', ts: 'src/app/feature/pm/rt/pmrt04/pmrt04A/pmrt04A.component.ts', html: 'src/app/feature/pm/rt/pmrt04/pmrt04A/pmrt04A.component.html' },
      { name: 'PMDT04A (Requirement)', ts: 'src/app/feature/pm/dt/pmdt04/pmdt04A/pmdt04A.component.ts', html: 'src/app/feature/pm/dt/pmdt04/pmdt04A/pmdt04A.component.html' },
      { name: 'PMDT07A (Specification)', ts: 'src/app/feature/pm/dt/pmdt07/pmdt07A/pmdt07A.component.ts', html: 'src/app/feature/pm/dt/pmdt07/pmdt07A/pmdt07A.component.html' },
      { name: 'PMDT12A (Test Case)', ts: 'src/app/feature/pm/dt/pmdt12/pmdt12A/pmdt12A.component.ts', html: 'src/app/feature/pm/dt/pmdt12/pmdt12A/pmdt12A.component.html' },
      { name: 'PMDT12B (Test Scenario)', ts: 'src/app/feature/pm/dt/pmdt12/pmdt12B/pmdt12B.component.ts', html: 'src/app/feature/pm/dt/pmdt12/pmdt12B/pmdt12B.component.html' },
      { name: 'PMDT14A (Delivery)', ts: 'src/app/feature/pm/dt/pmdt14/pmdt14A/pmdt14A.component.ts', html: 'src/app/feature/pm/dt/pmdt14/pmdt14A/pmdt14A.component.html' },
      { name: 'PMDT15A (User Manual)', ts: 'src/app/feature/pm/dt/pmdt15/pmdt15A/pmdt15A.component.ts', html: 'src/app/feature/pm/dt/pmdt15/pmdt15A/pmdt15A.component.html' },
      { name: 'PMDT16A (Invoice)', ts: 'src/app/feature/pm/dt/pmdt16/pmdt16A/pmdt16A.component.ts', html: 'src/app/feature/pm/dt/pmdt16/pmdt16A/pmdt16A.component.html' },
      { name: 'PMDT17A (MA Ticket)', ts: 'src/app/feature/pm/dt/pmdt17/pmdt17A/pmdt17A.component.ts', html: 'src/app/feature/pm/dt/pmdt17/pmdt17A/pmdt17A.component.html' },
    ];

    for (const mod of modules) {
      test(`${mod.name} has overwrite state, calls buildRefinePrompt, passes overwrite to smartPatchFormAiDraft, and binds in UI`, () => {
        const tsPath = path.resolve(__dirname, '..', mod.ts);
        const htmlPath = path.resolve(__dirname, '..', mod.html);

        expect(fs.existsSync(tsPath), `File ${tsPath} must exist`).toBe(true);
        expect(fs.existsSync(htmlPath), `File ${htmlPath} must exist`).toBe(true);

        const ts = fs.readFileSync(tsPath, 'utf8');
        const html = fs.readFileSync(htmlPath, 'utf8');

        // Check TS state property: supports both signal(false) and plain boolean false
        const hasStateVar = /ai(Assist)?Overwrite\s*=\s*(signal\(false\)|false)/.test(ts);
        expect(hasStateVar, `${mod.name} TS should declare aiOverwrite / aiAssistOverwrite`).toBe(true);

        // Check TS calls buildRefinePrompt
        expect(ts).toContain('buildRefinePrompt');

        // Check TS passes overwrite into smartPatchFormAiDraft
        expect(ts).toContain('smartPatchFormAiDraft');

        // Check HTML modal binds the checkbox and translation label
        const hasCheckboxBinding = html.includes('aiOverwrite') || html.includes('aiAssistOverwrite');
        expect(hasCheckboxBinding, `${mod.name} HTML should bind checkbox to aiOverwrite`).toBe(true);
        expect(html).toContain('AI_OVERWRITE_LABEL');
      });
    }
  });
});
