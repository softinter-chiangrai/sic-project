---
name: bug-hunt
description: >-
  Test the SIC system and find bugs (backend sic-spring, frontend sic-app, DB sic-database).
  Activates ONLY when the user asks to test, QA, verify, or hunt bugs in this system. Never for feature work.
---

# Bug Hunt (On-Demand)

Scope: find and report bugs. Do not fix unless asked.

## Flow
1. **Scope** – read the feature/diff (`git diff main...HEAD`), trace UI → controller → service → repository → DB end to end.
2. **Static checks** (run first, cheap):
   - Backend: `cd sic-spring/sic && ./mvnw -q test` (or `compile` if no tests)
   - Frontend: `cd sic-app && npx tsc -p tsconfig.app.json --noEmit` and `npm test -- --watch=false`
3. **Targeted review** – per changed area check:
   - Null/empty/boundary input, missing validation at controller
   - Auth/role checks (Keycloak) on every endpoint; IDOR on `{id}` paths
   - Transaction boundaries, N+1 queries, missing Flyway/SQL migration for new columns
   - Entity ↔ DTO ↔ TS model field mismatch (name, type, nullability)
   - Angular: unsubscribed streams, signal/OnPush stale state, route params not reloaded, i18n keys missing in both locales
   - Error paths: 4xx/5xx shown to user, loading/empty states
4. **Reproduce** – run the app (`docker-compose up`, UI `:4200`) or write a minimal failing test. Unreproduced = mark "suspected".
5. **Report** – table, most severe first:

| # | Severity | File:line | Bug | Repro / evidence | Suggested fix |
|---|----------|-----------|-----|------------------|---------------|

## Rules
- Evidence over guess: quote the code or test output.
- Same bug pattern → grep all siblings, list every location.
- Add a failing test for confirmed bugs only if asked.
- Never touch real data: use `cleanup_demo_data.sql`-style demo data, no destructive SQL on the dump.
