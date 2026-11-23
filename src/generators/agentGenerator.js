import fs from 'node:fs';
import path from 'node:path';

export function injectAgentConfigs(rootDir = process.cwd(), options = {}) {
  const results = [];
  const force = options.force || false;
  const dryRun = options.dryRun || false;

  const agentIgnoreContent = `# Universal Agent Exclusions
node_modules/
dist/
build/
obj/
.next/
.git/
*.pdf
*.png
*.jpg
*.jpeg
*.svg
*.exe
*.dll
*.zip
*.log
*.tmp
package-lock.json
`;

  const genericRule = `# Autonomous Performance Pipeline Directive

Enforce the 4-stage pipeline autonomously:
1. Virtual @: Read PROJECT_STATE.md on Turn 1 to anchor context. Deduce target files without blind scans.
2. Context Economy: Ignore node_modules, dist, build, and assets. Read targeted functions/lines for files >200 lines.
3. Single-Pass: Batch contiguous edits. Validate build/test once at the end. Ignore cosmetic linting warnings.
4. Living Memory: Append a 1-line update to PROJECT_STATE.md under Completed Milestones on task completion.
`;

  let isDotNet = options.isDotNet;
  if (isDotNet === undefined) {
    try {
      const rootFiles = fs.readdirSync(rootDir);
      isDotNet = rootFiles.some(f => f.endsWith('.sln') || f.endsWith('.csproj') || f === 'Program.cs');
    } catch {
      isDotNet = false;
    }
  }

  let finalIgnoreContent = agentIgnoreContent;
  let finalRule = genericRule;

  if (isDotNet) {
    finalIgnoreContent += `\n# .NET & Visual Studio Exclusions
[Bb]in/
[Oo]bj/
.vs/
TestResults/
*.user
*.suo
`;
    finalRule += `\n## 5. .NET Backend Engineering Directives
- Modern C# Idioms: Use file-scoped namespaces, primary constructors, pattern matching, and records for DTOs.
- Clean Architecture: Maintain separation of concerns (Controllers/Endpoints -> Application Services -> Domain & Data Access).
- Async Discipline: Always propagate CancellationToken and avoid sync-over-async (.Result or .Wait()).
- EF Core: Use AsNoTracking() for read queries and manage migrations carefully.
`;
  }

  const filesToWrite = [
    { name: '.agentignore', content: finalIgnoreContent },
    { name: 'AGENTS.md', content: finalRule },
    { name: 'CLAUDE.md', content: finalRule },
    { name: '.cursorrules', content: finalRule },
    { name: '.windsurfrules', content: finalRule }
  ];

  for (const item of filesToWrite) {
    const targetPath = path.join(rootDir, item.name);
    const exists = fs.existsSync(targetPath);

    if (exists && !force) {
      results.push({ file: item.name, status: 'SKIPPED (already exists)' });
      continue;
    }

    if (!dryRun) {
      fs.writeFileSync(targetPath, item.content, 'utf8');
    }
    results.push({ file: item.name, status: dryRun ? 'PLANNING (dry-run)' : 'CREATED' });
  }

  return results;
}
