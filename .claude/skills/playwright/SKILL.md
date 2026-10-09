---
name: playwright
description: >-
  Browser/E2E testing of the SIC frontend (sic-app, Angular) with Playwright.
  Activates ONLY when the user asks to test the UI, run E2E, drive a browser, take a screenshot, or reproduce a UI bug. Never for feature work or backend-only tasks.
---

# Playwright (On-Demand)

Scope: drive the real UI to verify behavior. Pair with `bug-hunt` for reporting.

## Setup
`@playwright/test` is a devDependency of `sic-app`. If browsers are missing:
```
cd sic-app
npx playwright install chromium
```
Run with `npx playwright test` or a scratchpad `*.mjs` script importing `@playwright/test`. Do not commit test files unless asked.

## Flow
1. App up: `docker-compose up` (backend + Keycloak + DB) and `cd sic-app && npm start` → `http://localhost:4200`. Check with `curl -s -o /dev/null -w "%{http_code}" http://localhost:4200`.
2. Login via Keycloak with a demo user (ask user for credentials if unknown; never hardcode into committed files). Save state once: `context.storageState({path})` and reuse.
3. Script the flow: prefer `getByRole` / `getByLabel` / `getByText` over CSS. Use auto-waiting; no `waitForTimeout`.
4. Capture evidence: `page.screenshot`, console errors (`page.on('console'|'pageerror')`), failed requests (`page.on('response')` status ≥ 400).
5. Check both locales (th/en) for i18n keys that render raw (`some.key.name`).
6. Report: steps, expected vs actual, screenshot path, console/network errors.

## Rules
- Demo data only; no destructive actions on real/dump data.
- Headless by default; `--headed` only to debug.
- Temp scripts/screenshots go to scratchpad, not the repo.
- Flaky? Fix the selector/wait, don't add retries.
