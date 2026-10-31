# Autonomy policy: month-end log triage (human-owned)

Status: accepted by the human for this workflow. Owner (human): Siddharth Jain. Approver: Siddharth Jain. Review: before each rotation.

**Workflow:** month-end log triage. The human reads the evidence and approves every recommendation. There is no delegated operational action: the agent may summarise, cluster and rank evidence, but it cannot edit the repo, change config, restart services or approve a release.

## Levels

| Level | Agent may | Human does |
| --- | --- | --- |
| L0 Manual | Nothing | Everything |
| L1 Assist | Read logs, summarise, rank likely causes, draft a note | Confirms the facts, approves or rejects |
| L2 Act with approval | Draft a patch or runbook note in a branch | Reviews it and decides whether to apply |
| L3 Act and report | Run a reversible, runbook-covered action, then report | Reviews the outcome and signs off |

## Tasks and levels

| Task | Day one | Ceiling |
| --- | --- | --- |
| 1. Read log evidence and isolate the time window | L1 | L1 |
| 2. Group findings by error signature or service area | L1 | L2 |
| 3. Rank likely causes or operational risk (the agent can be confidently wrong) | L1 | L1 |
| 4. Draft the triage summary and next check | L1 | L2 |
| 5. Apply a config change, restart or fix | L0 | L0 |
| 6. Approve or release a live action | L0 | L0 |

## Controls

| Control | Status |
| --- | --- |
| No installs, repo write, config change or restart without human approval | Exists: hooks in `.github/hooks/` plus the human gate |
| Every recommendation cites its evidence (log timestamp, service, file or line) and a human reads it before use | Rule today |
| Every session logged in `docs/ai-logs/` | Exists (template) |

## Moving a task up one level

All of these are needed, and Siddharth Jain approves relevant move after reading the recommendation in full:

1. Evidence is quoted: timestamp, service, file or line, or the exact alert.
2. A human read the summary and agreed it.
3. The change stays in scope: no new code path, schema, auth or production config change.
4. The relevant check is run and the result recorded.
5. The change is reversible.

**Demotion:** a fabricated citation, evidence the human did not read, or any action outside scope returns the task to L0 immediately.

## Day-one level: L1, assist only

Two of the six engineers are new to the codebase, so the team starts at L1 for tasks 1 to 4 and L0 for every action (tasks 5 and 6). The agent helps triage; the human owns the evidence and the decision. This stays in place until the team has stronger evidence and a broader runbook.