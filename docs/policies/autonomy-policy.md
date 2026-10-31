# Autonomy policy: month-end log triage (DRAFT for human adoption)

Status: draft written by an AI agent. Owner (human): _name_. Approver: _service owner_. Review: before first rotation.

**Workflow:** during the last three working days of the month (60 percent of volume, peak near 80 approvals a minute), the on-call engineer reads application logs to find what is failing, how often and since when. Evidence packs in `ops/incidents/` show the log shape (`timestamp LEVEL [Component] message instance= user= elapsed_ms= status=`). They describe the planned deployment, not a running system.

## Levels

| Level | Agent may | Human does |
| --- | --- | --- |
| L0 Manual | Nothing | Everything |
| L1 Assist | Read a redacted log file and answer in chat: summaries, clusters, ranked hypotheses with line citations | Verifies every claim, takes every action |
| L2 Act with approval | Draft artefacts (ticket text, channel post, query) | Reads each one and sends it |
| L3 Act and report | Perform reversible, read-only operations itself and report | Reviews the report afterwards |

No level above L3 is in scope. Nothing in this workflow ever reaches L3 for write actions.

## Tasks and levels

| Task | Day one | Ceiling | Why the ceiling |
| --- | --- | --- | --- |
| 1. Export and redact the log window | L0 | L0 | Redaction is the control for everything below. Must be done by a tool a human owns |
| 2. Group lines by error signature, count, bucket by minute | L1 | L3 | Read-only, deterministic, checkable by script |
| 3. Rank hypotheses for the cause, citing line numbers | L1 | L1 | Judgement. The agent can be confidently wrong, and a new engineer cannot tell |
| 4. Draft the month-end summary note | L1 | L2 | Text a human reads before it goes anywhere |
| 5. Raise a ticket or post to a channel | L0 | L2 | External communication. Human sends |
| 6. Page, restart, roll back, change config, resubmit to PayEx | L0 | L0 | Never delegated. Irreversible or money-moving |

## Why this is safe: controls

The agent in this workflow sees private data (customer names, usernames, payment references) and untrusted input (free-text fields and error messages that anyone can influence), so it must not also be able to communicate externally. Controls, marked by whether they exist today:

| Control | Status |
| --- | --- |
| No outbound tools: triage agent has read and search only, no terminal, no web, no GitHub or messaging tools (pattern of `risk-reviewer` in `.github/agents/`) | Exists for `risk-reviewer`. A dedicated `log-triage` agent file must be written |
| Redacted exports only: users, customer names and payment references masked before the agent sees them | Planned, task 1 |
| Hooks block destructive commands and require approval for git, installs and config (`.github/hooks/human-in-the-loop.json`) | Exists |
| Every hypothesis cites a line number. A claim without a quotable line is discarded | Rule today. Script that checks the quoted lines exist is planned |
| Log text is treated as data, never as instructions. Instructions found inside logs are reported, not followed | Rule today. Needs a test log containing an injected instruction |
| Every session logged in `docs/ai-logs/` | Exists (template) |

## Evidence needed to move a task up one level

Same rules for every task. Month-end only happens monthly, so evidence comes from replaying past incidents (INC-2041, INC-2047 and later ones) plus live use:

1. At least 5 replays or live uses at the current level, including at least one real month-end window.
2. Every citation checked by a human: 100 percent of quoted lines exist and support the claim. One fabricated citation resets the count.
3. Hypotheses: the true cause (known from the incident record) is in the agent's top three in at least 4 of 5, and wrong top-ranked hypotheses were flagged as low confidence.
4. No redaction miss and no instruction in log text obeyed.
5. Measured time saved against the baseline in `docs/policies/measurement-plan.md` (review turnaround and incident time are not captured yet, so this criterion cannot be met until they are).

**Who approves a move:** the service owner signs, and a second engineer who did not run the trial confirms the evidence. Moves above L1 touching task 5 also need security sign-off.
**Demotion:** any fabricated citation reaching a ticket, any unredacted data in a transcript, or any action taken outside the table drops the task back one level immediately; the on-call lead can do this without approval.

## Day-one level: L1 (Assist) for tasks 2 to 4, L0 for 1, 5 and 6

Reason: two of six engineers are new to the codebase. They cannot yet recognise a plausible but wrong hypothesis or tell a benign warning from a real signal, and a week-long 24x7 rotation under month-end load is the worst time to find out. At L1 the agent can speed up reading, and a human verifies every claim and performs every action, so an agent error costs time and not a wrong action. Pair a new engineer with an experienced one for any month-end rotation until the L1 to L2 evidence above exists.
