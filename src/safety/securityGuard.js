import path from 'node:path';

const DISALLOWED_COMMAND_PATTERNS = [
  // Catastrophic root/drive filesystem wiping
  /rm\s+-rf\s+[\/\\]/i,
  /rm\s+-rf\s+\*/i,
  /format\s+[a-z]:/i,
  /del\s+\/s\s+\/q\s+[a-z]:/i,
  /mkfs\b/i,
  /dd\s+if=/i,
  /:(){ :|:& };:/, // Fork bomb

  // Remote code injection via piped downloads
  /(curl|wget)\s+.*\|\s*(bash|sh|zsh|python|perl)\b/i,
  /iex\s*\(New-Object\s+Net\.WebClient\)/i,
  /powershell\s+.*-enc(odedCommand)?\b/i,

  // Database destruction outside migrations
  /drop\s+database\b/i,
  /drop\s+table\b/i,
  /truncate\s+table\b/i,

  // Destructive Git commands
  /git\s+push\s+.*--force\b/i,
  /git\s+reset\s+--hard\b/i,

  // System state tampering
  /shutdown\b/i,
  /reboot\b/i,
  /init\s+0\b/i,
  /reg\s+(delete|add)\b/i,
  /Set-ExecutionPolicy\s+Unrestricted\b/i
];

const SECRET_PATTERNS = [
  // OpenAI & generic sk-* tokens
  { name: 'API_KEY', re: /sk-[a-zA-Z0-9_\-]{20,}/g, replacement: '[REDACTED_API_KEY]' },
  { name: 'ANTHROPIC_KEY', re: /sk-ant-[a-zA-Z0-9_\-]{20,}/g, replacement: '[REDACTED_ANTHROPIC_KEY]' },
  { name: 'GOOGLE_KEY', re: /AIzaSy[a-zA-Z0-9_\-]{33}/g, replacement: '[REDACTED_GOOGLE_API_KEY]' },
  // GitHub Personal Access Tokens
  { name: 'GITHUB_TOKEN', re: /gh[pousr]_[a-zA-Z0-9]{36,}/g, replacement: '[REDACTED_GITHUB_TOKEN]' },
  // AWS Access Key ID
  { name: 'AWS_KEY', re: /AKIA[0-9A-Z]{16}/g, replacement: '[REDACTED_AWS_KEY]' },
  // RSA & Private Keys
  { name: 'PRIVATE_KEY', re: /-----BEGIN [A-Z ]*PRIVATE KEY-----[\s\S]*?-----END [A-Z ]*PRIVATE KEY-----/g, replacement: '[REDACTED_PRIVATE_KEY]' },
  // Connection String Passwords
  { name: 'CONN_PASSWORD', re: /((?:Password|pwd)\s*=\s*)([^;\r\n]+)/gi, replacement: '$1***REDACTED_SECRET***' },
  // Bearer Tokens
  { name: 'BEARER_TOKEN', re: /(Bearer\s+)[a-zA-Z0-9_\-\.]{25,}/gi, replacement: '$1[REDACTED_BEARER_TOKEN]' }
];

const PROTECTED_PATHS = [
  /^\.git([\/\\]|$)/i,
  /^node_modules([\/\\]|$)/i
];

/**
 * Validates that a file path stays strictly within rootDir and doesn't tamper with protected metadata.
 */
export function isSafePath(rootDir, targetPath) {
  if (!rootDir || !targetPath) return false;

  // Reject null-byte poisoning
  if (targetPath.includes('\0')) return false;

  const resolvedRoot = path.resolve(rootDir);
  const resolvedTarget = path.resolve(rootDir, targetPath);

  // Must reside inside rootDir
  const relative = path.relative(resolvedRoot, resolvedTarget);
  if (relative.startsWith('..') || path.isAbsolute(relative)) {
    return false;
  }

  // Normalize relative path for regex check
  const normalizedRel = relative.replace(/\\/g, '/');

  // Must not target protected git metadata directly
  if (PROTECTED_PATHS.some(re => re.test(normalizedRel))) {
    return false;
  }

  return true;
}

/**
 * Validates that an executable command does not contain dangerous system-wiping or injection vectors.
 */
export function isSafeCommand(command) {
  if (!command || typeof command !== 'string') {
    return { safe: false, reason: 'Empty or invalid command' };
  }

  for (const pattern of DISALLOWED_COMMAND_PATTERNS) {
    if (pattern.test(command)) {
      return {
        safe: false,
        reason: `Command matched dangerous pattern: ${pattern.toString()}`
      };
    }
  }

  return { safe: true };
}

/**
 * Redacts secrets, credentials, API keys, and connection strings from code or prompts.
 */
export function redactSensitiveSecrets(text = '') {
  if (!text || typeof text !== 'string') {
    return { sanitized: text, redactedCount: 0 };
  }

  let sanitized = text;
  let redactedCount = 0;

  for (const item of SECRET_PATTERNS) {
    const matches = sanitized.match(item.re);
    if (matches) {
      redactedCount += matches.length;
      sanitized = sanitized.replace(item.re, item.replacement);
    }
  }

  return {
    sanitized,
    redactedCount
  };
}
