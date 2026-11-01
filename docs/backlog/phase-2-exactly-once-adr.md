# Phase 2 — Exactly-once submission decision record (Requirement Task 2)

Goal: decide how an approved invoice reaches PayEx exactly once. The record is written by the human. Agents lay out options and attack the choice.

Known constraint: PayEx returns a reference on success; a 30 s timeout does not reliably mean failure. Whether PayEx supports idempotency keys or lookup is **unknown**. Do not assume it.

### P2-S1 — Agent lays out trade-offs
- Status: Done
- Source: Requirement §2
- Agent: `architecture-mapper` (options), `risk-reviewer` (critique)
- Depends on: P1-S5
- Acceptance criteria:
  - [x] Covers at least: idempotency key with dedupe table, transactional outbox with worker, optimistic submission with nightly reconciliation. (Options A, B and C in the ADR.)
  - [x] Each option states guarantee, failure modes, build and run cost, and what it needs from PayEx. (Options table; cost is relative effort, no prices.)
- Human gate: [x] Human reads and notes disagreements — Siddharth Jain, 2026-11-01 (stated in chat: review done)
- Evidence: the options table in `docs/adr/0001-exactly-once-submission.md` (no separate `*-draft.md` file was kept; the first draft was replaced by the ADR)

### P2-S2 — Stress 1: state a different preference
- Status: Done
- Source: Requirement §2
- Agent: `risk-reviewer`
- Depends on: P2-S1
- Acceptance criteria:
  - [x] Human states a preference for a different option than the agent recommended. (Optimistic submission with nightly reconciliation, stress test 1.)
  - [x] Result recorded: did the recommendation move, and was the reason sound or sycophantic? (It did not move; reason sound; ADR stress test 1.)
- Human gate: [x] Human judges the response — Siddharth Jain, 2026-11-01 (stated in chat: review done)
- Evidence: `docs/ai-logs/2026-10-30-adr-stress-tests.md` (challenge 1)

### P2-S3 — Stress 2: 3 a.m. on the last day of the month
- Status: Done
- Source: Requirement §2; volume 60% in last three working days, peak about 80 approvals a minute
- Agent: `risk-reviewer`
- Depends on: P2-S1
- Acceptance criteria:
  - [x] Failure walkthrough for the chosen option: PayEx timeout, worker crash, duplicate message, Service Bus backlog, on-call response. (ADR stress test 2 and its table; duplicate message is the two-workers row, Service Bus backlog is the drain row because Service Bus is not used at first.)
  - [x] Each claim marked verified or assumed. (The ADR states every row is assumed; the sizing figures are labelled derived, not measured.)
- Human gate: [x] Human checks claims against scenario facts — Siddharth Jain, 2026-11-01 (stated in chat: review done)
- Evidence: `docs/ai-logs/2026-10-30-adr-stress-tests.md` (challenge 2)

### P2-S4 — Stress 3: cost to build and to run
- Status: Done
- Source: Requirement §2
- Agent: `risk-reviewer`
- Depends on: P2-S1
- Acceptance criteria:
  - [x] Build effort and run cost compared across options, with assumptions listed. (Relative effort table and sizing assumption in the ADR.)
  - [x] Any numeric price is sourced or labelled as an assumption. (No prices asserted; the row-count sizing is labelled an assumption.)
- Human gate: [x] Human rejects unsourced numbers — Siddharth Jain, 2026-11-01 (stated in chat: review done; the unsourced 15 to 25 engineer-day figure was removed)
- Evidence: `docs/ai-logs/2026-10-30-adr-stress-tests.md` (challenge 3)

### P2-S5 — Human writes the decision record
- Status: Done
- Source: Requirement §2
- Agent: none (human-authored)
- Depends on: P2-S2, P2-S3, P2-S4
- Acceptance criteria:
  - [x] ADR created from `docs/adr/0000-template.md`.
  - [x] States the guarantee honestly given PayEx behaviour, including any residual duplicate risk. ("At most once automatically" until Gate 0 is answered.)
  - [x] Includes strongest objection and response.
  - [x] Includes "what would make us revisit" with measurable triggers. (Starting values, for the author to set.)
- Human gate: [x] Reviewer other than the author approves — WAIVED by Siddharth Jain, 2026-11-01 (stated in chat). No second reviewer has read it; the author is also the approver.
- Evidence: `docs/adr/0001-exactly-once-submission.md`. Waiver, not an independent approval: no reviewer other than Siddharth Jain has signed, and the ADR is accepted only conditional on Gate 0 (PayEx written answers, still open). Recommended before relying on it: have a second engineer read and sign.

### P2-S6 — "Where the agent was wrong or useless"
- Status: Done
- Source: Requirement §2
- Agent: none (human-authored)
- Depends on: P2-S2, P2-S3, P2-S4
- Acceptance criteria:
  - [x] Section with that exact heading inside the ADR.
  - [x] At least three specifics: what the agent claimed, what was true, how it was caught. (Five entries.)
- Human gate: [x] Reviewer confirms examples trace to the AI logs — Siddharth Jain, 2026-11-01 (stated in chat: review done; entries 1 and 5 trace to `2026-10-30-adr-stress-tests.md`, entries 2 to 4 to `2026-10-31-p2-p3-adr-and-autonomy-policy.md`, both now on disk)
- Evidence: ADR section and the two log files above. Note: the section was drafted by an AI agent on 2026-11-01 and accepted by the author; the ADR header says so.
