/* cSpell:disable */

# API Design Standard

> อ้างอิงจาก controller classes จริงใน `src/main/java/dev/suksabai/report_service/controller/` (ตรวจสอบล่าสุด: 2026-07-07 — เพิ่ม Queue/Bulk Generate)

## รูปแบบ API ในระบบ
ระบบมี REST Controller (`@RestController`) 7 ตัว และ MVC Controller (`@Controller`) 1 ตัว:

| Controller | Base Path | Auth |
|---|---|---|
| `ReportApiController` | `/api/reports` | X-Access-Token (public) |
| `AccessTokenApiController` | `/api/access-tokens` | Session cookie (admin) |
| `DataSourceApiController` | `/api/data-sources` | Session cookie (admin) |
| `ReportTemplateApiController` | `/api/report-templates` | Session cookie (admin) |
| `SettingsApiController` | `/api/settings` | Session cookie (admin) |
| `ReportQueueAdminApiController` (ใหม่ 2026-07-07) | `/api/report-queue` | Session cookie (admin) |
| `BulkReportAdminApiController` (ใหม่ 2026-07-07) | `/api/report-bulk` | Session cookie (admin) |
| `PageController` | `/` (Thymeleaf pages) | Session cookie (admin), ยกเว้น `/login` |

Swagger/OpenAPI UI: `/swagger-ui`, API docs JSON: `/api-docs` (ผ่าน springdoc), เรียงตาม tag/operation แบบ alpha

## Authentication Model (2 รูปแบบขนานกัน)

1. **Session Cookie Auth** (`sessionCookieAuth` ใน `OpenApiConfig`) — สำหรับ Admin API ทั้งหมด ใช้ `JSESSIONID` cookie จาก form login ปกติของ Spring Security
2. **Access Token Header Auth** (`reportAccessTokenHeader`) — ตอนนี้ (2026-07-07) มี 6 endpoint สาธารณะ:
   - `POST /api/reports/generate`
   - `GET /api/reports/files/{id}/download`
   - `POST /api/reports/generate/queue`, `GET /api/reports/generate/queue/{id}` (ใหม่)
   - `POST /api/reports/generate/bulk`, `GET /api/reports/generate/bulk/{id}/download` (ใหม่)
   - ส่ง token ผ่าน header `X-Access-Token`; ตรวจสอบโดย `AccessTokenApiFilter` (ทำงานก่อน `UsernamePasswordAuthenticationFilter`) และไม่ต้อง login session
   - Token ที่ผิด/หมดอายุ/ถูก revoke → ตอบ `401 Unauthorized` พร้อม body `{"message": "..."}` ที่เขียนด้วย `HttpServletResponse.getWriter()` ตรง (ไม่ผ่าน `@ExceptionHandler` เพราะเป็น filter level ไม่ใช่ controller level)
   - **ไม่มี ownership check**: token ใดก็ตามที่ valid สามารถเรียกดูสถานะ/โหลดไฟล์ queue หรือ bulk batch ของ token อื่นได้ (เหมือน `GET /api/reports/files/{id}/download` เดิมที่ไม่เช็ค owner เช่นกัน) — เป็น known limitation เดิมของระบบ ไม่ใช่สิ่งที่เพิ่มใหม่

## HTTP Methods ที่ตรวจพบ (ตาม Controller)

### `ReportApiController` (`/api/reports`)
| Method | Path | คำอธิบาย |
|---|---|---|
| POST | `/api/reports/generate` | สร้างรายงานจาก template (`reportId` หรือ `templateCode`) |
| GET | `/api/reports/files/{id}/download` | ดาวน์โหลดไฟล์รายงานที่สร้างแล้ว |
| POST | `/api/reports/generate/queue` (ใหม่) | ยิง request เข้าคิว generate (`reportId`/`templateCode`, `parameters`, `format`, `callbackUrl` ทางเลือก) — ตอบกลับทันทีด้วย `queueId` ไม่รอ generate เสร็จ |
| GET | `/api/reports/generate/queue/{id}` (ใหม่) | เช็คสถานะ queue item (Queued/Processing/Completed/Failed) + `downloadUrl` เมื่อเสร็จ |
| POST | `/api/reports/generate/bulk` (ใหม่) | รับ JSON array ของ item (`reportId`\|`templateCode`, `parameters`, `format`, `fileName`) → คืน ZIP bytes ตรง (มี `manifest.json` สรุปผลทุก item อยู่ในซิปเสมอ) |
| GET | `/api/reports/generate/bulk/{id}/download` (ใหม่) | โหลดซ้ำ ZIP ของ batch ที่เคย generate ไปแล้ว |

### `ReportQueueAdminApiController` (`/api/report-queue`, ใหม่ 2026-07-07)
| Method | Path | คำอธิบาย |
|---|---|---|
| GET | `/api/report-queue` | List แบบ pagination สำหรับตาราง monitor ในหน้า Queue Generate |
| GET | `/api/report-queue/{id}` | ดูสถานะ queue item 1 รายการ |
| POST | `/api/report-queue` | ฟอร์มทดลองยิง request จากหน้า Admin (ใช้ session username เป็น actor แทน access token) |
| POST | `/api/report-queue/{id}/retry-webhook` | สั่ง retry ส่ง webhook ด้วยมือ (รีเซ็ต attempt counter กลับไปเริ่มใหม่) |

### `BulkReportAdminApiController` (`/api/report-bulk`, ใหม่ 2026-07-07)
| Method | Path | คำอธิบาย |
|---|---|---|
| GET | `/api/report-bulk` | List ประวัติ batch แบบ pagination |
| GET | `/api/report-bulk/{id}` | ดูรายละเอียด batch พร้อมผลลัพธ์ต่อ item |
| POST | `/api/report-bulk` | ฟอร์มทดลองยิง JSON array จากหน้า Admin — คืน JSON metadata (`batchId`, counts, `zipDownloadUrl`) แทนที่จะเป็น ZIP bytes ตรง เพื่อให้ฝั่ง JS จัดการง่ายกว่า |

### `AccessTokenApiController` (`/api/access-tokens`) — CRUD เต็มรูปแบบ + action เฉพาะทาง
| Method | Path | คำอธิบาย |
|---|---|---|
| GET | `/api/access-tokens` | List ทั้งหมด |
| POST | `/api/access-tokens` | สร้างใหม่ |
| GET | `/api/access-tokens/{id}` | ดูรายละเอียด 1 รายการ |
| PUT | `/api/access-tokens/{id}` | แก้ไข |
| POST | `/api/access-tokens/{id}/generate` | Generate/rotate token value |
| POST | `/api/access-tokens/{id}/register` | ลงทะเบียน token value ที่สร้างจากภายนอก |
| POST | `/api/access-tokens/{id}/revoke` | เพิกถอน token |
| DELETE | `/api/access-tokens/{id}` | ลบถาวร (คืน `204 No Content`) |

### `DataSourceApiController` (`/api/data-sources`)
| Method | Path | คำอธิบาย |
|---|---|---|
| GET | `/api/data-sources` | List ทั้งหมด |
| POST | `/api/data-sources` | สร้างใหม่ |
| GET | `/api/data-sources/{id}` | ดูรายละเอียด 1 รายการ |
| PUT | `/api/data-sources/{id}` | แก้ไข |
| DELETE | `/api/data-sources/{id}` | ลบ (คืน `204 No Content`) |
| POST | `/api/data-sources/{id}/test` | ทดสอบการเชื่อมต่อ |

### `ReportTemplateApiController` (`/api/report-templates`)
| Method | Path | คำอธิบาย |
|---|---|---|
| GET | `/api/report-templates` | List ทั้งหมด |
| GET | `/api/report-templates/{id}` | ดูรายละเอียด 1 รายการ |
| GET | `/api/report-templates/{id}/jrxml` | ดาวน์โหลด JRXML ที่บันทึกไว้ |
| GET | `/api/report-templates/download` | ดาวน์โหลด JRXML จาก `templateId` หรือ `uploadToken` (staged) |
| POST | `/api/report-templates` | สร้าง template ใหม่ |
| PUT | `/api/report-templates/{id}` | แก้ไข |
| DELETE | `/api/report-templates/{id}` | ลบ (คืน `204 No Content`) |
| POST | `/api/report-templates/upload` | อัปโหลด+คอมไพล์ JRXML (multipart/form-data) |
| POST | `/api/report-templates/preview` | Preview PDF จาก template (บันทึกแล้วหรือ staged) |
| POST | `/api/report-templates/{id}/generate` | Generate รายงานจาก template ที่บันทึกแล้ว ผ่าน session admin |

### `SettingsApiController` (`/api/settings`)
| Method | Path | คำอธิบาย |
|---|---|---|
| GET | `/api/settings` | โหลดค่าตั้งค่าระบบ |
| PUT | `/api/settings` | แก้ไขตารางเวลาล้างข้อมูล/timezone/base URL |
| POST | `/api/settings/cleanup/generated-files-and-logs` | ล้างไฟล์รายงาน+log (คง audit history) |
| POST | `/api/settings/cleanup/all` | ล้างข้อมูลทั้งระบบ (คง audit history) |

> **รูปแบบที่สังเกตได้**: ใช้ `GET` (list/read), `POST` (create ทรัพยากรใหม่ หรือ action พิเศษที่ไม่ idempotent เช่น `/generate`, `/test`, `/revoke`), `PUT` (update ทั้งก้อนด้วย `{id}`), `DELETE` (ลบด้วย `{id}`) — ไม่พบการใช้ `PATCH` ที่ใดเลยในระบบ

## Response Format

### กรณีสำเร็จ (2xx)
- **ไม่มี response envelope กลาง** (ไม่มี wrapper แบบ `{ "success": true, "data": {...} }`) — Controller คืนค่า Java record/DTO ที่ Jackson serialize ตรงเป็น JSON object/array
- ตัวอย่างจริงจาก `ReportApiController.generate()`:
  ```json
  {
    "reportFileId": 123,
    "reportId": 10,
    "reportTemplateName": "Monthly Sales",
    "format": "pdf",
    "fileName": "monthly-sales-20260706-153000.pdf",
    "downloadUrl": "https://example.com/api/reports/files/123/download",
    "generatedAt": "2026-07-06T15:30:00"
  }
  ```
- Endpoint ที่คืนไฟล์ (download/preview/export) จะคืน `ResponseEntity<byte[]>` พร้อม header `Content-Disposition: attachment; filename="..."` และ `Content-Type` ตามชนิดไฟล์จริง (PDF/XLSX/DOCX/XML) แทนที่จะเป็น JSON
- `DELETE` ที่สำเร็จคืน `204 No Content` แบบไม่มี body (`ResponseEntity.noContent().build()`)

### กรณี Error (4xx)
- **รูปแบบ Error มาตรฐานเดียวกันทุก Controller**: `{"message": "คำอธิบาย error เป็นข้อความล้วน"}`
- Map ผ่าน `@ExceptionHandler` ระดับ controller (ไม่มี `@ControllerAdvice`/`@RestControllerAdvice` แบบ global — **แต่ละ `*ApiController` ประกาศ `@ExceptionHandler` ซ้ำกันเองทุกตัว**):
  | Exception | HTTP Status |
  |---|---|
  | `IllegalArgumentException` | `400 Bad Request` |
  | `*.XxxNotFoundException` (เช่น `AccessTokenNotFoundException`, `DataSourceNotFoundException`, `ReportTemplateNotFoundException`, `GeneratedReportNotFoundException`) | `404 Not Found` |
  | `AccessTokenService.InvalidAccessTokenException` | `401 Unauthorized` (จัดการที่ `AccessTokenApiFilter` ไม่ใช่ `@ExceptionHandler`) |
- ข้อยกเว้นพิเศษ: `ReportTemplateApiController.preview()` **ไม่ใช้ `@ExceptionHandler`** แต่ catch exception เองใน method แล้วคืน `ResponseEntity` แบบ manual (เพราะ endpoint เดียวกันต้องคืนได้ทั้ง PDF binary และ JSON error ขึ้นกับผลลัพธ์)
- `PageController` (MVC) ใช้ `ResponseStatusException(HttpStatus.NOT_FOUND, "...")` แทน เนื่องจากเป็นหน้าเว็บ ไม่ใช่ REST endpoint

> **Note**: ไม่มี error code/type แบบมาตรฐาน (เช่น `errorCode: "TEMPLATE_NOT_FOUND"`) — มีเพียง `message` เป็น string เดียว ไม่มี field อื่นเช่น `timestamp`, `path`, `traceId` ในทุก error response ที่พบ (ต่างจากรูปแบบ default ของ Spring Boot's `/error` ซึ่งไม่ได้ถูกใช้ในเคสนี้)

## OpenAPI/Swagger Documentation
- ใช้ annotation `@Operation`, `@ApiResponses`, `@ApiResponse`, `@Tag`, `@SecurityRequirement` ครบเกือบทุก endpoint
- มี customizer พิเศษ `OpenApiConfig.successResponsesOnlyCustomizer()` ที่ตัด response code ที่ไม่ใช่ 2xx ออกจากเอกสาร Swagger ที่ generate อัตโนมัติ (เก็บเฉพาะที่ประกาศชัดเจนใน `@ApiResponses`) — หมายความว่า **เอกสาร Swagger ที่เห็นจะไม่แสดง 400/401/404 อัตโนมัติจาก Spring เอง ต้องประกาศ `@ApiResponse` เองในโค้ดถึงจะขึ้น**

## Request Body Convention
- รับเป็น Java record ผ่าน `@RequestBody` (Jackson deserialize ตรง) เช่น `ReportGenerateRequest`, `AccessTokenSaveRequest`, `DataSourceSaveRequest`, `ReportTemplateSaveRequest`, `SettingsSaveRequest`, `QueueGenerateRequest` (ใหม่), และ `POST /api/reports/generate/bulk`/`POST /api/report-bulk` ที่รับ `@RequestBody List<BulkGenerateItem>` ตรง (root เป็น JSON array ไม่ใช่ object)
- Endpoint อัปโหลดไฟล์ (`/api/report-templates/upload`) ใช้ `multipart/form-data` กับ `@RequestParam("file") MultipartFile`
- Query parameter ใช้ `@RequestParam` พร้อม `required = false` หรือ `defaultValue` สำหรับ pagination/filter (`page`, `size`, `q`, `type`, `status`, `fromDate`, `toDate` ฯลฯ) ในหน้า MVC

## Bulk Generate — ข้อยกเว้นของ Response Format (ใหม่ 2026-07-07)
- `POST /api/reports/generate/bulk` **ตอบ 200 พร้อม ZIP เสมอแม้ทุก item ในคำขอจะ generate ไม่สำเร็จ** — ผลลัพธ์ราย item (สำเร็จ/ล้มเหลว + ข้อความ error) ถูกสรุปไว้ใน `manifest.json` ภายในซิปแทนที่จะทำให้ endpoint ตอบ error code แยกตามผลลัพธ์ของแต่ละ item
- Error 400 มาตรฐาน (`{"message": "..."}`) เกิดเฉพาะตอน request ทั้งก้อนผิดรูป (เช่น array ว่าง/parse ไม่ได้) เท่านั้น เป็นการตัดสินใจให้ endpoint นี้มีรูปแบบ response เดียวคงที่ ไม่ต้องสลับ Content-Type ตามผลลัพธ์เหมือน `ReportTemplateApiController.preview()`

## ข้อสังเกต / Note สำหรับทีม
- Error response format สม่ำเสมอดี (`{"message": "..."}`) แต่ **implementation ซ้ำกันในทุก controller** แทนที่จะรวมเป็น `@RestControllerAdvice` เดียว — หากต้องเพิ่ม controller ใหม่ ควรพิจารณาว่าจะคงรูปแบบเดิม (คัดลอก `@ExceptionHandler`) หรือ refactor รวมศูนย์ (ไม่มีเอกสารเดิมระบุว่าทีมตั้งใจแยกแบบนี้หรือไม่ — เป็นเพียงข้อสังเกตจากโค้ดปัจจุบัน)
- ไม่พบ API versioning ในรูปแบบใดๆ (ไม่มี `/v1/` prefix หรือ header-based versioning)
- ไม่พบ rate limiting ในโค้ด (Access Token entity มี field `callsToday`/`errorRate` แต่ไม่พบ logic ที่ enforce การจำกัดจริงในไฟล์ที่ตรวจสอบ — ควรตรวจสอบเพิ่มเติมว่ามีการอัปเดต field เหล่านี้จริงหรือเป็นเพียง placeholder)
