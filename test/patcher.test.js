import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { parsePatches, applyPatches } from '../src/patcher/patchApplier.js';

test('parsePatches parses full file blocks correctly', () => {
  const raw = `
Some introduction from chatbot...

<<<FILE: src/hello.js>>>
\`\`\`javascript
export function hello() {
  return "world";
}
\`\`\`
<<<END_FILE>>>
`;

  const patches = parsePatches(raw);
  assert.equal(patches.length, 1);
  assert.equal(patches[0].file, 'src/hello.js');
  assert.equal(patches[0].type, 'full_file');
  assert.ok(patches[0].content.includes('export function hello()'));
});

test('parsePatches parses Search/Replace diff blocks correctly', () => {
  const raw = `
<<<FILE: src/config.js>>>
<<<<<<< SEARCH
const port = 3000;
=======
const port = 8080;
>>>>>>> REPLACE
<<<END_FILE>>>
`;

  const patches = parsePatches(raw);
  assert.equal(patches.length, 1);
  assert.equal(patches[0].file, 'src/config.js');
  assert.equal(patches[0].type, 'search_replace');
  assert.equal(patches[0].diffs.length, 1);
  assert.equal(patches[0].diffs[0].search, 'const port = 3000;');
  assert.equal(patches[0].diffs[0].replace, 'const port = 8080;');
});

test('applyPatches applies search/replace diff and creates backup', () => {
  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'uap-test-patch-'));
  try {
    const filePath = path.join(tmpDir, 'src', 'app.js');
    fs.mkdirSync(path.dirname(filePath), { recursive: true });
    fs.writeFileSync(filePath, 'const greeting = "hi";\nconsole.log(greeting);\n', 'utf8');

    const patches = [
      {
        file: 'src/app.js',
        type: 'search_replace',
        diffs: [
          { search: 'const greeting = "hi";', replace: 'const greeting = "hello world";' }
        ]
      }
    ];

    const outcome = applyPatches(patches, tmpDir, { dryRun: false, backup: true });
    assert.equal(outcome.results.length, 1);
    assert.equal(outcome.results[0].status, 'PATCHED');

    const updatedContent = fs.readFileSync(filePath, 'utf8');
    assert.ok(updatedContent.includes('const greeting = "hello world";'));
    assert.ok(outcome.backupDir && fs.existsSync(outcome.backupDir));
  } finally {
    fs.rmSync(tmpDir, { recursive: true, force: true });
  }
});
