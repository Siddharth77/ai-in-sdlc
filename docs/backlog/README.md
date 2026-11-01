# Backlog: Invoice Approval production readiness

Source: `docs/requirement/AI-in-SDLC-Home Assignment.pdf` (five tasks plus demo video, submission pack and AI logs).

## How this backlog works

- Work one story at a time, in phase order. Every story starts as `To Do`.
- Status values: `To Do`, `In Progress`, `In Review`, `Done`, `Blocked`.
- Each story has a **Human gate**. A person reads the output, runs the verification, and ticks the gate with name and date before the story can move to `Done`. Agents never mark `Done`.
- `ops/` is planned-deployment evidence, not the current system. As-built work cites code only.
- Hooks in `.github/hooks/` enforce approvals deterministically (see Guardrails).
- Log AI use per session in `docs/ai-logs/`.

## Phases

| Phase | Name | Requirement | Stories | Status |
| --- | --- | --- | --- | --- |
| 0 | [Agent workspace and guardrails](phase-0-guardrails.md) | Setup, item 9 | 4 | Done |
| 1 | [As-built and target architecture](phase-1-architecture.md) | Task 1 | 6 | Done |
| 2 | [Exactly-once decision record](phase-2-exactly-once-adr.md) | Task 2 | 6 | Done (P2-S5 second-reviewer gate waived) |
| 3 | [Autonomy policy](phase-3-autonomy-policy.md) | Task 3 | 5 | Done (P3-S4, S5 waived) |
| 4 | [Review evaluation](phase-4-review-eval.md) | Task 4 | 6 | Done (P4-S4 raw outputs waived) |
| 5 | [Risk audit and measurement plan](phase-5-risk-measurement.md) | Task 5 | 5 | Done |
| 6 | [Submission pack](phase-6-submission.md) | Hand-in 1-9, demo video | 4 | In Progress (S1, S3 Done; S2 video, S4 open) |
| 7 | [Production build (deferred)](phase-7-production-build.md) | Implied by target state | 7 | Blocked (S7 Done; S1-S6 not started) |

## Dependencies at a glance

Phase 0 gates everything. Phase 1 feeds 2 and 5. Phase 2 and 5 must be approved before Phase 7 starts. Phase 6 needs phases 1-5.

## Guardrails (manual intervention)

| Control | Where | Effect |
| --- | --- | --- |
| Always-on conventions | `AGENTS.md` | Layering, roles, tests |
| File instructions | `.github/instructions/` | Scoped rules for backend, Domain, tests, e2e, docs, backlog |
| Agents | `.github/agents/` | `sdlc-orchestrator` plus subagents `backlog-planner`, `architecture-mapper`, `backend-implementer`, `test-author`, `risk-reviewer` |
| Hooks | `.github/hooks/human-in-the-loop.json` | deny destructive commands and `.env` edits; ask before git, installs, Domain, auth, config, CI, `ops/`, ADR edits; block secrets and Domain dependency violations after edit |

## Definition of Ready

- Source, acceptance criteria, dependencies and Human gate are written.
- Files that may change are listed (for code stories).

## Definition of Done

- All acceptance criteria checked with evidence (command output, file, or reviewer).
- Human gate ticked by a named person.
- AI log entry exists.
- `dotnet test backend/InvoiceApp.sln` passes if code changed.

## Story template

```
### P<phase>-S<n> — Title
- Status: To Do
- Source:
- Agent:
- Depends on:
- Acceptance criteria:
  - [ ] ...
- Human gate: [ ] <who> reviews <what> — name/date:
- Evidence:
```
