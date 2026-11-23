export function generateProjectState(projectInfo) {
  const dirs = projectInfo.sourceDirs.length > 0
    ? projectInfo.sourceDirs.map(d => `- \`${d}/\` : Core application modules`).join('\n')
    : '- `src/` : Application source code';

  return `# Project State & Architecture Ledger

## 1. Project Overview & Active Tech Stack
- **Project Name:** ${projectInfo.name}
- **Type:** ${projectInfo.type}
- **Framework:** ${projectInfo.framework}
- **Primary Language:** ${projectInfo.language}

## 2. Core Execution Commands
- **Dev Server:** \`${projectInfo.commands.dev}\`
- **Production Build:** \`${projectInfo.commands.build}\`
- **Test Suite:** \`${projectInfo.commands.test}\`
- **Lint Check:** \`${projectInfo.commands.lint}\`

## 3. Architecture & File Map
${dirs}

## 4. Completed Milestones (Auto-Maintained)
- [${new Date().toISOString().split('T')[0]}] Initialized UAP autonomous ledger.
`;
}
