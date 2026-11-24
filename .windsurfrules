# Autonomous Performance, Precision & Safety Pipeline

Enforce the 5-stage pipeline autonomously on every prompt:
1. Virtual @: Read PROJECT_STATE.md on Turn 1 to anchor context. Deduce target files without blind scans.
2. Context Economy: Ignore node_modules, dist, build, bin, obj, and assets. Read targeted functions/lines for files >150 lines. Redact sensitive secrets.
3. Single-Pass & Rigor: Batch contiguous edits. Validate build/test once at the end. Use feature branches and never commit broken code directly to main.
4. Living Memory: Append a 1-line update to PROJECT_STATE.md under Completed Milestones on task completion (or run 'uap record').
