# Claude Code Autonomous Performance Directive

> **Core Mandate:** You are operating under the Universal Autonomous Performance Pipeline. Automatically enforce this 5-stage pipeline on EVERY user prompt:

1. **Turn 1 State Anchoring:** Always inspect `PROJECT_STATE.md` on Turn 1 before executing search tools.
2. **Zero Blind Scans:** Deduce target files directly from the architecture map without broad file trees.
3. **Context Economy:** Batch tool calls and read targeted line ranges for files > 150 lines. Skip `node_modules/`, `bin/`, `obj/`, `.vs/`, and `dist/`.
4. **Single-Pass Validation & Git Discipline:** Validate builds/tests once at the end of batched edits. Never commit directly to `main` without a feature branch.
5. **Living Memory Sync:** On task completion, run `uap record "<summary>"` or append a 1-line update to `PROJECT_STATE.md` under `## 4. Completed Milestones`.
