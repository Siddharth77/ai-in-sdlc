# AI log: ADR, autonomy policy and their review, 2026-10-31 to 2026-11-01

Reconstructed on 2026-11-01 from the local chat transcripts and the files in this repository. Times are UTC (IST is 5 hours 30 minutes ahead). It records what happened, including the agent's errors. It is a summary, not a transcript.

| Field | Value |
| --- | --- |
| id | 2026-10-31-p2-p3-adr-and-autonomy-policy |
| timestamp (UTC) | 2026-10-31T12:16Z to 12:37Z (drafting); 2026-10-31T18:22Z (readiness audit); 2026-11-01 (completion) |
| stage | Task 2 exactly-once ADR (P2-S1 to S6) and Task 3 autonomy policy (P3-S1 to S5) |
| agent | GitHub Copilot, agent mode, with read-only reviewer subagents |
| model | 2026-10-31: not recorded by the tooling. 2026-11-01: Claude Sonnet 5.5 (stated by the assistant itself, not logged by the tooling). Copilot Chat 0.52.0, VS Code 1.124.2 |
| tools used | File read and edit tools, terminal (`wc -w`, `dotnet test`, `node`), subagents |
| human decision | Author decisions F1 to F10 and I1 to I7 on the diagrams at 12:16Z. ADR request at 12:21Z. "looks correct to be added" at 12:25Z. Autonomy policy owner and approver named as Siddharth Jain at 12:30Z to 12:37Z. On 2026-11-01 the author asked for the ADR objection and last section to be written, the policy to be cut to 300 to 500 words, and later said the review was done |
| verification | ADR sections checked against the three 2026-10-30 stress-test sessions (see `2026-10-30-adr-stress-tests.md`). Policy length checked with `wc -w`: 495 words. Backlog statuses checked against the files and `node docs/evals/score.mjs` |
| limitation | The 2026-11-01 ADR objection and last section were drafted by the agent from the logs, not written by the author. The ADR approver and author are the same person, so backlog gate P2-S5 stays open |
| status | Reconstructed |

## Entries

1. **ADR proposal overclaimed (12:22Z, 2026-10-31).** The agent proposed, in chat only, the idempotency key and dedupe table as "the authoritative exact-once guard" with "Status: Accepted", before any human review. A local table stops duplicate intents, not a duplicate payment after a lost reply. The text was never written to the file. The ADR now claims "at most once automatically" until Gate 0 is answered.
2. **Wrong file edited (12:25Z to 12:26Z).** After "looks correct to be added" the agent edited `docs/diagrams/inferred-items.md` and `docs/backlog/phase-1-architecture.md` and replied "Added". The ADR on disk stayed a draft with empty author fields and sections.
3. **Caught by the readiness audit (18:22Z).** The audit searched the ADR for unset placeholders and found the stress-test section, author fields and the "wrong or useless" section empty. Verdict at the time: not ready to submit.
4. **Completion (2026-11-01).** The ADR stress-test section was replaced with the real 2026-10-30 sessions. The strongest objection and the "Where the agent was wrong or useless" section (5 entries) were written, with provenance stated in the ADR header. The autonomy policy was cut to 495 words with the decisions unchanged (day-one L1, tasks 1 to 4 at L1, tasks 5 and 6 at L0, owner and approver Siddharth Jain).
5. **Open after review.** P3-S4 asks for measurable promotion evidence, but the policy's criteria are qualitative. P3-S5 and P2-S5 need a reader other than the author. Gate 0 (PayEx's written answers) is unanswered.

## What the agent got wrong or did not do

- Reported "Added" for an edit that went to a different file (entry 2).
- Put an unreviewed "Accepted" status and a guarantee the design cannot meet into a proposal (entry 1).
- Did not itself notice the empty ADR sections; the later audit did (entry 3).
