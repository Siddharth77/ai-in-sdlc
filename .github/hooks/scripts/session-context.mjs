#!/usr/bin/env node
// SessionStart: inject the human-gate rules so every agent session starts with them.
const context = [
  'Human-in-the-loop rules for this repository:',
  '- ops/ describes a PLANNED production deployment. It is not the current system.',
  '- Work one backlog story at a time (docs/backlog). Only a human marks a story Done.',
  '- Ask before commit, push, installs, config, auth, Domain or CI changes.',
  '- Decision records, the autonomy policy and the "Where the agent was wrong or useless" section are human-authored.',
  '- Never report test or metric results you did not run or capture.',
].join('\n');

process.stdout.write(
  JSON.stringify({ hookSpecificOutput: { hookEventName: 'SessionStart', additionalContext: context } }),
);
