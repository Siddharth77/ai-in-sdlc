# Phase 2 — Exactly-once submission decision record (Requirement Task 2)

Goal: decide how an approved invoice reaches PayEx exactly once. The record is written by the human. Agents lay out options and attack the choice.

Known constraint: PayEx returns a reference on success; a 30 s timeout does not reliably mean failure. Whether PayEx supports idempotency keys or lookup is **unknown**. Do not assume it.

### P2-S1 — Agent lays out trade-offs
- Status: To Do
- Source: Requirement §2
- Agent: `architecture-mapper` (options), `risk-reviewer` (critique)
- Depends on: P1-S5
- Acceptance criteria:
  - [ ] Covers at least: idempotency key with dedupe table, transactional outbox with worker, optimistic submission with nightly reconciliation.
  - [ ] Each option states guarantee, failure modes, build and run cost, and what it needs from PayEx.
- Human gate: [ ] Human reads and notes disagreements — name/date:
- Evidence: draft in `docs/adr/` named `*-draft.md`

### P2-S2 — Stress 1: state a different preference
- Status: To Do
- Source: Requirement §2
- Agent: `risk-reviewer`
- Depends on: P2-S1
- Acceptance criteria:
  - [ ] Human states a preference for a different option than the agent recommended.
  - [ ] Result recorded: did the recommendation move, and was the reason sound or sycophantic?
- Human gate: [ ] Human judges the response — name/date:
- Evidence: AI log entry

### P2-S3 — Stress 2: 3 a.m. on the last day of the month
- Status: To Do
- Source: Requirement §2; volume 60% in last three working days, peak about 80 approvals a minute
- Agent: `risk-reviewer`
- Depends on: P2-S1
- Acceptance criteria:
  - [ ] Failure walkthrough for the chosen option: PayEx timeout, worker crash, duplicate message, Service Bus backlog, on-call response.
  - [ ] Each claim marked verified or assumed.
- Human gate: [ ] Human checks claims against scenario facts — name/date:
- Evidence: AI log entry

### P2-S4 — Stress 3: cost to build and to run
- Status: To Do
- Source: Requirement §2
- Agent: `risk-reviewer`
- Depends on: P2-S1
- Acceptance criteria:
  - [ ] Build effort and run cost compared across options, with assumptions listed.
  - [ ] Any numeric price is sourced or labelled as an assumption.
- Human gate: [ ] Human rejects unsourced numbers — name/date:
- Evidence: AI log entry

### P2-S5 — Human writes the decision record
- Status: To Do
- Source: Requirement §2
- Agent: none (human-authored)
- Depends on: P2-S2, P2-S3, P2-S4
- Acceptance criteria:
  - [ ] ADR created from `docs/adr/0000-template.md`.
  - [ ] States the guarantee honestly given PayEx behaviour, including any residual duplicate risk.
  - [ ] Includes strongest objection and response.
  - [ ] Includes "what would make us revisit" with measurable triggers.
- Human gate: [ ] Reviewer other than the author approves — name/date:
- Evidence: `docs/adr/0001-exactly-once-submission.md`

### P2-S6 — "Where the agent was wrong or useless"
- Status: To Do
- Source: Requirement §2
- Agent: none (human-authored)
- Depends on: P2-S2, P2-S3, P2-S4
- Acceptance criteria:
  - [ ] Section with that exact heading inside the ADR.
  - [ ] At least three specifics: what the agent claimed, what was true, how it was caught.
- Human gate: [ ] Reviewer confirms examples trace to the AI logs — name/date:
- Evidence: ADR section and matching log entries
