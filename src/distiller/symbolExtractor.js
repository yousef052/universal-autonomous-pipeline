import path from 'node:path';

export function estimateTokens(text = '') {
  if (!text) return 0;
  // Standard BPE estimation: ~3.8 to 4 characters per token
  return Math.ceil(text.length / 4);
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
        // Include up to 3 preceding lines for decorators/docstrings
        const start = Math.max(0, i - 3);
        for (let j = start; j < i; j++) symbolLines.push(lines[j]);
      }

      if (capturing) {
        symbolLines.push(line);
        capturedCount++;
        if (line.includes('{')) braceCount += (line.match(/{/g) || []).length;
        if (line.includes('}')) braceCount -= (line.match(/}/g) || []).length;

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
    const line = lines[i];
    const trimmed = line.trim();

    // Preserve imports and exports
    if (trimmed.startsWith('import ') || trimmed.startsWith('export ') || trimmed.startsWith('from ') || trimmed.startsWith('package ') || trimmed.startsWith('use ')) {
      outlineLines.push(line);
      continue;
    }

    // Preserve declarations
    const isDeclaration = /^(export\s+)?(async\s+)?(function|class|interface|type|const|let|var|def|fn|pub fn|func)\b/.test(trimmed);
    if (isDeclaration) {
      outlineLines.push(line);
      if (line.includes('{')) {
        inFunction = true;
        braceDepth = 1;
      }
      continue;
    }

    if (inFunction) {
      braceDepth += (line.match(/{/g) || []).length;
      braceDepth -= (line.match(/}/g) || []).length;

      if (braceDepth <= 0) {
        outlineLines.push('  // ... implementation ...');
        outlineLines.push(line);
        inFunction = false;
      }
      continue;
    }

    if (outlineLines.length < maxLines) {
      outlineLines.push(line);
    }
  }

  if (outlineLines.length >= maxLines && outlineLines.length < lines.length) {
    outlineLines.push(`// ... [Truncated ${lines.length - outlineLines.length} lines for context economy] ...`);
  }

  return outlineLines.join('\n');
}

function cleanComments(code, ext) {
  // Strip heavy license header blocks without touching code
  return code
    .replace(/\/\*[\s\S]*?Copyright[\s\S]*?\*\//gi, '')
    .replace(/^#\s*Copyright[\s\S]*?\n/gim, '')
    .trim();
}
