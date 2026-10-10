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

## Run
Needs Keycloak (:8080), backend (:5265, `docker compose up -d sic-spring`) up. Playwright starts the UI (`npm start`) itself if :4200 is down.
```
cd sic-app && npx playwright test        # setup (login) + e2e/pages.spec.ts (all static routes, ~9-14 min)
```
- Credentials: `sic-app/e2e/.env.local` (E2E_USER / E2E_PASS, gitignored). Never commit.
- Routes: `e2e/pages.ts` (static only; `:id` pages need seeded data). Add a path there for new pages.
- Per page it fails on: bounced to Keycloak, empty body, pageerror, any 5xx response.

## Layers (all run against a throwaway DB)
`globalSetup` creates DB `sic_app_e2e`, re-points the backend (:5265) to it (Flyway migrates), seeds profile+business; real DB `sic_app` is never touched. After the run it restores the backend and DROPs the DB (skipped when `E2E_KEEP=1`, which VS Code sets; clean up with `npm run e2e:down`, check with `npm run e2e:status`).

| project | what | needs Angular? |
|---|---|---|
| `api` | `e2e/api/*.spec.ts`: POST/GET/PUT/DELETE + workflows for every module, GET smoke of 124 endpoints | no |
| `pages` | `e2e/pages.spec.ts`: every static route opens clean (list in `e2e/pages.ts`) | yes |
| `ui` | `e2e/ui/*.spec.ts`: edit/view pages with mock records (`id-pages`), create/edit/delete through real forms and grids for every module (`crud`, table-driven; `MODULE=customer,project` to pick), invites + business create (`business`), role permission matrix (`permission`) | yes |

- Run one layer: `npx playwright test --project=api` (also `pages`, `ui`); one page: `PAGE=pm/customer npx playwright test --project=pages`.
- API helpers: `e2e/api.ts` (`seededApi`, token via a 2nd browser login: Keycloak has no password grant), `e2e/api/world.ts` (dependency-ordered mock factory, deleted by `cleanup()`). Use `mock()` names. Pattern: `e2e/api/customer.spec.ts`.
- The backend maps every RuntimeException to 400, so bugs hide behind 4xx: `get-smoke` also greps bodies for internal-error signatures.
- Two users: `e2e-second` is created in Keycloak (real realm) for multi-person approvals (`e2e/api/approvals-multi.spec.ts`) and removed by teardown / `npm run e2e:down`.
- Forms are filled by `e2e/ui/forms.ts` (discovers required `ng-invalid` controls; knows sic-input/combobox/datepicker/radio/checkbox/tiptap + native inputs). A module that needs more declares it in the `mods` table of `crud.spec.ts` (`values`, `query`, `prepare`, `spa`, `page1`, `noGridDelete`).
- Not covered: profile edit (needs an e-mailed OTP), AI generation (no LLM key), positive path of joining a business by token (needs a third user).
- Needs ~1.5 GB free RAM for the Angular dev server; close other IDEs if it crashes at start (exit 3221226505).

## Gotchas
- Tokens live in sessionStorage (not in storageState): setup saves it to `e2e/.auth/session.json`, spec restores it and reuses ONE page so refresh-token rotation works.
- External requests (Google Fonts) are aborted; they hang Keycloak rendering.
- Cold Vite dev server is slow (low RAM): first login can take minutes.

## Flow
1. Script the flow: prefer `getByRole` / `getByLabel` / `getByText` over CSS. Use auto-waiting; no `waitForTimeout`.
2. Capture evidence: `page.screenshot`, console errors (`page.on('console'|'pageerror')`), failed requests (`page.on('response')` status ≥ 400).
3. Check both locales (th/en) for i18n keys that render raw (`some.key.name`).
4. Report: steps, expected vs actual, screenshot path, console/network errors.

## Rules
- Demo data only; no destructive actions on real/dump data.
- Headless by default; `--headed` only to debug.
- Temp scripts/screenshots go to scratchpad, not the repo.
- Flaky? Fix the selector/wait, don't add retries.
