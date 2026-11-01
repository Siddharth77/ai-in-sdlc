#!/usr/bin/env node
// Scores the review eval. Reads labels.csv and results.csv, prints caught / missed / false alarm rates.
// Run from the repository root:  node docs/evals/score.mjs [--labels path] [--results path]
//
// Verdict values in results.csv:
//   defect case: caught | missed
//   clean case:  false_alarm | clean_ok
// Rows with an empty verdict are reported as pending and excluded from the rates.
import { readFileSync } from 'node:fs';

const argument = (name, fallback) => {
  const index = process.argv.indexOf(name);
  return index > -1 ? process.argv[index + 1] : fallback;
};

const parseCsv = (text) => {
  const [headerLine, ...lines] = text.trim().split(/\r?\n/);
  const headers = headerLine.split(',');
  return lines.map((line, index) => {
    // No quoting support: free-text columns must not contain commas.
    const cells = line.split(',');
    if (cells.length !== headers.length) throw new Error(`Row ${index + 2} has ${cells.length} cells, expected ${headers.length}. Remove commas from free-text columns.`);
    return Object.fromEntries(headers.map((name, i) => [name, cells[i]]));
  });
};

const wilson = (successes, total, z = 1.96) => {
  if (total === 0) return [NaN, NaN];
  const proportion = successes / total;
  const denominator = 1 + (z * z) / total;
  const center = (proportion + (z * z) / (2 * total)) / denominator;
  const margin = (z * Math.sqrt((proportion * (1 - proportion)) / total + (z * z) / (4 * total * total))) / denominator;
  return [Math.max(0, center - margin), Math.min(1, center + margin)];
};

const percent = (value) => (Number.isNaN(value) ? 'n/a' : `${(value * 100).toFixed(0)}%`);
const rate = (count, total) => (total === 0 ? 'n/a' : `${count}/${total} = ${percent(count / total)} (95% CI ${percent(wilson(count, total)[0])} to ${percent(wilson(count, total)[1])})`);

const labels = new Map(parseCsv(readFileSync(argument('--labels', 'docs/evals/labels.csv'), 'utf8')).map((row) => [row.case, row.label]));
const results = parseCsv(readFileSync(argument('--results', 'docs/evals/results.csv'), 'utf8'));

const problems = [];
const VALID = { defect: ['caught', 'missed'], clean: ['false_alarm', 'clean_ok'] };
const scored = [];
let pending = 0;

for (const row of results) {
  const label = labels.get(row.case);
  if (!label) { problems.push(`${row.case}: no label in labels.csv`); continue; }
  if (!row.verdict) { pending += 1; continue; }
  if (!VALID[label].includes(row.verdict)) {
    problems.push(`run ${row.run} ${row.case}: verdict "${row.verdict}" is not valid for a ${label} case (use ${VALID[label].join(' or ')})`);
    continue;
  }
  scored.push({ ...row, label });
}

const seen = new Set();
for (const row of results) {
  const key = `${row.run}|${row.case}`;
  if (seen.has(key)) problems.push(`duplicate row for run ${row.run} ${row.case}`);
  seen.add(key);
}

const groups = new Map();
for (const row of scored) {
  const key = `${row.prompt_version}|${row.model || '(model not recorded)'}`;
  groups.set(key, [...(groups.get(key) ?? []), row]);
}

const summarize = (rows) => {
  const defectRows = rows.filter((row) => row.label === 'defect');
  const cleanRows = rows.filter((row) => row.label === 'clean');
  const caught = defectRows.filter((row) => row.verdict === 'caught').length;
  const falseAlarms = cleanRows.filter((row) => row.verdict === 'false_alarm').length;
  return { defectTotal: defectRows.length, cleanTotal: cleanRows.length, caught, missed: defectRows.length - caught, falseAlarms };
};

console.log(`Labels: ${labels.size} cases (${[...labels.values()].filter((l) => l === 'defect').length} defect, ${[...labels.values()].filter((l) => l === 'clean').length} clean)`);
console.log(`Rows: ${results.length}, scored: ${scored.length}, pending: ${pending}`);
if (problems.length) console.log(`\nPROBLEMS (fix before trusting any number):\n- ${problems.join('\n- ')}`);

for (const [key, rows] of groups) {
  const [promptVersion, model] = key.split('|');
  console.log(`\n== prompt ${promptVersion}, model ${model} ==`);
  const runNumbers = [...new Set(rows.map((row) => row.run))].sort();
  for (const run of runNumbers) {
    const s = summarize(rows.filter((row) => row.run === run));
    console.log(`run ${run}: caught ${s.caught}/${s.defectTotal}, missed ${s.missed}/${s.defectTotal}, false alarms ${s.falseAlarms}/${s.cleanTotal}`);
  }
  const pooled = summarize(rows);
  console.log(`pooled over ${runNumbers.length} run(s):`);
  console.log(`  caught       ${rate(pooled.caught, pooled.defectTotal)}`);
  console.log(`  missed       ${rate(pooled.missed, pooled.defectTotal)}`);
  console.log(`  false alarm  ${rate(pooled.falseAlarms, pooled.cleanTotal)}`);

  const perCase = new Map();
  for (const row of rows) perCase.set(row.case, [...(perCase.get(row.case) ?? []), row.verdict]);
  const unstable = [...perCase].filter(([, verdicts]) => new Set(verdicts).size > 1).map(([name, verdicts]) => `${name}: ${verdicts.join('/')}`);
  console.log(`  cases whose verdict changed between runs: ${unstable.length ? unstable.join('; ') : 'none'}`);
}

console.log('\nCaution: repeated runs of the same cases are not independent samples. Treat the case count, not the row count, as the real sample size.');
