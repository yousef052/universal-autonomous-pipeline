import { estimateTokens } from '../distiller/symbolExtractor.js';
import { redactSensitiveSecrets } from '../safety/securityGuard.js';

export function synthesizePrompt({
  projectInfo = {},
  stateContent = '',
  targetFiles = [],
  task = 'Optimize and fix code according to specifications',
  chatTarget = 'universal'
}) {
  const target = chatTarget.toLowerCase();

  const filePayloads = targetFiles.map(f => {
    const safeContent = redactSensitiveSecrets(f.content).sanitized;
    return `### FILE: \`${f.path}\`\n\`\`\`${f.language || ''}\n${safeContent}\n\`\`\``;
  }).join('\n\n');

  const distilledState = stateContent
    ? stateContent.trim()
    : `# ${projectInfo.name || 'Project'}\nType: ${projectInfo.type || 'Generic'}\nLanguage: ${projectInfo.language || 'Unknown'}`;

  const promptHeader = `You are an expert production software engineer acting as an autonomous copilot.`;

  const commonDirectives = `
## STRICT OPERATIONAL RULES:
1. ZERO FILLER: No greetings, pleasantries, apologies, or unsolicited general explanations.
2. FILE ANCHORING: Adhere strictly to the project architecture, frameworks, and command suite.
3. OUTPUT FORMAT: Output your solution strictly in machine-parseable blocks so the UAP CLI can apply it automatically.

### REQUIRED OUTPUT DELIMITERS (Choose one):
**Option A: Full File Replacement**
<<<FILE: path/to/file.ext>>>
\`\`\`lang
// Complete updated file content
\`\`\`
<<<END_FILE>>>

**Option B: Search and Replace Diff Block (Preferred for targeted edits)**
<<<FILE: path/to/file.ext>>>
<<<<<<< SEARCH
// Exact lines from current file to replace
=======
// Exact new replacement lines
>>>>>>> REPLACE
<<<END_FILE>>>
`;

  let prompt = '';

  if (target === 'claude') {
    prompt = `${promptHeader}
${commonDirectives}

<project_architecture>
${distilledState}
</project_architecture>

<target_files>
${filePayloads}
</target_files>

<task_instruction>
${task}
</task_instruction>

Execute the task now. Render the exact code modifications inside the specified delimiters.`;
  } else if (target === 'chatgpt') {
    prompt = `# SYSTEM DIRECTIVE: UAP Autonomous Copilot Mode
${commonDirectives}

---

## 1. Project Architecture & Active Stack
${distilledState}

---

## 2. Target Files Context
${filePayloads}

---

## 3. Developer Task
${task}

Generate the exact patch immediately using the specified delimiters.`;
  } else if (target === 'gemini') {
    prompt = `${promptHeader}
${commonDirectives}

PROJECT STATE:
${distilledState}

SOURCE CONTEXT:
${filePayloads}

ACTIONABLE REQUEST:
${task}

Output the code modifications strictly using the machine-parseable format.`;
  } else if (target === 'deepseek') {
    prompt = `${promptHeader}
Analyze the following architecture and source files carefully. Formulate a sound reasoning trace, then provide the final patch using the exact delimiters below.

${commonDirectives}

[ARCHITECTURE]
${distilledState}

[SOURCE CONTEXT]
${filePayloads}

[GOAL]
${task}`;
  } else {
    // Universal format
    prompt = `# UAP Autonomous Code Distiller Packet
${commonDirectives}

---
## Project State & Tech Stack
${distilledState}

---
## Target Source Files
${filePayloads}

---
## Task Description
${task}

Provide the code patch inside the delimiters now.`;
  }

  const estimatedTokens = estimateTokens(prompt);

  return {
    prompt,
    estimatedTokens,
    fileCount: targetFiles.length,
    chatTarget: target
  };
}
