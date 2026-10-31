# ADR-0001: Getting an approved invoice to PayEx exactly once

- Status: **DRAFT. Not accepted.** Drafted by an AI agent from your stated preference. The decision, the stress-test sessions and the last section must be done and owned by you.
- Date: 2026-10-31
- Author (human): _name_
- Approver (someone other than the author): _name_

## Context

What exists today (code):

- An approved invoice is a status change in memory: `ApprovalService.Approve` sets `Status = Approved` and calls `IInvoiceRepository.Update` (`backend/src/InvoiceApp.Domain/ApprovalService.cs`). The only implementation is `InMemoryInvoiceRepository`. There is no database, no message publishing and no PayEx client in the code.
- `ApprovalService` is registered scoped in `Program.cs`; the repository is a singleton.

What is planned (scenario in the assignment and `ops/`, none of it built):

- Azure SQL for persistence, GitHub Actions CI, Azure Service Bus provisioned and unused, about 40,000 invoices a month, 60 percent in the last three working days, peak near 80 approvals a minute.
- PayEx returns a reference on success. It times out at 30 seconds and a timeout does not reliably mean the submission failed.
- Approval actions must be auditable for seven years (SOC 2 Type II in six months).

Unknown and decisive: **whether PayEx honours an idempotency key, or lets us look a submission up by our own reference.** Nothing in the repository says either way. Every option below is graded twice: if PayEx supports one of those, and if it supports neither.

## What "exactly once" can honestly mean here

We control our side only. We can guarantee an invoice is *recorded as intended for submission* exactly once, in the same transaction as the approval. We cannot make PayEx process it exactly once unless PayEx cooperates. A timeout leaves three possible worlds (PayEx did not receive it, received and is processing it, processed it and the reply was lost) and we cannot tell them apart from our side. So the achievable claims are:

| PayEx offers | Best achievable guarantee |
| --- | --- |
| Idempotency key honoured for a long window | Effectively once: retries are safe, duplicates collapse at PayEx |
| No key, but lookup by our reference | At most once automatically, plus a resolver that asks PayEx before any retry |
| Neither | At most once automatically. Every timeout becomes a human decision. Duplicates are prevented by not retrying, at the cost of occasional manual work |

## Options

| | A. Idempotency key plus dedupe table | B. Transactional outbox plus worker | C. Optimistic submit plus nightly reconciliation |
| --- | --- | --- | --- |
| How | Generate a stable key per invoice. Record it in a dedupe table before calling PayEx. Skip calls whose key already exists | In one SQL transaction, set Approved and insert an outbox row. A worker reads rows and calls PayEx, then records the result | Call PayEx inline when approving. A nightly job compares our approved invoices with PayEx records and fixes differences |
| Loses an approval's intent? | Yes, if the process dies between commit of the approval and the dedupe insert, unless they share a transaction | No. Intent is atomic with the approval | Yes, until the nightly job notices |
| Duplicate on timeout? | Only if the key is not sent to PayEx and the code retries. A local table alone does not stop a lost-reply retry from double paying | Same exposure when the worker retries after a timeout, unless the key is sent to PayEx | High. Inline retry by users or the app is likely during an incident |
| Needs from PayEx | Key support to be safe. Otherwise only protects against our own double-click | Key support or lookup to retry safely | Lookup or a report to reconcile |
| Approval latency for the approver | Adds the PayEx call (up to 30 s) if inline | Approval returns immediately | Approval can block for 30 s per timeout |
| Operational parts | A table | A table, a worker, a poller or Service Bus, a runbook | A scheduled job, a report from PayEx, a runbook |
| Auditability | Needs separate audit rows | Outbox rows are themselves an audit trail of intent and outcome | Weak: state is wrong until the job runs |

Option A and B are not alternatives at the same layer. A is a correctness rule (stable key plus recorded state). B is a delivery mechanism. The key only protects us if it travels with every attempt and the state it guards is committed atomically with the approval, which is what B supplies.

## Proposed decision (author to accept, change or reject)

Your stated preference is idempotency key plus dedupe table. I propose adopting it as the correctness rule, delivered through an outbox so it is atomic, with a first-class `Unknown` state for timeouts:

1. One SQL transaction on approval: `Status = Approved`, plus one `submission` row keyed by a stable `idempotency_key` (unique index) in state `Pending`.
2. A worker claims a `Pending` row, moves it to `Submitting`, calls PayEx with the key, and records `Submitted(reference)`, `Failed(definite)` or `Unknown`.
3. A timeout always yields `Unknown`, never `Failed`. `Unknown` is resolved only by (a) a PayEx key-protected retry if PayEx supports keys, else (b) a PayEx lookup by our reference, else (c) a human.
4. Service Bus is **not** used for submission at first. At peak, 80 approvals a minute is about 1.3 a second, which a SQL polling worker handles. Adding a second system adds a second failure mode and a duplicate-delivery source. Revisit if notifications or fan-out need it.
5. Nightly reconciliation stays as a safety net that detects drift. It is a detector, not the mechanism.

This is "A plus B plus a slice of C", not a pure pick of one option. If you prefer a pure A, record why, and note the residual risk in the section below.

## Gate 0 (blocks acceptance)

Ask PayEx, in writing, and record the answers here:

- Does it honour an idempotency key on submit, and for how long?
- Can we query a submission by our reference?
- What does a duplicate with the same key return?

Until answered, the guarantee in this record is "at most once automatically", not "exactly once".

## Stress tests

These three were analysed while drafting. They are **not** evidence of an interactive challenge session and do not replace your own. Run each yourself, and log it in `docs/ai-logs/`.

### 1. You prefer a different option (A alone, B alone, or C)

Expected honest outcome: the recommendation moves on mechanism, not on conclusion. If you push for pure C (nightly reconciliation), the agent should say it accepts a window in which approved invoices are unsent or double-sent, which fails the "auditable" and "exactly once" asks, and it should hold its position unless PayEx offers a lookup and the window is acceptable to finance. If it agrees with whichever option you name, that is a sycophancy failure to record in the last section.

### 2. How it fails at 3 a.m. on the last day of the month

Numbers derived from the scenario, not measured: 60 percent of 40,000 is 24,000 invoices in the last three working days, so about 8,000 a day. At the stated peak of 80 a minute, if PayEx hangs and every call takes the full 30 seconds, in-flight calls reach about 80 per minute x 0.5 minute = 40 concurrent, and a 30-minute outage queues about 2,400 submissions.

| Failure | What happens | Mitigation to check in design |
| --- | --- | --- |
| PayEx slow, calls time out | Rows pile in `Unknown`. Retrying blindly risks duplicate payments | Cap concurrency and in-flight per worker. No automatic retry without key or lookup. Alert on `Unknown` count |
| Worker crashes after PayEx accepted, before recording | Row stuck in `Submitting` | Lease timeout moves it to `Unknown`, never back to `Pending` |
| Two workers claim the same row | Double call | Atomic claim in SQL (`UPDATE ... WHERE state = 'Pending'` and check rows affected, or `READPAST` locking) |
| Azure SQL failover mid-transaction | Approval or outbox row missing | Single transaction means both or neither. Client retry must be idempotent on the approval |
| On-call cannot tell what is safe to do | Wrong manual retry | Runbook: never resubmit an `Unknown` row without lookup or PayEx confirmation. Dashboard of counts by state |
| Backlog after outage drains into PayEx all at once | Rate limit or second timeout wave | Drain rate limit |

### 3. Cost to build and to run

No prices are asserted here. Relative effort and the sizing arithmetic:

| | Build | Run |
| --- | --- | --- |
| A alone | Smallest: table, key generation, unit tests | Almost nothing. But it does not close the lost-reply gap |
| B (with key) | Largest: transactional write, worker, claim and lease logic, `Unknown` handling, failure tests, runbook, dashboards | One more process to deploy, monitor and put on the on-call rotation, plus a poller |
| C | Moderate: job plus PayEx report integration | A daily human review of the diff, which is staff time every day |

Sizing assumption to validate: one `submission` row per approved invoice, about 40,000 a month. If rows are kept for the seven-year audit window that is about 3.4 million rows (40,000 x 84). At an assumed 300 bytes per row that is about 1 GB before indexes. This is small for Azure SQL. The assumption (row size, retention) needs checking with the audit owner.

## Strongest objection and response

_Author to write._ Suggested starting point: "A dedupe table only protects against double clicks. It does nothing for the lost-reply case that PayEx's timeout creates." Response drafted: true unless the key is sent to PayEx, which is why Gate 0 is blocking and why `Unknown` is a state instead of a retry.

## Consequences

- A new `submission` table, worker, runbook and on-call surface.
- Approvals stay fast: PayEx latency is off the approver's path.
- Unknown submissions can need manual work. The volume of those is the main operating cost and the main revisit trigger.

## What would make us revisit this

Starting values for you to set, not measured thresholds:

- PayEx answers Gate 0 with "no key and no lookup": the guarantee drops to manual resolution, so reassess whether auto-submission is acceptable at all.
- `Unknown` exceeds an agreed share of submissions in a week (proposed starting point 0.5 percent) or any duplicate payment is confirmed.
- Sustained peak above about 3 times the stated peak (about 240 a minute), or SQL polling shows lag over an agreed bound.
- Another consumer of approvals appears (notifications, ledger): move to Service Bus fan-out.
- Audit finds the outbox table is not an acceptable record of intent for the seven-year requirement.

## Where the agent was wrong or useless

_Human-authored. Leave empty until you have run the three stress tests yourself._ Each entry should say what the agent claimed, what was true, and how you caught it. Prompts to probe: did it assume PayEx supports idempotency keys? Did it call a local dedupe table "exactly once"? Did it invent prices or latencies? Did it change its recommendation just because you stated a preference? Did it ignore that Service Bus delivery is itself at least once? Every entry must trace to a log in `docs/ai-logs/`.
