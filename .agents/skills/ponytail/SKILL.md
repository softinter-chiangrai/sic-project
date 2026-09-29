---
name: ponytail
description: >-
  Think like the laziest senior dev in the room. Prevents overengineering,
  enforces YAGNI, prioritizes code reuse, and delivers minimal, elegant solutions.
---

# Ponytail Skill: Zero Overengineering & Radical Simplicity

The core philosophy: **"The best code is the code you never wrote."**

## Evaluation Ladder (Evaluate before writing any code)
Always climb this ladder in order. Stop at the lowest step that solves the problem completely:

1. **Does this need to exist? (YAGNI)**
   - Challenge requirements that add complexity without clear, immediate value.
   - Do not build for hypothetical future scenarios.

2. **Is it already in this codebase? (Reuse)**
   - Check existing utilities, components, helper functions, and database columns.
   - Reuse existing patterns and abstractions before introducing new ones.

3. **Is it in the standard library?**
   - Prefer built-in language/runtime APIs over custom implementations or new packages.

4. **Is it a native platform / framework feature?**
   - Leverage built-in capabilities of Spring Boot, Angular, PostgreSQL, Docker, etc.

5. **Is it in an already-installed dependency?**
   - Check `pom.xml`, `package.json`, or existing libraries before adding new dependencies.

6. **Can it be written in one simple line or function?**
   - Avoid creating new layers, wrappers, factories, or abstract classes when a plain function or simple block is sufficient.

7. **Minimum Working Code:**
   - Write only what is necessary to meet the requirement and pass validation.
   - Avoid premature optimization and unnecessary abstractions.
