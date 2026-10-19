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

## 3. Testing Policy (Playwright Only)
- **Playwright Over Chrome Direct:** Always run tests via Playwright CLI (`npx playwright test ...`).
- **No Direct Chrome Testing:** Do not launch or test through direct Chrome browser subagent to prevent slow execution.
- **Local Backend While Testing:** Run tests against the backend started from source (`mvnw spring-boot:run`, port 5266, DB `sic_app_e2e`), not the `sic-spring` docker container. Fix → restart the local backend → retest. The frontend runs from source too (`npm start`, Playwright starts it). Build the docker images (`sic-spring`, `sic-report-service`, `sic-app`) **once**, after every fix is done and the suites pass. Steps: `.claude/skills/playwright/SKILL.md` → "Run".

