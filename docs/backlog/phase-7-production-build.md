# Phase 7 — Production build (deferred)

Status: **Blocked** until the exactly-once ADR (P2-S5) and risk decision (P5-S3) are approved. The requirement asks for design, not implementation; these stories capture the work the target state implies. Every one is a human-gated code change with `backend-implementer` and `test-author`.

### P7-S1 — SQL persistence behind `IInvoiceRepository`
- Status: Blocked
- Source: Scenario ("persistence today: none"), target-state diagram
- Agent: `backend-implementer`
- Depends on: P2-S5
- Acceptance criteria:
  - [ ] New repository in Api implements `IInvoiceRepository`; Domain unchanged and free of SQL types.
  - [ ] Migration reviewed; tests use `FakeInvoiceRepository` for Domain.
  - [ ] Architecture test from P1-S6 still passes.
- Human gate: [ ] Human reviews schema and migration — name/date:

### P7-S2 — Append-only approval audit trail
- Status: Blocked
- Source: Scenario (approval actions auditable for seven years, SOC 2)
- Agent: `backend-implementer`
- Depends on: P7-S1
- Acceptance criteria:
  - [ ] Records who, what, when for approve and reject.
  - [ ] Retention and immutability approach approved by a human.
- Human gate: [ ] Compliance-aware reviewer approves — name/date:

### P7-S3 — Exactly-once mechanism per ADR
- Status: Blocked
- Source: ADR from P2-S5
- Agent: `backend-implementer`, `test-author`
- Depends on: P2-S5, P7-S1
- Acceptance criteria:
  - [ ] Implements only the option the ADR chose.
  - [ ] Tests cover duplicate submit, crash between steps and timeout.
- Human gate: [ ] Human reviews failure-case tests — name/date:

### P7-S4 — PayEx client with timeout handling
- Status: Blocked
- Source: Scenario (30 s timeout does not reliably mean failure)
- Agent: `backend-implementer`
- Depends on: P7-S3
- Acceptance criteria:
  - [ ] Timeout is treated as unknown, not failed.
  - [ ] Provider calls sit behind an interface; tests use a fake.
  - [ ] No real endpoint or credential in the repo.
- Human gate: [ ] Human reviews secrets handling — name/date:

### P7-S5 — Service Bus worker (if the ADR requires it)
- Status: Blocked
- Source: Scenario (Service Bus provisioned, unused)
- Agent: `backend-implementer`
- Depends on: P7-S3
- Acceptance criteria:
  - [ ] Worker lives outside Domain.
  - [ ] Retry, dead-letter and poison-message behaviour tested.
- Human gate: [ ] Human reviews retry and dead-letter policy — name/date:

### P7-S6 — SLO, alerts and on-call runbook
- Status: Blocked
- Source: Scenario (published SLO, 24x7 rotation)
- Agent: `backlog-planner` (draft only)
- Depends on: P5-S5
- Acceptance criteria:
  - [ ] SLO values are chosen by a human from measured baselines, not invented.
  - [ ] Runbook covers PayEx timeout and queue backlog.
- Human gate: [ ] On-call engineer reads it — name/date:

### P7-S7 — Add architecture test to CI
- Status: Done
- Source: P1-S6, `.github/workflows/ci.yml`
- Agent: `backend-implementer`
- Depends on: P1-S6
- Acceptance criteria:
  - [x] CI runs `dotnet test backend/InvoiceApp.sln`, including the architecture test. (`ci.yml` line 18 runs the whole solution with no filter, so `DomainDependencyRuleTests` is included. Checked by reading the file on 2026-11-01. Not checked in a CI run log.)
  - [x] Workflow change reviewed by a human. (No workflow change was needed: `ci.yml` is unchanged since the first commit on 2026-10-05, so there is no diff to review.)
- Human gate: [x] Human reviews the workflow diff — not applicable, no diff. Marked Done on Siddharth Jain's instruction, 2026-11-01 (stated in chat).
- Evidence: `.github/workflows/ci.yml`; `dotnet test backend/InvoiceApp.sln` gave 9 of 9 on 2026-11-01
