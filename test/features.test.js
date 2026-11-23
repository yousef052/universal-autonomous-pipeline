import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { recordMilestone, getChangedFiles } from '../src/memory/recordEngine.js';
import { diagnoseContextLeaks, fixContextLeaks, renderDoctorReport } from '../src/doctor/contextDoctor.js';
import { calculateBudget, renderBudgetScorecard } from '../src/budget/budgetCalculator.js';

test('recordMilestone appends formatted entry with date to PROJECT_STATE.md', () => {
  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'uap-rec-test-'));
  const statePath = path.join(tmpDir, 'PROJECT_STATE.md');
  fs.writeFileSync(statePath, '# Project State\n\n## 4. Completed Milestones (Auto-Maintained)\n- [2026-01-01] Old milestone\n');

  const res = recordMilestone(tmpDir, 'Implemented user authentication module', ['src/auth.js', 'test/auth.test.js']);

  assert.ok(res.success);
  assert.ok(res.entry.includes('Implemented user authentication module'));
  assert.ok(res.entry.includes('src/auth.js, test/auth.test.js'));

  const updatedContent = fs.readFileSync(statePath, 'utf-8');
  assert.ok(updatedContent.includes('Implemented user authentication module'));
  assert.ok(updatedContent.includes('Old milestone'));

  fs.rmSync(tmpDir, { recursive: true, force: true });
});

test('recordMilestone throws error when summary is missing or empty', () => {
  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'uap-rec-err-'));
  assert.throws(() => recordMilestone(tmpDir, ''), /Milestone summary is required/);
  fs.rmSync(tmpDir, { recursive: true, force: true });
});

test('diagnoseContextLeaks detects sensitive env files and log files', () => {
  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'uap-doc-test-'));
  fs.writeFileSync(path.join(tmpDir, '.env.local'), 'SECRET_KEY=123456');
  fs.writeFileSync(path.join(tmpDir, 'debug.log'), 'Verbose trace log content...');

  const diag = diagnoseContextLeaks(tmpDir);

  assert.equal(diag.healthy, false);
  assert.ok(diag.leaks.some(l => l.type === 'SENSITIVE_ENV' && l.file === '.env.local'));
  assert.ok(diag.leaks.some(l => l.type === 'LOG_FILE' && l.file === 'debug.log'));
  assert.ok(diag.suggestedIgnoreEntries.includes('.env*'));
  assert.ok(diag.suggestedIgnoreEntries.includes('*.log'));

  fs.rmSync(tmpDir, { recursive: true, force: true });
});

test('diagnoseContextLeaks detects sqlite database and oversized files', () => {
  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'uap-doc-db-'));
  fs.writeFileSync(path.join(tmpDir, 'app.sqlite'), 'SQLite format 3\0');
  fs.writeFileSync(path.join(tmpDir, 'large.txt'), 'x'.repeat(160 * 1024)); // 160 KB

  const diag = diagnoseContextLeaks(tmpDir, { maxFileSize: 150 * 1024 });

  assert.equal(diag.healthy, false);
  assert.ok(diag.leaks.some(l => l.type === 'DATABASE' && l.file === 'app.sqlite'));
  assert.ok(diag.leaks.some(l => l.type === 'LARGE_FILE' && l.file === 'large.txt'));

  fs.rmSync(tmpDir, { recursive: true, force: true });
});

test('fixContextLeaks appends missing patterns to .agentignore', () => {
  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'uap-fix-test-'));
  fs.writeFileSync(path.join(tmpDir, 'app.sqlite'), 'binary db data');
  fs.writeFileSync(path.join(tmpDir, 'test.log'), 'test log');

  const diag = diagnoseContextLeaks(tmpDir);
  const fixRes = fixContextLeaks(tmpDir, diag);

  assert.ok(fixRes.fixedCount >= 2);

  const ignoreContent = fs.readFileSync(path.join(tmpDir, '.agentignore'), 'utf-8');
  assert.ok(ignoreContent.includes('*.log'));
  assert.ok(ignoreContent.includes('*.sqlite'));

  // Re-diagnose to confirm leaks are now ignored
  const postDiag = diagnoseContextLeaks(tmpDir);
  assert.equal(postDiag.healthy, true);

  fs.rmSync(tmpDir, { recursive: true, force: true });
});

test('calculateBudget accurately estimates raw vs distilled token counts and savings percent', () => {
  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'uap-budget-test-'));
  // Create simulated 100KB of source code
  fs.mkdirSync(path.join(tmpDir, 'src'));
  fs.writeFileSync(path.join(tmpDir, 'src/main.js'), 'const a = 1;\n'.repeat(5000));
  fs.writeFileSync(path.join(tmpDir, 'PROJECT_STATE.md'), '# State Ledger\n');

  const budget = calculateBudget(tmpDir);

  assert.ok(budget.textFilesCount >= 2);
  assert.ok(budget.rawTokens > 10000);
  assert.ok(budget.distilledTokens < budget.rawTokens);
  assert.ok(parseFloat(budget.savingsPercent) > 50);
  assert.ok(parseFloat(budget.dollarsSaved) >= 0);

  fs.rmSync(tmpDir, { recursive: true, force: true });
});

test('renderDoctorReport and renderBudgetScorecard format valid ASCII output', () => {
  const doctorReport = renderDoctorReport({
    healthy: true,
    filesScanned: 15,
    leaks: []
  });
  assert.ok(doctorReport.includes('UAP CONTEXT LEAK DOCTOR REPORT'));
  assert.ok(doctorReport.includes('CLEAN & HEALTHY'));

  const budgetCard = renderBudgetScorecard({
    textFilesCount: 12,
    rawTokens: 85000,
    distilledTokens: 1800,
    tokensSaved: 83200,
    savingsPercent: '97.9',
    costPer100TurnsRaw: '25.50',
    costPer100TurnsUap: '0.54',
    dollarsSaved: '24.96'
  });
  assert.ok(budgetCard.includes('UAP CONTEXT BUDGET & FINANCIAL SAVINGS'));
  assert.ok(budgetCard.includes('85,000 tokens'));
  assert.ok(budgetCard.includes('97.9%'));
  assert.ok(budgetCard.includes('$24.96 Saved'));
});

test('contextDoctor detects .NET TestResults and *.user files as context leaks', () => {
  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'uap-doc-dotnet-'));
  try {
    fs.writeFileSync(path.join(tmpDir, 'test_run.trx'), '<TestRun id="123"/>');
    fs.writeFileSync(path.join(tmpDir, 'MyProject.csproj.user'), '<ProjectOptions/>');

    const diag = diagnoseContextLeaks(tmpDir);
    assert.equal(diag.healthy, false);
    assert.ok(diag.leaks.some(l => l.type === 'DOTNET_CACHE'));
    assert.ok(diag.suggestedIgnoreEntries.includes('TestResults/'));
  } finally {
    fs.rmSync(tmpDir, { recursive: true, force: true });
  }
});
