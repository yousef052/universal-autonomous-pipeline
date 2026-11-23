# Antigravity & AI Agent Performance, Precision & Safety Pipeline

> **Core Mandate:** The user may omit explicit file targeting (`@`), architecture references, or optimization tips. You MUST automatically enforce this 5-stage pipeline on EVERY user prompt across ANY workspace or project:

---

## 1. Automatic Pre-Flight (Virtual `@` Resolution)
- **Turn 1 State Anchoring:** Always inspect `PROJECT_STATE.md` immediately on Turn 1 to anchor the active tech stack, file map, and recent milestones in under 1 second.
- **Zero Blind Scans:** Deduce target files directly from the architecture map without broad directory walking or open-ended workspace searches.
- **Auto-Generate Starter Ledger if Missing:** If working in a project without `PROJECT_STATE.md`, infer the tech stack from root manifests (`package.json`, `*.sln`, `requirements.txt`, `go.mod`) and generate a clean starter ledger.

---

## 2. Context Economy & Chunked Operations
- **Batch Parallel Calls:** Always batch independent file reads, edits, or commands into a single turn to save roundtrip network latency.
- **Targeted Line Ranges:** For files larger than 150 lines, read only the specific functions or line ranges needed.
- **Strict Directory Exclusions:** Strictly skip `node_modules/`, `dist/`, `build/`, `bin/`, `obj/`, `.vs/`, `TestResults/`, `.git/`, and binary media assets.
- **Secret Redaction Shield:** Never emit raw API keys (`sk-*`, `ghp_*`), AWS credentials, or connection string passwords into chat history.

---

## 3. Engineering Rigor & Single-Pass Execution
- **Batch Edits Before Validation:** Make contiguous edits across all related files first before running build or test commands.
- **Single-Pass Test Validation:** Run build/test verification commands exactly once at the end of the batch.
- **Git Branch Discipline:** NEVER commit directly to `main`! Always create a dedicated semantic feature/fix branch (`feat/...`, `fix/...`), verify the test suite, and merge cleanly.
- **Sandbox Security Guardrails:**
  - Validate paths against traversal (`isSafePath`). Never write or modify files outside the workspace root or touch `.git/` metadata.
  - Reject dangerous system commands (`rm -rf /`, `format`, `drop database`, curl piped to shell, `git push --force`).

---

## 4. Self-Updating Living Memory Ledger
- **Automate Stage 4 via UAP Record:** Upon finishing any feature, bugfix, or refactor, record the milestone immediately:
  ```bash
  uap record "<Feature/Fix summary>"
  ```
  Or append a formatted 1-line update to `PROJECT_STATE.md` under `## 4. Completed Milestones`:
  `- [YYYY-MM-DD] <Feature/Fix summary> (<Modified files>)`
- This guarantees subsequent AI sessions inherit 100% of the project's memory with zero token bloat.

---

## 5. Technology Stack Directives

### .NET & C# (ASP.NET Core / Web APIs)
- **Modern C# 12 / .NET 8+ Idioms:** File-scoped namespaces, primary constructors, pattern matching, records for DTOs.
- **Clean Architecture & Separation of Concerns:** Controllers/Endpoints -> Application Services -> Domain & Data Access.
- **Async Discipline:** Always propagate `CancellationToken`. Never use blocking `.Result` or `.Wait()`.
- **EF Core:** Always use `.AsNoTracking()` for read queries.

### TypeScript / JavaScript (Node.js & Frontend)
- **Strict Typing:** Avoid `any`, use strict mode, and leverage TypeScript interfaces/types.
- **Clean Modules:** Use modern ESM syntax, avoid prototype pollution, and handle async promises cleanly.

### Python / Go / Rust
- **Python:** Use isolated `.venv`, avoid mutable default arguments, pin dependencies.
- **Go:** Explicit error checking (`if err != nil`), avoid goroutine leaks with context cancellation.
- **Rust:** Strict borrow checker compliance, avoid unsafe blocks unless explicitly necessary.
