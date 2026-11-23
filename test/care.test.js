import test from 'node:test';
import assert from 'node:assert/strict';
import { connect, ask, expectations } from '../src/care/careEngine.js';

test('CARE: connect establishes repository context and git information', () => {
  const conn = connect(process.cwd());
  assert.ok(conn.projectInfo);
  assert.ok(conn.auditResult);
  assert.ok(conn.git);
  assert.ok(conn.formattedCard.includes('[CARE: CONNECT]'));
  assert.ok(conn.formattedCard.includes('Repository Context Established'));
});

test('CARE: ask generates precision questions for accelerate intent', () => {
  const q = ask('accelerate');
  assert.equal(q.intent, 'accelerate');
  assert.ok(q.questions.length >= 2);
  assert.equal(q.questions[0].id, 'targetIde');
  assert.equal(q.questions[1].id, 'ignoreStrictness');
  assert.ok(q.questions[0].options[0].includes('Recommended'));
});

test('CARE: ask generates precision questions for patch and scaffold intents', () => {
  const patchQ = ask('patch');
  assert.equal(patchQ.questions[0].id, 'chatTarget');

  const scaffoldQ = ask('scaffold');
  assert.equal(scaffoldQ.questions[0].id, 'database');
  assert.equal(scaffoldQ.questions[1].id, 'styling');
});

test('CARE: expectations formats alignment dashboard and verification advice', () => {
  const exp = expectations({
    actionSummary: 'Workspace Accelerated',
    filesModified: ['PROJECT_STATE.md', '.agentignore', 'AGENTS.md'],
    benchmarkGain: 'Optimized Context',
    mode: 'agent'
  });

  assert.ok(exp.formattedCard.includes('[CARE: EXPECTATIONS]'));
  assert.ok(exp.formattedCard.includes('WHAT TO EXPECT NOW:'));
  assert.ok(exp.formattedCard.includes('VERIFICATION:'));
  assert.ok(exp.formattedCard.includes('ROLLBACK & SAFETY:'));
  assert.ok(exp.formattedCard.includes('PROJECT_STATE.md'));
});
