/* cSpell:disable */

# Database Standard

> อ้างอิงจาก entity classes จริงใน `src/main/java/dev/suksabai/report_service/model/` และ `application.properties` (ตรวจสอบล่าสุด: 2026-07-07 — เพิ่ม Queue/Bulk Generate)

## ฐานข้อมูลที่ใช้
- ระบบใช้ **H2 Database (file mode)** เป็นฐานข้อมูลหลักของตัวเองเสมอ: `spring.datasource.url=jdbc:h2:file:./data/report-service`
- `spring.jpa.hibernate.ddl-auto=update` → Hibernate auto-generate/update schema จาก Entity โดยตรง (**ไม่พบการใช้ Flyway/Liquibase หรือไฟล์ migration SQL ใดๆ ใน repo**) — Note: นี่คือรูปแบบ schema management ปัจจุบัน ไม่ใช่ recommendation
- Driver อื่น (MySQL/MariaDB/PostgreSQL) ที่ประกาศใน `pom.xml` ใช้สำหรับเชื่อมต่อฐานข้อมูล**ภายนอก**ที่ผู้ใช้กำหนดผ่านหน้า Data Sources เพื่อดึงข้อมูลไปออกรายงาน ไม่เกี่ยวกับ schema ของระบบเอง

## รายชื่อ Table หลัก (จาก `@Table(name = "...")`)

| Entity Class | ชื่อ Table | คำอธิบาย |
|---|---|---|
| `AccessToken` | `access_tokens` | ข้อมูล API access token ที่ใช้เรียก public report API |
| `AuditLogEvent` | `audit_log_events` | Event log กลางของทั้งระบบ (create/update/delete/generate/download/test) |
| `DataSourceConfig` | `data_source_configs` | Configuration การเชื่อมต่อฐานข้อมูลภายนอกที่ใช้เป็น data source ของรายงาน |
| `GeneratedReportFile` | `generated_report_files` | Metadata ของไฟล์รายงานที่ถูก generate ออกมาแล้ว |
| `ReportDownloadLog` | `report_download_logs` | Log การดาวน์โหลดไฟล์รายงานแต่ละครั้ง |
| `ReportTemplate` | `report_templates` | Template รายงาน (.jrxml/.jasper) ที่บันทึกไว้ในระบบ |
| `SystemSettings` | `system_settings` | ตาราง Singleton (มีแถวเดียว id=1) เก็บค่าตั้งค่าระบบ |
| `ReportGenerationQueueItem` (ใหม่ 2026-07-07) | `report_generation_queue_items` | คำขอ generate รายงานแบบ queue (Queue Generate) พร้อมสถานะ webhook delivery |
| `BulkReportGenerationBatch` (ใหม่ 2026-07-07) | `bulk_report_generation_batches` | ประวัติคำขอ Bulk Generate 1 แถวต่อ 1 batch (รวมผลลัพธ์ทุก item + path ของไฟล์ ZIP) |

### ความสัมพันธ์ (Relationship)
- มีความสัมพันธ์ JPA แบบ explicit เพียงจุดเดียว: `ReportTemplate.dataSourceConfig` เป็น `@ManyToOne(fetch = FetchType.LAZY)` ไปยัง `DataSourceConfig` ผ่าน foreign key column `data_source_id` (nullable — template ไม่จำเป็นต้องผูกกับ data source)
- Entity อื่นๆ (`GeneratedReportFile`, `AuditLogEvent`, `ReportDownloadLog`, และ 2 entity ใหม่ `ReportGenerationQueueItem`/`BulkReportGenerationBatch`) **ไม่ใช้ JPA relation (`@ManyToOne`/`@OneToMany`)** แต่เก็บ id และชื่อที่เกี่ยวข้องเป็น scalar column แยกต่างหาก (denormalized snapshot) เช่น `GeneratedReportFile.reportTemplateId` + `reportTemplateName`, `GeneratedReportFile.generatedByTokenId` + `generatedByTokenName`, `ReportGenerationQueueItem.reportTemplateId` + `reportTemplateName` + `generatedReportFileId` (ชี้ไปยังแถวใน `generated_report_files` หลัง generate สำเร็จ แบบ scalar เช่นกัน ไม่ใช่ FK)
  - เหตุผลเชิงออกแบบ (สังเกตจากโค้ด): เพื่อให้ประวัติ/log ยังแสดงชื่อเดิมได้แม้ template หรือ token ต้นทางจะถูกลบไปแล้ว
  - **`BulkReportGenerationBatch` ไม่มีความสัมพันธ์กับ `generated_report_files` เลย** — item ที่ generate สำเร็จใน batch หนึ่งไม่ได้สร้างแถวใน `generated_report_files` (ต่างจาก Queue Generate ที่ผูกกลับไปยัง `generated_report_files`) เพราะไฟล์อยู่ในตัว ZIP ที่ persist แยกต่างหากที่ `data/bulk` เท่านั้น ผลลัพธ์ราย item เก็บเป็น JSON summary ใน `item_results_json` แทน

## รูปแบบการตั้งชื่อ (Naming Convention)

- **ชื่อ Table**: `snake_case`, พหูพจน์ (เช่น `access_tokens`, `report_templates`) — Hibernate แปลงจาก class name แบบอัตโนมัติ (ไม่พบ `@Column`/`@Table` ที่ระบุชื่อ column แบบ custom นอกจาก `@Table(name=...)` ระดับ entity)
- **ชื่อ Field/Column ในโค้ด Java**: `camelCase` (เช่น `tokenName`, `expiresAt`, `generatedByTokenId`) — Hibernate แปลงเป็น `snake_case` โดยอัตโนมัติเมื่อ map ลง column จริง (physical naming strategy default ของ Spring Boot)
- **Primary Key**: ทุกตารางใช้ `id` เป็น `Long`, `@GeneratedValue(strategy = GenerationType.IDENTITY)` ยกเว้น `SystemSettings` ที่ใช้ `@Id` แบบ manual-set (เพราะเป็น singleton row ที่ id ถูก fix เป็น `1L` ใน service layer)
- **Enum**: เก็บแบบ `@Enumerated(EnumType.STRING)` (เช่น `DataSourceConfig.databaseType`) — ไม่ใช้ ordinal
- **Status/Flag แบบ String**: บาง field ใช้ `String` แทน enum สำหรับสถานะที่เป็น free-form/ขยายง่าย เช่น `AccessToken.status` ("Active"), `DataSourceConfig.lastTestStatus` ("Not tested"), `SystemSettings.generatedReportCleanupFrequency` ("Monthly") — Note: นี่เป็น pattern ที่ใช้จริงในโค้ด ไม่ใช่ enum ที่ type-safe
- **Boolean flag**: prefix แบบ `is`/adjective เช่น `fileDeleted` (ไม่มี prefix `is` ในชื่อ field แต่ getter เป็น `isFileDeleted()`)

## Audit Columns (รูปแบบที่พบจริง)

**ไม่มี Base/Abstract Entity กลางที่บังคับ audit columns** (ไม่พบ `@MappedSuperclass` หรือ `AuditingEntityListener` ในโปรเจกต์) — แต่ละ entity implement audit timestamp เองผ่าน JPA lifecycle callback (`@PrePersist`/`@PreUpdate`) แบบ manual โดยมี pattern ที่ใช้ซ้ำกันดังนี้:

| Entity | Audit columns ที่พบ | Callback |
|---|---|---|
| `AccessToken` | `createdAt`, `updatedAt` | `@PrePersist` ตั้งทั้ง `createdAt` (ถ้า null) และ `updatedAt`; `@PreUpdate` ตั้งเฉพาะ `updatedAt` |
| `ReportTemplate` | `uploadedAt`, `updatedAt` | เหมือนรูปแบบ `AccessToken` แต่ใช้ชื่อ `uploadedAt` แทน `createdAt` |
| `GeneratedReportFile` | `generatedAt`, `updatedAt` | เหมือนรูปแบบ `AccessToken` แต่ใช้ชื่อ `generatedAt` แทน `createdAt` |
| `DataSourceConfig` | `updatedAt` เท่านั้น | เมธอดเดียว `touch()` ผูกทั้ง `@PrePersist` และ `@PreUpdate` — **ไม่มี created-at column แยก** |
| `SystemSettings` | `updatedAt` เท่านั้น | `@PrePersist`/`@PreUpdate` แยกเมธอด แต่ทำสิ่งเดียวกัน |
| `AuditLogEvent` | `occurredAt` เท่านั้น | `@PrePersist` ตั้งค่าเฉพาะตอน insert (เป็น log แบบ immutable ไม่มี update) |
| `ReportDownloadLog` | `downloadedAt` เท่านั้น | `@PrePersist` เท่านั้น (immutable log) |
| `ReportGenerationQueueItem` (ใหม่ 2026-07-07) | `submittedAt`, `updatedAt` | เหมือนรูปแบบ `AccessToken` แต่ใช้ชื่อ `submittedAt` แทน `createdAt`; ยังมี `startedAt`/`completedAt` เป็น timestamp เพิ่มเติมที่ set โดย service เอง (ไม่ใช่ lifecycle callback) ตอนเปลี่ยนสถานะ |
| `BulkReportGenerationBatch` (ใหม่ 2026-07-07) | `generatedAt`, `updatedAt` | เหมือนรูปแบบ `GeneratedReportFile` ทุกประการ (ใช้ `generatedAt` แทน `createdAt`) |

### สรุปกฎที่สังเกตได้ (Note: เป็นการสังเกตจาก pattern จริง ไม่ใช่กฎที่มีเอกสารบังคับไว้ก่อนหน้า)
1. Entity ที่เป็น **ข้อมูล configuration/สถานะที่แก้ไขได้** (Access Token, Report Template, Generated Report File, Data Source Config, System Settings) จะมี `updatedAt` เสมอ และส่วนใหญ่มี "created-at" ในชื่อที่สื่อความหมายเฉพาะทาง (`createdAt`/`uploadedAt`/`generatedAt`) แทนที่จะใช้ชื่อ `createdAt` ตายตัวทุกที่
2. Entity ที่เป็น **Log/History แบบ immutable** (Audit Log Event, Report Download Log) จะมีเพียง timestamp เดียวที่บันทึกตอนเกิดเหตุการณ์ (`occurredAt`, `downloadedAt`) และไม่มี `updatedAt` เพราะไม่ถูกแก้ไขหลังสร้าง
3. **ไม่มี column ระบุผู้กระทำ (`createdBy`/`updatedBy`) ในรูปแบบ foreign key ที่เป็นมาตรฐานเดียวกันทุกตาราง** — ผู้กระทำถูกเก็บผ่าน column เฉพาะทางแทน เช่น `AuditLogEvent.actor`, `GeneratedReportFile.generatedByTokenName`, `ReportDownloadLog.downloadedBy` (Note: ไม่ใช่ pattern มาตรฐานเดียวกัน แต่ละตารางตั้งชื่อต่างกันตามบริบท)
4. **ไม่มี soft-delete column มาตรฐานเดียวกันทุกตาราง** — พบ soft-delete เฉพาะ `GeneratedReportFile` เท่านั้น ผ่าน `fileDeleted` (boolean) + `fileDeletedAt` + `fileDeletionReason` ตารางอื่นใช้ hard delete ปกติผ่าน `JpaRepository.deleteById`

## ข้อสังเกตเพิ่มเติม / Note สำหรับทีม
- เนื่องจากไม่มี Base Entity หรือ Auditing Listener กลาง หากต้องเพิ่ม entity ใหม่ ทีมควรตัดสินใจอย่างชัดเจนว่าจะ "สร้างมาตรฐานใหม่ให้ทุก entity ใช้ร่วมกัน (เช่น `@MappedSuperclass`)" หรือ "คงรูปแบบ manual `@PrePersist`/`@PreUpdate` ต่อ entity แบบเดิม" — ปัจจุบันโค้ด **ไม่มีมาตรฐานบังคับที่เขียนไว้เป็นลายลักษณ์อักษรมาก่อนหน้านี้** (ไฟล์นี้ว่างเปล่าก่อนการวิเคราะห์ครั้งนี้)
- Sensitive data: `DataSourceConfig.password` เก็บเป็น plain `String` column — **ไม่พบการเข้ารหัส (encryption) ก่อนบันทึกลง DB** ในโค้ดที่อ่านมา ควรตรวจสอบเพิ่มเติมกับทีม security ว่ามีการเข้ารหัสระดับ column หรือ disk-level หรือไม่ (ไม่พบในโค้ด service ที่เกี่ยวข้อง)
- `AccessToken.tokenValue` เก็บเป็น `String` ความยาวจำกัด `length = 160` — ไม่พบการ hash ก่อนบันทึก (เทียบกับค่าที่ส่งมาโดยตรงใน `X-Access-Token` header) Note: ควรตรวจสอบกับทีมว่าเป็นการออกแบบที่ตั้งใจหรือควรปรับปรุง
