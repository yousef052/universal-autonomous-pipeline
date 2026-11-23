# Universal Autonomous Performance Pipeline (UAP)

[![CI Status](https://github.com/yousef052/universal-autonomous-pipeline/actions/workflows/ci.yml/badge.svg)](https://github.com/yousef052/universal-autonomous-pipeline/actions)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![NPM Version](https://img.shields.io/badge/npm-v1.0.0-cb3837.svg)](https://www.npmjs.com)
[![Node.js](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen.svg)]()
[![Platform: Universal](https://img.shields.io/badge/Platform-Antigravity%20%7C%20Claude%20%7C%20Cursor%20%7C%20Windsurf-orange.svg)]()

A production-grade, zero-dependency autonomous engine and CLI tool for AI coding agents. UAP cuts multi-turn prompt turnaround latency from **60 minutes down to under 1 minute** while guaranteeing 100% project memory retention without regression bugs.

---

## ⚡ Quick Start: One Command Setup

Initialize any repository with zero configuration:

```bash
# In your project root
npx uap init
```

Audit your project's AI context health score:

```bash
npx uap audit
```

```text
Context Health Audit for: /my-awesome-project
  Score: 100/100 (Grade: A)
  Status: EXCELLENT (All optimization standards met)
```

---

## ⚡ The Problem: Context Bloat & The 60-Minute Stall

When AI agents work on real-world projects, long conversation histories inevitably accumulate:
1. **Context Window Inflation:** Storing complete terminal dumps, stale linter traces, and multi-file reads inflates sessions to 500k–1M+ tokens (20MB–50MB of raw data).
2. **Pre-fill & Network Latency:** Uploading and serializing megabytes of prompt history on every turn degrades roundtrip times to 60–90 seconds per tool call.
3. **The Autonomous Loop Trap:** A single user request can trigger 25–40 consecutive autonomous steps (read -> build -> lint error -> reread -> rebuild), totaling 30 to 60 minutes of waiting.

## 🚀 The Solution: The 4-Stage Autonomous Pipeline

```mermaid
flowchart TD
    UserPrompt["User Prompt<br/>(Natural language, no @ required)"] --> Stage1["1. Virtual '@' Pinpointing<br/>Reads PROJECT_STATE.md on Turn 1<br/>Resolves target files without blind scans"]
    Stage1 --> Stage2["2. Context Economy<br/>Reads only targeted functions/ranges<br/>Strictly ignores dependencies & build assets"]
    Stage2 --> Stage3["3. Single-Pass Execution<br/>Batches contiguous edits across files<br/>Runs build/test ONCE at the end"]
    Stage3 --> Stage4["4. Living Memory Sync<br/>Appends 1-line summary to PROJECT_STATE.md<br/>Zero bloat for future sessions"]
    Stage4 --> FastOutput["⚡ Sub-Minute Execution (30s - 60s)"]
```

---

## 🛠️ CLI Commands & Flags

| Command | Description |
| :--- | :--- |
| `npx uap init [dir]` | Auto-detects tech stack and generates `PROJECT_STATE.md`, `.agentignore`, and agent configs. |
| `npx uap audit [dir]` | Evaluates project health score (0-100) and detects missing ignore rules or state files. |
| `npx uap --version` | Outputs current CLI version. |
| `npx uap --help` | Displays help manual and usage instructions. |

### Available Flags
- `--force`: Overwrite existing configuration files.
- `--dry-run`: Preview planned changes without writing to disk.
- `--json`: Output audit results in machine-readable JSON format.

---

## 📂 Repository Structure

```text
universal-autonomous-pipeline/
├── bin/
│   └── uap.js                     # Production executable CLI entrypoint
├── src/
│   ├── index.js                   # Public programmatic API exports
│   ├── detectors/
│   │   └── projectDetector.js     # Multi-ecosystem detector (Node, Py, Go, Rust)
│   ├── generators/
│   │   ├── stateGenerator.js      # Dynamic PROJECT_STATE.md ledger builder
│   │   └── agentGenerator.js      # Cross-platform agent config generator
│   └── auditor/
│       └── contextAuditor.js      # Context health and scoring engine
├── test/                          # Unit test suite (node:test)
│   ├── detector.test.js
│   ├── generator.test.js
│   └── auditor.test.js
├── docs/
│   ├── architecture.md            # Three-tier memory architecture
│   ├── benchmarks.md              # 10-iteration verification metrics
│   └── case-study-enterprise-tours.md # Real-world 4,232-step optimization case study
├── templates/                     # Universal configuration templates
└── scripts/                       # Autonomous watchdog scripts
```

---

## 📊 Real-World Production Benchmarks

Tested in complex enterprise codebases (such as Next.js + Django platforms):

| Metric | Without Pipeline | With UAP Pipeline | Improvement |
| :--- | :---: | :---: | :---: |
| **Prompt Turnaround Time** | 30 – 60 min | **30 – 60 sec** | **~50x faster** |
| **Active Session DB Size** | 55.1 MB | **5.4 MB** | **90% reduction** |
| **Token Payload per Turn** | ~6.7M tokens | **< 30k tokens** | **98% lighter** |
| **Agent Autonomous Steps** | 25 – 45 turns | **3 – 6 micro-turns** | **85% fewer turns** |
| **Memory Regression Rate** | High (forgets work) | **0% (Living Ledger)** | **100% retained** |

Read the in-depth breakdown in the [Enterprise Travel Platform Case Study](docs/case-study-enterprise-tours.md).

---

## 📜 License

Published under the MIT License. Contributions and feedback are welcome!
