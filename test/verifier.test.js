import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { verifySystem, fixIdeVisibility, renderVerificationReport } from '../src/verifier/systemVerifier.js';

test('verifySystem evaluates healthy repository with grade A or A+', () => {
  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'uap-ver-healthy-'));
  
  // Setup standard state
  fs.writeFileSync(path.join(tmpDir, 'PROJECT_STATE.md'), `
# Project State
## 1. Project Overview
## 2. Core Execution Commands
## 3. Architecture & File Map
## 4. Completed Milestones
`);
  fs.writeFileSync(path.join(tmpDir, 'package.json'), JSON.stringify({ name: 'test-app', version: '1.0.0' }));
  fs.writeFileSync(path.join(tmpDir, '.agentignore'), 'node_modules/\n');

  const report = verifySystem(tmpDir);

  assert.ok(report.score >= 85);
  assert.ok(report.grade === 'A+' || report.grade === 'A');
  assert.equal(report.healthy, true);
  assert.ok(report.checks.some(c => c.name === 'Pre-Flight & State Ledger' && c.status === 'PASS'));

  fs.rmSync(tmpDir, { recursive: true, force: true });
});

test('verifySystem detects missing state and flags issues with lower score', () => {
  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'uap-ver-bad-'));
  
  const report = verifySystem(tmpDir);

  assert.ok(report.score < 85);
  assert.equal(report.healthy, false);
  assert.ok(report.issues.some(i => i.category === 'state' && i.severity === 'HIGH'));

  fs.rmSync(tmpDir, { recursive: true, force: true });
});

test('fixIdeVisibility whitelists bin directory across .gitignore and .vscode/settings.json', () => {
  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'uap-ver-fix-'));
  fs.mkdirSync(path.join(tmpDir, 'bin'), { recursive: true });
  fs.writeFileSync(path.join(tmpDir, 'bin', 'cli.js'), 'console.log("hello");');
  fs.writeFileSync(path.join(tmpDir, '.gitignore'), 'node_modules/\n');

  const result = fixIdeVisibility(tmpDir);

  assert.equal(result.success, true);
  assert.ok(result.actionsTaken.length > 0);

  const gitignore = fs.readFileSync(path.join(tmpDir, '.gitignore'), 'utf8');
  assert.ok(gitignore.includes('!bin/'));
  assert.ok(gitignore.includes('![Bb]in/'));

  const settingsPath = path.join(tmpDir, '.vscode', 'settings.json');
  assert.ok(fs.existsSync(settingsPath));
  const settings = JSON.parse(fs.readFileSync(settingsPath, 'utf8'));
  assert.equal(settings['files.exclude']['**/bin'], false);

  fs.rmSync(tmpDir, { recursive: true, force: true });
});

test('renderVerificationReport formats ASCII dashboard with grade and status', () => {
  const dummyReport = {
    targetDir: '/dummy/path',
    score: 95,
    grade: 'A+',
    healthy: true,
    checks: [
      { name: 'Pre-Flight & State Ledger', status: 'PASS', detail: '4/4 sections anchored' },
      { name: 'IDE Explorer & CLI Visibility', status: 'PASS', detail: 'whitelisted' }
    ],
    issues: []
  };

  const rendered = renderVerificationReport(dummyReport);
  assert.ok(rendered.includes('Health Grade: A+'));
  assert.ok(rendered.includes('[PASS]'));
  assert.ok(rendered.includes('HEALTHY & PRODUCTION READY'));
});
