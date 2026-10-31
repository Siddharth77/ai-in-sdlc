# Phase 5 — Risk audit and measurement plan (Requirement Task 5)

### P5-S1 — Locate the agent setup to audit
- Status: To Do
- Source: Requirement §5 (agent setup at the end of `ops/README.md`)
- Agent: `risk-reviewer`
- Depends on: none
- Acceptance criteria:
  - [ ] Confirm whether `ops/README.md` ends with an agent-setup description. In the current checkout it does not; do not invent one.
  - [ ] If missing, human obtains it from the facilitator or documents the assumed setup explicitly as an assumption.
- Human gate: [ ] Human confirms the setup being audited — name/date:
- Evidence: quoted source or written assumption

### P5-S2 — Lethal trifecta audit
- Status: To Do
- Source: Requirement §5
- Agent: `risk-reviewer`
- Depends on: P5-S1
- Acceptance criteria:
  - [ ] Each leg assessed with evidence: access to private data, exposure to untrusted input, ability to communicate externally.
  - [ ] Present legs named.
- Human gate: [ ] Human agrees with leg assessment — name/date:
- Evidence: `docs/policies/risk-audit.md`

### P5-S3 — Redesign or accept risk in writing
- Status: To Do
- Source: Requirement §5
- Agent: none (human decision)
- Depends on: P5-S2
- Acceptance criteria:
  - [ ] Either a redesign that removes at least one leg, or a written acceptance.
  - [ ] Acceptance includes the trigger that makes us revisit.
  - [ ] Decision recorded with owner and date.
- Human gate: [ ] Named risk owner signs — name/date:
- Evidence: audit decision section

### P5-S4 — Measurement plan
- Status: To Do
- Source: Requirement §5
- Agent: `backlog-planner` (draft), human edits
- Depends on: none
- Acceptance criteria:
  - [ ] Lead time for changes, change failure rate, review turnaround each defined.
  - [ ] Each names an exact source or query (for example `git log` format, GitHub Actions runs API, GitHub PR review timestamps).
  - [ ] States what cannot be captured today and why.
- Human gate: [ ] Human runs each query at least once or marks it untested — name/date:
- Evidence: `docs/policies/measurement-plan.md`

### P5-S5 — Capture the two baselines available today
- Status: To Do
- Source: Requirement §5 (from the repository and its CI history)
- Agent: none (human runs queries), agent may assist
- Depends on: P5-S4
- Acceptance criteria:
  - [ ] Two metrics captured with the exact command and date. Candidates: lead time from `git log` timestamps, CI failure rate from workflow runs in `.github/workflows/ci.yml`.
  - [ ] If the repository has no workflow runs or PRs, say so and report that metric as not capturable instead of using `ops/` figures as real production data.
  - [ ] Sample size stated next to each number.
- Human gate: [ ] Human re-runs the commands and gets the same numbers — name/date:
- Evidence: command output in the measurement plan
