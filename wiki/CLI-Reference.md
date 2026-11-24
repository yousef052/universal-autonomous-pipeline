# CLI Reference Manual 🛠️

UAP provides a unified CLI suite across **Interactive**, **Health & Economics**, **Quality & Memory**, and **Chat Adapters**.

---

## 1. Interactive & Guidance

### `uap`
Launches the interactive ASCII banner, dynamic system diagnostics scorecard, and menu selector:
```bash
npx uap
```

---

## 2. Health, Security & Diagnostics

### `uap verify [--test] [--fix]`
Executes comprehensive system health and security boundary audits:
- **`--test`:** Runs automated unit tests and validates test passing grade.
- **`--fix`:** Automatically creates starter ledger files and whitelists IDE rules.

### `uap fix-ide`
Whitelists `bin/` directory across Git and IDE settings (`.vscode/settings.json`) to prevent dimmed files.

### `uap doctor [--fix]`
Scans the repository for context bloat:
- Identifies oversized log files, SQLite databases, and `.env` credentials.
- **`--fix`:** Automatically patches `.agentignore` with safe patterns.

### `uap budget`
Calculates token consumption across raw repository files vs. distilled context, showing dollar savings per 100 agent turns.

### `uap audit [dir]`
Scans repository context health, awarding an architecture score (0–100) and letter grade (A+ through F).

---

## 3. Quality & Living Memory

### `uap care`
Runs the **CARE Framework Consultation Wizard** (Connect, Ask, Resolve, Expectations) to align agent instructions.

### `uap record "<summary>"`
Captures recent Git diffs and automatically appends a formatted milestone to `PROJECT_STATE.md`:
```bash
uap record "Added payment gateway webhook handler"
```

### `uap sync`
Synchronizes active Git changes directly into the living memory ledger without manual editing.

---

## 4. Web Chat Adapters

### `uap pack "<task>"`
Tree-shakes source files to extract essential signatures and copies a ready-to-paste XML prompt to clipboard.

### `uap apply [file]`
Parses diff/patch blocks from clipboard or file, creates safety backups (`.uap-backup`), and applies patches safely.

### `uap scaffold "<idea>"`
Generates a structured architect prompt for creating full-stack projects in browser chatbots.

### `uap run [file]`
Ingests multi-file batch manifests and executes creation/edits directly with sandbox traversal protections.
