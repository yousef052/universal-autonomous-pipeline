import fs from 'node:fs';
import path from 'node:path';
import { isSafePath } from '../safety/securityGuard.js';

const FILE_BLOCK_REGEX = /<<<FILE:\s*([^\r\n>]+)>>>([\s\S]*?)<<<END_FILE>>>/g;
const SEARCH_REPLACE_REGEX = /<<<<<<<\s*SEARCH([\s\S]*?)=======([\s\S]*?)>>>>>>>\s*REPLACE/g;
const CODE_FENCE_REGEX = /```[a-zA-Z0-9_-]*\r?\n([\s\S]*?)\r?\n```/;
const MARKDOWN_FALLBACK_REGEX = /```[a-zA-Z0-9_-]*\s*(?:\/\/|#|--)\s*(?:filepath:|file:)\s*([^\r\n]+)\r?\n([\s\S]*?)\r?\n```/g;

export function parsePatches(rawText = '') {
  const patches = [];
  if (!rawText) return patches;

  // Reset regex states
  FILE_BLOCK_REGEX.lastIndex = 0;
  let match;

  while ((match = FILE_BLOCK_REGEX.exec(rawText)) !== null) {
    const rawFilePath = match[1].trim();
    const blockContent = match[2];

    SEARCH_REPLACE_REGEX.lastIndex = 0;
    let srMatch;
    const diffs = [];

    while ((srMatch = SEARCH_REPLACE_REGEX.exec(blockContent)) !== null) {
      diffs.push({
        search: srMatch[1].replace(/^\r?\n/, '').replace(/\r?\n$/, ''),
        replace: srMatch[2].replace(/^\r?\n/, '').replace(/\r?\n$/, '')
      });
    }

    if (diffs.length > 0) {
      patches.push({
        file: rawFilePath,
        type: 'search_replace',
        diffs
      });
    } else {
      const codeFenceMatch = CODE_FENCE_REGEX.exec(blockContent);
      const content = codeFenceMatch ? codeFenceMatch[1] : blockContent.trim();
      patches.push({
        file: rawFilePath,
        type: 'full_file',
        content
      });
    }
  }

  // Fallback: Parse markdown code blocks with filepath comment
  if (patches.length === 0) {
    MARKDOWN_FALLBACK_REGEX.lastIndex = 0;
    while ((match = MARKDOWN_FALLBACK_REGEX.exec(rawText)) !== null) {
      patches.push({
        file: match[1].trim(),
        type: 'full_file',
        content: match[2]
      });
    }
  }

  return patches;
}

export function applyPatches(patches = [], rootDir = process.cwd(), options = {}) {
  const results = [];
  const dryRun = options.dryRun || false;
  const backup = options.backup !== false;
  const backupDir = path.join(rootDir, '.uap-backup', `${Date.now()}`);

  for (const patch of patches) {
    if (!isSafePath(rootDir, patch.file)) {
      results.push({
        file: patch.file,
        status: 'FAILED (Path traversal security violation)',
        changes: 0
      });
      continue;
    }
    const targetPath = path.resolve(rootDir, patch.file);
    const fileExists = fs.existsSync(targetPath);

    if (backup && fileExists && !dryRun) {
      const relPath = path.relative(rootDir, targetPath);
      const backupPath = path.join(backupDir, relPath);
      fs.mkdirSync(path.dirname(backupPath), { recursive: true });
      fs.copyFileSync(targetPath, backupPath);
    }

    if (patch.type === 'full_file') {
      if (!dryRun) {
        fs.mkdirSync(path.dirname(targetPath), { recursive: true });
        fs.writeFileSync(targetPath, patch.content, 'utf8');
      }
      results.push({
        file: patch.file,
        status: dryRun ? 'PLANNING (full_file)' : (fileExists ? 'MODIFIED' : 'CREATED'),
        changes: 1
      });
    } else if (patch.type === 'search_replace') {
      if (!fileExists) {
        results.push({
          file: patch.file,
          status: 'FAILED (file does not exist for search/replace)',
          changes: 0
        });
        continue;
      }

      let currentContent = fs.readFileSync(targetPath, 'utf8');
      let appliedCount = 0;
      let normalizedCurrent = null; // Lazy cached normalization

      for (const diff of patch.diffs) {
        if (currentContent.includes(diff.search)) {
          currentContent = currentContent.replace(diff.search, diff.replace);
          appliedCount++;
        } else {
          if (!normalizedCurrent) {
            normalizedCurrent = currentContent.replace(/\r\n/g, '\n');
          }
          const normalizedSearch = diff.search.replace(/\r\n/g, '\n');
          if (normalizedCurrent.includes(normalizedSearch)) {
            currentContent = normalizedCurrent.replace(normalizedSearch, diff.replace.replace(/\r\n/g, '\n'));
            appliedCount++;
            normalizedCurrent = null; // Invalidate cache after change
          }
        }
      }

      if (!dryRun && appliedCount > 0) {
        fs.writeFileSync(targetPath, currentContent, 'utf8');
      }

      results.push({
        file: patch.file,
        status: dryRun ? `PLANNING (${appliedCount}/${patch.diffs.length} diffs)` : (appliedCount > 0 ? 'PATCHED' : 'FAILED (diff search not matched)'),
        changes: appliedCount
      });
    }
  }

  return {
    results,
    backupDir: backup && !dryRun ? backupDir : null
  };
}
