# Contributing to Universal Autonomous Pipeline (UAP) ⚡

Thank you for your interest in contributing to UAP! We welcome community contributions that help enhance performance, expand language support, and strengthen security guardrails for AI coding agents.

---

## 🛠️ Development Setup

1. **Clone the repository:**
   ```bash
   git clone https://github.com/yousef052/universal-autonomous-pipeline.git
   cd universal-autonomous-pipeline
   ```

2. **Verify tests and benchmarks:**
   ```bash
   # Run automated test suite:
   npm test

   # Run performance benchmarks:
   npm run bench
   ```

---

## 🌿 Branch & Commit Discipline

To maintain clean repository hygiene:
- **Never commit directly to `main`:** Always create a dedicated semantic branch:
  - `feat/<feature-name>` for new capabilities
  - `fix/<bug-name>` for bug fixes
  - `docs/<doc-name>` for documentation updates
- **Single-Pass Validation:** Ensure all unit tests pass locally before opening a pull request.
- **Commit Messages:** Follow standard conventional commits format (e.g. `feat(parser): add support for rust AST extraction`).

---

## 🛡️ Security & Privacy

- **Path & Command Safety:** All file modifications must conform to workspace sandbox isolation (`isSafePath`).
- **Zero Secret Exposure:** Never commit real API keys, environment credentials, or private connection strings.
- **Anonymous & Confidential Inquiries:** For questions, utilize GitHub Discussions or public issue trackers without sharing personal identifying information.

---

## 📋 Pull Request Process

1. Fork the repo and create your branch from `main`.
2. Make your edits and ensure existing tests pass (`npm test`).
3. Add new unit tests in `test/` covering your changes.
4. Submit your pull request using our standard PR template.
