import path from 'node:path';

const DECLARATION_REGEX = /^(export\s+)?(async\s+)?(function|class|interface|type|const|let|var|def|fn|pub fn|func)\b/;
const LICENSE_BLOCK_REGEX = /\/\*[\s\S]*?Copyright[\s\S]*?\*\//gi;
const HASH_COPYRIGHT_REGEX = /^#\s*Copyright[\s\S]*?\n/gim;

export function estimateTokens(text = '') {
  if (!text) return 0;
  // Standard BPE estimation: ~3.8 to 4 characters per token
  return Math.ceil(text.length / 4);
}

// Fast character counter avoiding array allocations
function countBraces(str) {
  let open = 0;
  let close = 0;
  for (let i = 0; i < str.length; i++) {
    const code = str.charCodeAt(i);
    if (code === 123) open++;       // '{'
    else if (code === 125) close++; // '}'
  }
  return { open, close };
}

export function extractSymbols(code = '', filePath = '', options = {}) {
  const ext = path.extname(filePath).toLowerCase();
  const maxLines = options.maxLines || 180;
  const targetSymbol = options.targetSymbol ? options.targetSymbol.toLowerCase() : null;

  const lines = code.split('\n');

  // If file is short enough, return it fully with comments cleaned
  if (lines.length <= maxLines && !targetSymbol) {
    return cleanComments(code, ext);
  }

  // If a specific symbol/function is targeted, extract that block with padding
  if (targetSymbol) {
    const symbolLines = [];
    let capturing = false;
    let braceCount = 0;
    let capturedCount = 0;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      if (line.toLowerCase().includes(targetSymbol)) {
        capturing = true;
        const start = Math.max(0, i - 3);
        for (let j = start; j < i; j++) symbolLines.push(lines[j]);
      }

      if (capturing) {
        symbolLines.push(line);
        capturedCount++;
        const { open, close } = countBraces(line);
        braceCount += (open - close);

        if (braceCount <= 0 && capturedCount > 5) {
          capturing = false;
          break;
        }
      }
    }

    if (symbolLines.length > 0) {
      return symbolLines.join('\n');
    }
  }

  // Outline extraction: extract signatures and truncate internal bodies
  const outlineLines = [];
  let inFunction = false;
  let braceDepth = 0;

  for (let i = 0; i < lines.length; i++) {
    if (outlineLines.length >= maxLines) {
      outlineLines.push(`// ... [Truncated ${lines.length - outlineLines.length} lines for context economy] ...`);
      break;
    }

    const line = lines[i];
    const trimmed = line.trim();

    // Preserve imports and exports
    if (trimmed.startsWith('import ') || trimmed.startsWith('export ') || trimmed.startsWith('from ') || trimmed.startsWith('package ') || trimmed.startsWith('use ')) {
      outlineLines.push(line);
      continue;
    }

    // Preserve declarations
    if (DECLARATION_REGEX.test(trimmed)) {
      outlineLines.push(line);
      if (line.includes('{')) {
        inFunction = true;
        braceDepth = 1;
      }
      continue;
    }

    if (inFunction) {
      const { open, close } = countBraces(line);
      braceDepth += (open - close);

      if (braceDepth <= 0) {
        outlineLines.push('  // ... implementation ...');
        outlineLines.push(line);
        inFunction = false;
      }
      continue;
    }

    outlineLines.push(line);
  }

  return outlineLines.join('\n');
}

function cleanComments(code, ext) {
  return code
    .replace(LICENSE_BLOCK_REGEX, '')
    .replace(HASH_COPYRIGHT_REGEX, '')
    .trim();
}
