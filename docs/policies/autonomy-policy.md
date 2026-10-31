# Autonomy policy: month-end log triage (human-owned)

Status: accepted by the human for this workflow. Owner (human): Siddharth Jain. Approver: Siddharth Jain. Review: before each rotation.

**Workflow:** the team uses month-end log triage as a human-read, human-approved workflow. The human owns the read/approve decision and there is no delegated operational action. The agent may summarise, cluster and rank evidence, but it cannot directly edit the repo, change config, restart services, or approve a release.

## Levels

| Level | Agent may | Human does |
| --- | --- | --- |
| L0 Manual | Nothing | Everything |
| L1 Assist | Read log evidence, summarise findings, rank likely causes, draft a recommendation or note | Reads the summary, confirms the facts, approves or rejects the recommendation |
| L2 Act with approval | Draft a patch, PR summary or runbook note in a branch | Reviews it and decides whether to apply it |
| L3 Act and report | Perform a reversible, low-risk action only with a runbook and then report | Reviews the outcome and signs off before release |

For this team, the default is: no delegated action. The agent may assist, but a human must read and approve the result before any operational change or code change is made.

## Tasks and levels

| Task | Day one | Ceiling | Why the ceiling |
| --- | --- | --- | --- |
| 1. Read log evidence and isolate the time window | L1 | L1 | Read-only analysis, but final interpretation still belongs to a human |
| 2. Group findings by error signature or service area | L1 | L2 | Deterministic, but still needs a human to confirm the interpretation |
| 3. Rank likely causes or operational risk | L1 | L1 | Judgement. The agent can be confidently wrong |
| 4. Draft the triage summary and recommended next check | L1 | L2 | Text a human reads before any action |
| 5. Apply a config change, restart, or operational fix | L0 | L0 | Human-only, no delegated action |
| 6. Approve or release a live operational action | L0 | L0 | Human-only sign-off |

## Why this is safe: controls

The agent in this workflow handles evidence and recommendations, never action. Controls, marked by whether they exist today:

| Control | Status |
| --- | --- |
| No outbound package installs, no repo write, no config change, no restart without human approval | Exists via hook policy and human gate |
| All summaries and recommendations are read by a human before they are used | Rule today |
| Every recommendation must cite the relevant evidence (log timestamps, service name, and source file or line) | Rule today |
| No operational fix is taken without a human decision | Rule today |
| No log triage action is taken without a human-approved summary | Rule today |
| Every session logged in `docs/ai-logs/` | Exists (template) |

## Evidence needed to move a task up one level

Evidence required for any move above L1:

1. The evidence is explicit and quoted: log timestamp + service name + source file/line, or the exact alert and metric being reviewed.
2. A human has read the summary and agreed the evidence is correct.
3. The recommendation remains within the agreed scope: no new code path, no DB schema change, no auth change, no production config change, no runtime restart.
4. The relevant check or test is run and the result is recorded.
5. The change is either reversible or contains no irreversible action.

**Who approves a move:** Siddharth Jain reviews any move above L1. There is no delegated approval; the human must read the recommendation in full.
**Demotion:** any fabricated citation, any evidence the human did not read, or any action taken outside the agreed scope drops the task back to L0 immediately.

## Day-one level: L1 assist only; no delegated action

Reason: two of six engineers are new to the codebase. The safe default is:
- L1 for reading and summarising log evidence;
- L0 for every action, including repo edit, config change, restart, merge, release and approval;
- L2 only after a human has read the recommendation and explicitly approved the action path.

This means the agent can help the team triage, but the human still owns the evidence and the approval. The team does not delegate actual operational action to the agent on day one.

## Explicit decision for this team

For month-end log triage:
- Human reads the evidence.
- Human approves the recommendation.
- Human decides whether to act.
- The agent never writes, merges, deploys, restarts, updates config, or signs off on a release.

This is the rule for the next rotation and remains in place until the team has stronger evidence and a broader runbook.