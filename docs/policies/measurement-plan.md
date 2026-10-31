# Measurement plan and baseline (DRAFT for human review)

Status: draft. Numbers below were captured on 2026-10-31 with the commands shown. A human must re-run them and confirm the same output before this is submitted (backlog P5-S5).

## Read this first: what the data is and is not

- `ops/pipeline/run-timings.csv` is an invented fixture for the planned deployment (`ops/README.md`: "Names, hosts and figures are invented"). It is the only CI history available. Numbers from it are real arithmetic on fixture data, not production measurements.
- The live GitHub repository `Siddharth77/ai-in-sdlc` has 0 workflow runs and 0 pull requests (queried 2026-10-31, URLs below). The local `.github/workflows/ci.yml` has never produced a recorded run.
- The service has no deployments yet, so true lead time for changes and true change failure rate cannot exist today. What we can capture are the closest honest proxies, labelled as proxies.

## Baseline to capture before the rotation starts

| Metric | Definition used | Exact source or query | Capturable today? |
| --- | --- | --- | --- |
| Lead time for changes | Commit timestamp to the change running in production | Commit time: `git log --format='%H %aI' main`. Deploy time: GitHub Deployments API `GET /repos/{owner}/{repo}/deployments` and `/deployments/{id}/statuses` (state `success`), joined on SHA. Until deployments exist, use the proxy below. | No. Proxy: CI wall-clock per run (the floor) |
| Change failure rate | Share of production deployments that cause a rollback, hotfix or incident | Deployments API for the denominator. Numerator: deployments linked to a sev incident or revert, i.e. `git log --grep='^Revert'` plus the incident tracker, joined on SHA. Until then use the proxy below. | No. Proxy: CI failure rate (pre-merge) |
| Review turnaround | Pull request ready-for-review to first human review | `GET /repos/{owner}/{repo}/pulls?state=all` then for each PR `GET /pulls/{n}/reviews`; value is the earliest review `submitted_at` minus the PR `ready_for_review` event time from `GET /issues/{n}/timeline`. Exclude bot reviews. | No. 0 pull requests exist |

Cadence once live: weekly, reported as median and 90th percentile with the sample size beside each, never a bare mean. Re-capture the baseline in the last week before the first on-call rotation, then compare after each rotation. Do not set targets or SLOs from the fixture numbers.

## The two numbers captured today

Command (run from the repository root, read-only):

```
node docs/measurement/capture-baseline.mjs
```

Full output saved in [baseline-2026-10-31.json](../measurement/baseline-2026-10-31.json).

| # | Proxy for | Value | n | Source |
| --- | --- | --- | --- | --- |
| 1 | Lead time for changes (floor only) | CI wall-clock per run: median 1,875.5 s (about 31 min), mean 1,881 s, 90th percentile 2,072 s, range 1,702 to 2,108 s | 20 runs, 378 step rows | `ops/pipeline/run-timings.csv`, sum of `duration_seconds` per `run_number` |
| 2 | Change failure rate (pre-merge) | 2 of 20 runs failed = 10.0 percent. Both on pull requests (runs 6 and 14). 0 of 8 main-branch push runs failed | 20 runs | same file, `conclusion` per run |

Caveats a reviewer should challenge:

1. Number 1 is not lead time. It excludes review wait, merge wait and deploy. It is a lower bound on how fast any change can reach production. Every change pays at least about 31 minutes before it can ship.
2. Number 2 counts CI failures caught before merge. That is a quality-gate signal, not production failures, so it can be high while change failure rate is zero, or the reverse. Treat it as a proxy only.
3. 20 runs and 2 failures give a very wide interval (the 95 percent Wilson interval for 2 of 20 is roughly 3 to 30 percent). The fixture cannot support a claim that the rate is 10 percent, only that failures occurred.
4. Run 6 failed before the end-to-end step (19 of 20 runs contain it), so failed-run durations are shorter than a full run. Successful runs only: mean 1,893 s over 18 runs.
5. Repository facts from git on the same run: 7 commits between 2026-10-05 and 2026-10-31, 0 tags, so there is nothing to compute release cadence from.

## Reproduce the no-data findings

- `https://api.github.com/repos/Siddharth77/ai-in-sdlc/actions/runs?per_page=100` returned `"total_count": 0`.
- `https://api.github.com/repos/Siddharth77/ai-in-sdlc/pulls?state=all&per_page=100` returned an empty array.

## Open items for the human

- Decide whether the fixture figures are acceptable as "CI history" for submission, or whether to push a branch and let GitHub Actions build a real history first (needs your approval; hooks will ask before any push).
- Confirm how incidents map to deployments so the change-failure numerator has an agreed definition.
