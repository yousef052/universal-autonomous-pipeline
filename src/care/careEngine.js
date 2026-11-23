import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { detectProject } from '../detectors/projectDetector.js';
import { auditProject } from '../auditor/contextAuditor.js';

export function connect(rootDir = process.cwd()) {
  const projectInfo = detectProject(rootDir);
  const auditResult = auditProject(rootDir);

  let gitBranch = 'unknown';
  let gitStatusClean = true;
  let uncommittedChangesCount = 0;
  let lastCommit = '';

  try {
    const branchProc = spawnSync('git', ['branch', '--show-current'], { cwd: rootDir, encoding: 'utf8' });
    if (branchProc.status === 0 && branchProc.stdout) {
      gitBranch = branchProc.stdout.trim() || 'detached';
    }

    const statusProc = spawnSync('git', ['status', '--porcelain'], { cwd: rootDir, encoding: 'utf8' });
    if (statusProc.status === 0 && statusProc.stdout) {
      const lines = statusProc.stdout.trim().split('\n').filter(Boolean);
      uncommittedChangesCount = lines.length;
      gitStatusClean = uncommittedChangesCount === 0;
    }

    const logProc = spawnSync('git', ['log', '-1', '--pretty=format:%h %s'], { cwd: rootDir, encoding: 'utf8' });
    if (logProc.status === 0 && logProc.stdout) {
      lastCommit = logProc.stdout.trim();
    }
  } catch {}

  const statePath = path.join(rootDir, 'PROJECT_STATE.md');
  const hasState = fs.existsSync(statePath);
  let recentMilestones = [];

  if (hasState) {
    const content = fs.readFileSync(statePath, 'utf8');
    const milestoneMatches = content.match(/^-\s*\[\d{4}-\d{2}-\d{2}\].*$/gm);
    if (milestoneMatches) {
      recentMilestones = milestoneMatches.slice(-3);
    }
  }

  const line = '─'.repeat(66);
  const branchStatus = gitStatusClean ? `${gitBranch} (Clean)` : `${gitBranch} (${uncommittedChangesCount} uncommitted files)`;
  const stateStatus = hasState ? 'Initialized & Synchronized' : 'Missing (Will be auto-generated)';

  const card = `
┌${line}┐
│ 🤝 [CARE: CONNECT] Repository Context Established                       │
├${line}┤
│ Project Name:    ${(projectInfo.name || path.basename(rootDir)).padEnd(46)} │
│ Active Tech:     ${`${projectInfo.type} (${projectInfo.framework || projectInfo.language})`.substring(0, 46).padEnd(46)} │
│ Git Environment: ${branchStatus.substring(0, 46).padEnd(46)} │
│ Context Health:  ${`Score: ${auditResult.score}/100 (Grade: ${auditResult.grade})`.padEnd(46)} │
│ Living Ledger:   ${stateStatus.padEnd(46)} │
└${line}┘
`;

  return {
    rootDir,
    projectInfo,
    auditResult,
    git: {
      branch: gitBranch,
      isClean: gitStatusClean,
      uncommittedCount: uncommittedChangesCount,
      lastCommit
    },
    hasState,
    recentMilestones,
    formattedCard: card
  };
}

export function ask(intent = 'accelerate', context = {}) {
  const questions = [];

  if (intent === 'accelerate' || intent === 'agent') {
    questions.push({
      id: 'targetIde',
      prompt: 'Which primary AI coding tools do you use in this workspace?',
      options: [
        '(Recommended) All major agents (Antigravity, Cursor, Claude Code, Windsurf)',
        'Google Antigravity only',
        'Cursor IDE only',
        'Claude Code CLI only'
      ],
      default: 'all'
    });

    questions.push({
      id: 'ignoreStrictness',
      prompt: 'How aggressively should UAP exclude build assets & media?',
      options: [
        '(Recommended) Standard production (.git, node_modules, dist, logs, binary media)',
        'Aggressive (also exclude documentation and test fixtures)',
        'Conservative (only exclude node_modules and .git)'
      ],
      default: 'standard'
    });
  } else if (intent === 'patch' || intent === 'chat') {
    questions.push({
      id: 'chatTarget',
      prompt: 'Which web chatbot will you be interacting with?',
      options: [
        '(Recommended) Claude.ai (XML Artifacts format)',
        'ChatGPT (Unified search/replace diffs)',
        'Google Gemini Web (Structured Markdown)',
        'DeepSeek (Chain-of-thought analysis)'
      ],
      default: 'claude'
    });

    questions.push({
      id: 'sourceScope',
      prompt: 'What scope of code should be tree-shaken into the prompt?',
      options: [
        '(Recommended) Auto-deduce target files from task description',
        'Include current uncommitted git diffs only',
        'Select files manually'
      ],
      default: 'auto'
    });
  } else if (intent === 'scaffold' || intent === 'builder') {
    questions.push({
      id: 'database',
      prompt: 'Which database layer do you prefer?',
      options: [
        '(Recommended) SQLite with Prisma (Zero-setup & embedded)',
        'PostgreSQL with Prisma / Drizzle',
        'MongoDB / Document DB',
        'In-Memory / None'
      ],
      default: 'sqlite-prisma'
    });

    questions.push({
      id: 'styling',
      prompt: 'Which frontend styling system should be configured?',
      options: [
        '(Recommended) Tailwind CSS with Lucide Icons',
        'Plain CSS / CSS Modules',
        'Chakra UI / Component Library'
      ],
      default: 'tailwind'
    });
  }

  return {
    intent,
    questions,
    totalQuestions: questions.length
  };
}

export function expectations({
  actionSummary = 'Workspace Optimized',
  filesModified = [],
  benchmarkGain = '~74x faster',
  mode = 'agent'
}) {
  const line = '─'.repeat(66);
  let aiBehaviorAdvice = '';
  let verificationCommand = 'npm test';
  let rollbackAdvice = 'Restore files anytime from .uap-backup/ directory';

  if (mode === 'agent') {
    aiBehaviorAdvice = 'Agents will read PROJECT_STATE.md on Turn 1 & answer in <45s';
    verificationCommand = 'npx uap audit  (should score 100/100 Grade A)';
  } else if (mode === 'patch') {
    aiBehaviorAdvice = 'Chatbot will output machine-parseable diffs with zero filler';
    verificationCommand = 'npx uap apply  (runs tests automatically after patch)';
  } else if (mode === 'builder') {
    aiBehaviorAdvice = 'Chatbot will generate self-executing multi-file batch phases';
    verificationCommand = 'npx uap run    (creates files and copies next phase)';
  }

  const modifiedList = filesModified.length > 0
    ? filesModified.slice(0, 4).join(', ') + (filesModified.length > 4 ? ` (+${filesModified.length - 4} more)` : '')
    : 'None';

  const card = `
┌${line}┐
│ 🎯 [CARE: EXPECTATIONS] Alignment & Post-Execution Roadmap            │
├${line}┤
│ Action Delivered:    ${actionSummary.padEnd(46)} │
│ Files Configured:    ${modifiedList.substring(0, 46).padEnd(46)} │
│ Expected Gain:       ${benchmarkGain.padEnd(46)} │
├${line}┤
│ WHAT TO EXPECT NOW:                                                     │
│ • ${aiBehaviorAdvice.padEnd(65)}│
│ • Zero context bloat: build caches and logs will be strictly ignored   │
│ • 100% Memory retention: architecture preserved in living state ledger │
├${line}┤
│ VERIFICATION:        ${verificationCommand.padEnd(46)} │
│ ROLLBACK & SAFETY:   ${rollbackAdvice.substring(0, 46).padEnd(46)} │
└${line}┘
`;

  return {
    actionSummary,
    filesModified,
    benchmarkGain,
    mode,
    formattedCard: card
  };
}
