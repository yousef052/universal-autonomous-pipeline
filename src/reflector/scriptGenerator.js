export function generatePowerShellScript(batch) {
  const mkdirLines = batch.mkdirs.map(d => `New-Item -ItemType Directory -Force -Path "${d}" | Out-Null`).join('\n');

  const fileLines = batch.writes.map(item => {
    // Escape double quotes inside string if any
    const escaped = item.content.replace(/`/g, '``').replace(/\$/g, '`$');
    return `
New-Item -ItemType Directory -Force -Path (Split-Path "${item.file}") -ErrorAction SilentlyContinue | Out-Null
@'
${item.content}
'@ | Set-Content -Path "${item.file}" -Encoding UTF8 -Force
Write-Host "  -> [CREATED] ${item.file}" -ForegroundColor Green`;
  }).join('\n');

  const cmdLines = batch.execs.map(c => `
Write-Host "Running: ${c}..." -ForegroundColor Cyan
Invoke-Expression "${c}"`).join('\n');

  return `# UAP Self-Executing Batch Script for Windows PowerShell
Write-Host "=== UAP Terminal Reflector (Phase ${batch.phase}) ===" -ForegroundColor Magenta

# 1. Directories
${mkdirLines}

# 2. Files
${fileLines}

# 3. Execution Commands
${cmdLines}

Write-Host "=== Phase ${batch.phase} Executed Successfully! ===" -ForegroundColor Green
`;
}

export function generateBashScript(batch) {
  const mkdirLines = batch.mkdirs.map(d => `mkdir -p "${d}"`).join('\n');

  const fileLines = batch.writes.map(item => {
    return `
mkdir -p "$(dirname "${item.file}")"
cat << 'EOF' > "${item.file}"
${item.content}
EOF
echo "  -> [CREATED] ${item.file}"`;
  }).join('\n');

  const cmdLines = batch.execs.map(c => `
echo "Running: ${c}..."
${c}`).join('\n');

  return `#!/usr/bin/env bash
set -e
echo "=== UAP Terminal Reflector (Phase ${batch.phase}) ==="

# 1. Directories
${mkdirLines}

# 2. Files
${fileLines}

# 3. Execution Commands
${cmdLines}

echo "=== Phase ${batch.phase} Executed Successfully! ==="
`;
}
