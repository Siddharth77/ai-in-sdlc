#!/usr/bin/env node
// Hook smoke test (P0-S1). Feeds simulated tool calls to the hook scripts and checks the decision.
// Run: node .github/hooks/smoke-test.mjs   (exit code 1 if any case fails)
// Nothing here executes the commands under test; they are only passed as text to the guard.
import { spawnSync } from 'node:child_process';
import { mkdtempSync, mkdirSync, writeFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';

const repoRoot = process.cwd();
const guard = path.join(repoRoot, '.github/hooks/scripts/pre-tool-guard.mjs');
const postEdit = path.join(repoRoot, '.github/hooks/scripts/post-edit-check.mjs');

const run = (script, payload) => {
  const result = spawnSync('node', [script], { input: JSON.stringify(payload), encoding: 'utf8' });
  const text = result.stdout.trim();
  if (!text) return { decision: 'silent', reason: '' };
  const parsed = JSON.parse(text);
  return {
    decision: parsed.hookSpecificOutput?.permissionDecision ?? parsed.decision,
    reason: parsed.hookSpecificOutput?.permissionDecisionReason ?? parsed.reason,
  };
};

const terminal = (command) => ({ tool_name: 'run_in_terminal', cwd: repoRoot, tool_input: { command } });
const edit = (relativePath, cwd = repoRoot) => ({
  tool_name: 'create_file',
  cwd,
  tool_input: { filePath: path.join(cwd, relativePath) },
});

const scratch = mkdtempSync(path.join(tmpdir(), 'hook-smoke-'));
const scratchDomain = 'backend/src/InvoiceApp.Domain/Scratch.cs';
mkdirSync(path.dirname(path.join(scratch, scratchDomain)), { recursive: true });

const cases = [
  ['git push --force is denied', guard, terminal('git push --force origin main'), 'deny'],
  ['git push -f is denied', guard, terminal('git push -f'), 'deny'],
  ['recursive force delete is denied', guard, terminal('rm -rf some-folder'), 'deny'],
  ['git commit asks', guard, terminal('git commit -m "message"'), 'ask'],
  ['npm install asks', guard, terminal('npm install left-pad'), 'ask'],
  ['dotnet test is silent', guard, terminal('dotnet test backend/InvoiceApp.sln'), 'silent'],
  ['edit of a Domain file asks', guard, edit('backend/src/InvoiceApp.Domain/Invoice.cs'), 'ask'],
  ['edit of .env is denied', guard, edit('.env'), 'deny'],
  ['edit of a doc is silent', guard, edit('docs/ai-logs/example.md'), 'silent'],
];

const results = cases.map(([name, script, payload, expected]) => {
  const actual = run(script, payload);
  return { name, expected, actual: actual.decision, reason: actual.reason, pass: actual.decision === expected };
});

writeFileSync(path.join(scratch, scratchDomain), 'using Microsoft.AspNetCore.Http;\nclass Scratch {}\n');
const blocked = run(postEdit, edit(scratchDomain, scratch));
results.push({
  name: 'Domain file with "using Microsoft.AspNetCore" is blocked after edit',
  expected: 'block',
  actual: blocked.decision,
  reason: blocked.reason,
  pass: blocked.decision === 'block',
});

writeFileSync(path.join(scratch, scratchDomain), 'class Scratch {}\n');
const clean = run(postEdit, edit(scratchDomain, scratch));
results.push({
  name: 'Clean Domain file passes after edit',
  expected: 'silent',
  actual: clean.decision,
  reason: clean.reason,
  pass: clean.decision === 'silent',
});

rmSync(scratch, { recursive: true, force: true });

for (const row of results) {
  console.log(`${row.pass ? 'PASS' : 'FAIL'}  ${row.name}  (expected ${row.expected}, got ${row.actual})`);
  if (row.reason) console.log(`      ${row.reason.split('\n').join(' | ')}`);
}
const failed = results.filter((row) => !row.pass).length;
console.log(`\n${results.length - failed}/${results.length} passed`);
process.exit(failed === 0 ? 0 : 1);
