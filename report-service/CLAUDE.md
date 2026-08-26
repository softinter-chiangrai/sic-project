# Claude Project Guide & Context

You are an expert software engineer assistant working on the **Report Service** project. To ensure high-quality output and strict adherence to our project standards, you must read and follow our centralized configuration.

> **[System Directive]** Tell the user anytime you are reading this file or initializing your project context.

---

## 🧠 Centralized AI Instructions
Before responding to any prompt, generating code, or modifying files, **you must read and strictly adhere to the rules specified in our centralized AI instructions file:**
👉 **[.project-context/rules-and-conventions/ai-instructions.md](.project-context/rules-and-conventions/ai-instructions.md)**

---

## 🗺️ Project Context Directory
Our project utilizes a structured context folder located at `.project-context/`. You can reference these files at any time to understand the project deeply:

*   **Standards & Blueprints:**
    *   [.project-context/standards-and-blueprints/ui-ux-standard.md](.project-context/standards-and-blueprints/ui-ux-standard.md) — UI/UX, design tokens, and frontend component standards.
    *   [.project-context/standards-and-blueprints/api-design.md](.project-context/standards-and-blueprints/api-design.md) — API Response, HTTP methods, and Error payload formats.
    *   [.project-context/standards-and-blueprints/database-standard.md](.project-context/standards-and-blueprints/database-standard.md) — Core tables, naming conventions, and mandatory audit columns.
    *   [.project-context/standards-and-blueprints/error-handling.md](.project-context/standards-and-blueprints/error-handling.md) — Exception handling and logging policies.
    *   [.project-context/standards-and-blueprints/security-checklist.md](.project-context/standards-and-blueprints/security-checklist.md) — Security guardrails and verification checklist before making commits.

*   **Project Management & History:**
    *   [.project-context/management/todo.md](.project-context/management/todo.md) — Current task backlog, features in progress, and done tasks.
    *   [.project-context/management/changelog.md](.project-context/management/changelog.md) — Project update history.

*   **Long-term Memories & Technical Context:**
    *   [.project-context/memories/decisions.md](.project-context/memories/decisions.md) — Architecture Decision Records (ADR) and past technical choices.
    *   [.project-context/memories/ai-learnings.md](.project-context/memories/ai-learnings.md) — Log of fixed bugs, edge cases, and project lessons learned.
    *   [.project-context/memories/context-snapshot.md](.project-context/memories/context-snapshot.md) — Single-page executive summary of the current system state.

---

## 🤖 Core Commands for Claude
1.  **Read Context:** Always read `.project-context/rules-and-conventions/ai-instructions.md` first.
2.  **Check Tasks:** Refer to `.project-context/management/todo.md` to see what needs to be done next.
3.  **Enforce Blueprints:** Validate all implementation details against the files inside `standards-and-blueprints/`.
4.  **Update Handover:** Upon completing a significant task, ask the user if you should summarize the changes and update `.project-context/management/changelog.md` and relevant memory files.