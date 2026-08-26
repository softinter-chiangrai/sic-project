/* cSpell:disable */


# Changelog

> สร้างจากการอ่าน Git commit history ทั้งหมด (153 commits, `git log --reverse`) ตั้งแต่ 2026-03-13 ถึง 2026-07-03 ไม่ใช่ release note ที่เขียนไว้ก่อนหน้า จึงเป็นการสรุปย้อนหลังตามช่วงเวลาที่คอมมิตจริงเกิดขึ้น

## ช่วงที่ 1 — ต้นแบบแรก: Microservice + Angular (2026-03-13 – 2026-03-20)
โปรเจกต์เริ่มต้นด้วยสถาปัตยกรรมคนละแบบกับปัจจุบัน:
- สร้าง backend service, auth service แยกกัน (`create auth service`, `add backend service`)
- สร้าง Angular project เป็น frontend แยกต่างหาก (`create angular project`, `update frontend login and profile page`)
- ตั้งค่า Docker Compose หลายบริการ พร้อมเพิ่ม MariaDB
- **หมายเหตุ**: สถาปัตยกรรมชุดนี้ไม่ปรากฏในโค้ดปัจจุบันแล้ว (ไม่มี Angular project หรือ auth service แยกใน repo ปัจจุบัน) — เป็นหลักฐานว่ามีการรีสตาร์ทแนวทางกลางคัน

## ช่วงที่ 2 — รีสตาร์ทเป็น Spring Boot Monolith (2026-03-23)
- คอมมิต `initial new spring boot` (2026-03-23) เป็นจุดเปลี่ยนสำคัญ: ล้างสถาปัตยกรรมเดิมและเริ่มต้นใหม่เป็น Spring Boot monolith ตัวเดียวที่ผสาน Admin UI (Thymeleaf) และ Public API ไว้ในแอปเดียวกัน ตรงกับโครงสร้างที่ใช้งานอยู่ในปัจจุบัน
- เริ่มใช้ H2 file database เป็นฐานข้อมูลหลักของระบบ (`update h2 console`)

## ช่วงที่ 3 — วางรากฐาน Core Features (2026-03-24 – 2026-03-28)
- วางโครง Security (form login), หน้า UI เริ่มต้น, ฟอนต์และไอคอน
- สร้างและเชื่อม Data Source management เข้ากับ backend (`update data source service and ui`, `update data sources ui wire to backend`)
- สร้าง Report Template management (`update report template`, `update report templates ui and data source ui`)
- สร้าง Access Token management (`update token access ui`, `update access token page`)
- เพิ่ม generate/download service และหน้า preview รายงาน (`add generate and download service, add report view`, `add loading preview report`)
- เพิ่ม Audit Log เข้าสู่ระบบครั้งแรก (`add audit base entity`, `update audit log`, `update audit ui`)
- อัปเดต Swagger/OpenAPI documentation (`update open api doc`)
- ปรับ Dashboard ให้ดึง Recent Activity จริงจาก backend (`update dashboard activity`)

## ช่วงที่ 4 — Hardening และ Deploy (2026-03-28 – 2026-04-07)
- ปรับ Security เพิ่มเติม (`update security`), ปรับ path ดาวน์โหลดไฟล์ให้ปลอดภัยขึ้น (`update download file security`)
- เพิ่ม `templateCode` ให้ report template ใช้ generate รายงานแทน id ได้ (`add template code`, `update generate by template code`)
- เพิ่มโมดูลล้างข้อมูลอัตโนมัติ (`add clean up module`, `update ui and default cleanup`)
- ปรับ deploy script และ Docker build หลายรอบ (`update deploy script`, `update build and deploy method`)
- ทดสอบและแก้ไขรอบใหญ่ก่อนขึ้นสถานะเสถียร (`test and fixed`, `final test`)

## ช่วงที่ 5 — ฟอนต์ไทยและ UX เพิ่มเติม (2026-04-10 – 2026-04-27)
- เพิ่มฟอนต์ TH Sarabun New สำหรับรายงานภาษาไทย (`add fonts th sarabun new`)
- เพิ่มการตั้งค่า Download Base URL แบบกำหนดเองได้ (`add download base url`)
- ปรับปรุงการทดสอบและเพิ่ม try-catch เพื่อความทนทาน (`update testing and add try catch`)

## ช่วงที่ 6 — Multi-value Parameters และ Barcode (2026-05-20 – 2026-05-27)
- รองรับ parameter แบบหลายค่า (collection) ในรายงาน (`add multiple value`)
- เพิ่ม dependency `jasperreports-barcode4j` เพื่อรองรับ component บาร์โค้ดใน JRXML (`update dependencies barcode 4j`)
- ปรับโครงสร้างโปรเจกต์และ Dev Container ให้รองรับ GitHub Codespaces (`update dev container config for github codespace`, `update project file structure`)

## ช่วงที่ 7 — Data Source Timeout และ UI Polish (2026-06-05 – 2026-06-08)
- เพิ่ม connect timeout / socket timeout ต่อ data source configuration (`add connect timeout and socket timeout`, `update data source connection timeout`)
- จำกัด input ช่อง Port ให้รับเฉพาะตัวเลข (`number only for input port`)
- ปรับ layout report parameter เป็นคอลัมน์เดียว, ปรับตำแหน่ง dialog (`report parameter adjust to 1 column`, `adjust dialog to front`)
- ปรับปรุงข้อความ response และลบไฟล์ที่ไม่ใช้ (`update response message`, `remove unuse file`)

## ช่วงที่ 8 — Timezone Correctness (2026-07-03, ล่าสุด)
- เพิ่มการตั้งค่าเครื่องมือ Claude Code สำหรับโปรเจกต์ (`add claude setting to project`)
- แก้ไขให้ระบบยึด **UTC** เป็นมาตรฐานเวลาที่เก็บใน database เสมอ (`use utc timezone`)
- ปรับปรุงการแปลงเวลาสำหรับแสดงผลให้สอดคล้องกับ timezone ที่ตั้งค่าไว้ใน Settings (`update timezone`) — สอดคล้องกับ `ConfiguredTimeDisplayService` ที่พบในโค้ดปัจจุบัน

## ช่วงที่ 9 — Report Generation Menus: Generate / Queue / Bulk (2026-07-07)
> ช่วงนี้ไม่ได้มาจากการอ่าน git log ย้อนหลัง แต่เป็นงานที่ทำร่วมกับ Claude ในเซสชันนี้โดยตรง บันทึกไว้ทันทีหลังทำเสร็จ (ยังไม่ได้ commit ณ เวลาที่เขียนหมายเหตุนี้)
- เพิ่ม 3 เมนูใหม่ในแถบข้าง (ต่อจาก Dashboard, ก่อน Reports): **Generate Report**, **Queue Generate**, **Bulk Generate**
- **Generate Report**: หน้าจอใหม่ล้วน ๆ ให้แอดมินเลือก template ที่บันทึกไว้ ใส่ parameter แล้ว generate/download ได้ทันที — ใช้ API เดิม (`POST /api/report-templates/{id}/generate`) ที่มีอยู่แล้วแต่ยังไม่เคยมีเมนูเรียก
- **Queue Generate**: เพิ่ม API สาธารณะ (`X-Access-Token`) ให้ระบบภายนอกยิง request generate เข้าคิว ระบบประมวลผลเบื้องหลังด้วย `@Scheduled` poller แล้วยิง webhook แจ้งสถานะกลับไปที่ `callbackUrl` ของผู้ขอ พร้อม retry แบบ backoff (1/5/15 นาที) เมื่อยิงไม่สำเร็จ และมีปุ่ม retry ด้วยมือในหน้า Admin ที่มีทั้งฟอร์มทดลองยิงและตาราง monitor สถานะแบบ auto-refresh
- **Bulk Generate**: เพิ่ม API สาธารณะให้ยิง JSON array ของรายการที่ต้องการ generate (report code/id + parameter + ชื่อไฟล์ที่กำหนดเอง) ระบบ generate ทีละรายการแบบแยก transaction กัน (รายการหนึ่งพังไม่กระทบรายการอื่น) แล้วรวมเป็น ZIP พร้อม `manifest.json` สรุปผลให้ดาวน์โหลด
- Entity/table ใหม่: `report_generation_queue_items`, `bulk_report_generation_batches` (auto-create ผ่าน `ddl-auto=update` เหมือนตารางอื่นทั้งหมด ไม่มี migration script)
- Service ใหม่: `ReportGenerationQueueService`, `WebhookDeliveryService`, `BulkReportGenerationService`
- Controller ใหม่: `ReportQueueAdminApiController` (`/api/report-queue`), `BulkReportAdminApiController` (`/api/report-bulk`) — ส่วน endpoint สาธารณะเพิ่มเข้าไปใน `ReportApiController` เดิม
- **บั๊กที่เจอและแก้ระหว่างพัฒนา**: `UnexpectedRollbackException` ตอน commit เพราะ nested `@Transactional` (REQUIRED) method ที่ถูก catch exception ไว้แล้วยัง mark transaction ที่ใช้ร่วมกันเป็น rollback-only — แก้ด้วย `Propagation.REQUIRES_NEW` (รายละเอียดเต็มใน `memories/ai-learnings.md`)
- ตรวจสอบด้วย `mvn test` (ผ่านทั้งหมด ยกเว้น 3 test ที่ fail อยู่ก่อนแล้วจาก environment ไม่เกี่ยวกับงานนี้) และ smoke test แบบรันแอปจริง + curl ครบทุก flow (happy path, webhook success/failure/retry, bulk partial-failure)

## หมายเหตุสำคัญ
- เนื้อหาชุดนี้สรุปจากข้อความ commit message ล้วนๆ ไม่ได้เปิดดู diff ของทุกคอมมิตอย่างละเอียด รายละเอียดเชิงลึกของแต่ละฟีเจอร์อ้างอิงเพิ่มเติมได้จาก `architecture/system-architecture.md`, `standards-and-blueprints/database-standard.md`, และ `standards-and-blueprints/api-design.md` ที่วิเคราะห์จากโค้ดจริงโดยตรง
- Commit ล่าสุดในประวัติ (2026-07-03) อยู่ก่อนวันที่ปัจจุบัน (2026-07-06) เล็กน้อย — ควรตรวจสอบกับผู้ดูแลโปรเจกต์ว่ามีงานที่กำลังทำอยู่นอกเหนือจาก commit history หรือไม่ (ช่วงที่ 9 ด้านบนคือคำตอบส่วนหนึ่ง — เป็นงานที่ทำในเซสชัน AI วันที่ 2026-07-07)
