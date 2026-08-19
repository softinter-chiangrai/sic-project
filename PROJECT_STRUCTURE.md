# 📖 เอกสารสรุปโครงสร้างโปรเจกต์ SIC Project (Architecture & Project Overview)

เอกสารฉบับนี้อธิบายภาพรวมโครงสร้างของระบบ **SIC Project** ทั้งหมด ครอบคลุมทั้ง **Frontend (Angular)**, **Backend (Spring Boot)**, **Database & Auth**, และหน้าที่ของแต่ละโฟลเดอร์/ไฟล์อย่างละเอียด

---

## 🏗️ 1. ภาพรวมสถาปัตยกรรมทั้งระบบ (System Architecture)

```
sic-project/
├── 🌐 sic-app/          # Frontend Web Application (Angular 19 Standalone Components)
├── ⚙️ sic-spring/       # Backend RESTful API Server (Spring Boot 3 + Java)
├── 🔐 sic-auth/         # Authentication & Authorization Service / Configuration
├── 🗄️ sic-database/     # Database Schema, Migrations & Initial Data
├── 📁 sic-storage/      # Local Storage / Uploaded Files & Assets
├── 📜 rule.txt          # กฎและมาตรฐานโครงสร้างไฟล์ของโปรเจกต์ (SIC Standard)
└── 📘 README.md         # เอกสารแนะนำและคู่มือการใช้งานโปรเจกต์
```

---

## 🌐 2. โครงสร้างฝั่ง Frontend (`sic-app`)

สร้างด้วย **Angular (Standalone Architecture)** โดยจัดโครงสร้างตามมาตรฐานองค์กร แบ่งเป็น 3 เลเยอร์หลัก: **`core/`**, **`feature/`**, และ **`management/`**

### 📁 `src/app/` (Root App Directory)

```
src/app/
├── app.component.ts / html / css   # Component รากหลักของแอปพลิเคชัน
├── app.config.ts                   # รวม Application Providers (Router, HTTP Interceptors, ฯลฯ)
├── app.routes.ts                   # กำหนด Route หลักของระบบ
│
├── 🧱 core/                        # โมดูลแกนกลางที่ใช้ร่วมกันทั่วทั้งระบบ (Shared Core)
│   ├── auth/                       # ระบบยืนยันตัวตน, Token, User Session
│   ├── component/                  # Reusable UI Components มาตรฐานระบบ (sic-button, sic-input, ฯลฯ)
│   ├── config/                     # ค่า Config ของ Frontend เช่น api.config.ts
│   ├── guard/                      # Route Guards (AuthGuard, CanDeactivateGuard, ฯลฯ)
│   ├── interceptor/                # HTTP Interceptors (JWT Token, Error Handling)
│   ├── model/                      # โมเดลข้อมูลส่วนกลาง (sic-base-model, sic-from-data)
│   ├── pipes/                      # Custom Pipes (sic-date.pipe, ฯลฯ)
│   ├── services/                   # Services แกนกลาง (DialogService, NavigationService, CustomerStateService)
│   └── types/                      # TypeScript Global Types (Form Types, Table Types)
│
└── 💼 feature/                     # โมดูลฟังก์ชันการทำงานทางธุรกิจ (Business Features)
    ├── bu/                         # Business Unit Module (การจัดการธุรกิจและองค์กร)
    │   ├── dt/ (budt01 - budt06)   # Transactional Pages ของ Business Unit
    │   └── rt/ (burt01 - burt06)   # Master / Reporting ของ Business Unit
    ├── dashboard/                  # หน้าแดชบอร์ดหลักของระบบ
    ├── su/                         # System User & Security Module (จัดการสิทธิ์และผู้ใช้)
    └── pm/                         # Project Management Module (ระบบบริหารจัดการโครงการ)
```

---

### 📂 เจาะลึกโมดูล PM (`src/app/feature/pm/`)

โมดูล **Project Management (PM)** จัดโครงสร้างตามกฎ [rule.txt](file:///c:/Users/lovew/Student/Project-Main/Java-intern/sic-project/rule.txt) โดยแบ่ง Transaction ออกเป็น **`dt/`** (`pmdt01` - `pmdt20`) และ Master/Report เป็น **`rt/`** (`pmrt01` - `pmrt06`):

#### 📋 1. Transaction Modules (`src/app/feature/pm/dt/`)

ทุกโฟลเดอร์จะมีโครงสร้าง 7 ไฟล์มาตรฐาน (`.component.ts`, `.component.html`, `.component.css`, `.model.ts`, `.service.ts`, `.form.ts`, `.resolver.ts`):

| รหัสโฟลเดอร์ | ชื่อโมดูล / หน้าที่การทำงาน | โฟลเดอร์ย่อยภายใน (Subfolders) |
| :--- | :--- | :--- |
| **`pmdt01`** | **Phase Management**: จัดการรายการ Phase หลักของโครงการ | `pmdt01A`: ฟอร์มสร้าง/แก้ไข Phase |
| **`pmdt02`** | **WBS & Phase Detail**: รายละเอียดงานย่อย (WBS Tree) | `pmdt02A`: ฟอร์ม Milestone<br>`pmdt02B`: ฟอร์ม WorkPackage<br>`pmdt02C`: ฟอร์ม Task |
| **`pmdt03`** | **Approval Center**: ศูนย์รวมการขออนุมัติและประวัติการอนุมัติ | `pmdt03A`: รายละเอียดและปุ่ม Action อนุมัติเอกสาร |
| **`pmdt04`** | **Requirement Management**: รายการความต้องการของโครงการ | `pmdt04A`: ฟอร์มสร้าง/แก้ไข Requirement<br>`pmdt04-preview`: คอมโพเนนต์พรีวิวความต้องการ<br>`pmdt04B`: Requirement Approval Matrix |
| **`pmdt05`** | **Diagram Management**: วาด/แก้ไขไดอะแกรมผ่าน Draw.io | `pmdt05A`: หน้าต่างแชท AI Diagram Assistant |
| **`pmdt06`** | **Change Request**: จัดการคำขอเปลี่ยนแปลงความต้องการ | `pmdt06A`: ฟอร์มและรายละเอียด Change Request |
| **`pmdt07`** | **Specification Management**: รายการข้อกำหนดเชิงเทคนิค | `pmdt07A`: ฟอร์มสร้าง/แก้ไข Specification<br>`pmdt07-preview`: คอมโพเนนต์พรีวิว Spec |
| **`pmdt08`** | **Discussion Board**: เว็บบอร์ดสนทนาและสื่อสารในโครงการ | `pmdt08A`: โมดอลสร้าง/แก้ไขกระทู้และคอมเมนต์ |
| **`pmdt09`** | **Design Review**: ตรวจสอบและประเมินงานออกแบบ (UI/ERD) | `pmdt09A`: แบบฟอร์มตรวจทานและประเมินผล |
| **`pmdt10`** | **Task Management**: ภาพรวมและติดตามงานทั้งหมด | `pmdt10A`: หน้ารายการ My Tasks (งานของฉัน)<br>`pmdt10B`: หน้า Kanban Task Board<br>`pmdt10C`: โมดอลสร้าง/แก้ไข Task |
| **`pmdt11`** | **Gantt Schedule Update**: ปรับปรุงและอัปเดตแผนงาน Gantt | ฟอร์มปรับปรุงตารางเวลา |
| **`pmdt12`** | **Test Management**: จัดการชุดทดสอบและเคสการทดสอบ | `pmdt12A`: ฟอร์ม Test Case และผลการรัน Test<br>`pmdt12B`: ฟอร์ม Test Scenario |
| **`pmdt13`** | **Bug Tracking**: รายการติดตามและการแก้ไข Bug | `pmdt13A`: ฟอร์มรายงานและอัปเดตสถานะ Bug |
| **`pmdt14`** | **Delivery Management**: จัดการรายการส่งมอบงานและ Gate Check | `pmdt14A`: ฟอร์มบันทึกเอกสารส่งมอบงาน |
| **`pmdt15`** | **User Manual**: จัดการคู่มือการใช้งานระบบ | `pmdt15A`: ฟอร์มอัปโหลดและจัดการคู่มือ |
| **`pmdt16`** | **Invoice & Payment**: รายการใบแจ้งหนี้และการติดตามการชำระเงิน | `pmdt16A`: ฟอร์มบันทึกใบแจ้งหนี้ |
| **`pmdt17`** | **MA Ticket**: รายการ Ticket แจ้งซ่อม/บำรุงรักษาระบบ (MA) | `pmdt17A`: ฟอร์มบันทึกและตอบรับตั๋ว MA |
| **`pmdt18`** | **Renewal Management**: ติดตามและจัดการการต่อสัญญาบริการ MA | `pmdt18A`: ฟอร์มข้อเสนอต่อสัญญา MA |
| **`pmdt19`** | **Document Version History**: ประวัติเวอร์ชันและการย้อนกลับเอกสาร | `pmdt19A`: ฟอร์มบันทึกเวอร์ชันเอกสาร |
| **`pmdt20`** | **Audit Log**: ตารางบันทึกประวัติการใช้งานและการตรวจสอบระบบ | หน้ารวม Audit Log กิจกรรมทั้งหมด |

---

#### 📊 2. Master & Dashboard Modules (`src/app/feature/pm/rt/`)

| รหัสโฟลเดอร์ | ชื่อโมดูล / หน้าที่การทำงาน | โฟลเดอร์ย่อยภายใน |
| :--- | :--- | :--- |
| **`pmrt01`** | **Customer Master**: ข้อมูลลูกค้าและผู้ติดต่อ | `pmrt01A`: ฟอร์มข้อมูลลูกค้า |
| **`pmrt02`** | **Project Master**: ข้อมูลหลักของโครงการ | `pmrt02A`: ฟอร์มข้อมูลโครงการ |
| **`pmrt03`** | **Project Dashboard**: แดชบอร์ดภาพรวมโครงการ (หน้าหลักของระบบ PM) | - |
| **`pmrt04`** | **Contract Management**: สัญญาโครงการหลัก | `pmrt04A`: ฟอร์มสัญญา<br>`pmrt04B`: ฟอร์มต่อสัญญา |
| **`pmrt05`** | **Requirement Matrix Dashboard**: แดชบอร์ดตารางเมทริกซ์ความต้องการ | - |
| **`pmrt06`** | **Executive / Admin Dashboard**: แดชบอร์ดผู้บริหารและผู้ดูแลระบบ | - |

---

## ⚙️ 3. โครงสร้างฝั่ง Backend (`sic-spring`)

พัฒนาด้วย **Spring Boot 3 (Java)** สถาปัตยกรรมแบบ Layered Architecture (Controller $\rightarrow$ Service $\rightarrow$ Repository $\rightarrow$ Database)

### 📁 `src/main/java/com/softinter/sicapi/`

```
com/softinter/sicapi/
├── SicApiApplication.java        # จุดเริ่มต้นการทำงานของ Spring Boot Application
│
├── 🎮 controller/                # API Endpoints (รับ HTTP Request และส่ง Response)
│   ├── auth/                     # Authentication Controller (Login, Refresh Token, User Info)
│   ├── pm/                       # Project Management Controllers:
│   │   ├── CustomerController.java
│   │   ├── ProjectController.java
│   │   ├── PhaseController.java
│   │   ├── RequirementController.java
│   │   ├── SpecificationController.java
│   │   ├── TaskController.java
│   │   ├── TestScenarioController.java
│   │   ├── BugController.java
│   │   ├── DeliveryController.java
│   │   ├── InvoiceController.java
│   │   └── MaRenewalController.java
│   ├── db/                       # Parameter & LOV Endpoints (Lookup Values)
│   ├── storage/                  # File Upload / Download Controller
│   └── su/                       # System User & Role Controller
│
├── 💼 service/                   # Business Logic & Transaction Management
│   ├── impl/                     # Implementation Classes ของ Service ต่างๆ
│   └── ...Service.java           # Interface กำหนดฟังก์ชันทางธุรกิจ
│
├── 🗄️ repository/                # Data Access Layer (Spring Data JPA Repositories)
│   └── ...Repository.java        # Interface ติดต่อตารางฐานข้อมูลและ Query พิเศษ
│
├── 📦 entity/                    # JPA Entities (Mapping กับ Table ในฐานข้อมูล)
│   ├── Customer.java
│   ├── Project.java
│   ├── Requirement.java
│   ├── Task.java
│   └── ...
│
├── 📨 dto/                       # Data Transfer Objects (Request / Response Models)
├── 🗺️ mapper/                    # MapStruct หรือ Model Mapping แปลง Entity <-> DTO
├── 🛡️ security/                  # Spring Security, JWT Token Filter, Authorization Rules
├── ⚙️ config/                    # Configuration Beans (CORS, Database, Swagger, WebSocket)
├── ⚠️ exception/                 # Global Exception Handler & Custom Exception Classes
├── 🛠️ util/                      # Utility Classes (Date Helper, File Helper, ฯลฯ)
└── 🔌 websocket/                 # WebSocket Handlers สำหรับ Realtime Notification / Chat
```

---

## 🔐 4. ส่วนเสริมอื่นๆ (Auth, Database, Storage)

- **`sic-auth/`**:
  - จัดเก็บคอนฟิกและ Service ด้านการจัดการสิทธิ์การเข้าถึงของผู้ใช้ (Role-based Access Control - RBAC)
- **`sic-database/`**:
  - สคริปต์ SQL สำหรับสร้างโครงสร้างตาราง (DDL), ดัชนี (Indexes), ข้อมูลเริ่มต้น (Master Seed Data) และ Migration Scripts
- **`sic-storage/`**:
  - โฟลเดอร์จัดเก็บไฟล์อัปโหลดจริง เช่น เอกสารแนบ, รูปภาพ, ไดอะแกรม XML, ไฟล์ PDF ส่งมอบงาน

---

## 🚀 5. วิธีการรันโปรเจกต์ (Quick Start Guide)

### 🔹 การรัน Frontend (`sic-app`)
```bash
cd sic-app
npm install
npm run start
# หรือรันผ่าน Angular CLI:
npx ng serve
```
*Frontend จะทำงานที่ `http://localhost:4200`*

### 🔹 การรัน Backend (`sic-spring/sic`)
```bash
cd sic-spring/sic
./mvnw spring-boot:run
```
*Backend API จะทำงานที่ `http://localhost:8080`*
