# Security Policy

## Supported Versions

Only the latest active minor release is officially supported with security updates and path traversal patches.

| Version | Supported |
| :--- | :--- |
| `1.6.x` | :white_check_mark: Yes |
| `< 1.6.0` | :x: No (Please upgrade) |

---

## Security Architecture & Guardrails

UAP implements proactive defenses against common AI-agent execution vulnerabilities:
- **Path Traversal Shield:** Restricts modifications to workspace roots and prevents escapes (`../`, null bytes, `.git/` tampering).
- **Command Injection Firewall:** Blocks destructive disk commands, remote code pipes (`curl | bash`), and forced git operations.
- **Secret Redaction:** Automatically sanitizes API tokens (`sk-*`, `ghp_*`) and connection strings before prompts reach LLM contexts.

---

## Reporting a Vulnerability

We take the security of this project seriously. To protect our community and maintain complete privacy:

> **Important:** Do NOT file public GitHub issues for security vulnerabilities.

### Safe Reporting Method
1. Navigate to the repository's **Security** tab on GitHub:
   [GitHub Security Advisories](https://github.com/yousef052/universal-autonomous-pipeline/security/advisories)
2. Click **Report a vulnerability** to submit an encrypted, private advisory directly to the maintainer.
3. Include reproduction steps, environment details, and proof of concept if applicable.

This ensures all reports remain confidential without exposing any personal email addresses or contact details publicly.
