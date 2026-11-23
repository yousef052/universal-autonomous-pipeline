import readline from 'node:readline';

export async function promptModeSelect() {
  if (!process.stdin.isTTY) {
    return 'agent'; // non-interactive fallback default
  }

  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  console.log(`\nSelect an Operational Mode to proceed:\n`);
  console.log(`  [1] Agent Mode (Acceleration)`);
  console.log(`      -> Optimize local IDE agents (Antigravity, Cursor, Claude Code, Windsurf)`);
  console.log(`      -> Auto-detect stack, create PROJECT_STATE.md, and inject hygiene rules\n`);

  console.log(`  [2] Patch Mode (Web Chat Adapter)`);
  console.log(`      -> Fast bugfix/feature workflow via ChatGPT, Claude.ai, or Gemini Web`);
  console.log(`      -> Tree-shake target code (< 3k tokens), copy prompt, and apply patch\n`);

  console.log(`  [3] Builder Mode (Zero-Agent App from Scratch)`);
  console.log(`      -> Build complete apps from scratch with only a browser & terminal`);
  console.log(`      -> Master architect 4-phase scaffolding + 1-click terminal reflector\n`);

  console.log(`  [A] Audit Context Score (Grade A-F context health check)`);
  console.log(`  [Q] Exit\n`);

  return new Promise(resolve => {
    rl.question('Choose an option [1, 2, 3, A, Q] (Default: 1): ', answer => {
      rl.close();
      const choice = (answer || '1').trim().toLowerCase();
      if (choice === '1' || choice === 'agent') resolve('agent');
      else if (choice === '2' || choice === 'patch') resolve('patch');
      else if (choice === '3' || choice === 'builder') resolve('builder');
      else if (choice === 'a' || choice === 'audit') resolve('audit');
      else if (choice === 'q' || choice === 'exit') resolve('exit');
      else resolve('agent');
    });
  });
}
