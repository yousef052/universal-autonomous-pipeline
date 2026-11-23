import test from 'node:test';
import assert from 'node:assert/strict';
import { synthesizePrompt } from '../src/synthesizers/promptSynthesizer.js';

test('synthesizePrompt builds Claude-formatted XML prompt', () => {
  const res = synthesizePrompt({
    projectInfo: { name: 'demo-app', type: 'Node.js' },
    stateContent: '## 1. Project Overview\n- Name: demo-app',
    targetFiles: [
      { path: 'src/app.js', content: 'console.log("hello");', language: 'js' }
    ],
    task: 'Fix greeting',
    chatTarget: 'claude'
  });

  assert.equal(res.chatTarget, 'claude');
  assert.ok(res.prompt.includes('<project_architecture>'));
  assert.ok(res.prompt.includes('<target_files>'));
  assert.ok(res.prompt.includes('<task_instruction>'));
  assert.ok(res.prompt.includes('Fix greeting'));
  assert.ok(res.estimatedTokens > 0);
});

test('synthesizePrompt builds ChatGPT markdown diff prompt', () => {
  const res = synthesizePrompt({
    projectInfo: { name: 'demo-app' },
    stateContent: '## Stack: React',
    targetFiles: [],
    task: 'Add button',
    chatTarget: 'chatgpt'
  });

  assert.equal(res.chatTarget, 'chatgpt');
  assert.ok(res.prompt.includes('# SYSTEM DIRECTIVE: UAP Autonomous Copilot Mode'));
  assert.ok(res.prompt.includes('## 1. Project Architecture & Active Stack'));
  assert.ok(res.prompt.includes('Add button'));
});
