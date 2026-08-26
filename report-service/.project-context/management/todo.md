/* cSpell:disable */


# Todo / Backlog

> วิเคราะห์จาก Git history (153 commits, 2026-03-13 ถึง 2026-07-03) และสถานะโค้ดปัจจุบัน (ตรวจสอบล่าสุด: 2026-07-07 — เพิ่ม Generate/Queue/Bulk Generate)

## ✅ สิ่งที่ทำเสร็จแล้วในโค้ด (Done)

### Core Report Engine
- [x] อัปโหลดและคอมไพล์ไฟล์ .jrxml → .jasper พร้อมสกัด parameter schema อัตโนมัติ (`ReportTemplateService`)
- [x] Preview รายงานเป็น PDF ก่อนบันทึก (รองรับทั้ง template ที่บันทึกแล้วและไฟล์ที่ staged ไว้ชั่วคราว)
- [x] Generate รายงานจริงเป็น PDF / DOCX / XLSX (`GeneratedReportService`)
- [x] รองรับ collection parameter (`java.util.ArrayList`) ทั้งจาก JSON array (API) และ comma/newline-separated text (Admin UI)
- [x] รองรับบาร์โค้ดในรายงานผ่าน `jasperreports-barcode4j` และฟอนต์ไทย (Sarabun, TH SarabunNew, TH SarabunPSK)
- [x] Generate ได้ทั้งด้วย `reportId` และ `templateCode` (case-insensitive, ต้อง unique เมื่อไม่ blank)

### Data Source Management
- [x] CRUD ฐานข้อมูลภายนอก (PostgreSQL, MySQL, MariaDB) พร้อมทดสอบการเชื่อมต่อ
- [x] ตั้งค่า connect/socket timeout ต่อ connection ได้ (default 10s/30s)
- [x] JDBC URL ถูกสร้างจากจุดเดียว (`JdbcUrlFactory`) เพื่อให้ connection test กับ report execution สอดคล้องกัน

### Access Token & Public API
- [x] CRUD access token, generate/rotate token value, register token ที่สร้างจากภายนอก, revoke
- [x] `AccessTokenApiFilter` ตรวจ `X-Access-Token` เฉพาะ `POST /api/reports/generate` และ `GET /api/reports/files/*/download`
- [x] เอาคำนำหน้า `rpt_` เดิมออกจาก token ที่ generate ใหม่ (ตาม commit history)

### Audit & Compliance
- [x] Audit log กลาง (`AuditLogEvent`) ครอบคลุม CRUD ของทุกทรัพยากร + generate/download/test
- [x] หน้า Audit Logs พร้อม filter (category/status/date range + quick preset) และ export เป็น CSV/XLSX
- [x] Dashboard "Recent Activity" อ่านจาก audit log stream เดียวกัน

### Settings & Cleanup
- [x] ตารางเวลาล้าง generated report file อัตโนมัติ (Daily/Weekly/Monthly + เวลา + timezone) เปิด/ปิดได้
- [x] Manual cleanup action 2 แบบ: ล้างเฉพาะไฟล์/log และล้างข้อมูลทั้งระบบ (ทั้งคู่คง audit history ของการล้างไว้)
- [x] Soft-delete สำหรับ `GeneratedReportFile` (mark deleted + เก็บเหตุผล) แทนการลบแถวทิ้งตอน auto-cleanup
- [x] Configurable `Download Base URL` — ใช้แทนการ derive URL จาก request context เมื่อกำหนดไว้

### Timezone (งานล่าสุดตาม git log)
- [x] แยกกฎเก็บข้อมูลเป็น UTC (`app.display.stored-timestamp-timezone`) ออกจาก timezone แสดงผล (ตาม Settings, default Asia/Bangkok) ผ่าน `ConfiguredTimeDisplayService`
- [x] Container/JVM บังคับ `TZ=UTC` เพื่อให้ `LocalDateTime.now()` สอดคล้องกับสมมติฐานเรื่อง UTC (commit ล่าสุด: "use utc timezone", "update timezone")

### Security & Auth
- [x] Spring Security form login + remember-me (อายุ/คีย์ตั้งค่าได้ผ่าน `SecurityProperties`, มี validation test แยก)
- [x] CSRF เปิดทั่วระบบ ยกเว้น `/h2-console/**` และ `/api/reports/generate`
- [x] CORS แยกเฉพาะ 2 endpoint สาธารณะ ตั้งค่า origin ได้ผ่าน `app.cors.allowed-origins`

### UI/UX
- [x] หน้า Admin ครบ: Dashboard, Reports (master/detail), Report Templates, Data Sources, Access Tokens, Audit Logs, Settings
- [x] Custom dropdown component, toast notification component, modal/dialog component ใช้ร่วมกันหลายหน้า
- [x] Client-side validation (required field highlighting, template code uppercase-only, port digit-only)

### Documentation & Testing
- [x] OpenAPI/Swagger พร้อม custom successResponsesOnlyCustomizer
- [x] Test coverage หลักอยู่ใน `ReportServiceApplicationTests` (MockMvc, ครอบคลุม flow หลักเกือบทั้งหมด) + unit test แยกสำหรับ `JdbcUrlFactory`, `ReportTemplateService`, `DownloadUrlService`, remember-me, security properties validation

### Report Generation Menus — Generate / Queue / Bulk (เพิ่มใหม่ 2026-07-07)
- [x] เมนู **Generate Report** (`/reports/generate`) — หน้าจอใหม่ล้วน ๆ ไม่แก้ backend เลย ใช้ API เดิม (`POST /api/report-templates/{id}/generate`) ที่มีอยู่แล้วแต่ยังไม่มีเมนูเรียกใช้
- [x] เมนู **Queue Generate** (`/reports/queue`) — API สาธารณะ (`POST/GET /api/reports/generate/queue*`) + API/หน้าจอแอดมิน (`/api/report-queue`, มีฟอร์มทดลองยิง request ในตัว) ประมวลผลคิวด้วย `@Scheduled` poller, ส่ง webhook แจ้งสถานะไปยัง `callbackUrl` พร้อม retry แบบ backoff (1/5/15 นาที) และปุ่ม retry ด้วยมือ
- [x] เมนู **Bulk Generate** (`/reports/bulk`) — API สาธารณะ (`POST/GET /api/reports/generate/bulk*`) + API/หน้าจอแอดมิน (`/api/report-bulk`) รับ JSON array ของ item แยก generate ทีละรายการแบบ isolate transaction กัน รวมผลเป็น ZIP พร้อม `manifest.json`
- [x] Entity ใหม่ 2 ตัว: `ReportGenerationQueueItem`, `BulkReportGenerationBatch` (ดูรายละเอียดที่ `database-standard.md`)
- [x] แก้บั๊ก `UnexpectedRollbackException` ที่เจอระหว่างพัฒนา ด้วยการใช้ `Propagation.REQUIRES_NEW` ใน `generateFromQueue`/`generateBytesForBulk` (บันทึกไว้ใน `memories/ai-learnings.md`)

---

## 🔲 สิ่งที่ยังไม่เสร็จ / ควรทำต่อ (Next Steps)

> รายการนี้มาจากการตรวจสอบโค้ดจริง + `.github/memories/risks.md` ที่มีอยู่ในโปรเจกต์ ไม่ใช่การคาดเดา

- [ ] **Oracle Database ยังใช้งานไม่ได้จริง** — มี `ojdbc11` driver ใน `pom.xml` แต่ `DataSourceType` enum รองรับเฉพาะ `POSTGRESQL`, `MYSQL`, `MARIADB` และ `JdbcUrlFactory` ไม่มี case สำหรับ Oracle — ต้องตัดสินใจว่าจะทำต่อให้ครบหรือถอด dependency ออก
- [ ] **HTMX dependency ไม่ได้ใช้งานจริง** — ประกาศ `htmx-spring-boot-thymeleaf` ไว้ใน `pom.xml` แต่ไม่พบ `hx-*` attribute ใน template ใดเลย ควรถอดออกถ้าไม่มีแผนใช้ หรือเริ่มใช้งานจริงถ้ายังต้องการ
- [ ] **ไม่มี Connection Pooling สำหรับ external data source** — `ReportTemplateService`/`DataSourceConfigService` ใช้ `DriverManager.getConnection(...)` ตรงทุกครั้งที่ test/generate รายงาน ไม่มี pool (เช่น HikariCP) รองรับ concurrent load
- [ ] **Access Token usage metrics ยังเป็นแค่ placeholder** — field `callsToday`/`errorRate` ใน `AccessToken` มีอยู่และแสดงในหน้า UI/DTO แต่**ไม่มี logic ใดอัปเดตค่าเหล่านี้เลย** (ตรวจสอบด้วย grep แล้วพบเฉพาะ getter/setter) — ค่าจะค้างที่ default (`0`, `"--"`) เสมอ
- [ ] **ไม่มี Rate Limiting บน Public Report API** — แม้จะมี access token + CORS `*` แต่ไม่พบการจำกัดจำนวน request ต่อ token/ต่อเวลาในโค้ด
- [ ] **ข้อมูล sensitive เก็บแบบ plain text** — `DataSourceConfig.password` และ `AccessToken.tokenValue` ไม่มีการเข้ารหัส/hash ก่อนบันทึกลง H2 (ยืนยันจากการอ่าน `AccessTokenService`/`DataSourceConfig` โดยตรง)
- [ ] **ไม่มี Schema Migration Tool** — ใช้ `spring.jpa.hibernate.ddl-auto=update` ทั้ง dev และ production profile โดยไม่มี Flyway/Liquibase — เสี่ยงเรื่อง schema drift เมื่อ deploy หลาย environment
- [ ] **ไม่มี CI/CD Pipeline** — ไม่พบ `.github/workflows/` ใดๆ ในโปรเจกต์ มีเพียง local batch scripts (`build.bat`, `test-build.bat`, `test-run.bat`, `push.bat`)
- [ ] **Test suite กระจุกตัวอยู่ไฟล์เดียว** — ตามที่ `.github/memories/risks.md` และ `testing.md` ระบุไว้เอง: integration test ส่วนใหญ่อยู่ใน `ReportServiceApplicationTests.java` ไฟล์เดียว ซึ่งจะเริ่มดูแลยากเมื่อ feature เพิ่มขึ้นเรื่อยๆ
- [ ] **ไม่มี API Versioning** — ทุก endpoint อยู่ใต้ `/api/...` โดยไม่มี prefix เวอร์ชัน (`/v1/...`) หากต้อง breaking change ในอนาคตควรวางแผนกลยุทธ์ versioning ไว้ก่อน
- [ ] **`.project-context/memories/decisions.md` และ `ai-learnings.md` ยังว่างเปล่า** — ควรพิจารณาย้าย/สรุปเนื้อหาที่มีอยู่แล้วใน `.github/memories/` (ซึ่งมีข้อมูลใกล้เคียงกันแต่คนละโฟลเดอร์) เข้ามารวมไว้ที่จุดเดียว เพื่อไม่ให้ context กระจายซ้ำซ้อนระหว่าง `.github/memories/` กับ `.project-context/memories/` — **(อัปเดต 2026-07-07: เริ่มเติมทั้ง 2 ไฟล์แล้วจากงาน Queue/Bulk Generate ล่าสุด แต่ยังไม่ได้ย้าย/รวมเนื้อหาเก่าจาก `.github/memories/` เข้ามา)**
- [ ] **Queue Generate ยังเป็น single-instance polling** — `ReportGenerationQueueService` ประมวลผลด้วย `@Scheduled` ธรรมดา ไม่มี distributed lock ถ้าในอนาคต deploy หลาย instance พร้อมกัน อาจมี 2 instance หยิบ queue item เดียวกันไปประมวลผลซ้ำ (ตอนนี้ deploy เป็น container เดียวเท่านั้นจึงยังไม่เป็นปัญหา)
- [ ] **`callbackUrl` ของ Queue Generate ยังไม่ป้องกัน SSRF อย่างเข้มงวด** — เช็คแค่ scheme `http`/`https` + host ไม่ว่าง ไม่ได้ block internal/private IP range หรือ localhost ควรพิจารณาเพิ่ม allowlist หรือ block ranges ถ้าระบบต้องรองรับ callback URL จากผู้ใช้ที่ไม่น่าเชื่อถือ
- [ ] **Endpoint token-auth ใหม่ (queue/bulk) ไม่มี ownership check** — token ใดก็ตามที่ valid เรียกดู/โหลดไฟล์ queue item หรือ bulk batch ของ token อื่นได้ เหมือน endpoint download เดิมที่มีปัญหานี้อยู่ก่อนแล้ว ไม่ใช่ regression ใหม่แต่ยังไม่ได้แก้
- [ ] **Test suite ยังไม่มีเคสสำหรับ Queue/Bulk Generate** — ฟีเจอร์ใหม่ทั้งหมดถูกตรวจสอบด้วย manual smoke test (รันแอปจริง + curl) ระหว่างพัฒนาเท่านั้น ยังไม่มี MockMvc/unit test เพิ่มใน `ReportServiceApplicationTests` หรือไฟล์แยก — ควรเพิ่มก่อน production ถ้าเป็นไปได้

## หมายเหตุ
- รายการ "Next Steps" ข้างต้นเป็นข้อสังเกตเชิงเทคนิคจากการอ่านโค้ดและ dependency จริง ไม่ใช่ requirement ที่มีคนสั่งไว้ — ควรให้ผู้ดูแลโปรเจกต์ (Sarankon) ตัดสินใจ priority ก่อนเริ่มทำ
