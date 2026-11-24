# Chatbot & Agent Adapters 🤖

UAP provides seamless integration with both local AI agent harnesses and browser-based web chatbots.

---

## 1. Tree-Shaking Code with `uap pack`

When communicating with models that have tight context budgets (or in web chat interfaces), raw file copy-pasting wastes thousands of tokens.

`uap pack` parses source files and retains only essential signatures:
```bash
# Distill context for a specific task and copy XML prompt to clipboard:
uap pack "Implement JWT authentication filter"
```

The resulting prompt conforms to Claude/ChatGPT specifications with concise type definitions and targeted method signatures.

---

## 2. Ingesting AI Diffs with `uap apply`

Web chatbots often reply with code snippets or unified Search/Replace blocks. `uap apply` ingests these patches safely:

```bash
# Read patch directly from system clipboard:
uap apply

# Or apply from a saved patch file:
uap apply patch.diff
```

### Safety Backups
Before modifying any file on disk, `uap apply` automatically creates a safety snapshot in `.uap-backup/`, allowing instant rollbacks if needed.

---

## 3. Agent Emulation with `uap scaffold` & `uap run`

Build full-stack applications in multi-phase increments through browser chatbots:
```bash
# Generate Master Architect Prompt:
uap scaffold "Enterprise booking API with ASP.NET Core and PostgreSQL"

# Ingest multi-file manifest returned by model:
uap run manifest.txt
```
