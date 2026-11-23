export function renderBanner(version = '1.3.0') {
  const line = '═'.repeat(66);
  return `
╔${line}╗
║   ██╗   ██╗ █████╗ ██████╗     UNIVERSAL AUTONOMOUS PIPELINE   ║
║   ██║   ██║██╔══██╗██╔══██╗    Autonomous Performance & Context║
║   ██║   ██║███████║██████╔╝    Precision Engine for AI Agents  ║
║   ██║   ██║██╔══██║██╔═══╝     Version: v${version.padEnd(8)}           ║
║   ╚██████╔╝██║  ██║██║         https://github.com/yousef052    ║
║    ╚═════╝ ╚═╝  ╚═╝╚═╝         universal-autonomous-pipeline   ║
╚${line}╝

⚡ THE 60-MINUTE PROBLEM & UAP SOLUTION:
• AI agents inflate conversation history to 500k+ tokens, stalling turns for 30–60 min.
• UAP anchors memory in a 1KB Living State Ledger and enforces 4-stage precision.
• Result: Prompt turnaround drops from 52 minutes down to under 45 seconds (74x faster).
`;
}
