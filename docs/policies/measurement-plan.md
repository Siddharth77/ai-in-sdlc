# Measurement plan and baseline

Status: reviewed. Numbers below were captured on 2026-10-31 with the commands shown and re-run with identical CI figures. Human review confirmed by Siddharth Jain, 2026-10-31 (backlog P5-S5).

## Read this first: what the data is and is not

- `ops/pipeline/run-timings.csv` is an invented fixture for the planned deployment (`ops/README.md`: "Names, hosts and figures are invented"). It is the only CI history available. Numbers from it are real arithmetic on fixture data, not production measurements.
- When first queried on 2026-10-31 the live GitHub repository `Siddharth77/ai-in-sdlc` had 0 workflow runs and 0 pull requests (URLs below). `ci.yml` was not registered with GitHub until later that day. After PR #1 was opened and a commit pushed, the first real run appeared (see "First real CI run" below, n = 1).
- The service has no deployments yet, so true lead time for changes and true change failure rate cannot exist today. What we can capture are the closest honest proxies, labelled as proxies.

## Baseline to capture before the rotation starts

| Metric | Definition used | Exact source or query | Capturable today? |
| --- | --- | --- | --- |
| Lead time for changes | Commit timestamp to the change running in production | Commit time: `git log --format='%H %aI' main`. Deploy time: GitHub Deployments API `GET /repos/{owner}/{repo}/deployments` and `/deployments/{id}/statuses` (state `success`), joined on SHA. Until deployments exist, use the proxy below. | No. Proxy: CI wall-clock per run (the floor) |
| Change failure rate | Share of production deployments that cause a rollback, hotfix or incident | Deployments API for the denominator. Numerator: deployments linked to a sev incident or revert, i.e. `git log --grep='^Revert'` plus the incident tracker, joined on SHA. Until then use the proxy below. | No. Proxy: CI failure rate (pre-merge) |
| Review turnaround | Pull request ready-for-review to first human review | `GET /repos/{owner}/{repo}/pulls?state=all` then for each PR `GET /pulls/{n}/reviews`; value is the earliest review `submitted_at` minus the PR `ready_for_review` event time from `GET /issues/{n}/timeline`. Exclude bot reviews. | No. PR #1 exists (opened 2026-10-31T17:56:00Z) but has 0 reviews, so there is no turnaround to compute yet |

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
5. Repository facts from git (re-captured 2026-10-31): `main` has 6 commits (`git rev-list --count main`, 2026-10-05 to 2026-10-12). The capture script's `repository.commits` counts the checked-out branch, `feat/prod-ai-in-sdlc` (13 commits at the last capture), so that field grows as work continues and is not the `main` figure. 0 tags, so there is nothing to compute release cadence from. The CI figures in the table above do not depend on git and were identical on every re-run.

## First real CI run (captured 2026-10-31)

Command (needs `gh auth login`):

```
gh run list --limit 100 --json databaseId,event,headBranch,status,conclusion,createdAt,updatedAt,headSha,workflowName > docs/measurement/ci-runs-2026-10-31.json
gh run view 41227216780 --json jobs
```

Raw output saved in [ci-runs-2026-10-31.json](../measurement/ci-runs-2026-10-31.json).

| Field | Value |
| --- | --- |
| Run | 41227216780, workflow `CI`, event `pull_request`, branch `feat/prod-ai-in-sdlc`, SHA `ba11b475` |
| Result | success (1 of 1 runs; failure rate 0 of 1) |
| Wall-clock | 17 s (created 18:00:05Z, completed 18:00:22Z); job 15 s |
| Steps | checkout 1 s, setup-dotnet 1 s, build (Release) 6 s, test 4 s |
| n | 1 run |

This is real data from the live repository and is the first genuine CI measurement. It is not comparable to the fixture proxies above: the real workflow runs build and test only on a small solution, while the fixture's roughly 31 minute runs include an end-to-end step and are invented. With n = 1 no rate or percentile is meaningful. Re-capture as runs accumulate, and report median and 90th percentile only once there are enough runs to support them.

## Re-capture on 2026-11-01

Commands: `node docs/measurement/capture-baseline.mjs` and `gh run list --limit 100 --json databaseId,event,headBranch,status,conclusion,createdAt,updatedAt,workflowName`. Raw output saved in [baseline-2026-11-01.json](../measurement/baseline-2026-11-01.json) and [ci-runs-2026-11-01.json](../measurement/ci-runs-2026-11-01.json).

| Number | 2026-10-31 | 2026-11-01 |
| --- | --- | --- |
| Fixture CI (20 runs): median, failures | 1,875.5 s, 2 of 20 | 1,875.5 s, 2 of 20 (identical: the fixture does not change) |
| Real CI runs | 1 (run 41227216780, success, 17 s) | 5, all success, all on `pull_request`: 41274155952 (22 s), 41273631326 (30 s), 41234200739 (32 s), 41228762027 (23 s), 41227216780 (17 s) |
| Commits on the checked-out branch | 13 | 15 (grows with work; `main` is still 6) |
| Deployments, reviews, tags | 0, 0, 0 | not re-queried |

With n = 5 and no failures, no rate or percentile is meaningful. This is still a small sample, and the live run data remains a lead-time proxy rather than a production reliability statement.

## Reproduce the no-data findings

First query, 2026-10-31, before PR #1 existed:

- `https://api.github.com/repos/Siddharth77/ai-in-sdlc/actions/runs?per_page=100` returned `"total_count": 0`.
- `https://api.github.com/repos/Siddharth77/ai-in-sdlc/pulls?state=all&per_page=100` returned an empty array.

Still true on the later re-query (same day, after the first run): `gh api repos/Siddharth77/ai-in-sdlc/deployments --jq 'length'` returns 0, and `gh pr view 1 --json reviews` returns an empty `reviews` array.

## Query execution log (P5-S4 gate)

Every query in the plan was executed on 2026-10-31 by Siddharth Jain (agent-assisted, terminal output seen in session):

| Query | Result |
| --- | --- |
| `git log --format='%H %aI' main` | 6 commits on `main`, 2026-10-05T10:19:03Z to 2026-10-12T10:20:35Z |
| `git log --grep='^Revert' --oneline` | No output — zero reverts in history |
| `git tag` | 0 tags |
| GitHub Actions runs API (first query) | `total_count: 0` — no workflow runs. Re-queried after PR #1 and a push: 1 run, success (see "First real CI run") |
| GitHub pulls API (`state=all`) (first query) | Empty array — no pull requests. Re-queried later: PR #1 open, 0 reviews (`gh pr view 1 --json reviews`) |
| GitHub deployments API | Empty array — no deployments (re-confirmed later: `length` 0) |
| `gh run list` and `gh run view 41227216780 --json jobs` | 1 run, success, 17 s wall-clock, per-step timings (see "First real CI run") |
| `node docs/measurement/capture-baseline.mjs` | Reproduces `baseline-2026-10-31.json` CI figures (20 runs, median 1,875.5 s, 2 failures = 10%) |

Consequence: lead time for changes, change failure rate and review turnaround
all remain **not capturable as true metrics** — there are no deployments, no
reverts and no PR reviews (PR #1 exists but has not been reviewed). The two
fixture proxies are still the only multi-run numbers; the single real CI run
(n = 1) is recorded separately and is too small to replace them.
