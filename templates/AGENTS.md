# Universal Autonomous Performance, Precision & Safety Pipeline (AGENTS.md)

> **Specification Standard:** `UAP-SPEC-2026.1`  
> **Target Runtimes:** Universal AI Coding Agents (Google Antigravity, Claude Code, Cursor, Windsurf, GitHub Copilot, Codex)  
> **Mandate:** The developer may omit explicit file targeting (`@`), architecture references, or optimization directives. Any autonomous AI agent operating within this workspace MUST strictly enforce this 5-stage production pipeline on EVERY turn without exception.

---

## 1. Zero-Assumption Pre-Flight Protocol (Virtual `@` Resolution)

- **Turn-1 State Anchoring:** Always inspect `PROJECT_STATE.md` in the workspace root immediately on Turn 1. Extract active tech stacks, build commands, architecture maps, and recent milestones in under 1 second.
- **Prohibition of Blind Workspace Scans:** Never execute broad recursive directory scans (e.g. `ls -R`, open-ended `find`, or workspace-wide glob searches). Deduce target files directly from `PROJECT_STATE.md` or execute targeted path-specific lookups only.
- **Starter Ledger Auto-Generation:** If working in a project lacking `PROJECT_STATE.md`, infer the stack from root manifests (`package.json`, `*.sln`, `requirements.txt`, `go.mod`) and generate a clean starter ledger automatically upon task completion.

---

## 2. Context Window Economics & Token Conservation

- **Batch Parallel Tool Invocations:** Always batch independent file searches, file reads, and file edits into a single turn to eliminate unnecessary roundtrip latency and context re-serialization overhead.
- **Targeted Line-Range Slicing:** For files exceeding 150 lines, read only the specific functions, interfaces, or line ranges required for the task. Never ingest full 1,000-line files when touching a single function.
- **Strict Exclusion Firewall:** Strictly ignore and never traverse:
  - Dependency trees: `node_modules/`, `vendor/`, `.venv/`, `packages/`
  - Build & compile artifacts: `dist/`, `build/`, `bin/`, `obj/`, `out/`, `target/`, `.next/`
  - IDE & testing caches: `.vs/`, `.vscode/`, `TestResults/`, `coverage/`, `.cache/`
  - Version control internals: `.git/`
  - Binary media assets: images, videos, audio, font files, and archives.
- **Secret Redaction Shield:** Never emit raw API keys (`sk-*`, `ghp_*`, `AIzaSy*`), AWS credentials, RSA private keys, or database passwords into prompt histories or chat transcripts.

---

## 3. Engineering Rigor & Single-Pass Execution

- **Batch Edits Before Validation:** Make contiguous, drop-in replacements across all affected files first before executing compilation, linting, or test commands.
- **Single-Pass Test Validation:** Run verification commands (`npm test`, `dotnet test`, `pytest`) exactly once at the end of the edit batch. Never run build or test cycles after every single file touch.
- **Git Branch Discipline:** NEVER commit directly to `main` or production branches! Always operate within a semantic branch (`feat/...`, `fix/...`, `docs/...`), verify the test suite, and merge cleanly.
- **Sandbox Security Invariants:**
  - **Path Traversal Defense (`isSafePath`):** All file write and edit operations must strictly resolve within the workspace root. Strictly reject `../` traversal escapes, null bytes (`\0`), and protected `.git/` metadata modifications.
  - **Command Injection Defense (`isSafeCommand`):** Immediately reject destructive disk formats (`rm -rf /`, `format`, `del /s /q`), remote code execution pipes (`curl ... | bash`, `wget ... | sh`, `iex`), and disruptive Git operations (`git push --force`).

---

## 4. Self-Updating Living Memory Protocol (Auto-Sync)

- **Automated Milestone Capture:** Upon finishing any feature, bugfix, or refactor, record the milestone immediately:
  ```bash
  uap record "<Feature/Fix summary>"
  ```
  Or append a formatted 1-line update to `PROJECT_STATE.md` under `## 4. Completed Milestones`:
  `- [YYYY-MM-DD] <Feature/Fix summary> (<Modified files>)`
- **Context Debt Remediation:** Periodically scan for bloated logs or credential leaks using `uap doctor --fix`.
- **Zero Token Bloat Guarantee:** Living memory ledgers guarantee that subsequent agent turns inherit 100% of architectural context without bloating conversation history.

---

## 5. Multi-Stack Production Directives

### .NET & C# (ASP.NET Core / Web APIs)
- **Idiomatic C# 12 / .NET 8:** File-scoped namespaces, primary constructors, pattern matching, records for DTOs.
- **Clean Architecture & Separation of Concerns:** Controllers/Endpoints -> Application Services -> Domain & Data Access.
- **Async Discipline:** Always propagate `CancellationToken`. Strictly forbid blocking `.Result` or `.Wait()` (prevent thread-pool starvation).
- **EF Core Optimization:** Always apply `.AsNoTracking()` for read queries.

### TypeScript / Modern Web (React / Next.js / Node.js)
- **Strict Typing:** Strictly forbid `any`. Use strict TypeScript types and interfaces with runtime Zod contracts.
- **Clean Modules:** Modern ESM syntax (`import`/`export`), clean promise handling, component virtualization for large lists, zero memory leaks in subscription teardowns.

### Python / Go / Rust
- **Python:** Use isolated virtual environments (`.venv`), avoid mutable default arguments, type annotate signatures (`typing`).
- **Go:** Explicit error checking (`if err != nil`), prevent goroutine leaks with context cancellation.
- **Rust:** Strict borrow checker compliance, avoid unsafe blocks unless explicitly necessary.

---

## 6. Human Code Craftsmanship & Intuition

- **Eliminate Robotic Code Smells:** Do not generate obvious, mechanical comments (e.g. `// increment i by 1`). Comments must explain the *why* (architectural rationale, business constraints, edge cases), not the *what*.
- **Empathetic Error Design:** Provide actionable, descriptive error messages that inform operators exactly what failed and how to remediate it.
- **Pragmatic Simplicity:** Reject premature abstractions, excessive design patterns for trivial tasks, and boilerplate bloat. Write readable, maintainable, production-ready software.
