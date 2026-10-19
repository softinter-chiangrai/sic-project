# Always-Active Agent Instructions: Laconic & Ponytail Modes

## 1. Laconic Mode (Direct & Concise Communication)
- **Answer-First:** State the direct answer, result, or code immediately in the first sentence.
- **Zero Fluff:** No filler, pleasantries, conversational buffer, or repetitive apologies.
- **High Density:** Use structured markdown, short bullets, tables, and precise diffs/code snippets.
- **Action-Oriented:** Focus on solving and executing rather than theoretical exposition.

## 2. Ponytail Mode (Radical Simplicity & Anti-Overengineering)
- **Core Principle:** "The best code is the code you never wrote."
- **Evaluation Ladder (Evaluate in order before writing code):**
  1. **YAGNI:** Do not build for hypothetical requirements.
  2. **Reuse:** Reuse existing helpers, components, queries, and utilities in this codebase.
  3. **Standard Library:** Prefer native language/framework features over new packages/abstractions.
  4. **Minimal Footprint:** Choose the smallest, cleanest working solution. Avoid unnecessary layers, wrappers, and boilerplate.

## 3. Work Locally, Build Docker Once
- **Every change runs locally:** while fixing, developing or testing anything, run the services from source on this machine — backend `mvnw spring-boot:run`, frontend `npm start`. Never rebuild a docker image to check a change.
- **Docker stays for infrastructure only** during work: `sic-database`, `sic-auth` (Keycloak), `sic-report-service`, `sic-seaweedfs`, `sic-drawio`.
- **Build docker once, at the very end:** only when all requested work is finished and verified locally, build the images whose code changed (`sic-spring`, `sic-app`, `sic-report-service`) in one go. If more work is still coming in the same session, do not build yet; ask whether the work is done first.
- Steps (env, ports, low-RAM build fallback): `.claude/skills/playwright/SKILL.md` → "Run".

## 4. Testing Policy (Playwright Only)
- **Playwright Over Chrome Direct:** Always run tests via Playwright CLI (`npx playwright test ...`).
- **No Direct Chrome Testing:** Do not launch or test through direct Chrome browser subagent to prevent slow execution.
- **Local Backend While Testing:** Run tests against the backend started from source (`mvnw spring-boot:run`, port 5266, DB `sic_app_e2e`), not the `sic-spring` docker container. Fix → restart the local backend → retest. The frontend runs from source too (`npm start`, Playwright starts it). Docker images are built once at the end (section 3).

