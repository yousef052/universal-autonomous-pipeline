import fs from 'node:fs';
import path from 'node:path';

const DEFAULT_IGNORED_DIRS = new Set([
  '.git',
  'node_modules',
  'dist',
  'build',
  '.next',
  '.turbo',
  '.uap-backup',
  'coverage',
  '.venv',
  '__pycache__',
  'vendor'
]);

const SENSITIVE_PATTERNS = [/^\.env(\..+)?$/i, /^id_rsa/i, /\.pem$/i, /\.key$/i];
const DATABASE_EXTENSIONS = new Set(['.sqlite', '.sqlite3', '.db', '.rdb']);
const LOG_EXTENSIONS = new Set(['.log']);
const BINARY_EXTENSIONS = new Set(['.zip', '.tar', '.gz', '.mp4', '.avi', '.mov', '.pdf']);

export function loadIgnoreRules(rootDir = process.cwd()) {
  const ignorePath = path.join(rootDir, '.agentignore');
  if (!fs.existsSync(ignorePath)) {
    return new Set();
  }
  const content = fs.readFileSync(ignorePath, 'utf-8');
  const rules = content
    .split('\n')
    .map(line => line.trim())
    .filter(line => line && !line.startsWith('#'));
  return new Set(rules);
}

export function isPatternIgnored(relPath, ignoreRules) {
  const normalized = relPath.replace(/\\/g, '/');
  const baseName = path.basename(relPath);

  for (const rule of ignoreRules) {
    const cleanRule = rule.replace(/^\//, '').replace(/\/$/, '');
    if (normalized === cleanRule || normalized.startsWith(cleanRule + '/')) {
      return true;
    }
    if (baseName === cleanRule) {
      return true;
    }
    if (cleanRule.startsWith('*.') && baseName.endsWith(cleanRule.slice(1))) {
      return true;
    }
    if (cleanRule.endsWith('*') && baseName.startsWith(cleanRule.slice(0, -1))) {
      return true;
    }
  }
  return false;
}

export function diagnoseContextLeaks(rootDir = process.cwd(), options = {}) {
  const maxFileSize = options.maxFileSize || 150 * 1024; // 150 KB
  const ignoreRules = loadIgnoreRules(rootDir);
  const leaks = [];
  let filesScanned = 0;

  function walk(currentDir) {
    let entries;
    try {
      entries = fs.readdirSync(currentDir, { withFileTypes: true });
    } catch {
      return;
    }

    for (const entry of entries) {
      const name = entry.name;
      const fullPath = path.join(currentDir, name);
      const relPath = path.relative(rootDir, fullPath);

      if (entry.isDirectory()) {
        if (DEFAULT_IGNORED_DIRS.has(name) || isPatternIgnored(relPath, ignoreRules)) {
          continue;
        }
        walk(fullPath);
      } else if (entry.isFile()) {
        filesScanned++;

        if (isPatternIgnored(relPath, ignoreRules)) {
          continue;
        }

        let stat;
        try {
          stat = fs.statSync(fullPath);
        } catch {
          continue;
        }

        const ext = path.extname(name).toLowerCase();
        const sizeKb = (stat.size / 1024).toFixed(1);

        // 1. Sensitive Env Leaks
        if (SENSITIVE_PATTERNS.some(re => re.test(name))) {
          leaks.push({
            type: 'SENSITIVE_ENV',
            file: relPath.replace(/\\/g, '/'),
            sizeKb,
            message: 'Sensitive environment/credential file detected without ignore rule.'
          });
          continue;
        }

        // 2. Database Leaks
        if (DATABASE_EXTENSIONS.has(ext)) {
          leaks.push({
            type: 'DATABASE',
            file: relPath.replace(/\\/g, '/'),
            sizeKb,
            message: 'Database storage file will bloat token context and leak binary noise.'
          });
          continue;
        }

        // 3. Log Leaks
        if (LOG_EXTENSIONS.has(ext) || name.startsWith('npm-debug.log')) {
          leaks.push({
            type: 'LOG_FILE',
            file: relPath.replace(/\\/g, '/'),
            sizeKb,
            message: 'Runtime log file contains verbose traces that pollute agent memory.'
          });
          continue;
        }

        // 4. Binary / Archive Leaks
        if (BINARY_EXTENSIONS.has(ext) && stat.size > 50 * 1024) {
          leaks.push({
            type: 'BINARY_ASSET',
            file: relPath.replace(/\\/g, '/'),
            sizeKb,
            message: 'Large archive or binary media asset not excluded from context.'
          });
          continue;
        }

        // 5. Large File Bloat
        if (stat.size > maxFileSize) {
          leaks.push({
            type: 'LARGE_FILE',
            file: relPath.replace(/\\/g, '/'),
            sizeKb,
            message: `Large file (${sizeKb} KB) exceeds the 150KB context threshold.`
          });
        }
      }
    }
  }

  walk(rootDir);

  const suggestedIgnoreEntries = Array.from(new Set(
    leaks.map(l => {
      const ext = path.extname(l.file);
      if (l.type === 'LOG_FILE') return '*.log';
      if (l.type === 'DATABASE') return `*${ext}`;
      if (l.type === 'SENSITIVE_ENV') return '.env*';
      return l.file;
    })
  ));

  return {
    rootDir,
    healthy: leaks.length === 0,
    filesScanned,
    leaks,
    suggestedIgnoreEntries
  };
}

export function fixContextLeaks(rootDir = process.cwd(), diagnosis = null) {
  const diag = diagnosis || diagnoseContextLeaks(rootDir);
  if (diag.suggestedIgnoreEntries.length === 0) {
    return { fixedCount: 0, entriesAdded: [] };
  }

  const ignorePath = path.join(rootDir, '.agentignore');
  let currentContent = fs.existsSync(ignorePath) ? fs.readFileSync(ignorePath, 'utf-8') : '';

  const entriesToAdd = [];
  for (const entry of diag.suggestedIgnoreEntries) {
    if (!currentContent.includes(entry)) {
      entriesToAdd.push(entry);
    }
  }

  if (entriesToAdd.length > 0) {
    const banner = '\n# Added by UAP Context Doctor\n';
    const newContent = (currentContent.trim() ? currentContent.trim() + '\n' : '') + banner + entriesToAdd.join('\n') + '\n';
    fs.writeFileSync(ignorePath, newContent, 'utf-8');
  }

  return {
    fixedCount: entriesToAdd.length,
    entriesAdded: entriesToAdd
  };
}

export function renderDoctorReport(diagnosis) {
  const line = '─'.repeat(64);
  const status = diagnosis.healthy
    ? 'CLEAN & HEALTHY (0 context leaks detected)'
    : `WARNING: ${diagnosis.leaks.length} context leak(s) found`;

  let details = '';
  if (diagnosis.healthy) {
    details = [
      '│   [✓] No sensitive credentials or .env files exposed           │',
      '│   [✓] No runtime logs (*.log) polluting context                │',
      '│   [✓] No binary databases or uncompressed archives detected    │',
      '│   [✓] All source files within 150KB context threshold          │'
    ].join('\n');
  } else {
    details = diagnosis.leaks.slice(0, 6).map(l => {
      const tag = `[!] ${l.type}: ${l.file}`;
      return `│   ${tag.substring(0, 56).padEnd(56)} │\n│       ${`Size: ${l.sizeKb} KB - ${l.message}`.substring(0, 54).padEnd(54)} │`;
    }).join('\n');

    if (diagnosis.leaks.length > 6) {
      details += `\n│   ... and ${diagnosis.leaks.length - 6} more leaks. Run 'uap doctor --fix' to resolve.│`;
    }
  }

  return `
┌${line}┐
│ 🩺 UAP CONTEXT LEAK DOCTOR REPORT                              │
├${line}┤
│ Status:       ${status.padEnd(48)} │
│ Files Scanned:${String(diagnosis.filesScanned).padEnd(48)} │
├${line}┤
│ DIAGNOSIS:                                                     │
${details}
├${line}┤
│ Action:       ${(diagnosis.healthy ? 'Context is optimized for high-speed agent prompts' : 'Run "uap doctor --fix" to automatically ignore leaks').padEnd(48)} │
└${line}┘
`;
}
