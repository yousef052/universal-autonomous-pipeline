import test from 'node:test';
import assert from 'node:assert/strict';
import { extractSymbols, estimateTokens } from '../src/distiller/symbolExtractor.js';

test('estimateTokens calculates approximate token count based on length', () => {
  const sample = 'const a = 10; function test() { return a * 2; }';
  const tokens = estimateTokens(sample);
  assert.ok(tokens > 5 && tokens < 25);
  assert.equal(estimateTokens(''), 0);
});

test('extractSymbols retains short code without stripping', () => {
  const shortCode = 'export function add(a, b) {\n  return a + b;\n}';
  const result = extractSymbols(shortCode, 'src/math.js');
  assert.ok(result.includes('export function add(a, b)'));
  assert.ok(result.includes('return a + b;'));
});

test('extractSymbols pinpoints targeted function symbol', () => {
  const code = `
function ignoredOne() {
  return 1;
}

export function targetHandler(req, res) {
  const data = req.body;
  return res.json({ success: true, data });
}

function ignoredTwo() {
  return 2;
}
`;
  const result = extractSymbols(code, 'src/api.js', { targetSymbol: 'targetHandler' });
  assert.ok(result.includes('targetHandler(req, res)'));
  assert.equal(result.includes('ignoredOne'), false);
});
