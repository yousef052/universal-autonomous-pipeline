import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { generateProjectState } from '../src/generators/stateGenerator.js';
import { injectAgentConfigs } from '../src/generators/agentGenerator.js';

test('generateProjectState outputs standard 4-section markdown ledger', () => {
  const mockInfo = {
    name: 'test-service',
    type: 'Node.js Application',
    framework: 'Next.js',
    language: 'JavaScript / TypeScript',
    commands: {
      dev: 'npm run dev',
      build: 'npm run build',
      test: 'npm test',
      lint: 'npm run lint'
    },
    sourceDirs: ['src', 'pages']
  };

  const md = generateProjectState(mockInfo);
  assert.ok(md.includes('# Project State & Architecture Ledger'));
  assert.ok(md.includes('## 1. Project Overview & Active Tech Stack'));
  assert.ok(md.includes('**Framework:** Next.js'));
  assert.ok(md.includes('## 2. Core Execution Commands'));
  assert.ok(md.includes('## 3. Architecture & File Map'));
  assert.ok(md.includes('- `src/` : Core application modules'));
  assert.ok(md.includes('- `pages/` : Core application modules'));
  assert.ok(md.includes('## 4. Completed Milestones (Auto-Maintained)'));
});

test('injectAgentConfigs respects dry-run and writes files when executed', () => {
  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'uap-test-gen-'));
  try {
    // Dry run first
    const dryResults = injectAgentConfigs(tmpDir, { dryRun: true });
    assert.equal(dryResults.length, 5);
    for (const r of dryResults) {
      assert.ok(r.status.includes('dry-run'));
      assert.equal(fs.existsSync(path.join(tmpDir, r.file)), false);
    }

    // Actual execution
    const liveResults = injectAgentConfigs(tmpDir, { dryRun: false });
    assert.equal(liveResults.length, 5);
    for (const r of liveResults) {
      assert.equal(r.status, 'CREATED');
      assert.ok(fs.existsSync(path.join(tmpDir, r.file)));
    }

    // Skipping without force
    const repeatResults = injectAgentConfigs(tmpDir, { dryRun: false, force: false });
    for (const r of repeatResults) {
      assert.ok(r.status.includes('already exists'));
    }
  } finally {
    fs.rmSync(tmpDir, { recursive: true, force: true });
  }
});
