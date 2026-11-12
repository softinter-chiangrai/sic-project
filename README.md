# SIC Project (Software Development Lifecycle Management & Tracking Platform)

ระบบบริหารและติดตามโครงการพัฒนาซอฟต์แวร์แบบครบวงจร (SDLC Management Platform) สถาปัตยกรรม Microservices / Multi-Service Stack ที่รันด้วย Docker Compose และรองรับ Local Development

---

## 1. ภาพรวมสถาปัตยกรรมระบบ (Architecture Overview)

```
                                      ┌───────────────┐
                                      │   Keycloak    │ (Port 8080)
                                 ┌───►│  (sic-auth)   │ OIDC Auth / JWT
                                 │    └───────────────┘
                                 │
┌──────────────┐   Browser       │    ┌───────────────┐
│ User Browser │ ───────────────┼───►│    sic-app    │ (Port 4200)
└──────────────┘   HTTP / HTTPS  │    │  (Angular 22) │ Frontend Client + SSR
                                 │    └───────┬───────┘
                                 │            │ REST API + Bearer Token
                                 ▼            ▼
                              ┌───────────────────────┐
                              │      sic-spring       │ (Port 5265)
                              │  (Spring Boot / Java) │ Backend Core REST API
                              └───────────┬───────────┘
                     ┌────────────────────┼────────────────────┐
                     ▼                    ▼                    ▼
             ┌───────────────┐    ┌───────────────┐    ┌───────────────┐
             │ sic-database  │    │  sic-storage  │    │report-service │
             │ (PostgreSQL)  │    │  (SeaweedFS)  │    │(JasperReports)│
             │  Port: 54320  │    │  Port: 8888   │    │  Port: 8082   │
             └───────────────┘    └───────────────┘    └───────────────┘
```

### สรุป Port และ Tech Stack แต่ละ Service

| Service | Directory | Tech Stack | Port | หน้าที่หลัก |
|---|---|---|---|---|
| **Frontend** | `sic-app/` | Angular 22 (SSR), TailwindCSS, Tiptap | `4200` | หน้าบ้าน Web Application, หน้าจอทำเอกสาร SDLC, Gantt, Kanban |
| **Backend API** | `sic-spring/sic/` | Spring Boot 4.1, Java 21, JPA, Flyway | `5265` | ศูนย์กลาง Business Logic, REST API, AI Pipeline, Security |
| **Report Service** | `report-service/` | Spring Boot, JasperReports 7.0 | `8082` | ไมโครเซอร์วิสสร้างรายงาน PDF/Excel และจัดการคิวพิมพ์เอกสาร |
| **Authentication** | `sic-auth/` | Keycloak 26, Custom Theme | `8080` | Identity Provider (OIDC / OAuth2), จัดการผู้ใช้และ Token |
| **Database** | `sic-database/` | PostgreSQL 17 | `54320` | เก็บฐานข้อมูลแอปพลิเคชัน (`sic_app`) และ Keycloak (`sic_auth`) |
| **Object Storage** | `sic-storage/` | SeaweedFS (S3-compatible) | `8888` / `9333` | ที่เก็บไฟล์แนบ, รูปภาพ, เอกสาร PDF, สัญญา, Draw.io XML |
| **Diagram Tool** | `docker/drawio/` | Draw.io (Self-hosted) | `8085` | เครื่องมือวาดไดอะแกรม DFD, ERD, Flowchart ในระบบ |

---

## 2. เจาะลึกไฟล์ระดับ Root (Root Directory Files)

| ชื่อไฟล์ | หน้าที่โดยละเอียด |
|---|---|
| **`docker-compose.yml`** | ไฟล์คอนฟิกรวมของ Docker Compose ที่ผูกทุก Service เข้าด้วยกัน (`sic-database`, `sic-auth`, `sic-storage`, `sic-spring`, `sic-app`, `report-service`, `sic-drawio`) พร้อมจัดการ Network และ Volume |
| **`.env.example`** | แม่แบบ Environment Variables รวมทั้งระบบ (รหัสผ่าน DB, Keycloak Secret, S3 Keys, Mail SMTP, AI API Keys) สำหรับคัดลอกไปเป็น `.env` |
| **`.env`** | ไฟล์เก็บความลับ (Secrets) และค่าคอนฟิกจริงที่รันในเครื่อง (ถูก ignore ไม่นำขึ้น Git) |
| **`package.json`** | จัดการ Root NPM Scripts และ Dependencies สำหรับรันเครื่องมือส่วนกลาง (เช่น Playwright, Repomix) |
| **`package-lock.json`** | บันทึกเวอร์ชันที่แน่นอนของ Root Dependencies เพื่อให้การติดตั้งตรงกันทุกเครื่อง |
| **`AGENTS.md`** | กฎและแนวทางการทำงานของ AI Assistant (Laconic Mode, Ponytail Anti-overengineering, ข้อบังคับการรันโค้ดในเครื่อง และนโยบายการทดสอบ) |
| **`AI_PROMPTS_CATALOG.md`** | แคตตาล็อกรวม System Prompts และ Prompt Templates สำหรับฟีเจอร์ AI ในระบบทั้งหมด |
| **`PLAN.md`** | เอกสารวางแผนงาน รายการสิ่งที่ต้องทำ (To-Do List) และสถานะความคืบหน้าของโครงการ |
| **`READMEInformation.md`** | เอกสารอธิบายโฟลว์ธุรกิจ (Business Flow) ตามขั้นตอน SDLC แบบละเอียดตั้งแต่ต้นน้ำจนถึงปลายน้ำ |
| **`cleanup_demo_data.sql`** | สคริปต์ SQL สำหรับรันล้างข้อมูล Mock / Demo Data เพื่อรีเซ็ตฐานข้อมูลสู่สถานะเริ่มต้น |
| **`repomix.config.json`** | การตั้งค่า Repomix สำหรับบีบอัดโค้ดในโปรเจกต์เป็นก้อนเดียวเพื่อส่งให้ AI วิเคราะห์ |
| **`.repomixignore`** | กำหนดรายชื่อไฟล์/โฟลเดอร์ที่ไม่ต้องการให้ Repomix รวมเข้าไป |
| **`.gitignore`** | ระบุไฟล์และโฟลเดอร์ที่ไม่ต้องการให้ Git ติดตาม (เช่น `node_modules/`, `target/`, `.env`, log files) |

---

## 3. `sic-database/` (PostgreSQL Database Service)

โฟลเดอร์สำหรับจัดการฐานข้อมูลหลักของทั้งระบบ

```text
sic-database/
├── docker-compose.yml                       # คอนฟิกรัน PostgreSQL Container
└── infra/
    └── postgres/
        └── init/
            └── 01-init-databases.sql        # สคริปต์ SQL สร้าง Database และกำหนดสิทธิ์เริ่มต้น
```

* **`docker-compose.yml`**  
  กำหนดคอนเทนเนอร์ `postgres:17-alpine` แมป Port `54320:5432`, แมป Volume เก็บข้อมูลจริง `sic-postgres-data` และเมานต์สคริปต์เริ่มต้นจาก `infra/postgres/init`
* **`infra/postgres/init/01-init-databases.sql`**  
  สร้าง User และ Database สองก้อนอิสระเมื่อ Container สตาร์ตครั้งแรก:
  1. `sic_app` (สำหรับ Business Data ของ Spring Boot) พร้อมกำหนดสิทธิ์ให้ user `sic_app_user`
  2. `sic_auth` (สำหรับ Authentication Data ของ Keycloak) พร้อมกำหนดสิทธิ์ให้ user `keycloak_user`

---

## 4. `sic-storage/` (SeaweedFS Object Storage Service)

ระบบจัดเก็บไฟล์แบบ Distributed Object Storage รองรับ S3 API สำหรับเก็บไฟล์แนบและเอกสาร PDF

```text
sic-storage/
├── docker-compose.yml                       # คอนฟิกรัน SeaweedFS Master, Volume และ S3 Gateway
├── README.md                                # คู่มือการเชื่อมต่อใช้งาน S3 ผ่าน CLI/SDK
└── infra/
    └── seaweedfs/
        └── s3.conf                          # คอนฟิก S3 Access Key, Secret Key และ Buckets
```

* **`docker-compose.yml`**  
  รัน SeaweedFS ด้วยคำสั่ง `server -s3` เปิด Port S3 API ที่ `8888` และ Master UI ที่ `9333` พร้อมผูก Volume เก็บข้อมูลลงเครื่อง
* **`infra/seaweedfs/s3.conf`**  
  กำหนดคู่กุญแจ `accessKey` และ `secretKey` พร้อมสร้าง Buckets เริ่มต้น:
  * `uploads` — สำหรับเก็บไฟล์แนบของ Requirement, Task, Bug
  * `documents` — สำหรับเก็บไฟล์ PDF ที่ Export จากระบบรายงาน
  * `public-files` — สำหรับรูปภาพสาธารณะ เช่น โลโก้ และรูปโปรไฟล์
* **`README.md`**  
  อธิบายตัวอย่างคำสั่ง AWS CLI (`aws --endpoint-url=http://localhost:8888 s3 ls`) และวิธีเชื่อมต่อจากโค้ด

---

## 5. `sic-auth/` (Keycloak Authentication Service)

ระบบ Identity Provider สำหรับการยืนยันตัวตนแบบ Single Sign-On (OIDC / OAuth2)

```text
sic-auth/
├── Dockerfile                               # สร้าง Image Keycloak 26 พร้อม Build Custom Theme
├── docker-compose.yml                       # คอนฟิกรัน Keycloak เชื่อมต่อกับ sic-database (sic_auth)
├── infra/
│   └── realm-export.json                    # คอนฟิก Realm 'sic-project', Client 'sic-client' และ Roles
├── mint-keywind-theme-main/                 # ธีมพื้นฐาน Keycloak สไตล์ TailwindCSS
└── sic-keycloak-theme/                      # โฟลเดอร์ Custom Login/Register Theme เฉพาะของ SIC
```

* **`docker-compose.yml`**  
  รัน Keycloak บน Port `8080` โหมด `start-dev` เชื่อมต่อไปยังฐานข้อมูล `sic_auth` บน `sic-database:5432`
* **`Dockerfile`**  
  คัดลอก Custom Theme จาก `sic-keycloak-theme` เข้าไปยังไดเรกทอรี `/opt/keycloak/themes/`
* **`infra/realm-export.json`**  
  ไฟล์ส่งออกการตั้งค่า Realm `sic-project`:
  * กำหนด Client `sic-client` สำหรับ Frontend Angular (PKCE Flow)
  * กำหนด Roles ประจำระบบ: `PM`, `BA`, `SA`, `DEV`, `QA`, `EXECUTIVE`, `CUSTOMER`
* **`sic-keycloak-theme/`**  
  ไฟล์หน้าเข้าสู่ระบบ (Login), ลงทะเบียน (Register), รีเซ็ตรหัสผ่าน (Forgot Password) ที่ตกแต่งด้วย Tailwind ให้ตรงกับดีไซน์ของเว็บ SIC

---

## 6. `report-service/` (Standalone JasperReports Microservice)

ไมโครเซอร์วิสสำหรับประมวลผลและสร้างรายงาน PDF / Excel เพื่อแยกภาระงานหนักออกจาก Backend หลัก

```text
report-service/
├── pom.xml                                  # จัดการ Dependencies (JasperReports 7.0.6, OpenPDF, Spring Boot)
├── Dockerfile                               # สร้าง Container รัน report-service บน Port 8082
├── src/
│   ├── main/
│   │   ├── java/dev/suksabai/report_service/
│   │   │   ├── ReportServiceApplication.java# จุดเริ่มต้นรัน Spring Boot แอปพลิเคชัน
│   │   │   ├── config/                      # การตั้งค่า Security, Swagger, API Token
│   │   │   ├── controller/                  # REST APIs สำหรับสร้างและจัดการรายงาน
│   │   │   ├── model/                       # Entities บันทึกประวัติและคิวการพิมพ์
│   │   │   ├── repository/                  # Spring Data Repositories
│   │   │   └── service/                     # Core Engine สั่งรัน JasperReports
│   │   └── resources/
│   │       ├── application.properties       # คอนฟิก Port 8082, Datasource, Secret Token
│   │       ├── jasperreports.properties     # คอนฟิกการทำงานภายในของ JasperReports Engine
│   │       └── report-templates/            # รวมไฟล์เทมเพลต .jrxml ทุกประเภทเอกสาร
```

### รายละเอียดไฟล์สำคัญใน `report-service/`

* **`config/`**
  * `SecurityConfig.java` — ควบคุมความปลอดภัยของ endpoint และเปิด Swagger UI
  * `SecurityProperties.java` & `AccessTokenApiFilter.java` — ตรวจสอบ Access Token ที่ `sic-spring` ส่งมา
  * `OpenApiConfig.java` — ตั้งค่าหน้าเอกสาร OpenAPI / Swagger
* **`controller/`**
  * `ReportApiController.java` — API หลักสำหรับรับคำสั่งสร้างและดาวน์โหลดรายงาน (`/api/v1/reports/generate`)
  * `ReportTemplateApiController.java` — API สำหรับอัปโหลด อัปเดต และตรวจสอบไฟล์เทมเพลต `.jrxml`
  * `DataSourceApiController.java` — จัดการและทดสอบการเชื่อมต่อฐานข้อมูลสำหรับดึงข้อมูลรายงาน
  * `ReportQueueAdminApiController.java` — ดูสถานะและจัดการคิวการสร้างรายงานขนาดใหญ่
  * `BulkReportAdminApiController.java` — จัดการการสร้างรายงานแบบเป็นชุด (Bulk)
  * `PageController.java` — เรนเดอร์หน้าจอ Web Admin UI สำหรับจัดการเทมเพลตผ่านเบราว์เซอร์
* **`service/`**
  * `GeneratedReportService.java` — แกนหลักในการ Compile `.jrxml`, นำพารามิเตอร์ไป Fill ข้อมูล และ Export ออกมาเป็นไบต์สตรีม PDF/Excel
  * `ReportTemplateService.java` — โหลดไฟล์เทมเพลตจากโฟลเดอร์หรือฐานข้อมูล
  * `ReportGenerationQueueService.java` — จัดคิวงานพิมพ์ใน Background Thread ป้องกันคำร้องขอค้าง
  * `BulkReportGenerationService.java` — สร้างไฟล์เอกสารหลายรายการพร้อมกันแล้วรวมเป็นไฟล์เดียว
  * `WebhookDeliveryService.java` — ส่งสัญญาณ Webhook แจ้งเตือนเมื่อรายงานเสร็จสมบูรณ์
* **`src/main/resources/report-templates/*.jrxml` (เทมเพลตรายงานทั้งหมด):**
  * `pm_specification_report.jrxml` — ฟอร์มรายงานข้อกำหนดสเปกระบบ (SRS)
  * `pm_requirement_report.jrxml` — ฟอร์มรายงานความต้องการของโครงการ
  * `pm_contract_report.jrxml` — ฟอร์มสัญญาและตารางงวดงาน
  * `pm_delivery_report.jrxml` — ฟอร์มใบส่งมอบงานแต่ละงวด
  * `pm_design_review_report.jrxml` — ฟอร์มรายงานผลการตรวจสอบการออกแบบ
  * `pm_diagram_report.jrxml` — ฟอร์มรายงานแผนภาพ DFD / ER Diagram
  * `pm_invoice_report.jrxml` — ฟอร์มใบแจ้งหนี้และการชำระเงิน
  * `pm_project_report.jrxml` — ฟอร์มรายงานสรุปข้อมูลโครงการ
  * `pm_ticket_report.jrxml` — ฟอร์มใบแจ้งซ่อมและใบงาน MA
  * `pm_uat_report.jrxml` — ฟอร์มรายงานผลการทดสอบระบบ (Test Cases & UAT)
  * `pm_user_manual_report.jrxml` — ฟอร์มเอกสารคู่มือการใช้งานระบบ
  * `pm_change_request_report.jrxml` — ฟอร์มเอกสารขอเปลี่ยนแปลงขอบเขตงาน

---

## 7. `sic-spring/sic/` (Backend Core API - Spring Boot 4.1 / Java 21)

ศูนย์กลางการประมวลผลทางธุรกิจ, การคำนวณสิทธิ์, ระบบ AI และการเข้าถึงฐานข้อมูล

```text
sic-spring/sic/
├── pom.xml                                  # จัดการ Dependencies ของ Spring Boot และไลบรารีภายนอก
├── mvnw / mvnw.cmd                          # Maven Wrapper สำหรับ Build
└── src/
    ├── main/
    │   ├── java/com/softinter/sicapi/
    │   │   ├── config/                      # การตั้งค่าความปลอดภัย, Token, AOP, WebSocket
    │   │   ├── controller/                  # REST Controllers แบ่งตามโดเมน
    │   │   ├── dto/                         # DTO รับและส่งข้อมูล (Request/Response)
    │   │   ├── entity/                      # JPA Entities แทนตารางใน PostgreSQL
    │   │   ├── repository/                  # Spring Data JPA Repositories
    │   │   ├── service/                     # Service Interfaces และ Logic Implementations
    │   │   ├── exception/                   # คลาสจัดการข้อผิดพลาดส่วนกลาง
    │   │   ├── websocket/                   # ตัวจัดการข้อความ Real-time ผ่าน WebSocket
    │   │   ├── scheduler/                   # งานเบื้องหลังที่รันตามเวลา (Cron Jobs)
    │   │   └── util/                        # ตัวช่วยจัดการ PDF, Tiptap HTML และฟอนต์
    │   └── resources/
    │       ├── application.yml              # การตั้งค่าระบบ (Datasource, JPA, S3, AI, Mail)
    │       ├── db/migration/                # สคริปต์ Flyway Migration ทั้งหมด
    │       ├── fonts/                       # คอนฟิกฟอนต์ภาษาไทย (TH Sarabun New)
    │       └── reports/                     # เทมเพลต JasperReports สำรองในฝั่ง Backend
```

### รายละเอียดโครงสร้าง Package ใน `sic-spring/sic/src/main/java/`

#### 7.1 `config/` (การตั้งค่าสถาปัตยกรรมระบบ)
* `SecurityConfig.java` — กำหนด Spring Security Filter Chain ปิด Session ให้เป็น Stateless และกรอง JWT
* `KeycloakConfig.java` — ตรวจสอบความถูกต้องของ JWT Token ที่ได้จาก Keycloak และแกะ Role ของผู้ใช้
* `OpenApiConfig.java` — กำหนดชื่อ หัวข้อ และ Token Header สำหรับหน้า Swagger UI (`/swagger-ui.html`)
* `AuditorAwareImpl.java` — นำชื่อผู้ใช้ปัจจุบันจาก JWT ไปบันทึกในคอลัมน์ `created_by` / `updated_by` อัตโนมัติ
* `AuditLog.java` & `AuditLogAspect.java` — Custom Annotation และ AOP Aspect บันทึกประวัติการเรียกใช้งาน API
* `WebSocketConfig.java` — เปิดใช้งาน WebSocket STOMP endpoint ที่ `/ws` และตั้ง Broker `/topic`, `/queue`
* `CorsConfig.java` — กำหนดค่าอนุญาต Cross-Origin Resource Sharing สำหรับ Frontend Angular
* `AiApiKeyConverter.java` — ตัวแปลง Attribute JPA เข้ารหัส/ถอดรหัส AES-GCM สำหรับ API Key ของ AI
* `BusinessContextHolder.java` — เก็บ Business ID ของ Thread ปัจจุบันเพื่อคัดกรองข้อมูลแบบ Multi-tenant

#### 7.2 `controller/` (REST Endpoints แยกตามโดเมนงาน)
* **กลุ่ม AI Controllers:**
  * `AiProjectPipelineController.java` — รัน Pipeline AI แปลง Requirement $\rightarrow$ Spec $\rightarrow$ Test Case
  * `AiBatchGeneratorController.java` — สั่งสร้างเอกสารหลายรายการพร้อมกันผ่าน AI
  * `AiNavigatorController.java` — ระบบค้นหาอัจฉริยะ ตอบคำถาม และนำทางผู้ใช้ในระบบ
  * `AiSqlGeneratorController.java` — แปลง Requirement เป็นโครงสร้างตารางและ SQL DDL อัตโนมัติ
  * `AiPhaseWbsController.java` — วิเคราะห์และแนะนำการแตก Phase และ WBS ตามขอบเขตโครงการ
  * `PmDiagramAiController.java` — สร้างและปรับแต่งไฟล์ไดอะแกรม Draw.io ผ่านคำสั่ง AI
  * `PmDiagramChatController.java` — แชตและสั่งการ AI ภายในหน้าต่างวาดไดอะแกรม
  * `AiModelConfigController.java` — จัดการการตั้งค่าผู้ให้บริการโมเดล AI (Gemini, Claude, OpenAI)
* **กลุ่ม Project Management Controllers (`pm/`):**
  * `PmCustomerController.java` — จัดการข้อมูลลูกค้า (สร้าง, แก้ไข, ลบ, ค้นหา)
  * `PmCustomerProjectController.java` — จัดการข้อมูลโครงการ, งบประมาณ, สมาชิกทีม
  * `PmCustomerContractController.java` — จัดการสัญญาโครงการ, งวดการส่งมอบ, การต่อสัญญา
  * `PhaseController.java` — จัดการเฟสของโครงการ (เช่น Planning, Design, Development, UAT)
  * `MilestoneController.java` — จัดการเป้าหมายสำคัญของโครงการ (Milestones)
  * `WorkPackageController.java` — จัดการชุดงานหลักในแต่ละเฟส
  * `TaskController.java` & `ProjectTaskController.java` — จัดการงานย่อย, การมอบหมายงาน, สถานะงาน
  * `PmRequirementController.java` — จัดการข้อกำหนดความต้องการ พร้อมสถานะยืนยันจาก BA/ลูกค้า
  * `PmSpecificationController.java` — จัดการเอกสารข้อกำหนดเชิงเทคนิค (SRS)
  * `PmChangeRequestController.java` — จัดการคำขอเปลี่ยนแปลงขอบเขตงาน (CR)
  * `PmDesignReviewController.java` — บันทึกการตรวจสอบการออกแบบและรายการแก้ไข
  * `PmDiagramTabController.java` — จัดการแท็บแผนภาพ DFD และ ER Diagram ที่ผูกกับโครงการ
  * `PmTestCaseController.java` — จัดการเคสทดสอบและผลการรัน (Pass/Fail)
  * `PmTestScenarioController.java` — จัดการกลุ่มสถานการณ์ทดสอบ
  * `PmBugController.java` — จัดการการแจ้งข้อผิดพลาด การระบุสาเหตุ และการแก้บั๊ก
  * `PmDeliveryController.java` — จัดการเอกสารและหลักฐานการส่งมอบงาน
  * `PmUserManualController.java` — จัดการโครงสร้างและเนื้อหาคู่มือผู้ใช้งาน
  * `PmInvoiceController.java` & `PmPaymentController.java` — จัดการใบแจ้งหนี้และการบันทึกรับชำระเงิน
  * `PmMaTicketController.java` — จัดการตั๋วแจ้งซ่อมและงานบำรุงรักษาหลังส่งมอบ
  * `PmApprovalController.java` & `PmApprovalFlowController.java` — จัดการการยื่นและอนุมัติเอกสาร
  * `DocumentVersionController.java` — บันทึก Snapshot และเรียกดูประวัติการเปลี่ยนแปลงเอกสาร
  * `TraceLinkController.java` — บันทึกและสืบค้นความเชื่อมโยงของเอกสาร (Traceability Matrix)
  * `DiscussionController.java` — บันทึกข้อความสนทนาและคอมเมนต์ประจำเอกสาร
  * `ImpactAnalysisController.java` — คำนวณและวิเคราะห์ผลกระทบของ Change Request
  * `BulkDocumentExportController.java` — ส่งออกเอกสารทุกประเภทในโครงการรวมเป็นก้อนเดียว
  * `DocumentLivePreviewController.java` — ส่งข้อมูลสำหรับแสดงผลตัวอย่าง PDF แบบ Real-time
  * `PmEditSessionController.java` — จัดการ Session ล็อกการแก้ไขเอกสารป้องกันการบันทึกทับซ้อน
  * `PmProjectDashboardController.java` — รวมสถิติสถานะโครงการเพื่อแสดงผลบนแดชบอร์ด
* **กลุ่ม System Utilities Controllers (`su/`):**
  * `SuUserController.java` — จัดการบัญชีผู้ใช้ในระบบ
  * `ProfileController.java` — จัดการข้อมูลโปรไฟล์ส่วนตัวของผู้ใช้ปัจจุบัน
  * `SuProgramController.java` — ทะเบียนหน้าจอและสิทธิ์การเข้าถึงแต่ละเมนู
  * `SuBusinessRoleController.java` & `SuBusinessRoleProgramController.java` — จัดการสิทธิ์การใช้งานตาม Role
  * `SuBusinessInviteController.java` — จัดการการสร้างและยืนยันคำเชิญเข้าร่วมองค์กร
  * `SuUserBusinessController.java` & `SuUserBusinessMemberController.java` — จัดการสมาชิกใน Business Unit
  * `AuditLogController.java` — ค้นหาและดูบันทึก Audit Log ย้อนหลัง
  * `NotificationController.java` — จัดการการแจ้งเตือนของผู้ใช้และการมาร์กว่าอ่านแล้ว
  * `MessageController.java` — จัดการข้อความภาษาไทย/อังกฤษ (i18n) ที่เก็บในฐานข้อมูล
  * `ChatController.java` & `ChatHubController.java` — จัดการห้องสนทนาและดึงข้อความแชต
* **กลุ่ม Basic & Storage Controllers:**
  * `BusinessController.java` — จัดการสร้างและสลับ Business Unit ที่กำลังทำงาน
  * `ComboboxController.java` — ส่งข้อมูลตัวเลือกสำหรับ Dropdown ทุกชนิดในระบบ
  * `GlobalSearchController.java` — ค้นหาคำสำคัญแบบครอบคลุมทุกเอกสารในระบบ
  * `StorageController.java` — อัปโหลด ดาวน์โหลด และลบไฟล์บน SeaweedFS S3
  * `HealthController.java` & `VerifyController.java` — Endpoint ตรวจสอบสถานะความพร้อมของเซิร์ฟเวอร์

#### 7.3 `service/impl/` (Business Logic & Generators)
* **Jasper Export Services:**  
  `PmSpecificationExportServiceImpl`, `PmRequirementExportServiceImpl`, `PmCustomerContractExportServiceImpl`, `PmDeliveryExportServiceImpl`, `PmInvoiceExportServiceImpl`, `PmMaTicketExportServiceImpl`, `PmUatExportServiceImpl`, `PmUserManualExportServiceImpl`, `PmCustomerProjectExportServiceImpl`  
  *ดึงข้อมูล จัดเตรียมพารามิเตอร์ และส่งต่อให้ JasperReports คอมไพล์เป็น PDF*
* **AI Generators:**  
  `SpecificationGeneratorService`, `UserManualGeneratorService`, `TestCaseGeneratorService`, `AiProjectPipelineService`, `AiSqlGeneratorService`  
  *เชื่อมต่อไปยัง LLM API (Gemini / Claude) เพื่อสร้างเนื้อหาเอกสารตามบริบทโครงการ*
* **Core Business Services:**  
  `PmCustomerServiceImpl`, `PmCustomerProjectServiceImpl`, `PhaseServiceImpl`, `TaskServiceImpl`, `PmApprovalServiceImpl`, `DocumentVersionServiceImpl`

#### 7.4 `util/` (Utility Classes)
* **`ReportHelper.java`** — ตัวช่วยแกะรูปภาพ Base64, แตกตาราง HTML จาก Tiptap ออกเป็นแถว/คอลัมน์ และตั้งค่าฟอนต์ภาษาไทยไม่ให้สระลอยใน JasperReports
* **`PdfBook.java`** — ตัวประกอบเล่มรายงาน PDF หลายบทย่อยเข้าด้วยกัน พร้อมรันเลขหน้าและสร้างหน้าสารบัญ (TOC)
* **`SecurityUtils.java`** — ดึงข้อมูลรหัสผู้ใช้, อีเมล, และ Business ID จาก Security Context

#### 7.5 `src/main/resources/`
* **`application.yml`** — ตั้งค่าการเชื่อมต่อฐานข้อมูล HikariCP, JPA, Flyway, Keycloak, S3, Mail, AI API
* **`db/migration/`** — ไฟล์ Flyway Migration ทั้งหมด (สร้างตาราง, Seed สิทธิ์, ข้อความ i18n, และฟังก์ชันแปลง Tiptap HTML ระดับ SQL)
* **`fonts/`** — คอนฟิกฟอนต์ `TH Sarabun New` เพื่อให้ JasperReports เรนเดอร์ภาษาไทยได้ถูกต้อง
* **`reports/`** — รวมไฟล์ `.jrxml` สำหรับใช้สำรองกรณีรันแบบ Local นอก Docker

---

## 8. `sic-app/` (Frontend Application - Angular 22)

หน้าบ้านที่พัฒนาด้วย Angular 22 แบบ Standalone Components, SSR (Server-Side Rendering) และ TailwindCSS

```text
sic-app/
├── angular.json                             # คอนฟิกการ Build, Assets, Style ของ Angular
├── package.json                             # Dependencies ฝั่งหน้าบ้าน (Tiptap, Tailwind, ngx-translate)
├── Dockerfile                               # Multi-stage Dockerfile สำหรับ Build SSR
├── playwright.config.ts                     # คอนฟิก E2E Testing ด้วย Playwright
├── public/                                  # ไฟล์ Static Assets (รูปภาพ โลโก้ ธงภาษา ไอคอน)
└── src/
    ├── main.ts                              # จุดเริ่มต้นรันบนเบราว์เซอร์
    ├── main.server.ts                       # จุดเริ่มต้นรันบน Node.js SSR
    ├── server.ts                            # Node.js Express Server สำหรับรัน Angular SSR
    ├── index.html                           # โครงสร้างหน้าเว็บหลัก
    ├── styles.css                           # สไตล์ส่วนกลางและ Tailwind Directives
    ├── environments/                        # กำหนด URL ของ Backend API และ Keycloak
    └── app/
        ├── app.component.*                  # Root Component
        ├── app.config.ts                    # Providers, Interceptors, Translation Setup
        ├── app.routes.ts                    # Routing เส้นทางหลักของทั้งแอปพลิเคชัน
        ├── core/                            # คอมโพเนนต์และเซอร์วิสส่วนกลาง
        ├── feature/                         # หน้าจอการทำงานหลักของระบบ (PM, Dashboard, BU, SU)
        ├── main/                            # หน้าเว็บสาธารณะ (Home, Product, Blog, Contact)
        └── management/                      # หน้าจัดการบัญชี (Profile, Business)
```

### รายละเอียดไฟล์สำคัญใน `sic-app/src/app/`

#### 8.1 `core/` (แกนกลางของ Frontend)
* **`core/auth/`**
  * `auth.guard.ts` — ป้องกันหน้าที่ต้องล็อกอินก่อนเข้า
  * `business.guard.ts` — บังคับเลือกองค์กร/Business Unit ก่อนเข้าทำงาน
  * `profile.guard.ts` — ตรวจสอบให้ผู้ใช้บันทึกข้อมูลส่วนตัวให้ครบถ้วน
  * `auth-callback.component.ts` — รับการเปลี่ยนเส้นทางกลับหลังล็อกอินสำเร็จจาก Keycloak
* **`core/guard/`**
  * `can-deactivate.guard.ts` — ขึ้น Dialog เตือนเมื่อมีข้อมูลค้างในฟอร์มที่ยังไม่ได้บันทึก
* **`core/interceptor/`**
  * `auth.interceptor.ts` — ดึง Token ใส่ Header `Authorization: Bearer ...` ให้ HTTP Request ทุกตัว
  * `error.interceptor.ts` — ดักจับ HTTP Error 401, 403, 500 แล้วแสดง Toast แจ้งเตือน
* **`core/services/`**
  * `auth.service.ts` — บริหารจัดการ Token, การ Login/Logout และตรวจสอบสถานะผู้ใช้
  * `business.service.ts` — เก็บและสลับสถานะ Business Unit ที่กำลังทำงานอยู่
  * `dialog.service.ts` — เปิดหน้าต่าง Modal ยืนยัน (Confirmation/Alert Dialog)
  * `toast.service.ts` — แสดงข้อความเตือนมุมจอ (Toast Notification)
  * `permission.service.ts` — ตรวจสอบสิทธิ์การมองเห็นปุ่มและเมนูตาม Role
  * `theme.service.ts` — จัดการการสลับธีม สว่าง (Light) / มืด (Dark)
  * `websocket.service.ts` — จัดการการเชื่อมต่อ STOMP สำหรับแชตและการแจ้งเตือน Real-time
* **`core/validator/`**
  * `sic.validator.ts` — ฟังก์ชันตรวจสอบความถูกต้องของฟอร์ม (Validation Rules)
* **`core/component/` (UI Components ที่ใช้ซ้ำในหน้าต่างๆ):**
  * `sic-tiptap-editor/` — Rich Text Editor (Tiptap) รองรับจัดรูปแบบ ตาราง ลิสต์รูปภาพ และ Fullscreen
  * `sic-combobox/` — Dropdown ค้นหาและเลือกข้อมูลพร้อม Lazy Loading
  * `sic-datepicker/` & `sic-timepicker/` — ตัวเลือกวันและเวลาที่รองรับ พ.ศ. / ค.ศ.
  * `sic-gantt/` — ชาร์ตแสดงความคืบหน้าโครงการและตารางเวลา (Gantt Chart)
  * `sic-kanban/` — บอร์ดงานแบบลากวาง (Kanban Task Board)
  * `sic-drawio-modal/` — หน้าต่าง Pop-up ฝัง Draw.io สำหรับวาด DFD/ERD
  * `sic-ai-project-wizard/` — วิซาร์ด AI อัจฉริยะช่วยวางโครงสร้างโครงการอัตโนมัติ
  * `sic-approval/` — คอมโพเนนต์แสดงไทม์ไลน์และประวัติการอนุมัติเอกสาร
  * `sic-trace-link-panel/` — แผงแสดงความเชื่อมโยงของเอกสาร (Traceability Matrix)

#### 8.2 `feature/pm/dt/` (โมดูลจัดทำเอกสารและงาน SDLC)
แต่ละโมดูลจะมีไฟล์มาตรฐาน: `.component.ts` (Logic), `.component.html` (View), `.service.ts` (API), `.model.ts` (Types), `.resolver.ts` (Pre-load Data)
* `pmdt01/` — **Phase Management**: กำหนดและแก้ไขเฟสการทำงานของโครงการ
* `pmdt02/` — **WBS Detail**: แบ่งย่อยงานโครงการเป็น Milestone (`pmdt02A`), Work Package (`pmdt02B`), Task (`pmdt02C`)
* `pmdt03/` — **Approval Center**: ศูนย์กลางตรวจสอบและกดอนุมัติหรือตีกลับเอกสาร
* `pmdt04/` — **Requirement Management**: บันทึกและจัดการข้อกำหนดของระบบ ผูกความสัมพันธ์ และส่งอนุมัติ (`pmdt04B`)
* `pmdt05/` — **Diagram Management**: จัดการแผนภาพ DFD และ ER Diagram ด้วย Draw.io
* `pmdt06/` — **Change Request (CR)**: บันทึกคำขอแก้ไขขอบเขตงานและวิเคราะห์ผลกระทบ
* `pmdt07/` — **Specification Management**: เขียนเอกสารสเปกระบบเชิงลึก (SRS)
* `pmdt08/` — **Discussion**: กระดานพูดคุยและคอมเมนต์รายเอกสาร
* `pmdt09/` — **Design Review**: ตรวจสอบและให้ข้อเสนอแนะด้านดีไซน์
* `pmdt10/` — **Task Board**: บอร์ดติดตามสถานะงานของนักพัฒนา
* `pmdt11/` — **Gantt Schedule Update**: ปรับปรุงระยะเวลาแผนงานบนชาร์ต
* `pmdt12/` — **Test Management**: จัดการ Test Case (`pmdt12A`), Test Scenario (`pmdt12B`), และรายงาน Bug (`pmdt12C`)
* `pmdt14/` — **Delivery Management**: จัดทำเอกสารส่งมอบงานในแต่ละงวด
* `pmdt15/` — **User Manual**: จัดทำคู่มือการใช้งานระบบ
* `pmdt16/` — **Invoice & Payment**: บันทึกใบแจ้งหนี้ งวดชำระ และการรับเงิน
* `pmdt17/` — **MA Ticket**: ระบบรับแจ้งปัญหาและติดตามงานบำรุงรักษาหลังส่งมอบ
* `pmdt19/` — **Document Version History**: ตรวจสอบประวัติการแก้ไขและเปรียบเทียบ Snapshot แต่ละเวอร์ชัน
* `pmdt20/` — **Audit Log**: ตรวจสอบประวัติการใช้งานและการกระทำของผู้ใช้ในระบบ

#### 8.3 `feature/pm/rt/` (โมดูลทะเบียนและแดชบอร์ด)
* `pmrt01/` — **Customer Master**: ทะเบียนรายชื่อลูกค้าและข้อมูลผู้ติดต่อ
* `pmrt02/` — **Project Master**: จัดการรายชื่อโครงการ งบประมาณ และการมอบหมายทีมงาน
* `pmrt04/` — **Contract Management**: สัญญาโครงการ การแบ่งงวดงาน และการต่อสัญญา MA
* `pmrt07/` — **Notification Center**: หน้ารวมประวัติการแจ้งเตือนทั้งหมด

#### 8.4 `main/` & `management/`
* **`main/index/`** — หน้า Landing Page สาธารณะ ได้แก่ `home/`, `product/`, `blog/`, `contact/`
* **`management/profile/`** — จัดการข้อมูลส่วนตัว รหัสผ่าน และรูปโปรไฟล์
* **`management/business/`** — จัดการสร้างองค์กรใหม่ (`create`), เข้าร่วมองค์กร (`join`), และส่งคำเชิญสมาชิก (`invite`)

---

## 9. `docker/drawio/` (Self-hosted Diagram Service)

```text
docker/drawio/
└── docker-compose.yml                       # คอนฟิกรัน Container jgraph/drawio บน Port 8085
```

* **หน้าที่:**  
  รันระบบ Draw.io ใน Local Container แบบปิด (Self-hosted) ไม่ต้องพึ่งพาอินเทอร์เน็ต เพื่อให้ Frontend เรียกใช้งานผ่าน iframe หรือ Modal ในการวาดและแก้ไขแผนภาพ DFD และ ER Diagram

---

## 10. วิธีการติดตั้งและเริ่มใช้งาน (Quick Start Guide)

### 1. เตรียม Environment File
```bash
cp .env.example .env
```
*(แก้ไขรหัสผ่านและค่า Secret ต่างๆ ในไฟล์ `.env` ให้เรียบร้อย)*

### 2. รันทุก Service พร้อมกันผ่าน Docker Compose
```bash
docker compose up -d --build
```

### 3. การรันพัฒนาในเครื่อง (Local Development)
ขณะพัฒนา สามารถรันเฉพาะ Service โครงสร้างพื้นฐานใน Docker (`sic-database`, `sic-auth`, `sic-storage`, `report-service`, `sic-drawio`) แล้วรัน Source Code ในเครื่อง:

* **Backend (`sic-spring/sic`):**
  ```bash
  ./mvnw spring-boot:run
  ```
  Swagger UI: `http://localhost:5265/swagger-ui.html`

* **Frontend (`sic-app`):**
  ```bash
  npm install
  npm start
  ```
  Web UI: `http://localhost:4200`
