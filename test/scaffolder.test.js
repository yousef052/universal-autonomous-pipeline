import test from 'node:test';
import assert from 'node:assert/strict';
import { generateScaffoldPrompt } from '../src/scaffolder/scaffoldEngine.js';

test('generateScaffoldPrompt includes project concept, stack, and batch delimiters', () => {
  const result = generateScaffoldPrompt({
    idea: 'Full-Stack E-Commerce Platform',
    stack: 'Next.js 14, Tailwind, Prisma',
    phase: 1,
    totalPhases: 4
  });

  assert.equal(result.phase, 1);
  assert.equal(result.totalPhases, 4);
  assert.ok(result.prompt.includes('Full-Stack E-Commerce Platform'));
  assert.ok(result.prompt.includes('Next.js 14, Tailwind, Prisma'));
  assert.ok(result.prompt.includes('<<<UAP_BATCH_START>>>'));
  assert.ok(result.prompt.includes('<<<UAP_BATCH_END>>>'));
  assert.ok(result.prompt.includes('ZERO LAZINESS'));
});

test('generateScaffoldPrompt increments phase number correctly', () => {
  const result = generateScaffoldPrompt({
    idea: 'Microservice API',
    phase: 3,
    totalPhases: 4
  });

  assert.equal(result.phase, 3);
  assert.ok(result.prompt.includes('Phase 3 of 4'));
  assert.ok(result.prompt.includes('Phase 4'));
});
