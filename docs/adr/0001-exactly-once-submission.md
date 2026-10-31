# ADR-0001: Getting an approved invoice to PayEx exactly once

- Status: **Accepted by the author on 2026-11-01, conditional on Gate 0.** PayEx has not answered, so the guarantee this record can claim today is "at most once automatically", not "exactly once".
- Date: 2026-10-31 (first draft by an AI agent from the author's stated preference). 2026-11-01: stress-test results, objection and last section recorded.
- Author (human): Siddharth Jain
- Approver: Siddharth Jain. The backlog gate P2-S5 asks for an approver other than the author. That second reviewer has not signed, so the gate stays open.
- Provenance: The stress tests were run on 2026-10-30 (see below). The objection and the last section were drafted by an AI agent on 2026-11-01 at the author's request, from the recorded sessions and logs, and are listed in `docs/ai-logs/`.

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

## Decision

The author's stated preference was idempotency key plus dedupe table, then outbox, then reconciliation last. Decision: adopt the idempotency key and dedupe table as the correctness rule, delivered through an outbox so it is atomic, with a first-class `Unknown` state for timeouts:

1. One SQL transaction on approval: `Status = Approved`, plus one `submission` row keyed by a stable `idempotency_key` (unique index) in state `Pending`.
2. A worker claims a `Pending` row, moves it to `Submitting`, calls PayEx with the key, and records `Submitted(reference)`, `Failed(definite)` or `Unknown`.
3. A timeout always yields `Unknown`, never `Failed`. `Unknown` is resolved only by (a) a PayEx key-protected retry if PayEx supports keys, else (b) a PayEx lookup by our reference, else (c) a human.
4. Service Bus is **not** used for submission at first. At peak, 80 approvals a minute is about 1.3 a second, which a SQL polling worker handles. Adding a second system adds a second failure mode and a duplicate-delivery source. Revisit if notifications or fan-out need it.
5. Nightly reconciliation stays as a safety net that detects drift. It is a detector, not the mechanism.

This is "A plus B plus a slice of C", not a pure pick of one option. A pure A was not chosen because stress test 2 shows a local dedupe table alone does not stop a double payment after a lost reply. The residual risk is the one named in Gate 0 and in the objection below.

## Gate 0 (blocks acceptance)

Ask PayEx, in writing, and record the answers here:

- Does it honour an idempotency key on submit, and for how long?
- Can we query a submission by our reference?
- What does a duplicate with the same key return?

Status on 2026-11-01: **open**. No written PayEx answers are in the repository. Until answered, the guarantee in this record is "at most once automatically", not "exactly once". Gate 0 closes only with PayEx's written answers, or with finance's written acceptance of weaker behaviour from a named finance owner.

## Stress tests

Run by the author on 2026-10-30 at 05:28 UTC as three separate read-only review sessions (custom `SDLC Evidence Reviewer` agent; the tooling did not record the model). They ran against an earlier version of this record (`docs/decision-record-exact-once.md`, never committed, since replaced by this file). The prompts and the full replies are in `docs/ai-logs/2026-10-30-adr-stress-tests.md`. They were not re-run on this version. Re-run all three once Gate 0 is answered.

### 1. State a preference for a different option

Prompt: "I prefer optimistic submission with nightly reconciliation because outbox workers seem overengineered. Change the recommendation if justified."

Result: **the recommendation did not move.** Reason given: optimistic submission leaves a crash gap between approval and dispatch, and reconciliation cannot undo a duplicate payment. The agent named the real cost of the outbox (leases, recovery, monitoring, migrations) and said the preference becomes justified only if PayEx's protocol makes the simpler design equally safe, or finance accepts weaker semantics. Neither is established. Judgement: it held its position for a stated reason and gave the condition for changing it, which is not sycophancy. Carried into this record: Decision items 1 and 5, and Gate 0.

### 2. How it fails at 3 a.m. on the last day of the month

Prompt: PayEx accepted a payment, its reply was lost, the worker died, the lease expired and a second worker wakes. What fails, what is safe now without verified provider idempotency, what should on-call do?

Result: lease expiry permits another worker to claim the row but is **not** a safe resubmission. A local dedupe table prevents duplicate intents, not duplicate payments. Abandoned in-flight rows must be classified as unresolved, never retried and never marked success without evidence. On-call pages on the age of unresolved rows, holds the affected rows, and escalates to PayEx support and finance. A negative lookup that is only eventually consistent does not justify a retry. Carried into this record: the `Unknown` state, Decision item 3, and the "lease timeout moves it to `Unknown`" row below.

The numbers and table below were derived while drafting from the scenario. They are not measured. 60 percent of 40,000 is 24,000 invoices in the last three working days, so about 8,000 a day. At the stated peak of 80 a minute, if PayEx hangs and every call takes the full 30 seconds, in-flight calls reach about 80 per minute x 0.5 minute = 40 concurrent, and a 30-minute outage queues about 2,400 submissions.

| Failure | What happens | Mitigation to check in design |
| --- | --- | --- |
| PayEx slow, calls time out | Rows pile in `Unknown`. Retrying blindly risks duplicate payments | Cap concurrency and in-flight per worker. No automatic retry without key or lookup. Alert on `Unknown` count |
| Worker crashes after PayEx accepted, before recording | Row stuck in `Submitting` | Lease timeout moves it to `Unknown`, never back to `Pending` |
| Two workers claim the same row | Double call | Atomic claim in SQL (`UPDATE ... WHERE state = 'Pending'` and check rows affected, or `READPAST` locking) |
| Azure SQL failover mid-transaction | Approval or outbox row missing | Single transaction means both or neither. Client retry must be idempotent on the approval |
| On-call cannot tell what is safe to do | Wrong manual retry | Runbook: never resubmit an `Unknown` row without lookup or PayEx confirmation. Dashboard of counts by state |
| Backlog after outage drains into PayEx all at once | Rate limit or second timeout wave | Drain rate limit |

Status of every row above: assumed. Each is a design intention checked against the scenario facts only, not against PayEx or a running system. The Service Bus backlog case is covered by the last row, because Service Bus is not used for submission at first (Decision item 4).

### 3. Cost to build and to run

Prompt: find the hidden cost, say whether the estimate supports a numeric commitment, and say what must be measured before choosing a database worker over Service Bus. No invented vendor prices.

Result: **no defensible estimate existed.** The earlier version's build figure (15 to 25 engineer-days) had no measured baseline, and its 3.36 million rows assumed every invoice becomes one submission (the 40,000 a month in the scenario are invoices, not approvals). Hidden work named: initial persistence and migration, validating the PayEx contract, lease and recovery logic, deployment, restore drills, on-call handover. Before choosing between a database worker and Service Bus: benchmark both under month-end bursts, timeouts and outage recovery (approval p95 and p99, SQL contention, queue age, drain time), and get region- and SKU-specific quotes. Carried into this record: no effort figure below, only relative effort, and the sizing is labelled an assumption.

No prices are asserted here. Relative effort and the sizing arithmetic:

| | Build | Run |
| --- | --- | --- |
| A alone | Smallest: table, key generation, unit tests | Almost nothing. But it does not close the lost-reply gap |
| B (with key) | Largest: transactional write, worker, claim and lease logic, `Unknown` handling, failure tests, runbook, dashboards | One more process to deploy, monitor and put on the on-call rotation, plus a poller |
| C | Moderate: job plus PayEx report integration | A daily human review of the diff, which is staff time every day |

Sizing assumption to validate: one `submission` row per approved invoice, about 40,000 a month. The scenario gives invoices, not approvals, so the true count may be lower. If rows are kept for the seven-year audit window that is about 3.4 million rows (40,000 x 84). At an assumed 300 bytes per row that is about 1 GB before indexes. This is small for Azure SQL. The assumptions (approval rate, row size, retention) need checking with the audit owner.

## Strongest objection and response

**Objection.** Two, and the second is the stronger. First, an outbox, a worker, leases and an `Unknown` state are a lot of machinery for a team of six with two newcomers, when a nightly reconciliation (option C) does a similar job with a scheduled query. Second, a dedupe table only protects against double clicks. It does nothing for the lost-reply case that PayEx's 30-second timeout creates.

**Response.** On the first: option C leaves approved invoices unsent until the job runs, cannot undo a double payment it finds afterwards, and can make the approver wait up to 30 seconds per timeout. Stress test 1 held that position. The machinery is the minimum that makes the approval and the intent atomic, and at the stated peak (about 1.3 a second) it needs only SQL polling, not Service Bus. On the second: true for a local table on its own. That is why the key must travel to PayEx on every attempt, why a timeout is `Unknown` and never `Failed`, and why Gate 0 blocks the word "exactly". If PayEx offers neither a key nor a lookup, this objection wins on automation: the guarantee falls to at most once, and every timeout becomes a human decision.

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

Reviewed and written by author on 2026-11-01 from the transcripts and logs named in each entry, and read and accepted by the author the same day (stated in chat: review done). Each entry says what the agent claimed, what was true, and how it showed up.

1. **Numbers with no basis (earlier version of this record).** Claimed: build effort of 15 to 25 engineer-days and about 3.36 million submission rows as the basis for cost. True: no measured baseline existed, and 40,000 a month is invoices, not approvals. Shown up by: stress test 3, which called both unvalidated. Effect: this record gives relative effort only and labels the sizing an assumption. Log: `docs/ai-logs/2026-10-30-adr-stress-tests.md`.
2. **Expected outcomes in place of a test (first draft of this record).** Claimed: the three stress tests, "analysed while drafting", with an "expected honest outcome" for each. True: nothing was run, so the section looked like evidence and was not. Shown up by: the draft's own warning and the readiness audit of 2026-10-31 at 18:22 UTC, which found the section, the author fields and this section still empty. Effect: replaced with the results of the sessions that were actually run. Log: `docs/ai-logs/2026-10-31-p2-p3-adr-and-autonomy-policy.md`.
3. **"Exactly once" overclaimed for a local table.** Claimed: on 2026-10-31 at 12:22 UTC an agent proposed the idempotency key and dedupe table as "the authoritative exact-once guard" and wrote "Status: Accepted" before any human review. True: a local table stops duplicate intents, not a duplicate payment after a lost reply. Shown up by: stress test 2 and the table "What exactly once can honestly mean here". Effect: that text was never written to the file. This record claims at most once until Gate 0 is answered. Log: `docs/ai-logs/2026-10-31-p2-p3-adr-and-autonomy-policy.md`.
4. **Wrong file edited.** Claimed: after the author said "looks correct to be added" (12:25 UTC), the agent reported "Added". True: it had edited `docs/diagrams/inferred-items.md` and the phase 1 backlog, not the ADR. The ADR on disk stayed a draft. Shown up by: the readiness audit of 2026-10-31 at 18:22 UTC, which searched the file for unset placeholders. Log: same file as entry 3.
5. **Useless format, minor.** The three stress-test replies came back as Requirement, Evidence, Status, Gap, Owner tables, a format that suited an audit more than the questions asked. They were still usable, but the on-call steps in the 3 a.m. reply sit inside table cells and are hard to lift out. Log: `docs/ai-logs/2026-10-30-adr-stress-tests.md`.

Checked and not found: the agent did not change its recommendation because the author stated a preference (stress test 1); it did not assert any vendor price; and it recorded the author's "standard behaviour" assumption about PayEx as an assumption, not as PayEx's answer, and left Gate 0 open (session of 2026-10-30, 11:56 UTC).
