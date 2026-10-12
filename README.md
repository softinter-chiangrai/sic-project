# SIC Project

ระบบจัดการโครงการ (SIC) แบบ multi-service รันทั้งหมดด้วย Docker Compose

| Service | โฟลเดอร์ | Stack | Port |
|---|---|---|---|
| Frontend | `sic-app` | Angular 22 (SSR), Playwright E2E | 4200 |
| Backend API | `sic-spring/sic` | Spring Boot 4.1, Java 21, JPA, Flyway, springdoc | 5265 |
| Report | `report-service` | Spring Boot, JasperReports (PDF/Excel) | 8082 |
| Auth | `sic-auth` | Keycloak, realm `sic-project`, custom theme | 8080 |
| Database | `sic-database` | PostgreSQL 17 (`sic_app`, `sic_auth`) | 54320 |
| Storage | `sic-storage` | SeaweedFS (S3 API), buckets `uploads` `documents` `public-files` | 8888 |

เอกสารเพิ่มเติม: DFD/ERD อยู่ใน `docs/`

## Flow

```
Browser → sic-app → (OIDC login) → sic-auth
              └─ REST + JWT → sic-spring ─ JDBC → sic-database
                                  ├─ S3 API → SeaweedFS
                                  ├─ export → report-service
                                  └─ chat API → Claude / Gemini (optional)
```

## Quick start

```bash
cp .env.example .env     # แล้วแก้ค่า change_me / your_* ทุกตัว
docker compose up -d --build
```

- ค่า secret ทั้งหมดอยู่ใน `.env` (อยู่ใน `.gitignore`, ห้าม commit)
- `docker-compose.yml` จะ error ถ้า secret ที่จำเป็นไม่ถูกตั้งใน `.env`
- Swagger UI: `http://localhost:5265/swagger-ui.html`

## Secrets

| ตัวแปร | ใช้โดย |
|---|---|
| `POSTGRES_PASSWORD`, `SIC_APP_DB_PASSWORD`, `KEYCLOAK_DB_PASSWORD` | PostgreSQL, sic-spring, Keycloak |
| `KEYCLOAK_ADMIN_PASSWORD` | Keycloak admin |
| `SEAWEEDFS_SECRET_KEY` | SeaweedFS, sic-spring |
| `REPORT_SERVICE_TOKEN` | sic-spring → report-service |
| `MAIL_USERNAME`, `MAIL_PASSWORD` | sic-spring, Keycloak SMTP (Gmail app password) |
| `FIGMA_CLIENT_ID`, `FIGMA_CLIENT_SECRET` | Figma integration |
| `CLAUDE_API_KEY`, `GEMINI_API_KEY` | AI (optional) |

รัน sic-spring นอก Docker (IDE/`mvnw`): export ตัวแปรข้างบนเป็น env ก่อน เพราะ `application.yml` ไม่มีค่า default ของ secret

## Development

**Backend** (`sic-spring/sic`)

```bash
./mvnw spring-boot:run
```

- Controllers: `src/main/java/com/softinter/sicapi/controller` (auth, pm, su, db, ex, storage, ai*)
- Migration: Flyway ใน `src/main/resources/db/migration`
- Auth: JWT จาก Keycloak (`app.keycloak.*`)

**Frontend** (`sic-app`)

```bash
npm install
npm start          # http://localhost:4200
npm run e2e        # Playwright
```

**Report service** (`report-service`): `./mvnw spring-boot:run` (template อยู่ใน `src/main/resources/reports`)

**Infra แยกรัน**: `sic-database`, `sic-auth`, `sic-storage` มี `docker-compose.yml` ของตัวเอง
