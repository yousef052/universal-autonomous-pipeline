import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { detectProject } from '../src/detectors/projectDetector.js';

test('detectProject identifies Node.js React project correctly', () => {
  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'uap-test-node-'));
  try {
    const pkgJson = {
      name: 'sample-react-app',
      dependencies: {
        react: '^18.2.0',
        'react-dom': '^18.2.0'
      },
      scripts: {
        dev: 'vite',
        build: 'vite build',
        test: 'vitest'
      }
    };
    fs.writeFileSync(path.join(tmpDir, 'package.json'), JSON.stringify(pkgJson, null, 2), 'utf8');
    fs.mkdirSync(path.join(tmpDir, 'src'));

    const detected = detectProject(tmpDir);
    assert.equal(detected.name, 'sample-react-app');
    assert.equal(detected.type, 'Node.js Application');
    assert.equal(detected.framework, 'React');
    assert.equal(detected.language, 'JavaScript / TypeScript');
    assert.equal(detected.commands.dev, 'npm run dev');
    assert.equal(detected.commands.build, 'npm run build');
    assert.ok(detected.sourceDirs.includes('src'));
  } finally {
    fs.rmSync(tmpDir, { recursive: true, force: true });
  }
});

test('detectProject identifies Python project correctly', () => {
  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'uap-test-py-'));
  try {
    fs.writeFileSync(path.join(tmpDir, 'requirements.txt'), 'fastapi==0.110.0\nuvicorn==0.28.0\n', 'utf8');
    fs.mkdirSync(path.join(tmpDir, 'app'));

    const detected = detectProject(tmpDir);
    assert.equal(detected.type, 'Python Application');
    assert.equal(detected.language, 'Python');
    assert.equal(detected.commands.test, 'pytest');
    assert.ok(detected.sourceDirs.includes('app'));
  } finally {
    fs.rmSync(tmpDir, { recursive: true, force: true });
  }
});

test('detectProject identifies Go project correctly', () => {
  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'uap-test-go-'));
  try {
    fs.writeFileSync(path.join(tmpDir, 'go.mod'), 'module example.com/service\n\ngo 1.22\n', 'utf8');

    const detected = detectProject(tmpDir);
    assert.equal(detected.type, 'Go Service');
    assert.equal(detected.language, 'Go');
    assert.equal(detected.commands.build, 'go build -v ./...');
  } finally {
    fs.rmSync(tmpDir, { recursive: true, force: true });
  }
});
