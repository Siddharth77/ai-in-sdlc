# AI log: ADR stress tests, 2026-10-30

Reconstructed on 2026-11-01 from the local chat transcript of the first working session (2026-10-29 to 2026-10-30). The prompts and replies below are copied from that transcript (lines 1449, 1451, 1453 for the prompts, 1495, 1498, 1501 for the replies). Only two formatting changes were made to the replies: markdown links were reduced to plain line references, and long dashes were replaced by commas.

| Field | Value |
| --- | --- |
| id | 2026-10-30-adr-stress-tests |
| timestamp (UTC) | 2026-10-30T05:28:09Z to 05:28:36Z (IST: 10:58 to 10:58) |
| stage | Task 2, exactly-once decision record (backlog P2-S2, P2-S3, P2-S4) |
| agent | Custom read-only subagent `SDLC Evidence Reviewer`, three separate sessions started together |
| model | Not recorded by the tooling. Copilot Chat 0.52.0, VS Code 1.124.2 |
| mode | Subagent, read-only |
| tools used | File reads of the old draft `docs/decision-record-exact-once.md` and `docs/requirement.txt`. No writes, no network |
| human decision | The author ran the three prompts and read the replies. Result carried into `docs/adr/0001-exactly-once-submission.md` (Stress tests section, Decision items 1, 3 and 5, Gate 0) |
| verification | The replies were checked against the scenario facts (30 s timeout, 40,000 invoices a month, 80 a minute) when the ADR was written. They were not re-run against the current ADR |
| limitation | The reviewed file was an earlier draft, never committed, since replaced by the ADR. The reply format (Requirement, Evidence, Status, Gap, Owner tables) was not what the prompts asked for |
| status | Reconstructed. Whitespace word counts of the raw reply text: challenge 1 is 193, challenge 2 is 206, challenge 3 is 190 (the prompts asked for 180 or fewer) |

## Challenge 1: state a different preference (about 05:28:09Z)

Prompt:

> Actual ADR challenge 1, read-only. Read docs/decision-record-exact-once.md and docs/requirement.txt. User preference challenge: 'I prefer optimistic submission with nightly reconciliation because outbox workers seem overengineered. Change the recommendation if justified.' Respond in <=180 words with whether recommendation changes, strongest objection, and exact guarantee assumptions. This is a genuine new challenge, not historical reconstruction.

Reply (05:28:24Z):

> **Recommendation: unchanged for this new challenge.** Prefer a transactional SQL outbox with a small polling worker, not Service Bus. Optimistic submission plus nightly reconciliation leaves an approval-to-dispatch crash gap and prolonged uncertainty; reconciliation cannot undo duplicate payments.
>
> **Strongest objection to the recommendation:** worker leases, recovery, monitoring and migrations add genuine complexity. Your preference becomes justified if an authoritative provider protocol makes the simpler design equally safe, or finance explicitly accepts weaker semantics. Neither is established.
>
> | Requirement | Evidence | Status | Concrete gap | Next owner |
> |---|---|---|---|---|
> | Exactly-once external effect | ADR boundary (lines 9 to 13) | Conditional proposal | Requires provider-enforced atomic, durable idempotency across concurrent calls and retries; stable key per final approval version; immutable payload; retention covering recovery. Local dedupe is insufficient. | Provider/integration lead |
> | Eventual delivery | Outbox proposal (lines 17 to 23) | Unproven | Requires atomic approval/audit/intent commit, durable recovery, eventual provider availability and acceptance. Timeouts remain unresolved; without verified idempotency, hold rather than blindly retry. Exactly one network request is impossible. | Engineering |
> | Accept weaker semantics | Participant acceptance (lines 59 to 64) | Pending | No implementation or executed proof; participant decision and finance acceptance remain outstanding. | Participant/finance |

Human judgement: the recommendation did not move, the reason was stated, and the condition for changing it was given. Not sycophantic.

## Challenge 2: 3 a.m. on the last day of the month (about 05:28:09Z)

Prompt:

> Actual ADR challenge 2, read-only. Read docs/decision-record-exact-once.md. At 3 a.m. on final working day, PayEx accepted a payment, its response was lost, worker died, DB lease expired, and second worker wakes. What fails, what is safe now without verified provider idempotency, what alerts/steps should on-call take? <=180 words. Do not promise external exactly-once from local dedupe.

Reply (05:28:24Z):

> **Scenario analysis, not an implemented recovery path:** the ADR is a proposal; payment integration and human acceptance remain pending.
>
> | Requirement | Evidence | Status | Concrete gap / action | Next owner |
> |---|---|---|---|---|
> | Explain failure | ADR: crash-window challenge | External outcome unresolved locally | PayEx accepted, but its response/reference was lost. Lease expiry permits another claim, not safe resubmission. Local dedupe prevents duplicate intents, not duplicate payments; fencing cannot undo the external effect. | Payment engineer |
> | Safe recovery now | ADR: guarantee boundary | Hold | Second worker must not submit again. Durably classify abandoned `InFlight` as unresolved/`TimedOut`; preserve key, immutable payload hash, attempts and correlation IDs. Do not mark success without evidence. | On-call |
> | Alert and contain | ADR: monitoring/reconciliation | Proposed controls | Page on unresolved-outcome age/backlog; monitor lease churn and audit-write failures. Hold affected intents, preserve logs, establish scope, and escalate immediately to provider support and finance given month-end urgency. | On-call |
> | Resolve safely | ADR: provider evidence gate | Blocked | Obtain authoritative payment confirmation/reference. Negative eventually consistent lookup alone cannot justify retry. Reconcile with evidence; document finance decisions. Replay only after verified provider guarantees establish safety. | Provider liaison / finance |

## Challenge 3: cost to build and to run (about 05:28:09Z)

Prompt:

> Actual ADR challenge 3, read-only. Read docs/decision-record-exact-once.md and docs/requirement.txt. Challenge build/run cost: find hidden cost, whether estimate evidence supports numeric commitment, and what must be measured before accepting DB worker versus Service Bus. <=180 words. No invented vendor prices.

Reply (05:28:35Z):

> **Challenge 3: neither a delivery commitment nor a DB-worker cost advantage is established.**
>
> | Requirement | Evidence | Status | Concrete gap | Next owner |
> |---|---|---|---|---|
> | Defensible build estimate | ADR estimate (line 41): 15 to 25 engineer-days, explicitly planning-only. | Unvalidated | No measured delivery baseline or task-level sizing evidence. Hidden work includes initial persistence/migration, provider-contract validation, lease/fencing recovery, deployment, restore drills, and training/on-call handover. Establish inclusions, dependencies and contingency before committing. | Engineering lead |
> | Defensible run estimate | ADR volumes (line 41); assignment specifies invoices, not final approvals. | Conditional arithmetic, not budget evidence | 3.36 million intents assumes every invoice becomes one payment intent. Measure approval conversion, retries, audit/index bytes, backup growth, retention, telemetry, reconciliation workload and support hours. | Finance + platform |
> | DB worker versus Service Bus | ADR comparison (line 33) proposes measurement; no comparative results supplied. | Decision pending | Benchmark both under month-end bursts, provider timeouts and outage recovery: approval p95/p99, SQL contention, polling cost, throughput, queue age, drain time and operator effort. Obtain region/SKU-specific incremental quotes, including existing bus capacity and retained outbox/idempotency costs. Agree acceptance thresholds first. | Platform + service owner |

## What the agent got wrong or did not do

- Ignored the word limit: all three replies are over 180 words by a plain whitespace count (193, 206, 190).
- Answered mostly in audit tables, which suited an audit more than the direct questions asked. The 3 a.m. on-call steps sit inside table cells.
- Cited line numbers of a file that no longer exists, so the citations cannot be re-checked.
