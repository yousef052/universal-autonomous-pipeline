export function renderBanner(version = '1.4.1') {
  const line = '─'.repeat(64);
  return `
┌${line}┐
│ UAP v${version.padEnd(8)} — Universal Autonomous Pipeline                   │
│ Context Precision & Memory Ledger for AI Coding Agents         │
└${line}┘`;
}
