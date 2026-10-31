# Session: Phases 2 to 5 drafts - 2026-10-31
- Agent / subagent used: default Copilot agent (no custom subagent invoked)
- Model: not recorded by the agent; fill in from the chat model picker
- Prompt: "produce the four things a senior engineer should own before a service goes to production: a decision record, an autonomy policy, a working evaluation, and an honest measurement plan"
- Your inputs captured this session: autonomy workflow = month-end log triage; exactly-once preference = idempotency key plus dedupe table; eval runner = you run it; two own eval cases described in free text (defect: rejection reason not visible to admin later; clean: removal of created invoice)
- What the agent produced: `docs/adr/0001-exactly-once-submission.md` (draft), `docs/policies/autonomy-policy.md` (draft), `docs/policies/measurement-plan.md` and `docs/measurement/` (script plus captured output), `docs/evals/` (harness, labels, cases 11 and 12, prompts v1 and v2, blank results, scorer)
- Verified by: `node docs/measurement/capture-baseline.mjs` (output saved); `node docs/evals/score.mjs` on blank data and on temporary synthetic data (deleted)
- Not done: no review-eval model runs were made; no stress-test sessions were run; ADR "Where the agent was wrong or useless" left blank; risk audit not written
- Agent errors or gaps found: first draft of `review-v2.md` named this repo's specific defect types and would have tuned the experiment to the cases. Caught on re-read and rewritten to generic categories. An attempted cleanup with `rm -rf` was denied by the pre-tool hook and redone with single-file `rm`
- Human review still required: confirm labels, adoption of ADR and policy, re-run baseline command
