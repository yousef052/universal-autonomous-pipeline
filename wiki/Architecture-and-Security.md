# Architecture & Security Guardrails 🛡️

## The 5-Stage Autonomous Pipeline

UAP enforces a strict execution pipeline on every agent turn:

```mermaid
flowchart TD
    Prompt["User Natural Prompt"] --> Stage1["1. Virtual '@' Pinpointing<br/>Instant resolution via PROJECT_STATE.md"]
    Stage1 --> Stage2["2. Context Economy<br/>Symbol tree-shaking & line range reading"]
    Stage2 --> Stage3["3. Single-Pass Rigor<br/>Contiguous edits & single test suite execution"]
    Stage3 --> Stage4["4. Living Memory Auto-Sync<br/>Automated recording to PROJECT_STATE.md"]
    Stage4 --> Stage5["5. Ironclad Safety Shield<br/>Path traversal & command injection protection"]
    Stage5 --> SubSecond["⚡ Sub-Second TTFT Response"]
```

---

## 🛡️ Ironclad Security Safeguards

### 1. Path Traversal Shield (`isSafePath`)
- Isolates all file read/write operations strictly within the workspace root.
- Rejects paths containing `../` directory traversal sequences and null bytes (`\0`).
- Forbids modification of protected `.git/` metadata (hooks, config, objects).

### 2. Command Injection Firewall (`isSafeCommand`)
- Blocks destructive system commands (`rm -rf /`, `format`, `del /s /q`, fork bombs).
- Blocks remote command execution pipes (`curl ... | bash`, `wget ... | sh`, `iex`).
- Blocks forced git operations (`git push --force`, `git reset --hard`).

### 3. Secret Redaction Shield (`redactSensitiveSecrets`)
- Scans prompt contexts and masks private API keys:
  - OpenAI / Anthropic (`sk-...`)
  - GitHub Personal Access Tokens (`ghp_...`, `gho_...`)
  - Google API Keys (`AIzaSy...`)
  - AWS Access Keys (`AKIA...`)
  - Database connection strings and RSA private keys.
