#!/usr/bin/env node
// PostToolUse check. Re-reads files an agent just edited and blocks on rule violations.
import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
import {
  readHookInput,
  workspaceRoot,
  collectPaths,
  collectPatchPaths,
  toRelative,
  isEditTool,
} from './lib.mjs';

const input = readHookInput();
const toolName = input.tool_name ?? input.toolName ?? '';
const toolInput = input.tool_input ?? input.toolInput ?? {};
const root = workspaceRoot(input);

if (!isEditTool(toolName) && !toolInput.input) process.exit(0);

const SCANNED_EXTENSIONS = new Set(['.cs', '.ts', '.js', '.mjs', '.json', '.yml', '.yaml', '.html', '.config']);

const SECRET_PATTERNS = [
  [/-----BEGIN (RSA |EC |OPENSSH )?PRIVATE KEY-----/, 'private key'],
  [/\bAKIA[0-9A-Z]{16}\b/, 'AWS access key id'],
  [/\bBearer\s+eyJ[A-Za-z0-9_-]{10,}/, 'bearer token'],
  [/(Password|Pwd)=(?!ChangeMe123!)[^;"'\s]{4,}/i, 'password in a connection string'],
  [/(api[_-]?key|secret|token)\s*[:=]\s*["'][A-Za-z0-9_\-]{16,}["']/i, 'hard-coded secret'],
];

const DOMAIN_FORBIDDEN_USING =
  /using\s+(Microsoft\.AspNetCore|System\.Web|InvoiceApp\.Api|Microsoft\.EntityFrameworkCore|System\.Data|Microsoft\.Data|Azure\.Messaging)/;

const E2E_FORBIDDEN_SELECTOR = /\.locator\(|xpath=|\$\$?\(['"`]/;

const findings = [];

for (const rawPath of collectPatchPaths(toolInput, collectPaths(toolInput))) {
  const relativePath = toRelative(rawPath, root);
  const absolutePath = path.join(root, relativePath);
  if (relativePath.startsWith('..') || relativePath.startsWith('.github/hooks/')) continue;
  if (!SCANNED_EXTENSIONS.has(path.extname(relativePath)) || !existsSync(absolutePath)) continue;

  const content = readFileSync(absolutePath, 'utf8');

  for (const [pattern, label] of SECRET_PATTERNS) {
    if (pattern.test(content)) findings.push(`${relativePath}: possible ${label}. Remove it; never commit real credentials.`);
  }
  if (relativePath.startsWith('backend/src/InvoiceApp.Domain/') && DOMAIN_FORBIDDEN_USING.test(content)) {
    findings.push(`${relativePath}: Domain must not depend on web, storage or messaging namespaces.`);
  }
  if (relativePath.startsWith('e2e/') && relativePath.endsWith('.ts') && E2E_FORBIDDEN_SELECTOR.test(content)) {
    findings.push(`${relativePath}: use getByRole or getByLabel, not CSS or XPath selectors.`);
  }
}

if (findings.length > 0) {
  const reason = `Human review required before continuing:\n- ${findings.join('\n- ')}`;
  process.stdout.write(
    JSON.stringify({
      decision: 'block',
      reason,
      hookSpecificOutput: { hookEventName: 'PostToolUse', additionalContext: reason },
    }),
  );
}
