import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';

const DISALLOWED_COMMAND_PATTERNS = [
  /rm\s+-rf\s+[\/\\]/i,
  /format\s+[a-z]:/i,
  /del\s+\/s\s+\/q\s+c:/i,
  /drop\s+database/i,
  /:(){ :|:& };:/
];

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
    // If markers are missing but WRITE: exists, try parsing the whole string
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

  // 1. Extract PHASE:
  const phaseMatch = /^PHASE:\s*([^\r\n]+)/m.exec(batchBody);
  if (phaseMatch) batch.phase = phaseMatch[1].trim();

  // 2. Extract MKDIR:
  const mkdirRegex = /^MKDIR:\s*([^\r\n]+)/gm;
  let mMatch;
  while ((mMatch = mkdirRegex.exec(batchBody)) !== null) {
    batch.mkdirs.push(mMatch[1].trim());
  }

  // 3. Extract NEXT_PROMPT:
  const nextMatch = /NEXT_PROMPT:\s*([\s\S]*?)(?:<<<UAP_BATCH_END>>>|$)/.exec(batchBody);
  if (nextMatch) {
    batch.nextPrompt = nextMatch[1].trim();
  }

  // 4. Extract WRITE: <file> ... <<<END_WRITE>>>
  const writeRegex = /WRITE:\s*([^\r\n]+)\r?\n([\s\S]*?)<<<END_WRITE>>>/g;
  let wMatch;
  while ((wMatch = writeRegex.exec(batchBody)) !== null) {
    const filePath = wMatch[1].trim();
    const content = wMatch[2].replace(/^\r?\n/, ''); // trim leading newline only
    batch.writes.push({
      file: filePath,
      content
    });
  }

  // 5. Extract EXEC:
  const execRegex = /^EXEC:\s*([^\r\n]+)/gm;
  let eMatch;
  while ((eMatch = execRegex.exec(batchBody)) !== null) {
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
    const targetDir = path.resolve(rootDir, dir);
    if (!dryRun) {
      fs.mkdirSync(targetDir, { recursive: true });
    }
    results.directoriesCreated.push(dir);
  }

  // 2. Write files
  for (const item of batch.writes) {
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
      // Validate safety
      const isDangerous = DISALLOWED_COMMAND_PATTERNS.some(p => p.test(cmd));
      if (isDangerous) {
        results.commandsExecuted.push({
          command: cmd,
          success: false,
          error: 'Security guardrail blocked potentially unsafe command'
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
