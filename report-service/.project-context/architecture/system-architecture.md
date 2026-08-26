/* cSpell:disable */


# System Architecture

> อ้างอิงจากโค้ดจริงใน `src/main/java/dev/suksabai/report_service/` (ตรวจสอบล่าสุด: 2026-07-07 — เพิ่ม Generate/Queue/Bulk report menus)

## ภาพรวม
Report Service เป็น Spring Boot monolith ตัวเดียว (ไม่มีการแยก microservice) ที่ทำหน้าที่ 2 บทบาทควบคู่กันในแอปพลิเคชันเดียว:
1. **Admin Web UI** (Thymeleaf, server-rendered) — จัดการ Report Templates, Data Sources, Access Tokens, Audit Logs, Settings
2. **Public/Partner REST API** — ให้ระบบภายนอกยิง request มาสร้างรายงาน (JasperReports) และดาวน์โหลดไฟล์ที่สร้างแล้ว โดยใช้ Access Token แทน session

## โครงสร้าง Layer (ตาม package จริง)

```
dev.suksabai.report_service
├── ReportServiceApplication.java   (entry point, @EnableScheduling)
├── config/         → Security, OpenAPI, App-level filters/properties
├── controller/     → MVC page controllers + REST API controllers (อยู่ package เดียวกัน)
├── service/        → Business logic ทั้งหมด
├── repository/     → Spring Data JPA interfaces
└── model/          → JPA Entities + Enum
```

- **Controller layer** แบ่งเป็น 2 กลุ่มปนกันใน package เดียว:
  - `PageController` — คืนค่าเป็นชื่อ Thymeleaf view (server-side rendering) สำหรับ `/`, `/reports`, `/reports/generate`, `/reports/queue`, `/reports/bulk`, `/report-templates`, `/access-tokens`, `/data-sources`, `/audit-logs`, `/settings`, `/login`
  - `ReportApiController`, `ReportTemplateApiController`, `AccessTokenApiController`, `DataSourceApiController`, `SettingsApiController`, `ReportQueueAdminApiController`, `BulkReportAdminApiController` — `@RestController` คืนค่าเป็น JSON (ดูรายละเอียดใน `api-design.md`)
- **Service layer** คือที่รวม business logic เกือบทั้งหมด (compile JRXML, generate report, จัดการไฟล์, audit logging, timezone conversion) — Controller เป็นเพียง thin layer ที่ forward ไปเรียก service
- **Repository layer** เป็น `JpaRepository<Entity, Long>` มาตรฐาน ไม่มี custom `@Query` ที่ซับซ้อน ส่วนใหญ่ใช้ derived query methods (เช่น `findAllByOrderByUpdatedAtDesc`)

## Component และหน้าที่ (Service ที่พบจริง)

| Service | หน้าที่ |
|---|---|
| `ReportTemplateService` | อัปโหลด/คอมไพล์ JRXML, สกัด parameter schema, บันทึก/แก้ไข/ลบ template, preview PDF, execute template เพื่อสร้าง `JasperPrint` |
| `GeneratedReportService` | Export ผลลัพธ์ (PDF/XLSX/DOCX ฯลฯ), เขียนไฟล์ลงดิสก์, บันทึก metadata, บันทึก download log, เขียน audit event |
| `DataSourceConfigService` | จัดการ configuration ของฐานข้อมูลภายนอกที่ใช้เป็น data source ของรายงาน, ทดสอบการเชื่อมต่อ |
| `JdbcUrlFactory` | Static utility สร้าง JDBC URL ตาม `DataSourceType` (postgresql/mysql/mariadb) พร้อม connect/socket timeout |
| `AccessTokenService` | CRUD token, generate/register/revoke token value, ตรวจสอบความถูกต้องของ token สำหรับ public API |
| `AuditLogService` | บันทึกทุก event สำคัญของระบบ (create/update/delete/generate/download/test) เป็นสตรีมเดียว, ให้บริการหน้า Audit Log พร้อม filter/export (CSV/XLSX) |
| `SystemSettingsService` | เก็บ setting เดียว (singleton row id=1) สำหรับตารางเวลาล้างข้อมูลอัตโนมัติ, timezone แสดงผล, และ base URL สำหรับ download link |
| `DownloadUrlService` | สร้าง URL สำหรับดาวน์โหลดไฟล์ — ใช้ base URL ที่ตั้งค่าไว้ใน Settings ถ้ามี ไม่งั้น fallback ไปสร้างจาก request context ปัจจุบัน (ถ้าไม่มีทั้งคู่และไม่มี request context เช่นตอนรันใน `@Scheduled` job จะโยน `IllegalArgumentException` — ผู้เรียกต้อง catch แล้ว fallback เป็น relative path เอง) |
| `ConfiguredTimeDisplayService` | แปลงเวลาเก็บใน DB (timezone ตาม `app.display.stored-timestamp-timezone`, default `UTC`) ให้เป็น timezone ที่ผู้ใช้ตั้งไว้ใน Settings (default `Asia/Bangkok`) ก่อนแสดงผล/export ทุกหน้า |
| `ReportGenerationQueueService` | (ใหม่ 2026-07-07) รับ request generate แบบ queue (`enqueueFromApi`/`enqueueFromWeb`), ประมวลผลคิวด้วย `@Scheduled` poller (`processQueue`), ส่ง webhook แจ้งสถานะไปยัง `callbackUrl` ของผู้ขอพร้อม retry แบบ backoff (`processWebhookRetries`) |
| `WebhookDeliveryService` | (ใหม่ 2026-07-07) ยิง HTTP POST ไปยัง callback URL ภายนอกด้วย `java.net.http.HttpClient` (connect/request timeout กำหนดได้), คืนผลสำเร็จ/ล้มเหลวแบบไม่โยน exception ให้ผู้เรียก |
| `BulkReportGenerationService` | (ใหม่ 2026-07-07) generate รายงานหลายรายการจาก JSON array ต่อ item แบบแยก transaction (`Propagation.REQUIRES_NEW`), รวมผลลัพธ์เป็น ZIP พร้อม `manifest.json`, เก็บ batch metadata ไว้ประวัติ |

## Data Flow หลัก

### 1) Admin ใช้งานผ่านเว็บ (Session-based)
```
Browser → Spring Security (form login, remember-me) → PageController
       → Service layer → Repository (JPA/H2) และ/หรือ Filesystem (data/uploads, data/generated, data/reports)
       → Thymeleaf view (server-rendered HTML)
```
- ทุก action ที่แก้ไขข้อมูล (create/update/delete/test/generate) เขียน `AuditLogEvent` ผ่าน `AuditLogService` โดยไม่แยก stream ระหว่าง Web UI กับ API

### 2) Partner ยิง Public Report API (Token-based)
```
External System → AccessTokenApiFilter (ตรวจ header X-Access-Token, ทำงานเฉพาะ path/method ที่กำหนด)
                → ReportApiController
                → GeneratedReportService → ReportTemplateService (compile/execute JasperReports)
                → เขียนไฟล์ผลลัพธ์ลง data/reports + บันทึก GeneratedReportFile/AuditLogEvent
                → ตอบกลับ JSON (มี downloadUrl ที่สร้างจาก DownloadUrlService)
```
- `AccessTokenApiFilter` เป็น `OncePerRequestFilter` ที่ถูก add เข้า chain ก่อน `UsernamePasswordAuthenticationFilter` และ**ทำงานเฉพาะ 2 endpoint เท่านั้น**: `POST /api/reports/generate` และ `GET /api/reports/files/*/download` (ตรวจสอบด้วย `shouldNotFilter`) — endpoint อื่นทั้งหมดอาศัย Spring Security session ปกติ
- CORS ของ 2 endpoint นี้เปิดกว้างแยกต่างหาก (`app.cors.allowed-origins`, ค่า default `*`) เพื่อรองรับการเรียกจาก frontend ภายนอกโดยตรง

### 3) Report Generation Engine (ภายใน)
```
ReportTemplateService.executeTemplate(...)
  → โหลดไฟล์ .jasper ที่คอมไพล์ไว้แล้ว (jasperStoragePath)
  → ผูก parameter + (ถ้ามี) data source ภายนอกผ่าน JdbcUrlFactory
  → JasperReports engine คืนค่า JasperPrint
GeneratedReportService.export(...)
  → แปลง JasperPrint เป็นรูปแบบไฟล์ที่ร้องขอ (PDF ผ่าน JasperExportManager, XLSX ผ่าน JRXlsxExporter, DOCX ผ่าน JRDocxExporter)
  → เขียนไฟล์ลง data/reports (ตั้งชื่อด้วย UUID)
  → บันทึก metadata ลงตาราง generated_report_files
```

### 4) Queue Generate (ใหม่ 2026-07-07 — Async + Webhook)
```
External System (X-Access-Token) → POST /api/reports/generate/queue
   → ReportGenerationQueueService.enqueueFromApi(...) → resolve template (ReportTemplateService.findTemplateSummary)
   → บันทึก ReportGenerationQueueItem (status=Queued) → ตอบกลับ queueId ทันที (ไม่รอ generate เสร็จ)

@Scheduled processQueue() (ทุก app.queue.report-generation.poll-interval-ms, default 5s, batch size default 5)
   → ดึง item สถานะ Queued เก่าสุดตามลำดับ → mark Processing
   → GeneratedReportService.generateFromQueue(...) (wrapper บาง ๆ เรียก private generate() ตัวเดียวกับ flow ปกติ, ใช้ Propagation.REQUIRES_NEW)
   → สำเร็จ: mark Completed + เก็บ generatedReportFileId (ชี้ไปที่ GeneratedReportFile ปกติ ใช้ route download เดิมได้เลย)
   → ล้มเหลว: catch RuntimeException → mark Failed + errorMessage (ไม่ทำให้ item อื่นในรอบเดียวกันพังตาม)
   → ถ้ามี callbackUrl: ยิง webhook ทันที (WebhookDeliveryService)

@Scheduled processWebhookRetries() (ทุก app.queue.webhook.retry-poll-interval-ms, default 30s)
   → หา item ที่ webhookStatus=Pending และถึงเวลา nextWebhookAttemptAt แล้ว → ยิงซ้ำ
   → backoff schedule (app.queue.webhook.retry-delays-minutes, default 1,5,15 นาที) → เกินจำนวนครั้ง = webhookStatus=Failed ถาวร (admin กด Retry Webhook ด้วยมือได้ที่หน้า Queue Generate)
```
- Endpoint สาธารณะเพิ่ม: `POST /api/reports/generate/queue`, `GET /api/reports/generate/queue/{id}` (สถานะ) — ผ่าน `X-Access-Token` เหมือน `/api/reports/generate` เดิม
- Endpoint แอดมิน (session): `GET/POST /api/report-queue`, `GET /api/report-queue/{id}`, `POST /api/report-queue/{id}/retry-webhook` — หน้า `/reports/queue` มีทั้งฟอร์มทดลองยิง request และตาราง monitor สถานะ (auto-refresh ทุก 5s)
- **สำคัญ (เรียนรู้จากบั๊กจริงระหว่างพัฒนา)**: `GeneratedReportService.generateFromQueue` และ `BulkReportGenerationService`'s `generateBytesForBulk` ต้องใช้ `@Transactional(propagation = Propagation.REQUIRES_NEW)` ไม่ใช่ default (`REQUIRED`) — เพราะถูกเรียกจาก loop ที่ catch exception เพื่อประมวลผล item ถัดไปต่อ ถ้าใช้ REQUIRED (join transaction เดียวกับ caller) exception ที่ถูก catch แล้วยังทำให้ transaction ที่ใช้ร่วมกันถูก mark rollback-only และพังด้วย `UnexpectedRollbackException` ตอน commit แม้จะ catch ไว้แล้วก็ตาม (ดูรายละเอียดใน `memories/ai-learnings.md`)

### 5) Bulk Generate (ใหม่ 2026-07-07 — ZIP)
```
External System (X-Access-Token) → POST /api/reports/generate/bulk (JSON array: reportId|templateCode, parameters, format, fileName ต่อ item)
   → BulkReportGenerationService วน generate ทีละ item (GeneratedReportService.generateBytesForBulk, REQUIRES_NEW ต่อ item)
   → item สำเร็จ: ใส่ไฟล์ลง ZIP ด้วยชื่อไฟล์ที่ผู้ขอกำหนด (dedupe ชนกันด้วย -2/-3...)
   → item ล้มเหลว: บันทึกเฉพาะ error message ใน manifest.json ไม่ทำให้ item อื่น/ทั้ง batch ล้มเหลวตาม
   → ZIP มี manifest.json สรุปผลทุก item เสมอ (แม้ทุก item ล้มเหลวก็ยังได้ ZIP กลับมาพร้อม manifest) → เขียนไฟล์ลง data/bulk + บันทึก BulkReportGenerationBatch → ตอบกลับ ZIP bytes ทันที
```
- Endpoint สาธารณะเพิ่ม: `POST /api/reports/generate/bulk` (คืน ZIP bytes ตรง), `GET /api/reports/generate/bulk/{id}/download` (โหลดซ้ำ) — ผ่าน `X-Access-Token`
- Endpoint แอดมิน (session): `GET/POST /api/report-bulk`, `GET /api/report-bulk/{id}` — หน้า `/reports/bulk` มี textarea ให้ทดลองยิง JSON เอง + ตารางประวัติ batch; ปุ่ม submit ของแอดมินคืน JSON metadata (ไม่ใช่ ZIP bytes ตรง) พร้อมลิงก์ `GET /reports/bulk/files/{id}/download` (session-protected) เพื่อให้ฝั่ง JS จัดการง่ายกว่า
- **ข้อสังเกตการออกแบบ**: item ที่สำเร็จใน bulk **ไม่ได้สร้างแถวใน `generated_report_files`** เหมือน flow generate ปกติ — เก็บเฉพาะไฟล์ในตัว ZIP ที่ persist ไว้ที่ `data/bulk` + แถวเดียวใน `bulk_report_generation_batches` ต่อ 1 คำขอ (เพื่อไม่ให้ปนกับหน้า Reports ปกติ และไม่ audit-log ทีละ item แต่ log เป็น 1 event ต่อ batch)

### 6) Scheduled Cleanup
- `ReportServiceApplication` เปิดใช้ `@EnableScheduling`
- `SystemSettingsService` รันงานล้างไฟล์รายงานที่สร้างไว้เก่าตามตารางเวลาที่ผู้ใช้ตั้งค่าไว้ (`generatedReportCleanupFrequency`/`Time`/`Timezone`), เปิด/ปิดได้ด้วย property `app.settings.cleanup.scheduler-enabled`
- การล้างจะ mark `GeneratedReportFile.fileDeleted = true` และลบไฟล์จริงออกจากดิสก์ แต่ **ยังคงแถวข้อมูลไว้ในตาราง** เพื่อให้ประวัติยังแสดงในหน้า Reports ได้ (การดาวน์โหลดหลังจากนั้นจะได้ 404)
- ระบบตอนนี้มี `@Scheduled` job ทั้งหมด 3 ตัว: cleanup (ทุกนาที), `processQueue` (ทุก 5s default), `processWebhookRetries` (ทุก 30s default) — ทั้งหมดอยู่ใน service คนละตัวกัน ไม่มี shared scheduler/thread pool config พิเศษ (ใช้ default ของ Spring `@EnableScheduling`)

## Timezone Handling (สำคัญ — เพิ่งมีการเปลี่ยนแปลงล่าสุดตาม git log)
- เวลาที่เก็บใน database (`LocalDateTime` ทุก entity) ถือว่าอยู่ใน **UTC** เสมอ (`app.display.stored-timestamp-timezone` default = `UTC`)
- เวลาแสดงผลบน UI/Export จะถูกแปลงเป็น timezone ที่ตั้งไว้ใน System Settings (default = `Asia/Bangkok`) ผ่าน `ConfiguredTimeDisplayService` ทุกครั้งก่อนแสดงผล
- Container ตั้งค่า `TZ=UTC` และ JVM flag `-Duser.timezone=UTC` เพื่อให้ `LocalDateTime.now()` ในโค้ด (เช่น ใน `@PrePersist`) สอดคล้องกับสมมติฐานที่ว่า "ค่าที่เก็บคือ UTC"

## Storage Layout (Filesystem)
| Path (relative) | Property | ใช้เก็บอะไร |
|---|---|---|
| `data/uploads` | `file.reports-uploads-dir` | ไฟล์ .jrxml ที่ผู้ใช้อัปโหลดก่อนบันทึก template |
| `data/generated` | `file.reports-generated-dir` | ไฟล์ .jasper ที่คอมไพล์แล้วจาก .jrxml |
| `data/reports` | `file.reports-output-dir` | ไฟล์ผลลัพธ์ที่ generate ออกมาจริง (PDF/XLSX/DOCX ฯลฯ) |
| `data/bulk` (ใหม่ 2026-07-07) | `file.reports-bulk-dir` | ไฟล์ ZIP ที่ได้จากคำขอ Bulk Generate แต่ละ batch |
| `data/report-service` (H2 file) | `spring.datasource.url` | ไฟล์ฐานข้อมูล H2 หลักของระบบ |

> Note: Path เหล่านี้เป็น relative path เทียบกับ working directory ของ JVM — ใน container จะถูก mount ผ่าน volume `./data/report-service:/app/data` ตาม `docker-compose.yml`

## Security Architecture
- **Session/Form-based** สำหรับ Admin UI และ Admin REST API ทั้งหมด (`@SecurityRequirement(name = "sessionCookieAuth")` ใน Swagger ใช้ JSESSIONID cookie)
- **Token-based (X-Access-Token)** ผ่าน `AccessTokenApiFilter` + `AccessTokenService` — เดิมมี 2 endpoint ตอนนี้ (2026-07-07) ขยายเป็น **6 endpoint สาธารณะ**:
  - `POST /api/reports/generate`, `GET /api/reports/files/*/download` (เดิม)
  - `POST /api/reports/generate/queue`, `GET /api/reports/generate/queue/*` (Queue Generate)
  - `POST /api/reports/generate/bulk`, `GET /api/reports/generate/bulk/*/download` (Bulk Generate)
  - ทุก endpoint ใหม่ต้องเพิ่ม pattern ทั้งใน `AccessTokenApiFilter.shouldNotFilter(...)` (ให้ filter รันตรวจ token) และใน `SecurityConfig` (`permitAll()` + CORS registration) พร้อมกันเสมอ ไม่งั้น Spring Security จะบล็อกก่อนถึง filter
- Remember-me: คีย์และอายุ token ตั้งค่าได้ผ่าน `SecurityProperties` (`app.security.remember-me.days`, `.key`)
- CSRF: เปิดใช้งานทั่วระบบ ยกเว้น `/h2-console/**`, `/api/reports/generate`, `/api/reports/generate/queue`, `/api/reports/generate/bulk` (endpoint token-auth ทั้งหมดไม่ใช้ CSRF เพราะไม่มี session)
- H2 Console (`/h2-console`) เปิดใช้งานได้ (`spring.h2.console.enabled=true`) แต่ต้อง login ผ่าน session ก่อน (ไม่ใช่ public path — อ้างอิงจาก `.github/memories/architecture.md` และยืนยันว่าไม่มี `/h2-console` อยู่ใน `permitAll()` list ของ `SecurityConfig`)
- **Note**: `callbackUrl` ของ Queue Generate รับ URL ใดก็ได้ที่ผ่านการเช็คแค่ scheme (`http`/`https`) + host ไม่ว่าง — ยังไม่มีการป้องกัน SSRF อย่างเข้มงวด (เช่น block internal/private IP range) สอดคล้องกับระดับความเข้มงวดด้าน security ของโปรเจกต์นี้โดยรวม (ดู `security-checklist.md`)

## Diagram (ภาพรวมความสัมพันธ์)

```
                     ┌─────────────────────────┐
                     │   Browser (Admin User)   │
                     └────────────┬─────────────┘
                                  │ Session Cookie (JSESSIONID)
                                  ▼
        ┌───────────────────────────────────────────────────┐
        │        Spring Security Filter Chain                │
        │  (form login, remember-me, AccessTokenApiFilter)    │
        └───────────────────────────┬────────────────────────┘
                                     │
              ┌──────────────────────┼───────────────────────┐
              ▼                                              ▼
     ┌─────────────────┐                         ┌──────────────────────┐
     │  PageController   │                        │  *ApiController (REST) │
     │  (Thymeleaf views) │                        │  (JSON responses)      │
     └─────────┬─────────┘                        └───────────┬───────────┘
               │                                              │
               └───────────────────┬──────────────────────────┘
                                    ▼
                         ┌────────────────────┐
                         │   Service Layer     │  (business logic, audit logging,
                         └──────────┬──────────┘   timezone conversion)
                                    │
                 ┌──────────────────┼───────────────────┐
                 ▼                                       ▼
     ┌───────────────────────┐              ┌─────────────────────────────┐
     │  Repository (JPA/H2)   │              │  Filesystem (data/uploads,    │
     │  ระบบ metadata หลัก      │              │  data/generated, data/reports)│
     └───────────────────────┘              └─────────────────────────────┘

     ┌───────────────────────────────────────────────────────────┐
     │  External System (Partner) → X-Access-Token → /api/reports │
     │  → JasperReports engine → อ่านข้อมูลจาก Data Source ภายนอก   │
     │    (PostgreSQL / MySQL / MariaDB ตาม DataSourceConfig)       │
     └───────────────────────────────────────────────────────────┘
```

## ข้อสังเกต / Note
- ไม่มี cache layer (Redis ฯลฯ) หรือ external service call ใดๆ นอกจากฐานข้อมูลที่ผู้ใช้กำหนดเองสำหรับรายงานและ webhook callback ของ Queue Generate — ระบบนี้เป็น monolith แบบ self-contained เป็นหลัก
- **(อัปเดต 2026-07-07)** ตอนนี้มี "queue" แบบ DB-backed + `@Scheduled` polling สำหรับ Queue Generate (`ReportGenerationQueueItem` table + `ReportGenerationQueueService`) แต่ **ยังไม่ใช่ message broker แยกต่างหาก** (ไม่มี RabbitMQ/Kafka/Redis Streams ฯลฯ) — ประมวลผลแบบ single-instance polling เท่านั้น ถ้า deploy หลาย instance พร้อมกันในอนาคตต้องคิดเรื่อง distributed locking เพิ่ม (ยังไม่ได้ทำ)
- ไม่พบ API Gateway หรือ Load Balancer config ใน repo
- ไม่พบการใช้งาน HTMX จริงแม้จะมี dependency ประกาศไว้ (ดูรายละเอียดใน `tech-stack.md`)
