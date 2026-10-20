# คู่มือการจำกัดและควบคุมข้อมูลของระบบ AI (AI Data Limitation Guide)
> **ระบบ SIC Project (sic-spring & sic-app)**  
> รวบรวมข้อมูลจำกัด Token, ขอบเขตข้อมูล (Context Window), ประวัติแชท และขนาดฟิลด์ฐานข้อมูลที่ส่ง/รับจาก AI ทั้งหมด 100%

---

## 1. ตารางเปรียบเทียบข้อจำกัดของ AI แต่ละโมเดลในระบบ

ระบบ SIC บริหารจัดการโมเดล AI ผ่านตาราง `db_ai_model_config` (จัดการได้ผ่านเมนู **BURT07: จัดการ AI Model**) โดยมีโมเดลหลักที่ผ่าน KKU GenAI Gateway และ fallback ดังนี้:

| โมเดล (Model Code) | ผู้ให้บริการ (Provider) | รูปแบบ API (Format) | โควต้า Output Token สูงสุด (`max_tokens`) | ความสุ่ม (`temperature`) | บทบาทและหน้าที่หลักในระบบ |
|---|---|:---:|:---:|:---:|---|
| **`gemini-3.8-flash`** *(Default & Recommended)* | Google (KKU) | `OPENAI_COMPATIBLE` | **10,000 tokens** *(fallback: 4,096)* | 0.7 | โมเดลหลักของระบบ ประมวลผลรวดเร็ว ใช้เจนเอกสาร Pipeline, WBS, Requirement, Test Case, นำทาง Navigator |
| **`claude-sonnet-5`** | Anthropic (KKU) | `OPENAI_COMPATIBLE` หรือ `CLAUDE` | **10,000 tokens** *(fallback: 4,096)* | 0.7 | โมเดลสำหรับคิดวิเคราะห์ตรรกะลึก งาน SDLC Impact Analysis และโครงสร้างสถาปัตยกรรมซับซ้อน |
| **`gpt-5.4`** | OpenAI (KKU) | `OPENAI_COMPATIBLE` | **10,000 tokens** *(fallback: 4,096)* | 0.7 | โมเดลความสามารถรอบด้าน สำหรับสร้างเอกสารทางการและข้อกำหนดสัญญา |
| **`deepseek-v4-flash`** | DeepSeek (KKU) | `OPENAI_COMPATIBLE` | **10,000 tokens** *(fallback: 4,096)* | 0.7 | โมเดลเน้นการเขียนโค้ด แปลง ER Diagram เป็นสคริปต์ SQL DDL และงานด้าน Technical |

> **หมายเหตุเรื่อง Endpoint และ Token:**
> - ค่าเริ่มต้นในฐานข้อมูล (`db_ai_model_config`) กำหนด `max_tokens = 10,000`
> - หากระบบไม่พบคอนฟิกใน DB จะใช้ค่า fallback จาก `application.yml` ที่ `4,096 tokens`
> - หากผลลัพธ์ของ AI ยาวเกินกำหนดและโดนตัดจบ (`finish_reason = "length"` หรือ `"max_tokens"`) ระบบจะมี Logger เตือนทันที: `AI response truncated by token limit`

---

## 2. การจำกัดข้อมูลใน Default System Prompt (Prompt-Level Constraints)

ในคำสั่งตั้งต้น (**Default System Prompt**) ของระบบ Generator แต่ละตัว (`ProjectGeneratorService`, `RequirementGeneratorService`, `SpecificationGeneratorService`, `AiProjectPipelineJobService`, `AiNavigatorServiceImpl`) มีการเขียน **"กฎเหล็กและการจำกัดขอบเขตข้อมูล"** ไว้อย่างเข้มงวด ดังนี้:

### 2.1 การจำกัดจำนวนรายการที่ให้ AI สร้าง (Cardinality Limits)
เพื่อป้องกันไม่ให้ AI สร้างข้อมูลยาวจน Token ล้น หรือสร้างข้อมูลซ้ำซ้อนเกินจริง:
- **Phase & WBS:** บังคับ `3-5 phases`, ไม่เกิน `2 milestones ต่อ phase`, ไม่เกิน `2 work packages ต่อ milestone`
- **Requirements (PMDT04):** จำกัดสูงสุดไม่เกิน **8 ข้อ** (`max 8`)
- **Specifications (PMDT07):** จำกัดสูงสุดไม่เกิน **8 ฉบับ** (`max 8`) โดยแต่ละข้อต้องผูกกับ Requirement ได้ 1 ต่อ 1
- **Tasks (งานปฏิบัติการ):** จำกัดสูงสุดไม่เกิน **12 tasks** (`max 12`)
- **Test Scenarios & Cases (PMDT12):** บังคับ **1 scenario ต่อ 1 task** และมี **1-3 test cases** ต่อ scenario
- **Delivery Checklists (PMDT14):** บังคับต้องมีรายการตรวจรับ **3 ถึง 6 ข้อต่องวด** (ห้ามเป็น array ว่าง)
- **User Manuals (PMDT15):** สร้างสูงสุด **3 เล่ม** แต่ละเล่มมี **3-4 sections**
- **Design Review (PMDT08):** สร้างสูงสุด **4 ข้อตรวจทาน**
- **Diagrams (DFD / ERD / Use Case):** จำกัดจำนวนโหนดสูงสุดไม่เกิน **25 nodes / 15 entities**

### 2.2 การจำกัดความยาวและฟอร์แมตข้อความ (Field & Character Limits in Prompt)
- **Project Charter Description:** ใน Prompt ระบุชัดเจนว่า `max 1500 characters`
- **HTML Rich Text Tag:** อนุญาตให้ใช้เฉพาะแท็กมาตรฐานของ Tiptap Editor ได้แก่ `<p>`, `<ul>`, `<li>`, `<strong>`, `<h3>` (ห้ามใช้ `<script>`, `<iframe>` หรือแท็กแปลกปลอม)
- **รูปแบบวันเวลา:** บังคับต้องเป็น `yyyy-MM-dd` เท่านั้น

### 2.3 การจำกัดค่าตัวเลือกแบบเจาะจง (Strict Dropdown / Enum Values)
AI ถูกสั่งห้ามตั้งชื่อสถานะหรือประเภทข้อมูลเอง ต้องเลือกจากชุด Enum ที่ระบบเตรียมไว้เท่านั้น:
- **`status`:** บังคับเลือก 1 ค่าจาก 18 สถานะของโครงการ เช่น `Prospect | Planning | Development | UAT | Delivered` ฯลฯ
- **`priority`:** บังคับเลือก 1 ค่าจาก `Low | Medium | High | Critical` (หรือ `LOW | MEDIUM | HIGH | CRITICAL`)
- **`requirementType`:** บังคับเลือก 1 ค่าจาก: `FUNCTIONAL | NON_FUNCTIONAL | BUSINESS_RULE | REPORT | INTEGRATION | SECURITY | DATA | UI`
- **`specificationType`:** บังคับเลือก 1 ค่าจาก: `UI Specification | API Specification | Business Rule Specification | Report Specification | Data Specification | Integration Specification | Permission Specification`
- **`ticketType`:** บังคับเลือก 1 ค่าจาก: `BUG_SUPPORT | DATA_ISSUE | USER_SUPPORT | CHANGE_REQUEST`

### 2.4 กฎเหล็กด้านความปลอดภัยและความถูกต้อง (Data Integrity & Behavioral Constraints)
1. **ห้ามตอบคำทักทาย (Strict JSON Block):**
   - ต้องตอบกลับในรูปแบบ JSON ภายในบล็อก ````json ... ```` เท่านั้น ห้ามมีคำเกริ่นนำหรือคำลงท้ายนอกบล็อก
2. **ห้ามสร้างรหัสระบบเอง (Append-Only Rule ใน Batch Mode):**
   - ห้าม AI สร้างค่า `id`, `code`, `running number` (ต้องปล่อยเป็น `null` ให้ระบบ Database Sequence สร้างเอง)
3. **ข้อจำกัดของ AI Navigator:**
   - *"ห้ามกรอกฟอร์มหรือสร้างข้อมูลเอง หน้าที่ของคุณคือ นำทาง ไม่ใช่ กรอกข้อมูล"*
   - ในฟิลด์ `suggestedRoutes` ต้องใช้ URL Path ที่มีจริงใน `AiModuleRegistry` เท่านั้น **ห้ามจินตนาการ Path ขึ้นมาเอง**
4. **ข้อจำกัดรูปทรงไดอะแกรม (Mermaid Notation Rules):**
   - External Entity: ต้องเป็นสี่เหลี่ยม `E1["..."]` (ห้ามใช้วงกลม)
   - Process: ต้องเป็นสี่เหลี่ยมมนพร้อม Process Number `P1("1.0 ...")`
   - Data Store: ต้องเป็นรูปถังทรงกระบอก `D1[("...")]`
   - Use Case: ต้องเป็นรูปวงรี / Stadium `UC1(["..."])` (ห้ามใช้วงกลม `((...))` หรือสี่เหลี่ยม)
5. **การบังคับภาษา (Language Consistency):**
   - ถ้าผู้ใช้สั่งเป็นภาษาไทย ให้ตอบภาษาไทย (ยกเว้นคำศัพท์เทคนิค)
   - ถ้าผู้ใช้สั่งเป็นภาษาอังกฤษ ให้ตอบภาษาอังกฤษ

---

## 3. การจำกัดบริบทข้อมูลก่อนส่งให้ AI (Context Window & Scope Limiting)

เพื่อป้องกัน **Context Token ล้น (Token Explosion)** และป้องกันไม่ให้ AI เพ้อเจ้อ (Hallucinate) ข้อมูลนอกขอบเขตโครงการ ระบบมีคลาส [AiScopeContextService.java](file:///c:/Users/lovew/Student/Project-Main/Java-intern/sic-project/sic-spring/sic/src/main/java/com/softinter/sicapi/service/impl/AiScopeContextService.java) ทำหน้าที่กรองและจำกัดขนาดข้อมูลดังนี้:

| ค่าคงที่ / กลไก | ขีดจำกัด (Limit) | วัตถุประสงค์และการทำงาน |
|---|:---:|---|
| **`MAX_TOTAL`** | **4,000 ตัวอักษร** | ขนาดข้อความรวมของบล็อกบริบทโครงการและ Trace Link ทั้งหมด หากยาวเกินจะตัดทอน (`substring(0, 4000)`) ทันที |
| **`MAX_DESC`** | **300 ตัวอักษร** | ความยาวคำอธิบาย (`Description`) ของเอกสารแต่ละฉบับที่นำมาเป็น Anchor ถูกตัดไม่เกิน 300 ตัวอักษร |
| **`MAX_LIST`** | **10 รายการ** | จำนวนรายการเอกสารอื่นในโครงการ (Requirements, Specifications, Diagrams, Test Scenarios) ที่แนบเป็น Inventory ไม่เกิน 10 ชิ้นต่อประเภท |
| **Trace Link Depth** | **20 รายการ** | จำนวนเส้นเชื่อมโยงความสัมพันธ์ของเอกสาร (`fullTrace`) ที่สรุปให้ AI ถูกจำกัดไม่เกิน `MAX_LIST * 2 = 20` เส้น |

---

## 4. การจำกัดประวัติการแชท (Chat History Limiting)

ในโมดูล **AI Diagram Assistant** ([PmDiagramChatServiceImpl.java](file:///c:/Users/lovew/Student/Project-Main/Java-intern\sic-project\sic-spring\sic\src\main\java\com\softinter\sicapi\service\impl\PmDiagramChatServiceImpl.java)):

1. **จำกัดข้อความย้อนหลัง (Sliding Window):**
   - ดึงข้อความสนทนาย้อนหลังใน Session เดียวกันเพียง **6 ข้อความล่าสุด** (`Math.max(0, recent.size() - 6)`)
   - ข้อความเก่าก่อนหน้านั้นจะไม่ถูกส่งเข้า LLM เพื่อประหยัด Token และรักษาความเร็วในการตอบสนอง
2. **จำกัดความยาวชื่อหัวข้อแชท (Session Title):**
   - สร้างชื่อ Session จากข้อความแรกของผู้ใช้ โดยตัดความยาวไม่เกิน **35 ตัวอักษร** (`raw.substring(0, 35) + "..."`)

---

## 5. การจำกัดขนาดไฟล์แนบ (Attachment & Multimodal Filtering)

ฟังก์ชัน `inlineTextAttachments` ใน [PmAiProviderServiceImpl.java](file:///c:/Users/lovew/Student/Project-Main/Java-intern\sic-project\sic-spring\sic\src\main\java\com\softinter\sicapi\service\impl\PmAiProviderServiceImpl.java) จัดการไฟล์แนบของผู้ใช้ดังนี้:

* **ไฟล์รูปภาพ (`image/*`):** ไม่แปลงเป็นข้อความ แต่แปลงเป็น **Vision Block (Base64 Image)** ส่งให้โมเดลประมวลผลทางสายตาโดยตรง
* **ไฟล์ข้อความ (`text/*`, `json`, `csv`, `markdown`, `xml`):** ถอดรหัส UTF-8 และผนวกเนื้อหาเข้ากับ Prompt
* **ไฟล์ Binary อื่นๆ (PDF, DOCX, ZIP ฯลฯ):** **ไม่ดึงเนื้อหาทั้งไฟล์** เพื่อป้องกันข้อความขนาดยักษ์ทะลักเข้าโมเดล โดยส่งเพียงชื่อไฟล์ (`File Name`) เพื่อให้ AI ทราบว่ามีเอกสารอ้างอิงอยู่

---

## 6. การจำกัดข้อมูลเมื่อบันทึกลงฐานข้อมูล (Database Schema Bounding)

เมื่อ AI เจนข้อมูลกลับมาเป็น JSON ระบบจะทำการตัดความยาว (Sanitize & Truncate) ก่อนบันทึกลง Entity เพื่อไม่ให้ฐานข้อมูล Error จาก Data Truncation:

| โมดูล / ตาราง | ฟิลด์ข้อมูล | ขีดจำกัดสูงสุด (Database Bounds) |
|---|---|:---:|
| **Project (PMRT02)** | ชื่อโครงการ (`projectName`) | **255 ตัวอักษร** |
| | รายละเอียดโครงการ (`description`) | **2,000 ตัวอักษร** *(Prompt สั่งให้ AI ร่างไม่เกิน 1,500 ตัวอักษร)* |
| **Requirement (PMDT04)** | รหัส Requirement (`requirementCode`) | **30 ตัวอักษร** |
| | ชื่อหัวข้อ (`title`) | **255 ตัวอักษร** |
| **Specification (PMDT07)** | รหัส Spec (`specificationCode`) | **30 ตัวอักษร** |
| | ชื่อหัวข้อ (`title`) | **255 ตัวอักษร** |
| **Document Version** | รหัสเอกสาร (`documentCode`) | **100 ตัวอักษร** |
| **Change Request** | รหัส CR | **8 ตัวอักษร** (Hex Prefix) |
| **AI Navigator (BURT07)** | รายการปุ่มเส้นทาง (`suggestedRoutes`) | เฉพาะเส้นทางที่ลงทะเบียนไว้ใน `AiModuleRegistry` เท่านั้น (ห้าม AI สร้าง Path เอง) |

---

## 7. การจัดการเมื่อโควต้าหรือ Token เต็ม (Error & Quota Handling)

ระบบมี Regular Expression ตรวจจับข้อผิดพลาดเรื่องโควต้าจาก AI Gateway:
```java
Pattern QUOTA_ERROR = Pattern.compile("quota|credit balance|billing|insufficient|out of (tokens|credit)|exhausted", Pattern.CASE_INSENSITIVE);
```
* หาก AI Gateway ตอบกลับว่าโควต้าหมด เครดิตหมด หรือ Token เกินขีดจำกัด ระบบจะเก็บข้อความผ่าน `QUOTA_ERROR_MSG` (ThreadLocal) และส่ง Error ให้ฝั่ง Frontend แจ้งเตือนผู้ใช้ให้สลับไปใช้โมเดลอื่น หรือติดต่อผู้ดูแลระบบเพื่อเติมเครดิตทันที
