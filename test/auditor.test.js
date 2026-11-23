import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { auditProject } from '../src/auditor/contextAuditor.js';

test('auditProject detects missing state and rule files', () => {
  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'uap-test-audit-'));
  try {
    const res = auditProject(tmpDir);
    assert.ok(res.score < 50);
    assert.equal(res.grade, 'F');
    assert.equal(res.healthy, false);
    assert.ok(res.issues.length >= 3);
  } finally {
    fs.rmSync(tmpDir, { recursive: true, force: true });
  }
});

test('auditProject awards high score and grade A when fully configured', () => {
  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'uap-test-audit-pass-'));
  try {
    fs.writeFileSync(path.join(tmpDir, 'PROJECT_STATE.md'), '# State', 'utf8');
    fs.writeFileSync(path.join(tmpDir, '.agentignore'), 'node_modules/\n', 'utf8');
    fs.writeFileSync(path.join(tmpDir, 'AGENTS.md'), '# Agents', 'utf8');

    const res = auditProject(tmpDir);
    assert.equal(res.score, 100);
    assert.equal(res.grade, 'A');
    assert.equal(res.healthy, true);
    assert.equal(res.issues.length, 0);
  } finally {
    fs.rmSync(tmpDir, { recursive: true, force: true });
  }
});
