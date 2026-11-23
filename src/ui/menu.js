import readline from 'node:readline';

export async function promptModeSelect() {
  if (!process.stdin.isTTY) {
    return 'agent';
  }

  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  console.log(`\nSelect operational mode:\n`);
  console.log(`  [1] Agent Mode   - Initialize living memory ledger & ignore rules`);
  console.log(`  [2] Patch Mode   - Tree-shake code into <3k token prompt & apply diffs`);
  console.log(`  [3] Builder Mode - Multi-phase project scaffolding via web chat`);
  console.log(`  [C] CARE Mode    - Step-by-step guided setup with git & stack checks`);
  console.log(`  [A] Audit        - Check context health score`);
  console.log(`  [Q] Exit\n`);

  return new Promise(resolve => {
    rl.question('Option [1, 2, 3, C, A, Q] (Default: 1): ', answer => {
      rl.close();
      const choice = (answer || '1').trim().toLowerCase();
      if (choice === '1' || choice === 'agent') resolve('agent');
      else if (choice === '2' || choice === 'patch') resolve('patch');
      else if (choice === '3' || choice === 'builder') resolve('builder');
      else if (choice === 'c' || choice === 'care') resolve('care');
      else if (choice === 'a' || choice === 'audit') resolve('audit');
      else if (choice === 'q' || choice === 'exit') resolve('exit');
      else resolve('agent');
    });
  });
}
