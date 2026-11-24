import readline from 'node:readline';

/**
 * Radical Simplification: 3 intuitive options for developers.
 */
export async function promptModeSelect() {
  if (!process.stdin.isTTY) {
    return 'setup';
  }

  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  console.log(`\nHow would you like to optimize your workspace?\n`);
  console.log(`  [1] ⚡ Auto-Setup (Recommended) - Prepare project for AI agents in 1 second`);
  console.log(`  [2] 🩺 Doctor & Health Check   - Scan for context leaks, logs & bloated files`);
  console.log(`  [3] 📊 Audit & Token Savings   - Calculate health score (0-100) & financial ROI`);
  console.log(`  [Q] 🚪 Exit\n`);

  return new Promise(resolve => {
    rl.question('Select an option [1, 2, 3, Q] (Default: 1): ', answer => {
      rl.close();
      const choice = (answer || '1').trim().toLowerCase();
      if (choice === '1' || choice === 'setup' || choice === 'agent') resolve('setup');
      else if (choice === '2' || choice === 'doctor' || choice === 'health' || choice === 'd') resolve('doctor');
      else if (choice === '3' || choice === 'audit' || choice === 'budget' || choice === 'a' || choice === 'b') resolve('audit');
      else if (choice === 'q' || choice === 'exit') resolve('exit');
      // Backward-compatible power shortcuts:
      else if (choice === 'care' || choice === 'c') resolve('care');
      else if (choice === 'verify' || choice === 'v') resolve('verify');
      else if (choice === 'record' || choice === 'r') resolve('record');
      else if (choice === 'patch') resolve('patch');
      else if (choice === 'builder') resolve('builder');
      else resolve('setup');
    });
  });
}
