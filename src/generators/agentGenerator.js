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
bin/
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

  const filesToWrite = [
    { name: '.agentignore', content: agentIgnoreContent },
    { name: 'AGENTS.md', content: genericRule },
    { name: 'CLAUDE.md', content: genericRule },
    { name: '.cursorrules', content: genericRule },
    { name: '.windsurfrules', content: genericRule }
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
