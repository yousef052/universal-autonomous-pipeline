# Antigravity Autonomous Performance & Precision Pipeline

> **Core Mandate:** The user may omit explicit file targeting (`@`), architecture references, or optimization tips. You MUST automatically enforce this 5-stage pipeline on EVERY user prompt across ANY workspace or project:

---

## 1. Automatic Pre-Flight (Virtual `@` Resolution)
- **Turn 1 State Anchoring:** Always inspect `PROJECT_STATE.md` immediately on Turn 1 to anchor the active tech stack, file map, and recent milestones in under 1 second.
- **Zero Blind Scans:** Deduce target files directly from the architecture map without broad directory walking or open-ended workspace searches.
- **Auto-Generate Starter Ledger if Missing:** If working in a project without `PROJECT_STATE.md`, infer the tech stack from manifests (`package.json`, `*.sln`, `requirements.txt`, `go.mod`) and generate a clean starter ledger.

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
- **Sandbox Security Guardrails:** Validate paths against traversal (`isSafePath`). Never modify files outside workspace root or touch `.git/` metadata.

---

## 4. Self-Updating Living Memory Ledger
- **Automate Stage 4 via UAP Record:** Upon finishing any feature, bugfix, or refactor, record the milestone immediately:
  ```bash
  uap record "<Feature/Fix summary>"
  ```
  Or append a formatted 1-line update to `PROJECT_STATE.md` under `## 4. Completed Milestones`:
  `- [YYYY-MM-DD] <Feature/Fix summary> (<Modified files>)`

---

## 5. Technology Stack Directives
- **.NET / C#:** Modern C# 12 / .NET 8 idioms (file-scoped namespaces, primary constructors, records, `AsNoTracking()`, `CancellationToken`).
- **TypeScript / Node.js:** Strict types, ESM, parameterized queries.
- **Python / Go / Rust:** Idiomatic patterns, isolated environments, explicit error handling.
