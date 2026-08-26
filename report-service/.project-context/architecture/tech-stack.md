/* cSpell:disable */


# Tech Stack

> อ้างอิงจาก `pom.xml`, `docker/Dockerfile`, และ source code จริงในโปรเจกต์ (ตรวจสอบล่าสุด: 2026-07-06)

## ภาษาและ Runtime
| รายการ | เวอร์ชัน | หมายเหตุ |
|---|---|---|
| Java | 25 | กำหนดใน `pom.xml` (`<java.version>25</java.version>`) และ build ด้วย `eclipse-temurin:25-jdk` / รันด้วย `eclipse-temurin:25-jre` |
| Maven | ใช้ Maven Wrapper (`mvnw`, `mvnw.cmd`, `.mvn/`) | ไม่พบไฟล์ระบุเวอร์ชัน Maven ที่ตายตัวใน repo (Note: ไม่พบ `.mvn/wrapper/maven-wrapper.properties` ถูกอ่านตรวจสอบเวอร์ชัน Maven distribution) |

## Framework หลัก
| รายการ | เวอร์ชัน |
|---|---|
| Spring Boot (parent BOM) | 4.0.4 |
| spring-boot-starter-actuator | 4.0.4 |
| spring-boot-starter-webmvc | 4.0.4 |
| spring-boot-starter-data-jpa | 4.0.4 |
| spring-boot-starter-security | 4.0.4 |
| spring-boot-starter-thymeleaf | 4.0.4 |
| spring-boot-devtools | 4.0.4 (scope: runtime, optional) |
| spring-boot-h2console | 4.0.4 |

## API Documentation
| รายการ | เวอร์ชัน |
|---|---|
| springdoc-openapi-starter-webmvc-ui | 3.0.2 |

## Database Drivers (รองรับหลายฐานข้อมูล)
| รายการ | เวอร์ชัน | สถานะการใช้งาน |
|---|---|---|
| H2 (com.h2database) | 2.4.240 | **ใช้เป็นฐานข้อมูลหลักของระบบ (application datasource)** ผ่าน `spring.datasource.url=jdbc:h2:file:./data/report-service` |
| MySQL Connector/J | 9.6.0 | ใช้เป็น driver รันไทม์สำหรับเชื่อมต่อ "external data source" ที่ผู้ใช้กำหนดเอง (ดู `DataSourceConfig` / `JdbcUrlFactory`) ไม่ใช่ฐานข้อมูลหลักของระบบ |
| MariaDB Java Client | 3.5.7 | เช่นเดียวกับ MySQL — ใช้สำหรับ external data source เท่านั้น |
| PostgreSQL JDBC | 42.7.10 | เช่นเดียวกับ MySQL — ใช้สำหรับ external data source เท่านั้น |
| Oracle JDBC (ojdbc11) | 23.9.0.25.07 | มี driver อยู่ใน dependency แต่ **ไม่พบการรองรับใน `DataSourceType` enum** (รองรับเฉพาะ `POSTGRESQL`, `MYSQL`, `MARIADB`) — Note: driver ถูกประกาศไว้แต่ยังไม่ถูกใช้งานจริงในโค้ด อาจเตรียมไว้สำหรับอนาคต |

> **Note:** ระบบเก็บข้อมูลของตัวเอง (report templates, access tokens, audit logs ฯลฯ) ใน H2 เพียงตัวเดียวเสมอ ส่วน MySQL/MariaDB/PostgreSQL driver ใช้สำหรับให้ผู้ใช้สร้าง "Data Source" เพื่อดึงข้อมูลไปออกรายงาน (Jasper) เท่านั้น คนละบทบาทกัน

## Web UI / Template Engine
| รายการ | เวอร์ชัน | หมายเหตุ |
|---|---|---|
| Thymeleaf (spring-boot-starter-thymeleaf) | 4.0.4 | ใช้ render หน้า Admin ทั้งหมด (`src/main/resources/templates/*.html`) |
| thymeleaf-extras-springsecurity6 | 3.1.3.RELEASE | ผสาน Spring Security เข้ากับ Thymeleaf templates |
| htmx-spring-boot-thymeleaf | 5.0.0 | ประกาศเป็น dependency ใน `pom.xml` แต่ **Note: ไม่พบการใช้งานจริง** ใน templates (ไม่พบ attribute `hx-*` หรือการเรียกใช้ HTMX ใน `.html`/`.java` ใดๆ) — หน้าเว็บใช้ vanilla JavaScript ธรรมดาใน `static/js/*.js` แทน (เช่น `access-tokens.js`, `data-sources.js`, `report-templates.js`) |
| Custom CSS | - | `static/css/*.css` (app-shell, base, dashboard, login, resource-list, custom-dropdown) ไม่ใช้ CSS framework สำเร็จรูป (ไม่พบ Bootstrap/Tailwind) |
| Fonts | - | Inter (UI), Sarabun / THSarabunNew / THSarabunPSK (ใช้กับรายงานภาษาไทยใน JasperReports), LibreBarcode (บาร์โค้ด) |

## Reporting Engine
| รายการ | เวอร์ชัน |
|---|---|
| jasperreports | 7.0.6 |
| jasperreports-pdf | 7.0.6 |
| jasperreports-jdt | 7.0.6 (ใช้ Eclipse JDT compile expression ใน .jrxml) |
| jasperreports-barcode4j | 7.0.6 (สร้างบาร์โค้ดในรายงาน) |
| Apache POI (poi-ooxml) | 5.4.1 (ใช้ export ผลลัพธ์เป็น XLSX/DOCX และ export audit log เป็น XLSX) |

## Security
| รายการ | รายละเอียด |
|---|---|
| Spring Security | 4.0.4 (form login, remember-me, session-based auth สำหรับ Admin) |
| Custom API Token Auth | `AccessTokenApiFilter` (`OncePerRequestFilter`) ตรวจ header `X-Access-Token` เฉพาะ endpoint สาธารณะ (`/api/reports/generate`, `/api/reports/files/*/download`) |

## Development Tools
| รายการ | เวอร์ชัน |
|---|---|
| Lombok | 1.18.44 (optional, annotation processor) |
| maven-compiler-plugin | 3.14.1 |
| spring-boot-configuration-processor | 4.0.4 |
| spring-boot-maven-plugin | 4.0.4 |

## Testing
| รายการ | เวอร์ชัน |
|---|---|
| spring-boot-starter-actuator-test | 4.0.4 |
| spring-boot-starter-webmvc-test | 4.0.4 |
| spring-boot-starter-data-jpa-test | 4.0.4 |
| spring-boot-starter-security-test | 4.0.4 |
| spring-boot-starter-thymeleaf-test | 4.0.4 |

Test class ที่พบจริงใน `src/test/java/dev/suksabai/report_service/`:
- `ReportServiceApplicationTests.java`
- `RememberMeConfigurationTests.java`
- `SecurityPropertiesValidationTests.java`
- `BarcodeReportCompileTests.java`
- `service/DownloadUrlServiceTests.java`
- `service/ReportTemplateServiceTests.java`
- `service/JdbcUrlFactoryTests.java`

> Note: ไม่พบ dependency สำหรับ Mockito/JUnit เวอร์ชันเฉพาะแยกต่างหาก — มาจาก Spring Boot test starters ที่รวม JUnit 5 มาให้อัตโนมัติ (ไม่ได้ตรวจสอบเวอร์ชัน JUnit ที่ resolve จริงจาก dependency tree)

## Deployment / Infrastructure
| รายการ | รายละเอียด |
|---|---|
| Container Base Image (build) | `eclipse-temurin:25-jdk` |
| Container Base Image (runtime) | `eclipse-temurin:25-jre` |
| Container Registry Image | `sarankon/report-service:latest` (ตาม `docker/docker-compose.yml`) |
| Timezone ของ Container | ตั้งค่า `TZ=UTC` และ JVM flag `-Duser.timezone=UTC` ใน Dockerfile |
| Spring Profile ที่ใช้รันจริง | `production` (`--spring.profiles.active=production`) → มีไฟล์ `application-production.properties` แยกต่างหาก |
| Reverse Proxy / Ingress | ไม่พบไฟล์ config (เช่น nginx/traefik) ใน repo — Note: ไม่สามารถยืนยันได้ว่ามี reverse proxy อยู่หน้า container หรือไม่ |
| CI/CD | พบโฟลเดอร์ `.github/` แต่ไม่พบ GitHub Actions workflow (`.github/workflows/`) — มีเพียง `.github/memories/` (บันทึกบริบทโปรเจกต์อีกชุดหนึ่ง) และ `.github/modernize/java-upgrade/` (สคริปต์ hook สำหรับ tooling) Note: ไม่พบ pipeline อัตโนมัติสำหรับ build/test/deploy |
| Local dev scripts | `build.bat`, `push.bat`, `test-build.bat`, `test-run.bat` (Windows batch scripts, ไม่ได้ตรวจสอบเนื้อหาโดยละเอียด) |

## Package / Namespace
- Group ID: `dev.suksabai`
- Artifact ID: `report-service`
- Base package: `dev.suksabai.report_service`
