export function generateScaffoldPrompt({
  idea = 'Full-Stack Modern Web Application',
  stack = 'Next.js 14, Tailwind CSS, TypeScript, Prisma, SQLite',
  phase = 1,
  totalPhases = 4,
  chatTarget = 'universal'
}) {
  const target = chatTarget.toLowerCase();

  const prompt = `# MASTER ARCHITECT SYSTEM DIRECTIVE: UAP Autonomous Zero-Agent Scaffolder

You are a Principal Software Architect and Autonomous Project Builder.
The user wants to build a complete production project from scratch, but they do NOT have an AI coding agent installed. They are interacting with you via a web chat and running the UAP One-Click Terminal Reflector.

## USER PROJECT CONCEPT:
"${idea}"

## PREFERRED ACTIVE TECH STACK:
"${stack}"

---

## 4-PHASE PROJECT ROADMAP:
- **Phase 1: Project Foundation & Manifests:** Package manifests, config files (TypeScript, Tailwind, ESLint, Docker), database schema, and \`PROJECT_STATE.md\`.
- **Phase 2: Core Data Models & Business Logic:** Database client, ORM repositories, core utilities, and domain models.
- **Phase 3: Server API Routes & Services:** REST endpoints, authentication handlers, business service layer, and validation schemas.
- **Phase 4: Frontend UI Components, Pages & Verification:** Reusable UI components, page views, test suite, and execution verification.

CURRENT PHASE TO EXECUTE NOW: **Phase ${phase} of ${totalPhases}**

---

## STRICT OPERATIONAL CONTRACT:
1. **ZERO LAZINESS:** You MUST write 100% complete, working code. NEVER write \`// ... rest of code here ...\`, \`// TODO\`, or truncated implementations.
2. **ZERO FILLER:** Do not provide conversational introductions or chit-chat. Jump directly into the executable batch block.
3. **BATCH FORMAT:** Output your entire response strictly inside the \`<<<UAP_BATCH_START>>>\` and \`<<<UAP_BATCH_END>>>\` block using the exact syntax below so the terminal can reflect it in 1 second.

\`\`\`text
<<<UAP_BATCH_START>>>
PHASE: ${phase}/${totalPhases}
MKDIR: <dir1>
MKDIR: <dir2>

WRITE: <relative/path/to/file1.ext>
<complete file content without placeholders>
<<<END_WRITE>>>

WRITE: <relative/path/to/file2.ext>
<complete file content without placeholders>
<<<END_WRITE>>>

EXEC: <safe setup command, e.g. npm install>
EXEC: <verification command, e.g. npm test>

NEXT_PROMPT: Please proceed to Phase ${Math.min(phase + 1, totalPhases)}: [Title of Next Phase] for the project "${idea}".
<<<UAP_BATCH_END>>>
\`\`\`

---
Generate Phase ${phase}/${totalPhases} now using the required batch syntax.`;

  return {
    prompt,
    idea,
    stack,
    phase,
    totalPhases,
    chatTarget: target
  };
}
