/* cSpell:disable */

# Architecture Decision Records

> เริ่มบันทึกครั้งแรก 2026-07-07 พร้อมกับงานเพิ่มเมนู Generate/Queue/Bulk Generate — ก่อนหน้านี้ไฟล์นี้ว่างเปล่า

## ADR-001: ใช้ `@Scheduled` polling แทน message broker สำหรับ Queue Generate (2026-07-07)
- **บริบท**: ต้องเพิ่ม "queue generate" ที่รับ request แล้วประมวลผลเบื้องหลัง ไม่ block caller
- **ทางเลือก**: (a) message broker แยก (RabbitMQ/Kafka/Redis Streams) (b) DB-backed queue + `@Scheduled` polling เหมือนที่ `SystemSettingsService.runAutomaticGeneratedReportCleanup()` ทำอยู่แล้ว
- **ตัดสินใจ**: เลือก (b) — โปรเจกต์นี้เป็น self-contained monolith ไม่มี infra ภายนอกใด ๆ เลย (ไม่มี Redis/message broker declare ใน `pom.xml`/`docker-compose.yml`) การเพิ่ม broker ใหม่จะขยาย deployment footprint เกินความจำเป็นสำหรับ scale ปัจจุบัน (deploy เป็น container เดียว)
- **Trade-off ที่ยอมรับ**: ประมวลผลได้ทีละ instance เท่านั้น (ไม่มี distributed lock) ถ้าต้อง scale เป็นหลาย instance ในอนาคตต้องกลับมาทบทวน ADR นี้ใหม่

## ADR-002: Webhook retry ใช้ fixed backoff schedule เก็บ state ใน DB แทน retry queue แยก (2026-07-07)
- **บริบท**: เมื่อยิง webhook แจ้งสถานะไปหา `callbackUrl` ของผู้ขอไม่สำเร็จ ต้องมีกลไก retry
- **ตัดสินใจ**: เก็บ `webhookStatus`/`webhookAttempts`/`nextWebhookAttemptAt`/`lastWebhookResponseSummary` เป็น column ตรงบน `ReportGenerationQueueItem` เอง แล้วให้ `@Scheduled processWebhookRetries()` (ทุก 30s default) กวาดหา item ที่ถึงเวลา retry — ไม่สร้างตาราง/mechanism แยกสำหรับ retry queue
- **Backoff schedule**: 1 → 5 → 15 นาที (กำหนดได้ผ่าน `app.queue.webhook.retry-delays-minutes`) ครบแล้วยัง fail ให้ `webhookStatus=Failed` ถาวร แต่ยังกด "Retry Webhook" ด้วยมือได้เสมอจากหน้า Admin (รีเซ็ต attempt counter กลับเป็น 0)
- **เหตุผล**: ผู้ใช้เลือกไว้ชัดเจนว่าต้องการ "retry อัตโนมัติแบบมี backoff" (ไม่ใช่แค่ยิงครั้งเดียว) — เก็บ state ในแถวเดียวกับ queue item ทำให้ query/แสดงผลในหน้า Admin ง่าย ไม่ต้อง join ตารางเพิ่ม

## ADR-003: Bulk Generate ไม่สร้าง `GeneratedReportFile` ต่อ item (2026-07-07)
- **บริบท**: แต่ละ item ใน bulk request สร้างไฟล์รายงาน 1 ไฟล์ ควรบันทึกเป็น `GeneratedReportFile` เหมือน flow generate ปกติหรือไม่?
- **ตัดสินใจ**: **ไม่บันทึก** — item ที่สำเร็จจะถูกใส่ลง ZIP ตรง ๆ (ไม่เขียนไฟล์เดี่ยวลง `data/reports` ไม่สร้างแถวใน `generated_report_files`) เก็บเฉพาะ 1 แถวใน `bulk_report_generation_batches` ต่อ 1 คำขอ (รวม `itemResultsJson` สรุปทุก item) และ audit log เพียง 1 event ต่อ batch (ไม่ log ทีละ item)
- **เหตุผล**: ป้องกันไม่ให้หน้า "Reports" ปกติและ audit log ถูก spam ด้วยรายการจำนวนมากจากคำขอ bulk เดียว (เช่น bulk 500 รายการ = 500 แถว/500 audit event ถ้าทำตาม flow ปกติ) — ให้ bulk เป็น concept แยกที่มีหน้า/API monitor ของตัวเอง (`/reports/bulk`, `/api/report-bulk`)
- **ผลที่ตามมา**: ไฟล์ที่ generate จาก bulk **ดาวน์โหลดซ้ำได้เฉพาะทั้ง ZIP** (ผ่าน `GET /api/reports/generate/bulk/{id}/download` หรือ `GET /reports/bulk/files/{id}/download`) ไม่มี route ดาวน์โหลดไฟล์เดี่ยวจากใน ZIP แยกออกมา

## ADR-004: `generateFromQueue`/`generateBytesForBulk` ต้องใช้ `Propagation.REQUIRES_NEW` (2026-07-07)
- **บริบท**: ตอน implement ครั้งแรกใช้ `@Transactional` default (`REQUIRED`) แล้วเจอ `UnexpectedRollbackException` จริงตอน smoke test (ดูรายละเอียดเต็มใน `memories/ai-learnings.md`)
- **ตัดสินใจ**: เปลี่ยนทั้ง `GeneratedReportService.generateFromQueue(...)` และ `GeneratedReportService.generateBytesForBulk(...)` เป็น `@Transactional(propagation = Propagation.REQUIRES_NEW)` เพื่อให้แต่ละ item/request มี transaction ของตัวเอง แยกจาก transaction ของ caller (`ReportGenerationQueueService.processQueueItem`, `BulkReportGenerationService.performBulkGeneration`) ที่ loop เรียกซ้ำแล้ว catch exception เพื่อ "ไปต่อ" กับ item ถัดไป
- **บทเรียนทั่วไป**: pattern นี้ใช้ได้กับทุกจุดในอนาคตที่ต้อง loop เรียก `@Transactional` method หลายครั้งแล้ว catch-and-continue ต่อ item — ต้องใช้ `REQUIRES_NEW` เสมอ ไม่งั้น exception ที่ถูก catch แล้วก็ยังทำให้ transaction วงนอกพังตอน commit

