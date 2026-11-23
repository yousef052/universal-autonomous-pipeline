import fs from 'node:fs';
import path from 'node:path';

export function auditProject(rootDir = process.cwd()) {
  const issues = [];
  let score = 100;

  const statePath = path.join(rootDir, 'PROJECT_STATE.md');
  const ignorePath = path.join(rootDir, '.agentignore');

  if (!fs.existsSync(statePath)) {
    issues.push({ severity: 'HIGH', message: 'Missing PROJECT_STATE.md. Agents will lack context and may hallucinate.' });
    score -= 40;
  }

  if (!fs.existsSync(ignorePath)) {
    issues.push({ severity: 'HIGH', message: 'Missing .agentignore. Build assets and dependencies will bloat prompt context.' });
    score -= 30;
  }

  const agentsMd = fs.existsSync(path.join(rootDir, 'AGENTS.md'));
  const claudeMd = fs.existsSync(path.join(rootDir, 'CLAUDE.md'));
  const cursorRules = fs.existsSync(path.join(rootDir, '.cursorrules'));

  if (!agentsMd && !claudeMd && !cursorRules) {
    issues.push({ severity: 'MEDIUM', message: 'No agent rule file found (AGENTS.md, CLAUDE.md, or .cursorrules).' });
    score -= 20;
  }

  let grade = 'A';
  if (score < 50) grade = 'F';
  else if (score < 70) grade = 'C';
  else if (score < 85) grade = 'B';

  return {
    rootDir,
    score: Math.max(0, score),
    grade,
    healthy: score >= 80,
    issues
  };
}
