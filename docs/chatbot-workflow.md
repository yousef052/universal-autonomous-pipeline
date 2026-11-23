# UAP Web Chatbot Workflow Guide

## Zero-Tool Web Chat Acceleration

Web chatbots like **Claude.ai**, **ChatGPT**, and **Gemini Web** do not have native filesystem or terminal access. Developers often struggle with manual copy-pasting, token limits, and hallucinated paths.

The **UAP Pack & Apply Loop** bridges your local filesystem with any web chatbot seamlessly.

---

## 1. Pack: Distill Code & Copy to Clipboard

Run in your terminal:
```bash
npx uap pack "Fix JWT token refresh expiration in auth service"
```

### What happens:
1. UAP reads `PROJECT_STATE.md` to load the architecture and tech stack.
2. It pinpoints relevant files (e.g. `src/services/auth.js`).
3. It tree-shakes the code to keep the payload under **3,000 tokens**.
4. It copies the formatted prompt directly to your OS clipboard.

You can also target specific files and models:
```bash
npx uap pack "Add dark mode toggle" --files=src/components/Theme.jsx,src/styles/theme.css --chat=claude
```

---

## 2. Paste & Send in Web Chat

Go to your browser (**Claude.ai**, **chatgpt.com**, or **gemini.google.com**) and press `Ctrl+V` (or `Cmd+V`).

The chatbot receives the architecture, target symbols, and instructions, and outputs a structured patch:

```text
<<<FILE: src/services/auth.js>>>
<<<<<<< SEARCH
if (token.isExpired()) {
  return null;
}
=======
if (token.isExpired()) {
  return await refreshAuthToken(token.refreshToken);
}
>>>>>>> REPLACE
<<<END_FILE>>>
```

---

## 3. Apply: Ingest Patch Back into Your Project

Copy the chatbot's response in your browser, then run:

```bash
npx uap apply
```

### What happens:
1. UAP automatically reads the patch from your clipboard.
2. Creates an automatic backup in `.uap-backup/`.
3. Applies search-and-replace or full-file updates directly to disk.
4. Appends a milestone entry to `PROJECT_STATE.md` to maintain living project memory.

---

## 4. Verification & Testing

Preview changes before applying:
```bash
npx uap apply --dry-run
```

Apply patch from a saved file:
```bash
npx uap apply response.md
```
