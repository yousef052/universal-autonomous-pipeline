# Universal Autonomous Pipeline Specification (UAP)

> **Version:** 1.0  
> **Target:** Autonomous Coding Agents (Antigravity, Claude Code, Cursor, Windsurf, Aider, Copilot)

---

## Directive 1: Virtual `@` Resolution (Pre-Flight)
* On Turn 1 of any task, inspect the project root for `PROJECT_STATE.md`.
* Extract tech stack, core commands, and active file paths in under 1 second.
* If `PROJECT_STATE.md` does not exist, inspect project manifests (`package.json`, `go.mod`, `Cargo.toml`, `requirements.txt`, `*.sln`) and generate a clean starter ledger.
* Map user requests directly to known modules (e.g. "navbar fix" -> `src/components/Navbar`) without scanning unneeded folders.

## Directive 2: Context Economy
* Issue independent file inspections, searches, or checks in parallel within a single turn.
* For files larger than 200 lines, read only targeted line ranges or functions.
* Never read `node_modules/`, `dist/`, `build/`, `.git/`, or binary files (`*.pdf`, `*.png`, `*.dll`).

## Directive 3: Single-Pass Execution & Noise Suppression
* Group contiguous file edits into a single batch before executing tests or compilers.
* Run compilation, build, and test suites ONCE at the end of the batch, not after every file touch.
* Suppress cosmetic formatting or linter warnings (e.g. whitespace, trailing commas) and fix only breaking issues.
* Apply a circuit breaker: if the same error repeats twice, pause and reassess against `PROJECT_STATE.md`.

## Directive 4: Self-Updating Memory Ledger
* Upon completing a task or fix, append a single line to `PROJECT_STATE.md` under `## 4. Completed Milestones`:
  `- [YYYY-MM-DD] <Feature/Fix summary> (<Modified files>)`
* This guarantees future chat sessions inherit complete project memory without conversational context bloat.
