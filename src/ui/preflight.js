import readline from 'node:readline';

export function renderPreflightPlan({ projectInfo = {}, mode = 'agent', plannedActions = [] }) {
  const line = '─'.repeat(66);
  let modeTitle = 'Mode 1: Autonomous Agent Acceleration';
  if (mode === 'patch') modeTitle = 'Mode 2: Web Chatbot Patch & Tree-Shaking';
  if (mode === 'builder') modeTitle = 'Mode 3: Zero-Agent Full-Stack Project Builder';
  if (mode === 'audit') modeTitle = 'Context Health Audit';

  let output = `
┌${line}┐
│ PRE-FLIGHT VERIFICATION PLAN: ${modeTitle.padEnd(35)}│
├${line}┤
│ Target Directory:   ${(projectInfo.name || process.cwd()).substring(0, 44).padEnd(44)}│
│ Detected Stack:     ${(projectInfo.type || 'Generic').padEnd(44)}│
│ Primary Language:   ${(projectInfo.language || 'Unknown').padEnd(44)}│
│ Framework:          ${(projectInfo.framework || 'None').padEnd(44)}│
├${line}┤
│ PLANNED ACTIONS:                                                        │\n`;

  for (const a of plannedActions) {
    const symbol = a.type === 'create' ? '[+]' : (a.type === 'modify' ? '[~]' : '[*]');
    const desc = `${symbol} ${a.name} (${a.detail || ''})`.substring(0, 62);
    output += `│   ${desc.padEnd(63)}│\n`;
  }

  output += `├${line}┤
│ SAFETY GUARANTEE: Automatic backup in .uap-backup/ before modifications │
│ PRIVACY GUARANTEE: 100% Local execution - Zero telemetry / zero uploads │
└${line}┘\n`;

  return output;
}

export async function askConfirmation(question = 'Proceed with these changes? [Y/n]: ') {
  if (!process.stdin.isTTY) {
    return true; // Auto-confirm in non-interactive/CI
  }

  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  return new Promise(resolve => {
    rl.question(question, answer => {
      rl.close();
      const trimmed = (answer || 'y').trim().toLowerCase();
      resolve(trimmed === 'y' || trimmed === 'yes' || trimmed === '');
    });
  });
}
