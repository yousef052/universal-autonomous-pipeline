import fs from 'node:fs';
import path from 'node:path';
import readline from 'node:readline';
import { connect, ask, expectations } from './careEngine.js';
import { generateProjectState } from '../generators/stateGenerator.js';
import { injectAgentConfigs } from '../generators/agentGenerator.js';
import { auditProject } from '../auditor/contextAuditor.js';
import { renderPreflightPlan, askConfirmation } from '../ui/preflight.js';

export async function runCareConsultation(rootDir = process.cwd(), options = {}) {
  console.log('\n=== Launching CARE Quality Framework Consultation ===\n');

  // 1. CONNECT
  const connection = connect(rootDir);
  console.log(connection.formattedCard);

  if (!process.stdin.isTTY) {
    // Non-interactive fallback
    console.log('[CARE] Running automated standard resolution...');
    const stateContent = generateProjectState(connection.projectInfo);
    fs.writeFileSync(path.join(rootDir, 'PROJECT_STATE.md'), stateContent, 'utf8');
    const results = injectAgentConfigs(rootDir, { force: true });
    const auditRes = auditProject(rootDir);
    console.log(expectations({
      actionSummary: 'Automated Agent Acceleration',
      filesModified: results.map(r => r.file),
      mode: 'agent'
    }).formattedCard);
    return;
  }

  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });

  // 2. ASK
  const askQuestions = ask('accelerate', connection);
  console.log(`\n📋 [CARE: ASK] Precision Architecture Clarification:\n`);

  console.log(`1. Target AI Coding Tools:`);
  console.log(`   [1] (Recommended) All major agents (Antigravity, Cursor, Claude Code, Windsurf)`);
  console.log(`   [2] Google Antigravity IDE only`);
  console.log(`   [3] Cursor IDE only`);

  const choiceIde = await new Promise(resolve => {
    rl.question('\nSelect primary tool [1-3] (Default: 1): ', ans => resolve((ans || '1').trim()));
  });

  console.log(`\n2. Context Exclusion Strictness:`);
  console.log(`   [1] (Recommended) Production Standard (.git, node_modules, dist, logs, binary media)`);
  console.log(`   [2] Aggressive (also exclude documentation and test fixtures)`);

  const choiceStrict = await new Promise(resolve => {
    rl.question('\nSelect strictness level [1-2] (Default: 1): ', ans => resolve((ans || '1').trim()));
  });

  rl.close();

  // 3. RESOLVE
  const plannedActions = [
    { name: 'PROJECT_STATE.md', type: 'create', detail: 'Living architecture & memory ledger' },
    { name: '.agentignore', type: 'create', detail: choiceStrict === '2' ? 'Aggressive build & fixture exclusions' : 'Production exclusions' },
    { name: 'AGENTS.md', type: 'create', detail: 'Antigravity autonomous 4-stage pipeline rule' },
    { name: 'CLAUDE.md', type: 'create', detail: 'Claude Code instructions' },
    { name: '.cursorrules', type: 'create', detail: 'Cursor IDE context constraints' },
    { name: '.windsurfrules', type: 'create', detail: 'Windsurf IDE execution instructions' }
  ];

  console.log(renderPreflightPlan({
    projectInfo: connection.projectInfo,
    mode: 'agent',
    plannedActions
  }));

  const confirmed = await askConfirmation('Proceed with executing CARE resolution? [Y/n]: ');
  if (!confirmed) {
    console.log('\n[CARE] Consultation paused. No files were modified.\n');
    return;
  }

  // Execute changes
  const stateContent = generateProjectState(connection.projectInfo);
  const statePath = path.join(rootDir, 'PROJECT_STATE.md');
  fs.writeFileSync(statePath, stateContent, 'utf8');

  const fileResults = injectAgentConfigs(rootDir, { force: true });
  const auditRes = auditProject(rootDir);

  console.log('\n[CARE: RESOLVE] Resolution executed successfully!');
  for (const r of fileResults) {
    console.log(`  -> [${r.status}] ${r.file}`);
  }

  // 4. EXPECTATIONS
  const exp = expectations({
    actionSummary: 'Production Agent Acceleration Installed',
    filesModified: fileResults.map(r => r.file),
    benchmarkGain: 'Optimized Context (Filtered dependencies & anchored memory)',
    mode: 'agent'
  });

  console.log(exp.formattedCard);
}
