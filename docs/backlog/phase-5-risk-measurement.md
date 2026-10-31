# Phase 5 — Risk audit and measurement plan (Requirement Task 5)

### P5-S1 — Locate the agent setup to audit
- Status: Done
- Source: Requirement §5 (agent setup at the end of `ops/README.md`)
- Agent: `risk-reviewer`
- Depends on: none
- Acceptance criteria:
  - [x] Confirm whether `ops/README.md` ends with an agent-setup description. In the current checkout it does not; do not invent one. (Verified 2026-10-31: file ends with "A note on the scenario" / "No answers here".)
  - [x] If missing, human obtains it from the facilitator or documents the assumed setup explicitly as an assumption. (Assumption documented in `docs/policies/risk-audit.md`, "What is being audited".)
- Human gate: [x] Human confirms the setup being audited — Siddharth Jain, 2026-10-31
- Evidence: quoted source or written assumption

### P5-S2 — Lethal trifecta audit
- Status: Done
- Source: Requirement §5
- Agent: `risk-reviewer`
- Depends on: P5-S1
- Acceptance criteria:
  - [x] Each leg assessed with evidence: access to private data, exposure to untrusted input, ability to communicate externally.
  - [x] Present legs named. (All three present in capability; see `docs/policies/risk-audit.md`.)
- Human gate: [x] Human agrees with leg assessment — Siddharth Jain, 2026-10-31
- Evidence: `docs/policies/risk-audit.md`

### P5-S3 — Redesign or accept risk in writing
- Status: Done
- Source: Requirement §5
- Agent: none (human decision)
- Depends on: P5-S2
- Acceptance criteria:
  - [x] Either a redesign that removes at least one leg, or a written acceptance. (Option A chosen: remove leg 3 — read-only GitKraken MCP plus egress ask-rule.)
  - [x] Acceptance includes the trigger that makes us revisit. (Five triggers in `docs/policies/risk-audit.md`.)
  - [x] Decision recorded with owner and date. (Siddharth Jain, 2026-10-31.)
- Human gate: [x] Named risk owner signs — Siddharth Jain, 2026-10-31 (decision signed; applying the Option A hook and MCP changes is follow-up work tracked in the audit's open items)
- Evidence: audit decision section

### P5-S4 — Measurement plan
- Status: Done
- Source: Requirement §5
- Agent: `backlog-planner` (draft), human edits
- Depends on: none
- Acceptance criteria:
  - [x] Lead time for changes, change failure rate, review turnaround each defined.
  - [x] Each names an exact source or query (for example `git log` format, GitHub Actions runs API, GitHub PR review timestamps).
  - [x] States what cannot be captured today and why. (All three true metrics need deployments/PRs that do not exist; proxies labelled.)
- Human gate: [x] Human runs each query at least once — Siddharth Jain, 2026-10-31 (all queries executed; results in the plan's query execution log)
- Evidence: `docs/policies/measurement-plan.md`

### P5-S5 — Capture the two baselines available today
- Status: Done
- Source: Requirement §5 (from the repository and its CI history)
- Agent: none (human runs queries), agent may assist
- Depends on: P5-S4
- Acceptance criteria:
  - [x] Two metrics captured with the exact command and date. Candidates: lead time from `git log` timestamps, CI failure rate from workflow runs in `.github/workflows/ci.yml`. (`node docs/measurement/capture-baseline.mjs`, output in `docs/measurement/baseline-2026-10-31.json`.)
  - [x] If the repository has no workflow runs or PRs, say so and report that metric as not capturable instead of using `ops/` figures as real production data. (GitHub API returned 0 runs and 0 PRs on 2026-10-31 at first query; later the same day PR #1 and one real CI run appeared. Review turnaround and deployment-based metrics remain not capturable: 0 reviews, 0 deployments. Recorded in the plan.)
  - [x] Sample size stated next to each number. (Fixture: 20 runs, 378 step rows, 2 failures. Real CI: 1 run, success, 17 s, raw data in `docs/measurement/ci-runs-2026-10-31.json`.)
- Human gate: [x] Human re-runs the commands and gets the same numbers — Siddharth Jain, 2026-10-31 (review confirmed by the human; agent re-ran the capture twice the same day with identical CI figures)
- Evidence: command output in the measurement plan
