# คู่มือเขียนเทส AI ของระบบ SIC (สำหรับ AI ที่จะสร้างเทส)

อ่านไฟล์นี้ก่อนเขียนเทสฟีเจอร์ AI ทุกครั้ง ทุกอย่างอ้างจากโค้ดจริง (route, ชื่อปุ่ม, endpoint, field)
ถ้าโค้ดเปลี่ยนแล้วไม่ตรงไฟล์นี้ ให้เชื่อโค้ด แล้วแก้ไฟล์นี้ด้วย

---

## 1. ภาพรวม: AI ในระบบทำงานยังไง

```
หน้าเว็บ (sic-app) ──POST──> backend (sic-spring) ──> PmAiProviderService ──> LLM (OpenAI-compatible / Claude)
                                                         ↑
                                      เลือก model จากตาราง db_ai_model_config (หน้า /feature/bu/ai-model-config)
                                      ไม่เจอ → ใช้ env GEMINI_API_KEY / CLAUDE_API_KEY
```

- Frontend **ไม่เคย** เรียก LLM ตรง ทุกอย่างผ่าน backend endpoint (ดูตารางข้อ 4)
- ผลลัพธ์ AI ส่วนใหญ่เป็น **"ร่าง" (draft)** ยังไม่บันทึกลง DB จนผู้ใช้กด "วางลงในฟอร์ม" แล้วกดบันทึกฟอร์มเอง
  - ยกเว้น: **Phase WBS** และ **AI Project Wizard (execute)** บันทึกลง DB ทันที
- ประวัติการ generate (AI history) เก็บใน **localStorage** ของเบราว์เซอร์ key `sic_ai_history_<module>_<projectId|all>`
  ไม่ได้อยู่ใน DB → เทสต้องล้าง localStorage ก่อนถ้าจะเช็กจำนวนประวัติ
- ประวัติแชท Navigator เก็บใน localStorage: `sic_ai_navigator_sessions_v1`, `sic_ai_navigator_active_id_v1`, `sic_ai_navigator_model_v1`

## 2. เลือกวิธีเทส (สำคัญที่สุด)

| ระดับ | ใช้เมื่อ | วิธี | ไฟล์ตัวอย่าง |
|---|---|---|---|
| **L1 UI + mock (ค่าเริ่มต้น)** | เทส flow หน้าจอ: กดปุ่ม → ส่ง request ถูก → แสดงผล → วางลงฟอร์ม | `ui.page.route('**/api/...', r => r.fulfill({...}))` ปลอมคำตอบ backend | `e2e/ui/invoice-items.spec.ts` (เทสสุดท้ายของ AI draft) |
| **L2 API + LLM จริง** | เทสคุณภาพ prompt / backend parse JSON จาก LLM ได้ | `w.api.post(endpoint, payload)` ต้องมี API key จริง | `e2e/api/ai-all-modules-quality.spec.ts`, `ai-full-generate-quality.spec.ts` |
| **L3 Unit (node)** | logic ล้วน ไม่ต้องเปิดเบราว์เซอร์ | import util ตรง ๆ | `e2e/ai-refine-overwrite.spec.ts`, `src/app/core/utils/*.spec.ts` |

กฎ:
- **เทส UI ใช้ L1 เสมอ** ห้ามรอ LLM จริงในเทส UI (ช้า 15-60 วิ ผลไม่คงที่ CI ไม่มี key)
- เวลา mock ให้ **ดัก request ไว้ตรวจด้วย** ไม่ใช่แค่ fulfill: `route.request().postDataJSON()` แล้ว `expect` field ที่หน้าควรส่ง (projectId, prompt, model, ตัวเลือกเฉพาะ module)
- L2 (LLM จริง): **ห้าม assert ข้อความตรงตัว** ให้ assert โครงสร้าง (มี field, ไม่ว่าง, enum อยู่ในชุดที่อนุญาต, HTML ไม่พัง) + `test.setTimeout(180_000)`
- L2 ถ้าไม่มี key ให้ `test.skip(!process.env.GEMINI_API_KEY && !hasModelConfig, 'no LLM key')` ห้ามปล่อยให้ fail
- ทุกเทสต้องเช็กเคส error ด้วย: mock `status: 500, body: {message:'x'}` → หน้าต้องแสดง dialog error, ปุ่มกลับมากดได้, ไม่ค้างที่ loading
- ใช้ `await ui.page.evaluate(() => localStorage.setItem('app-lang', 'en'))` ถ้าจะหา element ด้วยข้อความอังกฤษ (หรือใช้ภาษาไทยตามตารางข้อ 4)
- Setup ข้อมูลใช้ `World` (`e2e/api/world.ts`): `w.customer()`, `w.project()`, `w.contract()`, `w.phase()`, `w.workPackage()`, `w.task()`, `w.requirement()`, `w.specification()`, `w.testScenario()` แล้ว `w.cleanup()` ใน afterAll
- เปิดหน้าใช้ `Ui.open(browser)` + `ui.visit(path)` + `ui.expectHealthy(path)` (`e2e/ui.ts`)

## 2.1 ลบข้อมูลเทสทุกครั้ง (บังคับ)

เทสต้องลบ **ทุก record ที่ตัวเองสร้าง** ใน `afterAll` ห้ามพึ่งว่า DB เทสจะถูก DROP ทิ้งเอง เพราะ:
- `E2E_KEEP=1` (VS Code ตั้งให้) จะไม่ DROP DB
- `.env.local` อาจชี้ `E2E_DB` ไปที่ DB จริงได้ → ข้อมูลขยะเข้า DB จริง

| ข้อมูลสร้างจาก | วิธีลบ |
|---|---|
| `World` (`w.project()`, `w.make(...)` ฯลฯ) | `await w.cleanup()` ใน `afterAll` (ลบย้อนลำดับให้เอง) |
| กดบันทึกผ่านหน้าจอ (ฟอร์มหลังวางร่าง AI, batch "นำไปใช้") | ดัก response ตอนบันทึกเก็บ id → ลบเองด้วย `w.api.del(...)` ใน `afterAll` (ดูโค้ดข้างล่าง) |
| Phase WBS (บันทึก milestone/WP/task ลง DB ทันที) | L1: mock `/api/pm/ai/phase-wbs/generate` → ไม่มีอะไรถูกสร้าง; L2: หลังเทส `GET` รายการลูกของ phase แล้วลบ task → work package → milestone |
| Wizard execute (สร้างทั้งโครงการ) | L1: mock `execute-async` + `jobs/{id}` → ไม่มีอะไรถูกสร้าง; L2: เก็บ `projectId` จาก job แล้วลบลูกทั้งหมดก่อนลบ project |
| localStorage (AI history, แชท Navigator) | `await resetAiStorage(ui)` ใน `afterAll` (ลบเฉพาะ `sic_ai_*`) |

```ts
const created: string[] = [];   // DELETE path ของ record ที่สร้างผ่าน UI
const res = ui.page.waitForResponse((r) => r.url().includes('/api/pm/ma-tickets/save') && r.request().method() === 'POST');
await ui.page.getByRole('button', { name: /บันทึก|Save/ }).click();
const id = idOf(await (await res).json());   // idOf จาก e2e/api/world.ts
created.push(`/api/pm/ma-tickets/${id}`);

test.afterAll(async () => {
  for (const p of created.reverse()) await w.api.del(p).catch(() => {});
  await w?.cleanup();   // ลบ parent ทีหลังลูกเสมอ
  await ui?.close();
});
```
- ตั้งชื่อข้อมูลเทสด้วย `mock('...')` หรือขึ้นต้น `E2E` เสมอ → ถ้าลบตกหล่นยังหาเจอ
- batch บันทึกหลายรายการ → ดักทุก response (`page.on('response')`) แล้วเก็บ id ทุกตัว
- เช็กหลังลบ: `GET` รายการแล้วต้องไม่เจอชื่อ `E2E...` ของรอบนี้

## 3. Component AI ที่ใช้ร่วมกัน (เทส behavior เหล่านี้ทุก module ที่ใช้)

### 3.1 AI Draft Modal ในหน้าฟอร์ม (หน้า `.../new` และ `.../:id/edit`)
มี 10 ฟอร์ม (ตารางข้อ 4.1) ใช้ pattern เดียวกัน:

1. กดปุ่มเปิด (ไอคอน `i.bi-stars` / ข้อความ "สร้างด้วย AI") → modal เปิด
2. modal มี 2 แท็บ: **สร้างเนื้อหา (Generate)** / **ประวัติ (History)**
3. ช่องในแท็บ Generate: เลือกโมเดล AI, ตัวเลือกเฉพาะ module (ถ้ามี), prompt (textarea), แนบไฟล์ (`sic-ai-attachment-picker`), checkbox **"แก้ไข/ต่อเติมจากข้อมูลเดิม"** (`AI_OVERWRITE_LABEL`)
4. กดปุ่ม generate → แสดง loading → แสดงร่าง (version `vN (ล่าสุด)`) + ปุ่ม **คัดลอก** / **วางลงในฟอร์ม**
5. กด **วางลงในฟอร์ม** → modal ปิด, ค่าลงฟอร์ม

สิ่งที่ต้องเทส:
- [ ] request ส่ง `prompt`, `model`, `projectId` (และ field เฉพาะ module) ถูก
- [ ] **Smart Preserve**: วางลงฟอร์มจะกรอก **เฉพาะช่องที่ว่าง** ช่องที่ผู้ใช้กรอกไว้แล้วต้องไม่ถูกทับ (`smartPatchFormAiDraft` ใน `core/utils/ai-form-patch.util.ts`)
- [ ] ค่า combobox จาก AI ต้องแมปเป็น value จริง (`matchAiComboOption`) เช่น AI ตอบ `"High"` → combobox priority ได้ `HIGH`; ค่าที่ไม่มีในตัวเลือกต้อง **ไม่ถูกกรอก**
- [ ] ติ๊ก "แก้ไข/ต่อเติมจากข้อมูลเดิม" แล้ว prompt ที่ส่งต้องมี `[โหมดแก้ไข/ต่อเติมจากเนื้อหาเดิมในระบบ (Edit & Refine Mode)]` + ค่าเดิมในฟอร์ม (`buildRefinePrompt`)
- [ ] ร่างที่ได้ถูกเก็บในแท็บประวัติ, กดลบประวัติได้, ปิด/เปิด modal ใหม่แล้วประวัติยังอยู่
- [ ] backend ตอบ error → dialog error, ไม่ค้าง loading
- [ ] backend ตอบร่างว่าง → dialog แจ้ง (ไม่วางค่าว่างลงฟอร์ม)
- [ ] หน้า view / เอกสารถูกล็อก (อนุมัติแล้ว) → เปิด AI ไม่ได้ (`canOpen` ในแต่ละ component)
- [ ] กดบันทึกฟอร์มหลังวางร่าง → record ถูกสร้างจริง (เช็กผ่าน `w.api.get`)

### 3.2 AI Batch Modal ในหน้า list (`sic-ai-batch-modal`)
1. **ต้องเลือกโครงการก่อน** (project picker ของระบบ, `customerState.currentSelectedProjectIds()`) ไม่งั้นกดบันทึกจะขึ้น error "กรุณาเลือกโครงการ"
2. กดปุ่ม **"สร้างชุดข้อมูลด้วย AI" / "AI Batch Create"** (`AI_BATCH_CREATE_BUTTON`)
3. ใส่ prompt → กด **"สร้างด้วย AI" / "Generate with AI"** → `POST /api/ai/batch-generate` body `{moduleType, prompt, count:5, projectId, model, attachments}` ตอบ `{moduleType, items:[...], message}`
4. ได้ตารางแถว (ติ๊กไว้ทุกแถว) แก้ค่าในเซลล์ได้, ลบแถวได้, ติ๊ก/ไม่ติ๊กทั้งหมดได้
5. กด **"สร้างเพิ่มเติม"** → แถวใหม่ **ต่อท้าย** (ไม่ทับของเดิม)
6. กด **"นำไปใช้ (N รายการ)" / "Apply (N items)"** → บันทึกเฉพาะแถวที่ติ๊ก → grid reload

สิ่งที่ต้องเทส:
- [ ] prompt ว่าง → ปุ่ม generate ไม่ทำงาน
- [ ] `items: []` → ข้อความ `AI_BATCH_NO_RESULT_ERROR`
- [ ] แก้เซลล์แล้วค่าที่บันทึกเป็นค่าที่แก้
- [ ] ไม่ติ๊กบางแถว → บันทึกเฉพาะที่ติ๊ก (นับ record ใน DB)
- [ ] แท็บ **"ประวัติเวอร์ชัน"** → กด **"ใช้งานชุดนี้"** คืนแถว + prompt + model
- [ ] ไม่ได้เลือกโครงการ → กดนำไปใช้แล้วขึ้น error, ไม่สร้าง record

### 3.3 Global AI Navigator (ปุ่มลอย มีทุกหน้าใต้ `/feature`)
- ปุ่มลอย `.ai-nav-fab` (aria-label "ผู้ช่วย AI นำทางระบบ" / "AI System Navigator") → แผงแชท
- พิมพ์ใน `.ai-nav-input` → Enter หรือ `.ai-nav-send` → `POST /api/ai/navigator/chat` body `{message, currentPath, model, attachments?}`
- ตอบ `{answer, suggestedRoutes:[{label,path}], openBatchModuleType, openBatchRoute}`
  - `suggestedRoutes` → ปุ่ม `.ai-nav-route-btn` กดแล้วไปหน้านั้น + แผงปิด
  - มี `openBatchRoute` + `openBatchModuleType` → ไปหน้า `createRoute` ของ module พร้อม query `?aiAutoOpen=1&aiModuleType=X&aiPrompt=...` (ดู 3.5)
- ปุ่มหัวแผง: เลือกโมเดล (`.ai-nav-model-btn`), เปิด Wizard (`.ai-nav-wizard-btn`), แชทใหม่, ประวัติ (`bi-clock-history`), ปิด (`.ai-nav-close-btn`)
- ประวัติ: รายการ session (`.ai-nav-history-item`), ลบทีละอัน (`.ai-nav-history-del-btn`), ล้างทั้งหมด (`.ai-nav-clear-history-btn`)
- แนบไฟล์: `.ai-nav-attach-btn` / ลากวาง, ลบ chip `.ai-nav-chip-del`

สิ่งที่ต้องเทส:
- [ ] ข้อความแรกกลายเป็นชื่อ session (ตัดที่ 30 ตัว + `...`)
- [ ] error → ขึ้นข้อความ `AI_NAV_ERROR_MSG` ในแชท (ไม่ใช่ dialog)
- [ ] reload หน้าแล้วประวัติแชทยังอยู่ (localStorage)
- [ ] ส่งข้อความว่าง ไม่มีไฟล์ → ไม่ยิง request

### 3.4 AI Full-Project Wizard (`sic-ai-project-wizard`)
- เปิดจาก: หน้า `/feature/pm/project` ปุ่ม **"สร้างด้วย AI"** (`PMRT02_CREATE_WITH_AI_BTN`) หรือปุ่ม wizard ใน Navigator
- modal `.ai-wizard-modal` มี 4 step (`.stepper-item`):
  1. กรอก ชื่อโครงการ / prompt (ต้องมีอย่างน้อย 1 อย่าง), ลูกค้า, ระยะเวลา (สัปดาห์, ค่าเริ่ม 12), โมเดล, ไฟล์แนบ, ติ๊กสิ่งที่จะสร้าง (requirements, specs, tasks, gantt, delivery, contract, tests, manuals, invoices, diagrams, design reviews, MA)
  2. กด generatePreview → `POST /api/pm/ai/pipeline/preview` → แสดงแผน
  3. กด executeFullPipeline → `POST /api/pm/ai/pipeline/execute-async` ได้ `{jobId}` → poll `GET /api/pm/ai/pipeline/jobs/{jobId}` ทุก 2 วิ
  4. เสร็จ → สรุปจำนวนที่สร้าง (`.summary-stat-grid`) + ปุ่มไปหน้าโครงการ / Gantt
- ประวัติงาน: `.ai-wizard-history-btn` → `GET /api/pm/ai/pipeline/jobs?page=&size=` (อยู่ใน DB ไม่ใช่ localStorage)
- ปิด wizard ระหว่างรัน แล้วเปิดใหม่ → ต้องกลับมาที่ step 3 และ poll ต่อ
- เทส L1: mock preview + execute-async + jobs/{id} (ตอบ RUNNING ก่อน แล้ว DONE) แล้วเช็กว่า step เปลี่ยน 1→2→3→4

### 3.5 Deep link เปิด AI อัตโนมัติ (`tryAiAutoOpen`)
เปิด URL `<createRoute>?aiAutoOpen=1&aiModuleType=<TYPE>&aiPrompt=<ข้อความ>` → modal AI เปิดเอง, กรอก prompt, generate ทันที, แล้ว query param หายจาก URL
- รองรับ: PROJECT, CONTRACT, REQUIREMENT, SPECIFICATION, TEST_SCENARIO, DELIVERY, USER_MANUAL, INVOICE, MA_TICKET (ฟอร์ม A) และ TEST_CASE (เปิด **batch modal** ที่ `/feature/pm/test-management`)
- `aiModuleType` ไม่ตรงกับหน้า → ต้องไม่เปิด
- หน้า view / ล็อก → ต้องไม่เปิด

## 4. ตาราง module

### 4.1 ฟอร์มที่มี AI Draft Modal

| Module | หน้า (route) | Component | Endpoint (POST) | field เฉพาะใน request | field ในร่างที่ใช้ | ต้องมีก่อน |
|---|---|---|---|---|---|---|
| Project | `/feature/pm/project/new` | `pmrt02A` | `/api/pm/customer-projects/generate/draft` | `customerId, projectCode, projectName` | `projectName, projectCode, description, priority, budgetManday, startDate, plannedEndDate, status` | customer |
| Contract | `/feature/pm/contract/new` | `pmrt04A` | `/api/pm/contracts/generate/draft` | `projectId, customerId, contractNo, contractType, contractValue` (มี dropdown ประเภทสัญญาใน modal) | `contractNo, scopeSummary, paymentTerms, ...` | project, customer |
| Requirement | `/feature/pm/requirement/new` | `pmdt04A` | `/api/pm/requirement/ai/generate` | `projectId, title, requirementType` (มีช่อง "ชื่อฟีเจอร์" ใน modal) | `requirementCode, title, description, acceptanceCriteria, businessValue, requirementType, priority` | project |
| Specification | `/feature/pm/specification/new` | `pmdt07A` | `/api/pm/specifications/generate/draft` | `projectId, requirementId, diagramIds, specificationType` | `title, specificationType, priority, estimatedManday, generatedHtmlDescription \| description` | project, requirement (diagram ไม่บังคับ) |
| Test Case | `/feature/pm/test-case/new` | `pmdt12A` | `/api/pm/test-cases/generate/draft` | `projectId, taskId, scenarioId, title` (มี dropdown task) | `title, testStep, expectedResult, priority` | project, scenario |
| Test Scenario | `/feature/pm/test-scenario/new` | `pmdt12B` | `/api/pm/test-scenarios/generate/draft` | `projectId, taskId, scenarioName` | `scenarioName, description, priority` | project |
| Delivery | `/feature/pm/delivery/new` | `pmdt14A` | `/api/pm/delivery/generate/draft` | `projectId, deliveryName` | `deliveryTitle, deliveryName, deliverySummary, deliveryType, deliveryVersion, deliveryDate, releaseNote, items, checklists` | project |
| User Manual | `/feature/pm/manual/new` | `pmdt15A` | `/api/pm/manual/generate/draft` | `projectId, manualTitle, manualType, requirementIds, specificationIds` | `manualTitle, version, manualType, sections[{sectionCode, sectionTitle, content, sortOrder}]` | project |
| Invoice | `/feature/pm/invoice/new` | `pmdt16A` | `/api/pm/invoices/generate/draft` | `projectId, contractId, invoiceType` (dropdown ประเภทวางบิล) | `invoiceTitle, billingType, vatRate, remark, items[{itemCode,itemDescription,quantity,unitPrice,discount,amount}]` | project, contract |
| MA Ticket | `/feature/pm/ma-ticket/new` | `pmdt17A` | `/api/pm/ma-tickets/generate/draft` | `projectId, title, ticketType, priority` (dropdown 2 ตัว) | `title, description, severity, ticketType, priority, rootCause, resolution, resolutionSummary, startDate, endDate` | project |

ทุก request มี `prompt, model, attachments` ด้วย

ข้อสังเกตเฉพาะ module:
- **User Manual**: ร่างเป็น `sections[]` มี 2 โหมดตอนวาง: **replace** (แทนหัวข้อ) / **append** (ต่อท้าย) ต้องเทสทั้งสองแบบ; ร่างที่ไม่มี `sections` = ถือว่าว่าง
- **Invoice**: วางแล้ว `items` ต้องลงตารางรายการ และยอดรวมคำนวณใหม่ (ตัวอย่างอยู่ใน `invoice-items.spec.ts`)
- **Specification**: ถ้า title ในฟอร์มมีค่าแล้ว ต้องคงชื่อเดิม
- **Contract**: deep link เปิดได้เฉพาะหน้า new (`!this.contractId`)
- **Test Case**: เปิดใน `/test-execution/:id` ไม่ได้

### 4.2 หน้า list ที่มี Batch Modal

| moduleType | หน้า | Component | field ในตาราง | บันทึกผ่าน | ต้องมีก่อน |
|---|---|---|---|---|---|
| PHASE | `/feature/pm/phase` | `pmdt01` | phaseName, description, startDate, endDate, color | `phaseService.createPhase` | เลือกโครงการ |
| REQUIREMENT | `/feature/pm/requirement` | `pmdt04` | title, description, requirementType, priority, source | `POST /api/pm/requirement/save` | เลือกโครงการ |
| SPECIFICATION | `/feature/pm/specification` | `pmdt07` | title, description, specificationType, priority, module | `service.save` | เลือกโครงการ |
| DESIGN_REVIEW | `/feature/pm/design-review` | `pmdt09` | title, description, severity (reviewableType บันทึกเป็น `Specification` เสมอ) | `POST /api/pm/design-reviews` | เลือกโครงการ |
| TASK | `/feature/pm/task-board` | `pmdt10` | taskName, description, priority, estimateManday, color | `service.createTask` | **เลือก Work Package** |
| TEST_CASE | `/feature/pm/test-management` | `pmdt12` | title, testStep, expectedResult, priority, testType | `service.saveTestCase` | (ไม่บังคับ project) |
| DELIVERY | `/feature/pm/delivery` | `pmdt14` | deliveryTitle, deliverySummary, deliveryType | `service.save` | เลือกโครงการ (`PM_AI_BATCH_NO_PROJECT_TITLE`) |
| USER_MANUAL | `/feature/pm/manual` | `pmdt15` | manualTitle, manualType, version | `service.save` | เลือกโครงการ |
| MA_TICKET | `/feature/pm/ma-ticket` | `pmdt17` | title, description, severity, ticketType | `POST /api/pm/ma-tickets/save` | เลือกโครงการ |

schema ที่ backend สั่งให้ LLM ตอบ ดูที่ `sic-spring/.../service/AiModuleRegistry.java` (L2 ใช้เช็ก enum เช่น `requirementType ∈ FUNCTIONAL|NON_FUNCTIONAL|BUSINESS_RULE`)
Registry มี CUSTOMER, CONTRACT, PROJECT, INVOICE, APPROVAL_FLOW, ROLE, TEAM, MILESTONE, WORK_PACKAGE ด้วย แต่ **ยังไม่มีหน้าไหนใช้ batch modal ของ module เหล่านี้** เทสได้แค่ระดับ API

### 4.3 ฟีเจอร์ AI เฉพาะทาง

| ฟีเจอร์ | หน้า / วิธีกด | Endpoint | ผล / สิ่งที่ต้องเทส |
|---|---|---|---|
| **Phase WBS** | `/feature/pm/phase/:id` → ปุ่ม `bi-stars` "สร้างด้วย AI" (`PMDT02_AI_WBS_BTN`) → เลือกโมเดล, prompt, ไฟล์ → กดรัน | `POST /api/pm/ai/phase-wbs/generate` body `{phaseId, projectId, prompt, model, attachments}` ตอบ `{milestones, workPackages, tasks, message}` | **บันทึกลง DB ทันที** → หน้า reload เห็น milestone/WP/task ใหม่; ผลรวม 0 → dialog warn; ระหว่างรันกดปิด modal ไม่ได้ |
| **Diagram AI chat** | `/feature/pm/diagram` → เปิดแผงแชท (`toggleChat`) → พิมพ์ → `sendMessage()`; มี prompt สำเร็จรูป (`applyPrompt`) | `POST /api/diagram/chat`; sessions: `GET/DELETE /api/diagram/chat/{diagramId}/sessions...`, ชื่อ session `PUT .../title` | คำตอบมีโค้ด Mermaid → ปุ่ม **คัดลอกโค้ด Mermaid** / **แทรกลง Draw.io** (`insertMermaidToDiagram`); ต้องมี diagram เปิดอยู่ (`diagramId`) ไม่งั้นไม่ส่ง; session ใหม่/เปลี่ยนชื่อ/ลบ/ล้างแชท |
| **Mermaid generate** | (API) | `POST /api/ai/generate-mermaid` `{prompt}` | ตอบ mermaid script + ชื่อ + type |
| **SQL จาก ER** | `/feature/pm/diagram` → ปุ่ม generate SQL (`generateSql`) → dialog SQL export | `POST /api/ai/generate-sql-from-er` (xml, vendor, pageName); ประวัติ `GET /api/ai/sql-history/{tabId}` | DDL แสดงผล, คัดลอก, ดาวน์โหลด `.sql`, แท็บประวัติ |
| **ตรวจ DB design** | ใน dialog SQL export → `validateDbDesign()` สลับภาษา th/en | `POST /api/ai/validate-db-design` | แสดงผลวิเคราะห์ตามภาษาที่เลือก, คัดลอก SQL แนะนำ |
| **Impact Analysis** | `/feature/pm/change-request/new` หรือ `:id/edit` → เลือก targetType + targetId ก่อน → กดวิเคราะห์ด้วย AI (`aiAnalyzeImpact`) → ปุ่ม "วิเคราะห์ใหม่" | มี id: `POST /api/pm/impact-analysis/ai-analyze/{crId}`; ยังไม่บันทึก: `POST /api/pm/impact-analysis/ai-preview` `{targetType,targetId,title,description,changeReason,changeLevel,priority}` | ส่วนผลกระทบแสดงขึ้นมา; **ไม่เลือก target → ไม่ยิง request**; เคส new ต้องยิง `ai-preview` ไม่ใช่ `ai-analyze` |
| **Bug Smart Resolution** | `/feature/pm/bug/new` หรือ `:id/edit` → เลือกภาษา th/en → กด `analyzeBugWithAi` | `POST /api/pm/bugs/ai-smart-resolution` `{title, description, environment, lang}` ตอบ `{rootCause, suggestedFix, codeSnippet, preventionTest, lang}` | ไม่มีทั้ง title และ description → dialog warn ไม่ยิง request; กดปุ่มนำผลไปใส่ (`applyResolutionToDescription`) → **ต่อท้าย** description เดิม ไม่ทับ |
| **ตั้งค่าโมเดล AI** | `/feature/bu/ai-model-config` → new / edit | `GET/POST/DELETE /api/ai-model-config`; dropdown ทุกหน้าโหลดจาก `GET /api/ai/models` | field: modelCode, displayName, providerLabel, apiFormat (CLAUDE / อื่น = OpenAI), apiUrl, apiKey, maxTokens, isActive, isDefault, isRecommended, description; โมเดลที่ปิด (`isActive=false`) ต้องไม่โผล่ใน dropdown ของ modal ใด ๆ; apiKey ถูกเข้ารหัสใน DB ห้ามส่งกลับเป็น plain text |

## 5. แม่แบบโค้ด

### L1: ฟอร์ม + mock (ใช้แบบนี้เป็นหลัก)
```ts
import { test, expect } from '@playwright/test';
import { Ui } from '../ui';
import { World } from '../api/world';

let ui: Ui; let w: World;
test.beforeAll(async ({ browser }) => { w = await World.create(); ui = await Ui.open(browser); });
test.afterAll(async () => { await ui?.close(); await w?.cleanup(); });

test('MA Ticket: AI ร่าง → วางลงฟอร์ม โดยไม่ทับช่องที่กรอกแล้ว', async () => {
  const projectId = await w.project();
  let sent: any;
  await ui.page.route('**/api/pm/ma-tickets/generate/draft', (route) => {
    sent = route.request().postDataJSON();
    return route.fulfill({ status: 200, contentType: 'application/json',
      body: JSON.stringify({ title: 'AI title', description: '<p>AI desc</p>', severity: 'HIGH', ticketType: 'BUG_SUPPORT' }) });
  });
  await resetAiStorage(ui);                                    // ล้าง AI history (e2e/ui/ai.ts)
  await ui.visit('/feature/pm/ma-ticket/new');
  await ui.expectHealthy('/feature/pm/ma-ticket/new');
  // ... เลือกโครงการ projectId ในฟอร์ม (ดูวิธีกรอกใน e2e/ui/forms.ts), กรอก title เองก่อน เพื่อเช็ก Smart Preserve
  // ... เปิด modal (ปุ่ม i.bi-stars), พิมพ์ prompt, กด generate, กด "วางลงในฟอร์ม"
  expect(sent.prompt).toBeTruthy();
  expect(sent.projectId).toBe(projectId);
  // expect: title = ค่าที่กรอกเอง (ไม่ถูกทับ), description = AI desc
  await ui.page.unroute('**/api/pm/ma-tickets/generate/draft');
});
```

### L1: เคส error (ทำทุก module)
```ts
await ui.page.route('**/generate/draft', (r) => r.fulfill({ status: 400, contentType: 'application/json', body: JSON.stringify({ message: 'AI ล่ม' }) }));
// กด generate → expect dialog มีข้อความ 'AI ล่ม', ปุ่ม generate enabled อีกครั้ง
```

### L2: API + LLM จริง
```ts
test('Requirement AI draft: โครงสร้างถูก', async () => {
  test.setTimeout(180_000);
  const res = await w.api.post('/api/pm/requirement/ai/generate', { projectId: await w.project(), title: 'Low stock alert', prompt: '...', requirementType: 'FUNCTIONAL' });
  expect(res.status, JSON.stringify(res.body)).toBe(200);
  expect(res.body.title).toBeTruthy();
  expect(['FUNCTIONAL', 'NON_FUNCTIONAL', 'BUSINESS_RULE']).toContain(res.body.requirementType);
});
```

## 6. Bug ที่เจอและแก้แล้ว (มีเทสกันไว้ ถ้าเทสพังแปลว่ากลับมาอีก)

| จุด | เดิม | ตอนนี้ / เทสที่กัน |
|---|---|---|
| Wizard ปุ่มไปหน้าโครงการ / Gantt / ประวัติ | ไป `/pm/dt/pmdt01A` ที่ไม่มี route | `/feature/pm/project/:id/edit`, `/feature/pm/gantt` — `ai-navigator-wizard.spec.ts` |
| Deep link module ที่ไม่มี AI modal | Navigator ส่ง `aiAutoOpen` ไปหน้าที่ไม่รับ | registry ไม่มี `createRoute` → ส่งปุ่มลิงก์หน้ารายการแทน (`AiNavigatorServiceImpl`) |
| Impact Analysis ล้ม | มีแค่ `console.error` | dialog error — `ai-special.spec.ts` |
| Batch Design Review | สั่ง AI ตอบ `reviewType/priority`, บันทึก `reviewableType: 'UI/UX'` | schema = `severity`, reviewableType = `Specification` |
| Batch MA Ticket | registry ให้ `GENERAL_QUESTION`/`CR_SUPPORT` ที่ enum ไม่มี → 400 | schema = enum จริง + fallback ค่าที่ถูก — `ai-batch.spec.ts` |
| Batch Test Case | ไม่ส่ง `testCaseCode` (required) → 400 เงียบ | สร้าง `TC-AI-<stamp>-<n>` + dialog error — `ai-batch.spec.ts` |
| i18n | en เป็นชื่อ key ("Create With Ai Button"), Thai hardcode ใน template 100 จุด | `i18n.spec.ts` (3 guard) |
| Batch Change Request | CR ต้องผูกเอกสารเป้าหมาย แต่ batch เลือกไม่ได้ → 400 | เอา batch ออกจากหน้า CR (`pmdt06`) — CR สร้างทีละใบผ่านฟอร์ม |

## 6.1 กับดักที่เจอตอนเขียนเทส (อย่าทำซ้ำ)
- ใช้ `resetAiStorage(ui)` จาก `e2e/ui/ai.ts`: เปิดหน้าแอปก่อน (หน้า `about:blank` อ่าน localStorage ไม่ได้) และลบเฉพาะ key `sic_ai_*` — ห้าม `localStorage.clear()` (ลบ business ที่เลือก / theme ไปด้วย)
- ชื่อปุ่มมี glyph ของไอคอน bootstrap-icons นำหน้า: ห้าม `exact: true` หรือ regex `^...$` → ใช้ substring หรือ `new RegExp(\`${t(key)}$\`)`
- ปุ่มที่ disabled (prompt ว่าง, Send ว่าง) ให้ `expect(...).toBeDisabled()` ไม่ใช่ click
- ปิด dialog แจ้งเตือนของแอปเฉพาะใน `.sic-dialog-overlay-pane` (ปุ่ม OK/Close) — ปุ่ม Close ของ AI modal มีชื่อเดียวกัน; dialog อาจขึ้นช้าและซ้อนกันได้ (รอแล้ววนปิด)
- User Manual วางร่างลงฟอร์มเองหลัง generate (ไม่มีปุ่ม paste ให้กด)
- id ปลอมในหน้า edit → resolver หาไม่เจอแล้วเด้งหน้าแรก: ใช้ record จริงจาก `World`
- textarea เช็กด้วย `toHaveValue` ไม่ใช่ `toContainText`

## 7. Checklist ก่อนส่งเทส
- [ ] เทส UI ไม่รอ LLM จริง (มี `page.route` ครบทุก AI endpoint ที่หน้านั้นเรียก)
- [ ] มีทั้ง happy path, error path, empty result
- [ ] เช็ก request body ไม่ใช่แค่ผลบนจอ
- [ ] ล้าง localStorage ก่อนเช็กประวัติ
- [ ] ลบข้อมูลทุกอย่างที่เทสสร้าง ทั้งจาก `World` และจาก UI (ข้อ 2.1) + ล้าง localStorage
- [ ] selector ใช้ role/text/class จากไฟล์นี้ ไม่ใช้ `waitForTimeout`
- [ ] รันด้วย `cd sic-app && npx playwright test --project=ui e2e/ui/<file>` (UI) หรือ `--project=api` (API)
