#!/usr/bin/env node
// Stop: remind the human what is uncommitted and unreviewed. Never blocks.
import { execFileSync } from 'node:child_process';
import { readHookInput, workspaceRoot } from './lib.mjs';

const input = readHookInput();
let changedFiles = [];
try {
  changedFiles = execFileSync('git', ['status', '--porcelain'], {
    cwd: workspaceRoot(input),
    encoding: 'utf8',
  })
    .split('\n')
    .filter(Boolean);
} catch {
  process.exit(0);
}

if (changedFiles.length > 0) {
  process.stdout.write(
    JSON.stringify({
      systemMessage: `Human review needed: ${changedFiles.length} uncommitted change(s). Review the diff, run dotnet test backend/InvoiceApp.sln, then tick the story's Human gate before committing.`,
    }),
  );
}
