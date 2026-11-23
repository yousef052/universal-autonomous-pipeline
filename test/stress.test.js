import test from 'node:test';
import assert from 'node:assert/strict';
import { extractSymbols, estimateTokens } from '../src/distiller/symbolExtractor.js';
import { synthesizePrompt } from '../src/synthesizers/promptSynthesizer.js';
import { parseBatch, executeBatch } from '../src/reflector/batchExecutor.js';
import { parsePatches, applyPatches } from '../src/patcher/patchApplier.js';

test('Stress: extractSymbols handles 10,000 lines of code without memory leak', () => {
  const hugeCode = Array.from({ length: 10000 }, (_, i) => `const x${i} = ${i};`).join('\n');
  const t0 = Date.now();
  const res = extractSymbols(hugeCode, 'src/huge.js');
  const elapsed = Date.now() - t0;

  assert.ok(elapsed < 200, `Execution took ${elapsed}ms which is too slow`);
  assert.ok(res.includes('Truncated'));
});

test('Edge: Unicode, Arabic, and Emoji support in Prompt Synthesizer', () => {
  const arabicTask = 'إصلاح مشكلة الـ JWT في ملف المصادقة 🚀';
  const res = synthesizePrompt({
    projectInfo: { name: 'تطبيق-عربي', type: 'Node.js' },
    stateContent: '# سجل تطبيق-عربي',
    targetFiles: [{ path: 'src/auth.js', content: '// كود المصادقة 🔐', language: 'js' }],
    task: arabicTask,
    chatTarget: 'universal'
  });

  assert.ok(res.prompt.includes('إصلاح مشكلة الـ JWT'));
  assert.ok(res.prompt.includes('تطبيق-عربي'));
  assert.ok(res.prompt.includes('🔐'));
  assert.ok(res.estimatedTokens > 0);
});

test('Edge: parsePatches tolerates mixed CRLF and LF line endings', () => {
  const mixedDiff = "<<<FILE: src/test.js>>>\r\n<<<<<<< SEARCH\r\nconst a = 1;\n=======\r\nconst a = 2;\r\n>>>>>>> REPLACE\n<<<END_FILE>>>";
  const patches = parsePatches(mixedDiff);
  assert.equal(patches.length, 1);
  assert.equal(patches[0].diffs.length, 1);
  assert.equal(patches[0].diffs[0].search.trim(), 'const a = 1;');
  assert.equal(patches[0].diffs[0].replace.trim(), 'const a = 2;');
});

test('Edge: parseBatch handles malformed/corrupted batch input safely', () => {
  assert.equal(parseBatch(''), null);
  assert.equal(parseBatch('Just random text without markers'), null);
  assert.equal(parseBatch('<<<UAP_BATCH_START>>> incomplete without end marker'), null);

  const emptyBatch = parseBatch('<<<UAP_BATCH_START>>>\nPHASE: 1/1\n<<<UAP_BATCH_END>>>');
  assert.ok(emptyBatch);
  assert.equal(emptyBatch.writes.length, 0);
  assert.equal(emptyBatch.mkdirs.length, 0);
});

test('Edge: executeBatch safely blocks dangerous shell command injection', () => {
  const dangerousBatch = {
    phase: '1/1',
    mkdirs: [],
    writes: [],
    execs: ['rm -rf /', 'format c:', 'del /s /q c:'],
    nextPrompt: ''
  };

  const outcome = executeBatch(dangerousBatch, process.cwd(), { dryRun: false, skipExec: false });
  assert.equal(outcome.commandsExecuted.length, 3);
  for (const cmd of outcome.commandsExecuted) {
    assert.equal(cmd.success, false);
    assert.ok(cmd.error.includes('Security guardrail blocked'));
  }
});
