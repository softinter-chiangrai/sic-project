# คู่มือการจำกัดข้อมูลใน Default Prompt ของ AI (AI Default Prompt Limitations)
> **ระบบ SIC Project (sic-spring & sic-app)**  
> รวมกฎเหล็ก, ข้อจำกัดขนาด, จำนวนรายการ (Cardinality), ค่า Enum และฟอร์แมตที่ระบุไว้ใน **Default System Prompt** ของระบบ AI ทั้งหมด

---

## 1. ภาพรวมการควบคุมผ่าน Default System Prompt

ในระบบ SIC ทุกคำขอที่ส่งไปยัง LLM (Gemini, Claude, GPT, DeepSeek) จะมีการประกบ **Default System Prompt** ส่วนกลางของแต่ละโมดูล เพื่อทำหน้าที่เป็น **"Guardrails"** บังคับให้ AI ทำงานอยู่ในกรอบ ไม่สร้างข้อมูลยาวเกิน Token และได้โครงสร้างที่สามารถแปลงลงฐานข้อมูล PostgreSQL ได้ทันที 100%

---

## 2. ตารางสรุปข้อจำกัดใน Default Prompt แยกตาม Generator

| ลำดับ | โมดูล / Service Generator | ข้อจำกัดจำนวนรายการ (Cardinality) | ข้อจำกัดความยาว / ฟิลด์ | ข้อจำกัดค่าตัวเลือก (Strict Enum) |
|:---:|---|---|---|---|
| 1 | **Project Plan**<br>`ProjectGeneratorService` | 1 แผนโครงการ | • `description`: ข้อความ plain text ไม่เกิน **1,500 ตัวอักษร**<br>• HTML tags: `<p>`, `<ul>`, `<li>`, `<strong>`, `<h3>` | • `status`: 18 สถานะ (เริ่มต้นใช้ `Prospect` หรือ `Planning`)<br>• `priority`: `Low \| Medium \| High \| Critical`<br>• วันที่: `yyyy-MM-dd` |
| 2 | **WBS & Phases**<br>`AiProjectPipelineJobService` | • **3–5 Phases**<br>• ไม่เกิน **2 Milestones / Phase**<br>• ไม่เกิน **2 Work Packages / Milestone** | • สัปดาห์: อิงตาม `durationWeeks` (1-based index) | • กำหนดงวดสอดคล้องกับ Timeline โครงการ |
| 3 | **Requirement (PMDT04)**<br>`RequirementGeneratorService` | สูงสุดไม่เกิน **8 ข้อ** (`max 8`) | • `description`, `acceptanceCriteria`, `businessValue`: ใช้ rich text HTML tags ที่กำหนด | • `requirementType`: `FUNCTIONAL`, `NON_FUNCTIONAL`, `BUSINESS_RULE`, `REPORT`, `INTEGRATION`, `SECURITY`, `DATA`, `UI`<br>• `priority`: `LOW \| MEDIUM \| HIGH \| CRITICAL` |
| 4 | **Specification (PMDT07)**<br>`SpecificationGeneratorService` | สูงสุดไม่เกิน **8 ฉบับ** (`max 8`) | • แต่ละ Spec ต้องผูกกับ 1 Requirement (1:1)<br>• มี screens, fields, validations | • `specificationType`: `UI`, `API`, `Business Rule`, `Report`, `Data`, `Integration`, `Permission Specification`<br>• `priority`: `LOW \| MEDIUM \| HIGH \| CRITICAL` |
| 5 | **Task (งานปฏิบัติการ)**<br>`AiProjectPipelineJobService` | สูงสุดไม่เกิน **12 tasks** (`max 12`) | • แต่ละ Task ต้องผูกกับ Work Package และ Specification ตามหมายเลขลำดับ | • `status`: `Todo \| In Progress \| Review \| Done` |
| 6 | **Test Scenario & Case (PMDT12)**<br>`TestCaseGeneratorService`<br>`TestScenarioGeneratorService` | • บังคับ **1 Scenario ต่อ 1 Task**<br>• **1–3 Test Cases ต่อ Scenario** | • `testStep`: Ordered list HTML `<ol><li>...</li></ol>`<br>• `expectedResult`: HTML `<p>`, `<strong>` | • `testType`: บังคับ `SIT` หรือ `UAT` เท่านั้น |
| 7 | **Delivery Checklist (PMDT14)**<br>`DeliveryGeneratorService` | บังคับ **3 ถึง 6 ข้อตรวจรับต่องวด** *(ห้าม array ว่าง)* | • รายการตรวจรับครอบคลุม Source code, Test results, User manuals, Deployment | • งวดส่งมอบ: อิงตาม Milestone |
| 8 | **User Manual (PMDT15)**<br>`UserManualGeneratorService` | สูงสุดไม่เกิน **3 เล่ม** (`max 3`) | • แต่ละเล่มมี **3–4 หัวข้อย่อย (sections)**<br>• รองรับ styled callout boxes สำหรับ tips/warnings | • `manualType`: `USER`, `ADMIN`, `INSTALLATION`, `OPERATION`, `TROUBLESHOOT` |
| 9 | **Design Review (PMDT08)**<br>`AiProjectPipelineJobService` | สูงสุดไม่เกิน **4 ข้อตรวจทาน** (`max 4`) | • ตรวจสอบความสอดคล้องของ Spec กับ Diagram | • ผลการตรวจ: `Pass \| Minor \| Major` |
| 10 | **Diagrams (DFD/ERD/Use Case)**<br>`AiProjectPipelineJobService` | สูงสุดไม่เกิน **25 nodes / 15 entities** | • บังคับ Mermaid Syntax กฎรูปทรงเข้มงวด | • Node IDs: ภาษาอังกฤษและตัวเลขเท่านั้น (E1, P1, D1, UC1) |
| 11 | **MA Ticket (PMDT17)**<br>`MaTicketGeneratorService` | ตามจำนวนคำขอ | • `description`: ปัญหาและขั้นตอนการเกิด (HTML)<br>• `resolutionSummary`: วิธีแก้และ RCA (HTML) | • `ticketType`: `BUG_SUPPORT`, `DATA_ISSUE`, `USER_SUPPORT`, `CHANGE_REQUEST`<br>• `severity`: `LOW`, `MEDIUM`, `HIGH`, `CRITICAL` |
| 12 | **AI Navigator**<br>`AiNavigatorServiceImpl` | 1 คำตอบต่อ 1 คำถาม | • แนะนำเส้นทาง URL จริงจากระบบ | • `suggestedRoutes`: ต้องดึงจาก `AiModuleRegistry` เท่านั้น **ห้ามสร้าง path เอง** |
| 13 | **Batch Data Generator**<br>`AiBatchGeneratorServiceImpl` | ตามพารามิเตอร์ `count` | • **Append-Only Mode** | • **ห้ามใส่ค่า id, code, running number** (ปล่อย null เสมอ) |
| 14 | **SQL Generator**<br>`AiSqlGeneratorServiceImpl` | 1 สคริปต์ SQL DDL | • คำสั่ง SQL executable code ล้วนๆ | • **ห้ามมี Markdown, ห้ามมีคำอธิบาย**, ใช้ `CREATE TABLE` เฉพาะตารางใหม่ |

---

## 3. รายละเอียดกฎเหล็ก 5 ประการใน Default Prompt

### กฎข้อที่ 1: บังคับรูปแบบผลลัพธ์เป็น Strict JSON เท่านั้น (No Conversational Filler)
ทุก System Prompt จะระบุประโยคนี้เป็นข้อแรกเสมอ:
```text
RULES:
1. Respond strictly in valid JSON format inside a ```json ``` block.
2. Do NOT wrap with any text, greetings, or explanations outside the ```json ``` block.
```
* **ผลลัพธ์:** ป้องกันไม่ให้ AI ตอบคำทักทาย เช่น *"สวัสดีครับ นี่คือข้อมูลโครงการที่คุณขอ..."* ซึ่งจะทำให้ Jackson `ObjectMapper` ใน Backend พังทันที

---

### กฎข้อที่ 2: ห้ามปล่อยฟิลด์ว่าง (Fill Every Field Rule)
```text
Fill EVERY field of the JSON (including dropdown/code/date/number fields) with a sensible value 
inferred from the user's prompt and project context. Never leave a field null unless it is truly impossible to infer.
```
* **ผลลัพธ์:** ป้องกันปัญหาข้อมูลในหน้าจอ Frontend แสดงผลเป็นช่องว่างสีขาว หรือค่า `undefined`

---

### กฎข้อที่ 3: กฎการจำกัดความยาวและแท็ก HTML (Sanitized Rich Text)
```text
Formatted in HTML using only <p>, <ul>, <li>, <strong>, <h3> tags suitable for rich-text editors.
Description max 1500 characters.
Dates use yyyy-MM-dd.
```
* **ผลลัพธ์:**
  - AI จะใช้เฉพาะแท็กมาตรฐานที่ Tiptap Editor ของ Frontend รองรับ
  - ป้องกัน XSS Injection โดยห้ามใช้ `<script>`, `<style>`, `<iframe>` หรือ `onclick`
  - ป้องกันสตริงล้นคอลัมน์ของ PostgreSQL

---

### กฎข้อที่ 4: กฎ Append-Only และห้ามกำหนดรหัสระบบเอง (Batch Mode)
ใน `AiBatchGeneratorServiceImpl.java`:
```text
กติกาสำคัญ (Data Integrity - ห้ามฝ่าฝืน):
1. คุณกำลังสร้าง "ข้อมูลใหม่" เพื่อเพิ่มเข้าระบบเท่านั้น (Append Only) ไม่มีการแก้ไขข้อมูลเดิมใดๆ
2. ห้ามกำหนดค่าฟิลด์ที่เป็นรหัสระบบ (id, code, running number) ปล่อยเป็น null เสมอ ระบบจะสร้างให้เอง
```
* **ผลลัพธ์:** ป้องกันไม่ให้ AI สุ่มรหัส UUID หรือรหัสเอกสารไปทับกับข้อมูลที่มีอยู่จริงในฐานข้อมูล

---

### กฎข้อที่ 5: กฎรูปทรงและสัญลักษณ์ของ Mermaid Diagram
ใน `AiProjectPipelineJobService.java`:
```text
Respond ONLY with valid Mermaid code in a ```mermaid block. Max 25 nodes / 15 entities.
Standard Diagram Shapes & Notation Rules:
* External Entity: MUST be a Rectangle `E1["Entity Name"]` (NEVER circle).
* Process: MUST be a Rounded Rectangle WITH process number `P1("1.0 Process Name")`.
* Data Store: MUST be a Cylinder `D1[("D1: Data Store Name")]`.
* Use Case: MUST be Oval / Stadium `UC1(["Use Case Name"])` (NEVER circle `((...))` and NEVER square).
```
* **ผลลัพธ์:** Mermaid Diagram ที่ AI วาดจะมีรูปทรงถูกต้องตามหลักวิศวกรรมซอฟต์แวร์ (SDLC) 100% อาจารย์ตรวจแล้วไม่ถูกหักคะแนน

---

## 4. กฎพฤติกรรมเฉพาะของ AI Navigator (บอทนำทางระบบ)

ใน [AiNavigatorServiceImpl.java](file:///c:/Users/lovew/Student/Project-Main/Java-intern/sic-project/sic-spring/sic/src/main/java/com/softinter/sicapi/service/impl/AiNavigatorServiceImpl.java):
```text
หน้าที่ของคุณคือ ตอบคำถามเกี่ยวกับขั้นตอนการใช้งานระบบ (Workflow) และแนะนำ/พาผู้ใช้ไปยังหน้าที่ต้องการเท่านั้น
ห้ามกรอกฟอร์มหรือสร้างข้อมูลเอง หน้าที่ของคุณคือ "นำทาง" ไม่ใช่ "กรอกข้อมูล"

กติกาการตอบ:
1. ตอบเป็นภาษาเดียวกับที่ผู้ใช้ถาม (ภาษาไทย หรือภาษาอังกฤษ) เสมอ สุภาพ กระชับ ตรงประเด็น
2. ตอบกลับเป็น JSON เท่านั้น
3. suggestedRoutes ต้องใช้ path จากรายชื่อโมดูลด้านบน (AiModuleRegistry) เท่านั้น ห้ามสร้าง path เอง
```
* **ผลลัพธ์:** บอทจะไม่พยายามกรอกข้อมูลแทนผู้ใช้ และทุกลิงก์ที่แนะนำในปุ่มจะสามารถคลิกเปิดหน้าจอใน Angular ได้จริง ไม่เกิด Error 404
