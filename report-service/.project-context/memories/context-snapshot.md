/* cSpell:disable */


# Context Snapshot

> อ่านไฟล์นี้ไฟล์เดียวเพื่อเข้าใจภาพรวมโปรเจกต์ใน 1 นาที (อัปเดตล่าสุด: 2026-07-07 — เพิ่มเมนู Generate/Queue/Bulk Generate)

## นี่คือระบบอะไร
**Report Service** — Spring Boot 4.0.4 (Java 25) monolith ตัวเดียว ที่รวม 2 หน้าที่ไว้ในแอปเดียวกัน:
1. **Admin Web UI** (Thymeleaf, server-rendered, session login) สำหรับจัดการ Report Template (JasperReports), Data Source ภายนอก, Access Token, Audit Log และ Settings
2. **Public Report API** (`X-Access-Token` header auth) ให้ระบบภายนอกยิง request มา generate และ download รายงานได้โดยไม่ต้อง login

Base package: `dev.suksabai.report_service` | Base URL รันจริง: port 80 (container) | ฐานข้อมูลหลัก: H2 (file mode)

## ประวัติย่อ
โปรเจกต์เริ่มต้น (มี.ค. 2026) ด้วยสถาปัตยกรรม microservice (Angular frontend + auth service แยก) แต่ถูก**รีสตาร์ทใหม่ทั้งหมด**เมื่อ 2026-03-23 (commit `initial new spring boot`) มาเป็น Spring Boot monolith ตัวเดียวอย่างที่เห็นในปัจจุบัน มีการพัฒนาต่อเนื่องมา 153 commits จนถึง 2026-07-03 (ดูรายละเอียดที่ `management/changelog.md`)

## สถาปัตยกรรมโดยย่อ
```
Browser/External System → Spring Security (session หรือ X-Access-Token)
    → Controller (PageController = Thymeleaf views, *ApiController = REST/JSON)
    → Service layer (business logic ทั้งหมดอยู่ที่นี่)
    → Repository (Spring Data JPA / H2) + Filesystem (data/uploads, data/generated, data/reports)
```
รายละเอียดเต็มดูที่ `architecture/system-architecture.md`

## จุดที่ต้องระวังเป็นพิเศษ (เพิ่งแก้ไขล่าสุด)
- **Timezone**: ทุกค่าที่เก็บใน DB เป็น `LocalDateTime` แบบ **UTC เสมอ** ส่วนการแสดงผลบน UI/Export จะถูกแปลงเป็น timezone ที่ตั้งไว้ใน Settings (default `Asia/Bangkok`) ผ่าน `ConfiguredTimeDisplayService` — แก้ไขเรื่องนี้เสร็จในคอมมิต 2026-07-03 ถ้าจะแก้โค้ดที่เกี่ยวกับเวลา ต้องเข้าใจ 2 ชั้นนี้ก่อน
- **Transaction propagation ใน loop ที่ catch-and-continue (ใหม่ 2026-07-07)**: ถ้าเขียนโค้ดที่ loop เรียก `@Transactional` method หลายครั้งแล้ว catch exception เพื่อไปประมวลผล item ถัดไปต่อ (เช่น batch/queue processing) เมธอดที่ถูกเรียกต้องใช้ `@Transactional(propagation = Propagation.REQUIRES_NEW)` ไม่งั้นจะเจอ `UnexpectedRollbackException` ตอน commit แม้ exception จะถูก catch ไว้แล้วก็ตาม (เจอบั๊กนี้จริงตอนพัฒนา Queue/Bulk Generate — รายละเอียดเต็มที่ `memories/ai-learnings.md`)

## Feature หลักที่ทำงานได้แล้ว
- Upload/compile JRXML → preview PDF → generate PDF/DOCX/XLSX (รองรับ multi-value parameter, บาร์โค้ด, ฟอนต์ไทย)
- **(ใหม่ 2026-07-07) เมนู Generate Report** (`/reports/generate`) — เลือก template ที่บันทึกไว้ ใส่ parameter แล้ว generate/download ได้จากหน้าเดียว
- **(ใหม่ 2026-07-07) เมนู Queue Generate** (`/reports/queue` + `POST/GET /api/reports/generate/queue*`) — ยิง request generate เข้าคิว ประมวลผลเบื้องหลัง แล้วแจ้งสถานะกลับผ่าน webhook (`callbackUrl`) พร้อม retry แบบ backoff
- **(ใหม่ 2026-07-07) เมนู Bulk Generate** (`/reports/bulk` + `POST/GET /api/reports/generate/bulk*`) — ยิง JSON array ของรายการที่ต้องการ generate ได้ ZIP กลับมาพร้อม manifest สรุปผลแต่ละรายการ
- Data Source ภายนอก: PostgreSQL, MySQL, MariaDB (ทดสอบการเชื่อมต่อได้, ตั้ง timeout ได้)
- Access Token: CRUD, generate/register/revoke, ใช้เป็น auth ของ public API (รวมถึง endpoint ใหม่ queue/bulk ด้านบน)
- Audit Log กลาง (ครอบคลุมทุก CRUD + generate/download/test/queue/bulk) พร้อม filter/export CSV-XLSX
- Cleanup อัตโนมัติตามตารางเวลา + manual cleanup 2 ระดับ (เก็บ audit history ไว้เสมอ)
- Configurable Download Base URL สำหรับ URL ที่ส่งกลับในรายงานที่ generate แล้ว

## จุดที่ยังไม่สมบูรณ์ (ดูรายละเอียดที่ `management/todo.md`)
- Oracle JDBC driver ประกาศไว้แต่ยังไม่ได้ wiring เข้า `DataSourceType`
- HTMX dependency ประกาศไว้แต่ไม่ได้ใช้งานจริง
- ไม่มี connection pooling สำหรับ external data source (ใช้ `DriverManager` ตรง)
- Field `callsToday`/`errorRate` ของ Access Token เป็นแค่ placeholder ไม่มี logic อัปเดตจริง
- ไม่มี CI/CD pipeline, ไม่มี schema migration tool (พึ่ง `ddl-auto=update`)
- Password/Token value เก็บเป็น plain text ใน DB
- **(ใหม่ 2026-07-07)** Queue Generate เป็น single-instance polling เท่านั้น (ไม่มี distributed lock), `callbackUrl` ยังไม่ป้องกัน SSRF อย่างเข้มงวด, endpoint queue/bulk ใหม่ยังไม่มี ownership check ต่อ token, และยังไม่มี automated test coverage สำหรับฟีเจอร์ทั้งชุดนี้ (ตรวจสอบด้วย manual smoke test เท่านั้น)

## ไฟล์ที่ควรอ่านต่อ (ตามลำดับความสำคัญ)
1. `architecture/system-architecture.md` — data flow และ component ทั้งหมด
2. `architecture/tech-stack.md` — เวอร์ชัน library ทั้งหมด
3. `standards-and-blueprints/database-standard.md` — table, naming convention, audit column pattern
4. `standards-and-blueprints/api-design.md` — HTTP method, response/error format
5. `management/todo.md` — งานที่เสร็จแล้ว/งานที่ควรทำต่อ
6. `management/changelog.md` — ประวัติการพัฒนาแบบละเอียดตามช่วงเวลา

> Note: มีโฟลเดอร์ `.github/memories/` อีกชุดหนึ่งในโปรเจกต์ที่เก็บบันทึกบริบทคล้ายกัน (architecture.md, api.md, data-model.md, ui.md, conventions.md, testing.md, risks.md, commands.md, reporting-flow.md, project-summary.md) — ข้อมูลใน `.github/memories/` ค่อนข้างละเอียดและเป็นประโยชน์ ควรพิจารณาอ่านประกอบหรือรวม context เข้าด้วยกันเพื่อไม่ให้ซ้ำซ้อนกับ `.project-context/`
