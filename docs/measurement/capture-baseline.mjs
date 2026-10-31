#!/usr/bin/env node
// Captures the two baseline numbers available today, read-only.
//   1. CI wall-clock per run (floor for lead time for changes) from ops/pipeline/run-timings.csv
//   2. CI failure rate (proxy for change failure rate) from the same file
// Also prints repository facts from git. Nothing is written; redirect stdout to keep a copy.
// Run from the repository root:  node docs/measurement/capture-baseline.mjs
import { readFileSync } from 'node:fs';
import { execFileSync } from 'node:child_process';

const TIMINGS_FILE = 'ops/pipeline/run-timings.csv';

// The step column can contain commas inside quotes only if the exporter quoted it; none do today, so fail loudly if that changes.
const parseCsv = (text) => {
  const [headerLine, ...lines] = text.trim().split(/\r?\n/);
  const headers = headerLine.split(',');
  return lines.map((line, index) => {
    const cells = line.split(',');
    if (cells.length !== headers.length) throw new Error(`Row ${index + 2} has ${cells.length} cells, expected ${headers.length}`);
    return Object.fromEntries(headers.map((name, i) => [name, cells[i]]));
  });
};

const percentile = (sortedValues, fraction) => {
  const position = (sortedValues.length - 1) * fraction;
  const lower = Math.floor(position);
  const upper = Math.ceil(position);
  return sortedValues[lower] + (sortedValues[upper] - sortedValues[lower]) * (position - lower);
};

const rows = parseCsv(readFileSync(TIMINGS_FILE, 'utf8'));
const runs = new Map();
for (const row of rows) {
  const run = runs.get(row.run_number) ?? { branch: row.branch, event: row.event, conclusion: row.conclusion, startedAt: row.started_at, totalSeconds: 0, steps: 0 };
  run.totalSeconds += Number(row.duration_seconds);
  run.steps += 1;
  runs.set(row.run_number, run);
}

const runList = [...runs.values()];
const durations = runList.map((run) => run.totalSeconds).sort((a, b) => a - b);
const failed = runList.filter((run) => run.conclusion !== 'success');
const mainPushRuns = runList.filter((run) => run.branch === 'main' && run.event === 'push');
const sum = durations.reduce((total, value) => total + value, 0);

const git = (...args) => execFileSync('git', args, { encoding: 'utf8' }).trim();
const commitDates = git('log', '--format=%aI').split('\n').reverse();

const report = {
  capturedAt: new Date().toISOString(),
  source: { file: TIMINGS_FILE, note: 'Invented planned-deployment fixture per ops/README.md; not live production data.' },
  ci: {
    runs: runList.length,
    stepRows: rows.length,
    runsWithMissingSteps: runList.filter((run) => run.steps !== runList[0].steps).length,
    durationSeconds: { mean: Math.round(sum / runList.length), median: percentile(durations, 0.5), p90: Math.round(percentile(durations, 0.9)), min: durations[0], max: durations.at(-1) },
    failedRuns: failed.length,
    failureRate: Number((failed.length / runList.length).toFixed(3)),
    failedRunDetail: failed.map((run) => `${run.startedAt} ${run.branch} (${run.event})`),
    mainPushRuns: mainPushRuns.length,
    mainPushFailures: mainPushRuns.filter((run) => run.conclusion !== 'success').length,
  },
  repository: {
    commits: commitDates.length,
    firstCommit: commitDates[0],
    lastCommit: commitDates.at(-1),
    tags: git('tag').split('\n').filter(Boolean).length,
    remote: git('remote', 'get-url', 'origin'),
  },
};

console.log(JSON.stringify(report, null, 2));
