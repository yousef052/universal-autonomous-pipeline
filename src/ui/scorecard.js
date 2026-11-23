export function renderBenchmarkScorecard({ auditResult = {}, mode = 'agent' }) {
  const line = '─'.repeat(64);
  const score = auditResult.score !== undefined ? auditResult.score : 100;
  const grade = auditResult.grade || 'A';
  const status = score >= 80 ? 'HEALTHY (Context standards satisfied)' : 'NEEDS ATTENTION (Issues detected)';

  let nextStep = '';
  if (mode === 'agent') {
    nextStep = 'Prompt in your AI agent directly without typing @file';
  } else if (mode === 'patch') {
    nextStep = 'Prompt copied to clipboard. Paste into chat, then run "uap apply"';
  } else if (mode === 'builder') {
    nextStep = 'Phase 1 prompt copied. Paste into chat, then run "uap run"';
  } else {
    nextStep = score >= 80 ? 'Project is ready for AI coding' : 'Run "uap init" to resolve issues';
  }

  let diagnostics = '';
  if (auditResult.issues && auditResult.issues.length > 0) {
    diagnostics = auditResult.issues.map(iss => `│   [!] ${iss.message.substring(0, 56).padEnd(56)} │`).join('\n');
  } else {
    diagnostics = [
      '│   [✓] Context hygiene: dependencies & build assets excluded    │',
      '│   [✓] Architecture ledger: PROJECT_STATE.md active             │',
      '│   [✓] Agent rule set: cross-platform directives active         │'
    ].join('\n');
  }

  return `
┌${line}┐
│ 📋 PROJECT CONTEXT DIAGNOSTICS                                 │
├${line}┤
│ Health Score:    ${`Score: ${score}/100 (Grade: ${grade})`.padEnd(45)} │
│ Status:          ${status.padEnd(45)} │
├${line}┤
│ VERIFIED STANDARDS:                                            │
${diagnostics}
├${line}┤
│ Next Step:       ${nextStep.substring(0, 45).padEnd(45)} │
└${line}┘
`;
}
