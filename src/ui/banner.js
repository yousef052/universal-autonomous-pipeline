export function renderBanner(version = '1.4.1') {
  const width = 64;
  const line = '─'.repeat(width);
  const title = `UAP v${version} - Universal Autonomous Pipeline`;
  const subtitle = 'Context Precision & Memory Ledger for AI Coding Agents';

  return `
┌${line}┐
│ ${title.padEnd(width - 2)} │
│ ${subtitle.padEnd(width - 2)} │
└${line}┘`;
}
