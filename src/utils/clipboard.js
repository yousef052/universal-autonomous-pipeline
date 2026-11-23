import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

export function copyToClipboard(text = '') {
  try {
    if (process.platform === 'win32') {
      const proc = spawnSync('clip.exe', { input: text, encoding: 'utf8' });
      if (proc.status === 0) return { success: true, method: 'clip.exe' };
    } else if (process.platform === 'darwin') {
      const proc = spawnSync('pbcopy', { input: text, encoding: 'utf8' });
      if (proc.status === 0) return { success: true, method: 'pbcopy' };
    } else {
      // Linux: try wl-copy, then xclip
      let proc = spawnSync('wl-copy', { input: text, encoding: 'utf8' });
      if (proc.status === 0) return { success: true, method: 'wl-copy' };

      proc = spawnSync('xclip', ['-selection', 'clipboard'], { input: text, encoding: 'utf8' });
      if (proc.status === 0) return { success: true, method: 'xclip' };
    }
  } catch {}

  // Fallback: write to file if clipboard utility unavailable
  const fallbackPath = path.resolve('.uap-prompt.txt');
  fs.writeFileSync(fallbackPath, text, 'utf8');
  return { success: false, method: 'fallback_file', path: fallbackPath };
}

export function readFromClipboard() {
  try {
    if (process.platform === 'win32') {
      const proc = spawnSync('powershell.exe', ['-NoProfile', '-Command', 'Get-Clipboard'], { encoding: 'utf8' });
      if (proc.status === 0 && proc.stdout) return proc.stdout.trim();
    } else if (process.platform === 'darwin') {
      const proc = spawnSync('pbpaste', { encoding: 'utf8' });
      if (proc.status === 0 && proc.stdout) return proc.stdout.trim();
    } else {
      // Linux
      let proc = spawnSync('wl-paste', { encoding: 'utf8' });
      if (proc.status === 0 && proc.stdout) return proc.stdout.trim();

      proc = spawnSync('xclip', ['-o', '-selection', 'clipboard'], { encoding: 'utf8' });
      if (proc.status === 0 && proc.stdout) return proc.stdout.trim();
    }
  } catch {}

  // Fallback: try reading from .uap-patch.txt
  const fallbackPath = path.resolve('.uap-patch.txt');
  if (fs.existsSync(fallbackPath)) {
    return fs.readFileSync(fallbackPath, 'utf8').trim();
  }

  return '';
}
