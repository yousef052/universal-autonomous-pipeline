import test from 'node:test';
import assert from 'node:assert/strict';
import { renderBanner } from '../src/ui/banner.js';
import { renderPreflightPlan } from '../src/ui/preflight.js';
import { renderBenchmarkScorecard } from '../src/ui/scorecard.js';

test('renderBanner outputs title, version, and clean description', () => {
  const banner = renderBanner('1.4.1');
  assert.ok(banner.includes('Universal Autonomous Pipeline'));
  assert.ok(banner.includes('v1.4.1'));
  assert.ok(banner.includes('Context Precision & Memory Ledger'));
});

test('renderPreflightPlan displays detected stack and planned actions with safety guarantee', () => {
  const plan = renderPreflightPlan({
    projectInfo: { name: 'my-web-app', type: 'Node.js Application', language: 'TypeScript', framework: 'Next.js' },
    mode: 'agent',
    plannedActions: [
      { name: 'PROJECT_STATE.md', type: 'create', detail: 'Living architecture ledger' },
      { name: '.agentignore', type: 'create', detail: 'Strict exclusions' }
    ]
  });

  assert.ok(plan.includes('PRE-FLIGHT VERIFICATION PLAN'));
  assert.ok(plan.includes('Next.js'));
  assert.ok(plan.includes('[+] PROJECT_STATE.md'));
  assert.ok(plan.includes('SAFETY GUARANTEE: Automatic backup in .uap-backup/'));
  assert.ok(plan.includes('PRIVACY GUARANTEE: 100% Local execution'));
});

test('renderBenchmarkScorecard outputs real project diagnostics and context health score', () => {
  const card = renderBenchmarkScorecard({
    auditResult: { score: 100, grade: 'A', healthy: true },
    mode: 'agent'
  });

  assert.ok(card.includes('PROJECT CONTEXT DIAGNOSTICS'));
  assert.ok(card.includes('Score: 100/100 (Grade: A)'));
  assert.ok(card.includes('Context hygiene'));
  assert.ok(card.includes('Architecture ledger'));
  assert.ok(card.includes('Agent rule set'));
});
