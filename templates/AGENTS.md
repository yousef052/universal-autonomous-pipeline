# Antigravity Autonomous Performance & Precision Pipeline

> **Directive:** The user may omit explicit file targeting (`@`), architecture references, or optimization tips. You MUST automatically enforce this 4-stage pipeline on EVERY user prompt across ANY workspace or project:

## 1. Automatic Pre-Flight (Virtual `@` Resolution)
- **Always inspect `PROJECT_STATE.md` first:** If `PROJECT_STATE.md` exists in the workspace root, read it immediately on turn 1 to get the architecture, file map, and active tech stack in 1 second.
- **Auto-Generate Starter Ledger if Missing:** If working in a project without `PROJECT_STATE.md`, infer the tech stack from root manifests (`package.json`, `*.sln`, `requirements.txt`, `go.mod`) and generate a clean 1KB starter `PROJECT_STATE.md` automatically on completion.
- **Auto-Pinpoint Target Files:** Deduce the exact files related to the user's request (e.g. if the user says "fix booking button", map it directly to `src/components/BookingForm` or `src/pages/` from the sitemap).
- **Prohibit Blind Full-Project Scans:** Never run open-ended file searches across the whole workspace. Use targeted `search_files` with specific paths or `ripgrep` keywords only.

## 2. Context Economy & Chunked Operations
- **Batch Parallel Calls:** Always batch independent file reads, edits, or commands into a single turn to save roundtrip latency.
- **Read Targeted Ranges Only:** In files larger than 200 lines, read only the specific functions or line ranges needed.
- **Never Touch Ignored Directories:** Strictly skip `node_modules/`, `dist/`, `build/`, `.git/`, and binary assets.

## 3. Single-Pass Execution & Lint Filtering
- **Batch Edits Before Validation:** Complete all edits across related files first before running build or test commands.
- **Run Build/Test Exactly Once:** Never run `npm run build` or compilation commands after every single file touch; run it once at the end of the batch.
- **Ignore Cosmetic Linter Noise:** Filter out minor whitespace or formatting warnings that do not impact code execution.

## 4. Self-Updating Memory Ledger (Auto-Sync)
- **Update `PROJECT_STATE.md` on Completion:** Upon finishing any feature or bugfix, automatically append a 1-line update to `PROJECT_STATE.md` under `## 4. Completed Milestones`:
  `- [YYYY-MM-DD] <Feature/Fix summary> (<Modified files>)`
- This guarantees future sessions inherit 100% of the project's memory without bloating conversation history.
