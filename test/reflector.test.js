import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { parseBatch, executeBatch } from '../src/reflector/batchExecutor.js';
import { generatePowerShellScript, generateBashScript } from '../src/reflector/scriptGenerator.js';

test('parseBatch parses directories, files, commands, and next prompt', () => {
  const rawBatch = `
<<<UAP_BATCH_START>>>
PHASE: 1/4
MKDIR: src/components
MKDIR: src/services

WRITE: src/components/Header.jsx
export default function Header() {
  return <header>My SaaS</header>;
}
<<<END_WRITE>>>

WRITE: package.json
{
  "name": "sample-saas",
  "version": "1.0.0"
}
<<<END_WRITE>>>

EXEC: npm install
EXEC: npm test

NEXT_PROMPT: Please proceed to Phase 2: Core Data Models.
<<<UAP_BATCH_END>>>
`;

  const batch = parseBatch(rawBatch);
  assert.ok(batch);
  assert.equal(batch.phase, '1/4');
  assert.equal(batch.mkdirs.length, 2);
  assert.equal(batch.mkdirs[0], 'src/components');
  assert.equal(batch.writes.length, 2);
  assert.equal(batch.writes[0].file, 'src/components/Header.jsx');
  assert.ok(batch.writes[0].content.includes('export default function Header()'));
  assert.equal(batch.execs.length, 2);
  assert.equal(batch.execs[0], 'npm install');
  assert.ok(batch.nextPrompt.includes('Please proceed to Phase 2'));
});

test('executeBatch creates directories and files cleanly without shell execution', () => {
  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'uap-test-batch-'));
  try {
    const mockBatch = {
      phase: '1/4',
      mkdirs: ['src/lib', 'public'],
      writes: [
        { file: 'src/lib/utils.js', content: 'export const sum = (a, b) => a + b;\n' },
        { file: 'README.md', content: '# Sample App\n' }
      ],
      execs: ['echo "mock execution"'],
      nextPrompt: 'Next prompt'
    };

    const outcome = executeBatch(mockBatch, tmpDir, { dryRun: false, skipExec: true });
    assert.equal(outcome.directoriesCreated.length, 2);
    assert.equal(outcome.filesWritten.length, 2);

    assert.ok(fs.existsSync(path.join(tmpDir, 'src', 'lib', 'utils.js')));
    assert.ok(fs.existsSync(path.join(tmpDir, 'README.md')));
    assert.equal(fs.readFileSync(path.join(tmpDir, 'src', 'lib', 'utils.js'), 'utf8'), 'export const sum = (a, b) => a + b;\n');
  } finally {
    fs.rmSync(tmpDir, { recursive: true, force: true });
  }
});

test('generatePowerShellScript outputs valid PowerShell syntax', () => {
  const mockBatch = {
    phase: '1/2',
    mkdirs: ['src'],
    writes: [{ file: 'src/app.js', content: 'console.log("hello");' }],
    execs: ['npm install']
  };

  const ps = generatePowerShellScript(mockBatch);
  assert.ok(ps.includes('New-Item -ItemType Directory'));
  assert.ok(ps.includes('Set-Content -Path "src/app.js"'));
  assert.ok(ps.includes('npm install'));
});

test('generateBashScript outputs valid bash script syntax', () => {
  const mockBatch = {
    phase: '1/2',
    mkdirs: ['src'],
    writes: [{ file: 'src/app.js', content: 'console.log("hello");' }],
    execs: ['npm install']
  };

  const sh = generateBashScript(mockBatch);
  assert.ok(sh.includes('#!/usr/bin/env bash'));
  assert.ok(sh.includes('mkdir -p "src"'));
  assert.ok(sh.includes('cat << \'EOF\' > "src/app.js"'));
});
