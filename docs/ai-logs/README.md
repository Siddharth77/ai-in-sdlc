# AI augmentation logs

One file per working session: `YYYY-MM-DD-<story-id>.md`. Required for submission (requirement item 9).

## Template

Keep it short. Times are UTC (IST is 5 hours 30 minutes ahead). Use these fields and drop any that do not apply.

```
# AI log: <topic>

| Field | Value |
| --- | --- |
| id | <date>-<topic> |
| timestamp (UTC) | <start> to <end> |
| stage | <task and backlog story IDs> |
| agent | <agent or subagent, and mode> |
| model | <name> and its source: recorded by the tooling, stated by the author, or not recorded |
| subagents / MCP tools / tools used | <short list> |
| human decision | <what the human accepted, changed or rejected> |
| verification | <command, file or reviewer> |
| limitation | <agent errors, gaps, what could not be checked> |
| status | <live, or reconstructed from transcript on DATE> |
| artifacts | <files produced> |

## Entries
- A few short points: request, suggestion, what the human did, what went wrong.
```

## Rules

- Log what actually happened, including failures and rejected output.
- A log written later than the same day is marked "reconstructed" with its source (chat transcript, files) and says what the source could not show. Never invent a model name, a prompt or a reply.
- State the model source: the tooling often does not record the main agent's model.
- No secrets or customer data. The demo accounts in `AGENTS.md` are labelled demo credentials.

## Index

| Log | Covers |
| --- | --- |
| [2026-10-29-first-attempt.md](2026-10-29-first-attempt.md) | First working session, 29 to 30 October. Its documents were never committed |
| [2026-10-30-adr-stress-tests.md](2026-10-30-adr-stress-tests.md) | The three ADR stress tests, prompts and replies |
| [2026-10-31-p0-p1-diagrams-and-architecture-test.md](2026-10-31-p0-p1-diagrams-and-architecture-test.md) | Guardrail review, diagrams, Mermaid MCP, architecture test |
| [2026-10-31-p2-p3-adr-and-autonomy-policy.md](2026-10-31-p2-p3-adr-and-autonomy-policy.md) | ADR and autonomy policy |
| [2026-10-31-phases-2-5-drafts.md](2026-10-31-phases-2-5-drafts.md) | The first drafts of phases 2 to 5 |
| [2026-10-31-p4-review-evaluation.md](2026-10-31-p4-review-evaluation.md) | The 144-row review evaluation |
| [2026-10-31-p5-risk-audit.md](2026-10-31-p5-risk-audit.md) | Risk audit and measurement baselines |
| [2026-11-01-submission-readiness.md](2026-11-01-submission-readiness.md) | Readiness audit and the fixes that followed |
