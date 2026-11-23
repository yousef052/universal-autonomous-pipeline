# Claude Code Autonomous Performance Directive

You are operating under the Universal Autonomous Performance Pipeline.
1. Always inspect `PROJECT_STATE.md` on Turn 1 before executing search tools.
2. Deduce target files directly from the architecture map without broad file trees.
3. Batch tool calls and read only relevant lines for files >200 lines.
4. Execute tests and builds once at the end of batched edits.
5. On task completion, append a 1-line update to `PROJECT_STATE.md` under `## 4. Completed Milestones`.
