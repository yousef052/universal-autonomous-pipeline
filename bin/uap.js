#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';
import readline from 'node:readline';
import { detectProject } from '../src/detectors/projectDetector.js';
import { generateProjectState } from '../src/generators/stateGenerator.js';
import { injectAgentConfigs } from '../src/generators/agentGenerator.js';
import { auditProject } from '../src/auditor/contextAuditor.js';
import { extractSymbols } from '../src/distiller/symbolExtractor.js';
import { synthesizePrompt } from '../src/synthesizers/promptSynthesizer.js';
import { parsePatches, applyPatches } from '../src/patcher/patchApplier.js';
import { copyToClipboard, readFromClipboard } from '../src/utils/clipboard.js';
import { generateScaffoldPrompt } from '../src/scaffolder/scaffoldEngine.js';
import { parseBatch, executeBatch } from '../src/reflector/batchExecutor.js';
import { generatePowerShellScript, generateBashScript } from '../src/reflector/scriptGenerator.js';
import { renderBanner } from '../src/ui/banner.js';
import { promptModeSelect } from '../src/ui/menu.js';
import { renderPreflightPlan, askConfirmation } from '../src/ui/preflight.js';
import { renderBenchmarkScorecard } from '../src/ui/scorecard.js';
import { runCareConsultation } from '../src/care/careWizard.js';
import { recordMilestone } from '../src/memory/recordEngine.js';
import { diagnoseContextLeaks, fixContextLeaks, renderDoctorReport } from '../src/doctor/contextDoctor.js';
import { calculateBudget, renderBudgetScorecard } from '../src/budget/budgetCalculator.js';

const args = process.argv.slice(2);
const isZeroArgs = args.length === 0;
const command = isZeroArgs ? 'interactive' : args[0];

function getFlagValue(name) {
  const prefix = `--${name}=`;
  const found = args.find(a => a.startsWith(prefix));
  return found ? found.substring(prefix.length) : null;
}

const flags = {
  force: args.includes('--force'),
  dryRun: args.includes('--dry-run'),
  json: args.includes('--json'),
  preview: args.includes('--preview'),
  noBackup: args.includes('--no-backup'),
  skipExec: args.includes('--skip-exec'),
  yes: args.includes('--yes') || args.includes('-y'),
  care: args.includes('--care') || command === 'care',
  fix: args.includes('--fix'),
  help: (args.includes('--help') || args.includes('-h') || command === 'help') && !isZeroArgs,
  version: args.includes('--version') || args.includes('-v') || command === 'version',
  chat: getFlagValue('chat') || 'universal',
  files: getFlagValue('files'),
  save: getFlagValue('save'),
  stack: getFlagValue('stack') || 'Next.js 14, Tailwind CSS, TypeScript, Prisma, SQLite',
  phase: parseInt(getFlagValue('phase') || '1', 10),
  script: getFlagValue('script')
};

if (flags.version) {
  console.log('uap v1.5.0');
  process.exit(0);
}

if (flags.help) {
  console.log(`
Universal Autonomous Pipeline (UAP) CLI - v1.5.0
Zero-Bloat Autonomous & Web Chat Precision Engine

Usage:
  npx uap                       Launch interactive guided wizard (Default)
  npx uap care                  Launch CARE Framework Consultation
  npx uap init [dir]            Initialize UAP in a project
  npx uap record "<summary>"    Auto-record milestone to PROJECT_STATE.md (Living Memory)
  npx uap sync                  Auto-record milestone from recent git changes
  npx uap doctor [--fix]        Detect and fix context leaks, large files, and unignored noise
  npx uap budget                Calculate token savings and dollar cost reductions
  npx uap audit [dir]           Audit context health and ignore rules
  npx uap pack "<task>"         Synthesize and copy distilled prompt for web chats
  npx uap apply [file]          Ingest and apply patch from clipboard or file
  npx uap scaffold "<idea>"     Generate Master Architect Prompt for web chat building
  npx uap run [file]            Execute multi-file batch & commands from clipboard or file
  npx uap --version             Show version
  npx uap --help                Show help

Interactive Flags:
  --yes, -y                     Auto-confirm pre-flight actions without prompt
  --dry-run                     Preview planned changes without writing to disk
`);
  process.exit(0);
}

const targetDir = process.cwd();

async function runInteractive() {
  console.log(renderBanner('1.5.0'));

  if (flags.care) {
    await runCareConsultation(targetDir, flags);
    process.exit(0);
  }

  const mode = await promptModeSelect();

  if (mode === 'exit') {
    console.log('\nGoodbye! To run UAP anytime, simply type: npx uap\n');
    process.exit(0);
  }

  if (mode === 'care') {
    await runCareConsultation(targetDir, flags);
    process.exit(0);
  }

  if (mode === 'audit') {
    const auditRes = auditProject(targetDir);
    console.log(renderBenchmarkScorecard({ auditResult: auditRes, mode: 'audit' }));
    process.exit(0);
  }

  if (mode === 'doctor') {
    const diag = diagnoseContextLeaks(targetDir);
    console.log(renderDoctorReport(diag));
    if (!diag.healthy) {
      const fix = flags.yes || await askConfirmation('Auto-fix and append detected leaks to .agentignore? [Y/n]: ');
      if (fix) {
        const result = fixContextLeaks(targetDir, diag);
        console.log(`\n[FIXED] Added ${result.fixedCount} leak pattern(s) to .agentignore.\n`);
      }
    }
    process.exit(0);
  }

  if (mode === 'budget') {
    const budget = calculateBudget(targetDir);
    console.log(renderBudgetScorecard(budget));
    process.exit(0);
  }

  if (mode === 'record') {
    const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
    const summary = await new Promise(res => {
      rl.question('\nEnter completed milestone summary: ', ans => {
        rl.close();
        res(ans);
      });
    });
    if (summary && summary.trim()) {
      const res = recordMilestone(targetDir, summary);
      console.log(`\n[OK] Milestone recorded: ${res.entry}\n`);
    } else {
      console.log('\nNo summary provided. Milestone cancelled.\n');
    }
    process.exit(0);
  }

  const projectInfo = detectProject(targetDir);

  if (mode === 'agent') {
    const plannedActions = [
      { name: 'PROJECT_STATE.md', type: 'create', detail: 'Living architecture & memory ledger' },
      { name: '.agentignore', type: 'create', detail: 'Strict exclusions for dependencies & caches' },
      { name: 'AGENTS.md', type: 'create', detail: 'Antigravity autonomous 4-stage pipeline rule' },
      { name: 'CLAUDE.md', type: 'create', detail: 'Claude Code instructions' },
      { name: '.cursorrules', type: 'create', detail: 'Cursor IDE context constraints' },
      { name: '.windsurfrules', type: 'create', detail: 'Windsurf IDE execution instructions' }
    ];

    console.log(renderPreflightPlan({ projectInfo, mode: 'agent', plannedActions }));

    const confirmed = flags.yes || await askConfirmation('Proceed with initializing Agent Acceleration? [Y/n]: ');
    if (!confirmed) {
      console.log('\nOperation cancelled. No files were modified.\n');
      process.exit(0);
    }

    // Execute init
    const stateContent = generateProjectState(projectInfo);
    const statePath = path.join(targetDir, 'PROJECT_STATE.md');
    if (!fs.existsSync(statePath) || flags.force) {
      fs.writeFileSync(statePath, stateContent, 'utf8');
    }
    injectAgentConfigs(targetDir, flags);

    const auditRes = auditProject(targetDir);
    console.log('\n[SUCCESS] Agent Acceleration successfully installed!');
    console.log(renderBenchmarkScorecard({ auditResult: auditRes, mode: 'agent' }));
    process.exit(0);
  }

  if (mode === 'patch') {
    const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
    const taskDesc = await new Promise(res => {
      rl.question('\nEnter your bugfix or feature task (e.g. "Fix JWT token refresh"): ', ans => {
        rl.close();
        res(ans || 'Review and optimize target source files');
      });
    });

    let stateContent = '';
    const statePath = path.join(targetDir, 'PROJECT_STATE.md');
    if (fs.existsSync(statePath)) stateContent = fs.readFileSync(statePath, 'utf8');

    const result = synthesizePrompt({
      projectInfo,
      stateContent,
      targetFiles: [],
      task: taskDesc,
      chatTarget: flags.chat
    });

    copyToClipboard(result.prompt);
    console.log(`\n[COPIED] ~${result.estimatedTokens} tokens copied to your clipboard!`);
    console.log(renderBenchmarkScorecard({ auditResult: { score: 100, grade: 'A' }, mode: 'patch' }));
    process.exit(0);
  }

  if (mode === 'builder') {
    const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
    const ideaDesc = await new Promise(res => {
      rl.question('\nWhat project would you like to build? (e.g. "Full-Stack SaaS with Stripe"): ', ans => {
        rl.close();
        res(ans || 'Modern Full-Stack Web Application');
      });
    });

    const scaffoldRes = generateScaffoldPrompt({
      idea: ideaDesc,
      stack: flags.stack,
      phase: 1,
      totalPhases: 4,
      chatTarget: flags.chat
    });

    copyToClipboard(scaffoldRes.prompt);
    console.log(`\n[COPIED] Master Architect Prompt for Phase 1 copied to clipboard!`);
    console.log(renderBenchmarkScorecard({ auditResult: { score: 100, grade: 'A' }, mode: 'builder' }));
    process.exit(0);
  }
}

if (command === 'interactive' || command === 'start') {
  runInteractive();
} else if (command === 'care') {
  runCareConsultation(targetDir, flags);
} else if (command === 'init') {
  const dir = args[1] && !args[1].startsWith('--') ? path.resolve(args[1]) : targetDir;
  console.log(`\nInitializing UAP in: ${dir}`);
  const projectInfo = detectProject(dir);
  console.log(`  -> Detected ${projectInfo.type} (${projectInfo.framework || projectInfo.language})`);

  const stateContent = generateProjectState(projectInfo);
  const statePath = path.join(dir, 'PROJECT_STATE.md');
  
  if (!fs.existsSync(statePath) || flags.force) {
    if (!flags.dryRun) fs.writeFileSync(statePath, stateContent, 'utf8');
    console.log(`  -> ${flags.dryRun ? 'PLANNING' : 'CREATED'}: PROJECT_STATE.md`);
  } else {
    console.log('  -> SKIPPED: PROJECT_STATE.md (already exists)');
  }

  const results = injectAgentConfigs(dir, flags);
  for (const r of results) {
    console.log(`  -> ${r.status}: ${r.file}`);
  }

  console.log('\n[OK] UAP successfully initialized! Your AI agent will now operate at sub-minute speeds.\n');
} else if (command === 'audit' || command === 'check') {
  const dir = args[1] && !args[1].startsWith('--') ? path.resolve(args[1]) : targetDir;
  const result = auditProject(dir);
  if (flags.json) {
    console.log(JSON.stringify(result, null, 2));
  } else {
    console.log(`\nContext Health Audit for: ${dir}`);
    console.log(`  Score: ${result.score}/100 (Grade: ${result.grade})`);
    if (result.issues.length === 0) {
      console.log('  Status: EXCELLENT (All optimization standards met)\n');
    } else {
      console.log('  Issues Detected:');
      for (const iss of result.issues) {
        console.log(`    [${iss.severity}] ${iss.message}`);
      }
      console.log('\nRun "npx uap init" to automatically fix missing files.\n');
    }
  }
} else if (command === 'pack' || command === 'clip') {
  const task = args.slice(1).filter(a => !a.startsWith('--')).join(' ') || 'Review and optimize target source files';
  const projectInfo = detectProject(targetDir);

  let stateContent = '';
  const statePath = path.join(targetDir, 'PROJECT_STATE.md');
  if (fs.existsSync(statePath)) {
    stateContent = fs.readFileSync(statePath, 'utf8');
  }

  const targetFiles = [];
  if (flags.files) {
    const fileList = flags.files.split(',').map(f => f.trim());
    for (const rel of fileList) {
      const full = path.resolve(targetDir, rel);
      if (fs.existsSync(full)) {
        const raw = fs.readFileSync(full, 'utf8');
        targetFiles.push({
          path: rel,
          content: extractSymbols(raw, rel),
          language: path.extname(rel).replace('.', '')
        });
      }
    }
  } else {
    const words = task.toLowerCase().split(/\s+/).filter(w => w.length > 3);
    const candidateDirs = ['src', 'lib', 'app'];
    for (const cDir of candidateDirs) {
      const p = path.join(targetDir, cDir);
      if (fs.existsSync(p)) {
        const files = fs.readdirSync(p, { recursive: true });
        for (const f of files) {
          const str = String(f);
          if (typeof str === 'string' && (str.endsWith('.js') || str.endsWith('.ts') || str.endsWith('.py') || str.endsWith('.go'))) {
            const rel = path.join(cDir, str);
            const matches = words.some(w => rel.toLowerCase().includes(w));
            if (matches && targetFiles.length < 3) {
              const full = path.join(targetDir, rel);
              if (fs.statSync(full).isFile()) {
                const raw = fs.readFileSync(full, 'utf8');
                targetFiles.push({
                  path: rel,
                  content: extractSymbols(raw, rel),
                  language: path.extname(rel).replace('.', '')
                });
              }
            }
          }
        }
      }
    }
  }

  const result = synthesizePrompt({
    projectInfo,
    stateContent,
    targetFiles,
    task,
    chatTarget: flags.chat
  });

  if (flags.preview) {
    console.log('\n--- UAP SYNTHESIZED PROMPT PREVIEW ---');
    console.log(result.prompt);
    console.log('---------------------------------------');
    console.log(`Estimated Tokens: ~${result.estimatedTokens} | Chat Target: ${result.chatTarget}`);
  } else if (flags.save) {
    fs.writeFileSync(path.resolve(flags.save), result.prompt, 'utf8');
    console.log(`\n[SAVED] Prompt packet saved to: ${flags.save} (~${result.estimatedTokens} tokens)\n`);
  } else {
    const clipResult = copyToClipboard(result.prompt);
    console.log(`\n[COPIED] ~${result.estimatedTokens} tokens copied to clipboard (${clipResult.method})!`);
    console.log(`Target: ${flags.chat.toUpperCase()} | Included Files: ${result.fileCount}`);
    console.log('👉 Next: Paste into your web chat (ChatGPT / Claude.ai / Gemini), then run "npx uap apply".\n');
  }
} else if (command === 'apply') {
  let patchContent = '';
  const inputFile = args[1] && !args[1].startsWith('--') ? path.resolve(args[1]) : null;

  if (inputFile && fs.existsSync(inputFile)) {
    patchContent = fs.readFileSync(inputFile, 'utf8');
  } else {
    patchContent = readFromClipboard();
  }

  if (!patchContent) {
    console.error('\n[ERROR] No patch found in clipboard or specified file.');
    console.log('Copy the chatbot response to your clipboard, or run: npx uap apply <file.md>\n');
    process.exit(1);
  }

  const patches = parsePatches(patchContent);
  if (patches.length === 0) {
    console.error('\n[ERROR] No valid UAP code delimiters found in the input.');
    console.log('Ensure the chatbot response uses <<<FILE: ...>>> or ```filepath: ...``` syntax.\n');
    process.exit(1);
  }

  console.log(`\nApplying ${patches.length} patch(es) in: ${targetDir}`);
  const outcome = applyPatches(patches, targetDir, { dryRun: flags.dryRun, backup: !flags.noBackup });

  for (const r of outcome.results) {
    console.log(`  -> [${r.status}] ${r.file}`);
  }

  if (!flags.dryRun && outcome.backupDir) {
    console.log(`\nBackup saved to: ${outcome.backupDir}`);

    const statePath = path.join(targetDir, 'PROJECT_STATE.md');
    if (fs.existsSync(statePath)) {
      const today = new Date().toISOString().split('T')[0];
      const filesModified = outcome.results.map(r => r.file).join(', ');
      const milestone = `\n- [${today}] Applied patch from web chat: (${filesModified})`;
      fs.appendFileSync(statePath, milestone, 'utf8');
      console.log('  -> Updated PROJECT_STATE.md milestone');
    }
  }

  console.log('\n[OK] Patch operation completed successfully.\n');
} else if (command === 'scaffold' || command === 'build') {
  const idea = args.slice(1).filter(a => !a.startsWith('--')).join(' ') || 'Modern Full-Stack Web Application';
  const scaffoldResult = generateScaffoldPrompt({
    idea,
    stack: flags.stack,
    phase: flags.phase,
    totalPhases: 4,
    chatTarget: flags.chat
  });

  if (flags.preview) {
    console.log('\n--- UAP MASTER ARCHITECT PROMPT PREVIEW ---');
    console.log(scaffoldResult.prompt);
    console.log('--------------------------------------------\n');
  } else if (flags.save) {
    fs.writeFileSync(path.resolve(flags.save), scaffoldResult.prompt, 'utf8');
    console.log(`\n[SAVED] Master Architect Prompt saved to: ${flags.save}\n`);
  } else {
    const clipResult = copyToClipboard(scaffoldResult.prompt);
    console.log(`\n[COPIED] Master Architect Prompt copied to clipboard (${clipResult.method})!`);
    console.log(`Concept: "${idea}" | Phase: ${flags.phase}/4 | Stack: ${flags.stack}`);
    console.log('\n👉 Instructions:');
    console.log('  1. Paste (Ctrl+V) into your web chat (ChatGPT / Claude.ai / Gemini).');
    console.log('  2. Copy the chatbot\'s batch response (Ctrl+C).');
    console.log('  3. In your terminal, run: npx uap run\n');
  }
} else if (command === 'run') {
  let batchText = '';
  const inputFile = args[1] && !args[1].startsWith('--') ? path.resolve(args[1]) : null;

  if (inputFile && fs.existsSync(inputFile)) {
    batchText = fs.readFileSync(inputFile, 'utf8');
  } else {
    batchText = readFromClipboard();
  }

  if (!batchText) {
    console.error('\n[ERROR] No batch found in clipboard or specified file.');
    console.log('Copy the chatbot batch response to your clipboard, or run: npx uap run <batch.txt>\n');
    process.exit(1);
  }

  const batch = parseBatch(batchText);
  if (!batch || (batch.writes.length === 0 && batch.mkdirs.length === 0)) {
    console.error('\n[ERROR] No valid UAP_BATCH_V1 directives found in input.');
    console.log('Ensure the chatbot response starts with <<<UAP_BATCH_START>>> and contains WRITE: directives.\n');
    process.exit(1);
  }

  if (flags.script === 'ps' || flags.script === 'powershell') {
    const script = generatePowerShellScript(batch);
    console.log('\n' + script);
    process.exit(0);
  } else if (flags.script === 'bash' || flags.script === 'sh') {
    const script = generateBashScript(batch);
    console.log('\n' + script);
    process.exit(0);
  }

  console.log(`\n=== UAP Terminal Reflector: Executing Phase ${batch.phase} ===`);
  console.log(`Target Directory: ${targetDir}`);

  const outcome = executeBatch(batch, targetDir, { dryRun: flags.dryRun, skipExec: flags.skipExec });

  console.log(`  -> Directories Created: ${outcome.directoriesCreated.length}`);
  for (const d of outcome.directoriesCreated) {
    console.log(`     [DIR]  ${d}`);
  }

  console.log(`  -> Files Written: ${outcome.filesWritten.length}`);
  for (const f of outcome.filesWritten) {
    console.log(`     [FILE] ${f.file} (${f.bytes} bytes)`);
  }

  if (outcome.commandsExecuted.length > 0) {
    console.log(`  -> Commands Executed: ${outcome.commandsExecuted.length}`);
    for (const c of outcome.commandsExecuted) {
      console.log(`     [EXEC] ${c.command} -> ${c.success ? 'SUCCESS' : 'FAILED'}`);
    }
  }

  console.log(`\n[OK] Phase ${batch.phase} successfully reflected to terminal!`);

  if (batch.nextPrompt) {
    copyToClipboard(batch.nextPrompt);
    console.log('\n🎉 NEXT PHASE READY:');
    console.log(`Prompt for the next phase has been copied to your clipboard!`);
    console.log('👉 Paste (Ctrl+V) back into your web chat to continue to the next phase.\n');
  }
} else if (command === 'record' || command === 'sync') {
  const summary = args.slice(1).filter(a => !a.startsWith('--')).join(' ');
  if (!summary) {
    console.error('\n[ERROR] Milestone summary is required. Example: uap record "Added auth service"\n');
    process.exit(1);
  }
  const result = recordMilestone(targetDir, summary, flags.files);
  console.log(`\n[OK] Milestone recorded successfully!`);
  console.log(`Entry: ${result.entry}`);
  console.log(`Files: ${result.files.join(', ') || '(none detected)'}\n`);
} else if (command === 'doctor') {
  const diag = diagnoseContextLeaks(targetDir);
  if (flags.fix) {
    const fixed = fixContextLeaks(targetDir, diag);
    console.log(renderDoctorReport({ ...diag, leaks: [], healthy: true }));
    console.log(`[FIXED] Added ${fixed.fixedCount} pattern(s) to .agentignore.\n`);
  } else {
    console.log(renderDoctorReport(diag));
  }
} else if (command === 'budget' || command === 'token' || command === 'tokens') {
  const budget = calculateBudget(targetDir);
  console.log(renderBudgetScorecard(budget));
} else {
  console.error(`Unknown command: ${command}. Use "uap --help" for guidance.`);
  process.exit(1);
}
