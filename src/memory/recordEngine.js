import fs from 'node:fs';
import path from 'node:path';
import { execSync } from 'node:child_process';

/**
 * Automatically captures git modified files safely.
 */
export function getChangedFiles(rootDir = process.cwd()) {
  try {
    const output = execSync('git status --porcelain', {
      cwd: rootDir,
      stdio: ['pipe', 'pipe', 'ignore'],
      encoding: 'utf-8'
    });

    if (!output || !output.trim()) {
      return [];
    }

    const files = [];
    const lines = output.trim().split('\n');
    for (const line of lines) {
      const match = line.match(/^.{2}\s+(.+)$/);
      if (match) {
        let filePath = match[1].trim();
        // Handle git rename: old -> new
        if (filePath.includes(' -> ')) {
          filePath = filePath.split(' -> ')[1].trim();
        }
        // Remove quotes if git quoted non-ascii or spaces
        filePath = filePath.replace(/^"(.*)"$/, '$1');
        files.push(filePath);
      }
    }
    return files;
  } catch {
    return [];
  }
}

/**
 * Appends a verified milestone entry to PROJECT_STATE.md adhering to Stage 4 UAP standards.
 */
export function recordMilestone(rootDir = process.cwd(), summary = '', explicitFiles = null) {
  if (!summary || !summary.trim()) {
    throw new Error('Milestone summary is required.');
  }

  const statePath = path.join(rootDir, 'PROJECT_STATE.md');
  if (!fs.existsSync(statePath)) {
    throw new Error(`PROJECT_STATE.md not found in ${rootDir}. Run 'uap init' first.`);
  }

  let filesList = [];
  if (Array.isArray(explicitFiles)) {
    filesList = explicitFiles.filter(Boolean);
  } else if (typeof explicitFiles === 'string' && explicitFiles.trim()) {
    filesList = explicitFiles.split(',').map(f => f.trim()).filter(Boolean);
  } else {
    filesList = getChangedFiles(rootDir);
  }

  const dateStr = new Date().toLocaleDateString('en-CA');
  const filesTag = filesList.length > 0 ? ` (${filesList.join(', ')})` : '';
  const milestoneLine = `- [${dateStr}] ${summary.trim()}${filesTag}`;

  let content = fs.readFileSync(statePath, 'utf-8');

  const milestoneHeaderRegex = /(##\s*4\.\s*Completed Milestones[^\n]*\n)/i;
  if (milestoneHeaderRegex.test(content)) {
    // Append directly under the section header or at the end
    // Check if there are existing entries
    content = content.replace(milestoneHeaderRegex, `$1${milestoneLine}\n`);
  } else {
    // If section 4 header is missing, append it at the bottom
    content += `\n## 4. Completed Milestones (Auto-Maintained)\n${milestoneLine}\n`;
  }

  fs.writeFileSync(statePath, content, 'utf-8');

  return {
    success: true,
    entry: milestoneLine,
    path: statePath,
    files: filesList
  };
}
