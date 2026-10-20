# Testing & Docker Rule (Always Active)
Full rules: `AGENTS.md` sections 3-4, steps in `.claude/skills/playwright/SKILL.md` "Run".
- Never test on the real DB `sic_app` or the backend on :5265 (docker, real DB). Tests create data.
- Tests run only against a backend started from source: `mvnw spring-boot:run` on :5266 with DB `sic_app_e2e`, then
  `cd sic-app && E2E_DB=sic_app_e2e E2E_API_PORT=5266 npx playwright test ...`. Plain `npx playwright test` is refused (`e2e/.env.local` points at the real DB).
- Never call the :5265 API (curl, scripts) to create test data, and never create test data through the app on :4200.
- Docker = infrastructure only while working. Build images once at the end: stop local backend + `npm start`, `docker compose down` (never `-v`), prune, `docker compose build <changed>`, `docker compose up -d`.
