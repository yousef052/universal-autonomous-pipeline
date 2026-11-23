import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { isSafePath, isSafeCommand } from '../safety/securityGuard.js';

const DISALLOWED_COMMAND_PATTERNS = [
  /rm\s+-rf\s+[\/\\]/i,
  /format\s+[a-z]:/i,
  /del\s+\/s\s+\/q\s+c:/i,
  /drop\s+database/i,
  /:(){ :|:& };:/
];

const PHASE_REGEX = /^PHASE:\s*([^\r\n]+)/m;
const MKDIR_REGEX = /^MKDIR:\s*([^\r\n]+)/gm;
const NEXT_PROMPT_REGEX = /NEXT_PROMPT:\s*([\s\S]*?)(?:<<<UAP_BATCH_END>>>|$)/;
const WRITE_REGEX = /WRITE:\s*([^\r\n]+)\r?\n([\s\S]*?)<<<END_WRITE>>>/g;
const EXEC_REGEX = /^EXEC:\s*([^\r\n]+)/gm;

export function parseBatch(rawText = '') {
  if (!rawText) return null;

  const startMarker = '<<<UAP_BATCH_START>>>';
  const endMarker = '<<<UAP_BATCH_END>>>';

  const startIndex = rawText.indexOf(startMarker);
  const endIndex = rawText.indexOf(endMarker);

  let batchBody = '';
  if (startIndex !== -1 && endIndex !== -1 && endIndex > startIndex) {
    batchBody = rawText.substring(startIndex + startMarker.length, endIndex).trim();
  } else {
    if (rawText.includes('WRITE:')) {
      batchBody = rawText.trim();
    } else {
      return null;
    }
  }

  const batch = {
    phase: '1/1',
    mkdirs: [],
    writes: [],
    execs: [],
    nextPrompt: ''
  };

  // 1. Extract PHASE
  const phaseMatch = PHASE_REGEX.exec(batchBody);
  if (phaseMatch) batch.phase = phaseMatch[1].trim();

  // 2. Extract MKDIR (deduplicated)
  MKDIR_REGEX.lastIndex = 0;
  let mMatch;
  const mkdirSet = new Set();
  while ((mMatch = MKDIR_REGEX.exec(batchBody)) !== null) {
    mkdirSet.add(mMatch[1].trim());
  }
  batch.mkdirs = Array.from(mkdirSet);

  // 3. Extract NEXT_PROMPT
  const nextMatch = NEXT_PROMPT_REGEX.exec(batchBody);
  if (nextMatch) {
    batch.nextPrompt = nextMatch[1].trim();
  }

  // 4. Extract WRITE
  WRITE_REGEX.lastIndex = 0;
  let wMatch;
  while ((wMatch = WRITE_REGEX.exec(batchBody)) !== null) {
    const filePath = wMatch[1].trim();
    const content = wMatch[2].replace(/^\r?\n/, '');
    batch.writes.push({
      file: filePath,
      content
    });
  }

  // 5. Extract EXEC
  EXEC_REGEX.lastIndex = 0;
  let eMatch;
  while ((eMatch = EXEC_REGEX.exec(batchBody)) !== null) {
    batch.execs.push(eMatch[1].trim());
  }

  return batch;
}

export function executeBatch(batch, rootDir = process.cwd(), options = {}) {
  const dryRun = options.dryRun || false;
  const skipExec = options.skipExec || false;

  const results = {
    phase: batch.phase,
    directoriesCreated: [],
    filesWritten: [],
    commandsExecuted: [],
    nextPrompt: batch.nextPrompt
  };

  // 1. Create directories
  for (const dir of batch.mkdirs) {
    if (!isSafePath(rootDir, dir)) {
      continue;
    }
    const targetDir = path.resolve(rootDir, dir);
    if (!dryRun) {
      fs.mkdirSync(targetDir, { recursive: true });
    }
    results.directoriesCreated.push(dir);
  }

  // 2. Write files
  for (const item of batch.writes) {
    if (!isSafePath(rootDir, item.file)) {
      results.filesWritten.push({
        file: item.file,
        bytes: 0,
        status: 'BLOCKED (Path traversal attempt)'
      });
      continue;
    }
    const targetFile = path.resolve(rootDir, item.file);
    if (!dryRun) {
      fs.mkdirSync(path.dirname(targetFile), { recursive: true });
      fs.writeFileSync(targetFile, item.content, 'utf8');
    }
    results.filesWritten.push({
      file: item.file,
      bytes: Buffer.byteLength(item.content, 'utf8')
    });
  }

  // 3. Execute safe commands
  if (!skipExec && !dryRun) {
    for (const cmd of batch.execs) {
      const check = isSafeCommand(cmd);
      if (!check.safe) {
        results.commandsExecuted.push({
          command: cmd,
          success: false,
          error: `Security guardrail blocked potentially unsafe command: ${check.reason || 'disallowed pattern'}`
        });
        continue;
      }

      try {
        const proc = spawnSync(cmd, {
          cwd: rootDir,
          shell: true,
          stdio: 'inherit'
        });
        results.commandsExecuted.push({
          command: cmd,
          success: proc.status === 0,
          code: proc.status
        });
      } catch (err) {
        results.commandsExecuted.push({
          command: cmd,
          success: false,
          error: err.message
        });
      }
    }
  }

  // 4. Update PROJECT_STATE.md milestone if not dryRun
  if (!dryRun && results.filesWritten.length > 0) {
    const statePath = path.join(rootDir, 'PROJECT_STATE.md');
    if (fs.existsSync(statePath)) {
      const today = new Date().toISOString().split('T')[0];
      const milestone = `\n- [${today}] Executed Phase ${batch.phase}: (${results.filesWritten.length} files created)`;
      fs.appendFileSync(statePath, milestone, 'utf8');
    }
  }

  return results;
}
