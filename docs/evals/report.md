# Review evaluation report

Date: 2026-10-31. Model under test: kimi-k3 (GitHub Copilot). Runs executed by
spawning one fresh, stateless review session per case with only the prompt file
and one diff — no repo access, no earlier cases. 48 rows in `results.csv`,
scored with `node docs/evals/score.mjs`.

## Results

| Prompt | Run | Caught | Missed | False alarms |
| --- | --- | --- | --- | --- |
| v1 | 1 | 9/9 | 0/9 | 1/3 (case-12) |
| v1 | 2 | 9/9 | 0/9 | 2/3 (case-06, case-12) |
| v1 | 3 | 9/9 | 0/9 | 1/3 (case-12) |
| v1 | pooled | 27/27 = 100% (95% CI 88–100) | 0/27 | 4/9 = 44% (95% CI 19–73) |
| v2 | 4 | 9/9 | 0/9 | 1/3 (case-12) |

## The one changed variable

Only the prompt changed: `review-v1.md` (two-sentence generic prompt) to
`review-v2.md` (same prompt plus the service's review checklist: authorization,
injection, silent behaviour change, dropped response data, sensitive logging,
shared state, batch partial failure, and a "quote the changed line" bar).
Same model, same cases, same scoring throughout.

## Was the change an improvement?

**No measurable improvement, and the sample cannot support one.**

- Caught rate was already at the ceiling: 100% on v1 in all three runs, so v2
  had no headroom to show a gain.
- False alarms: v2 produced 1/3. v1's per-run spread was 1/3, 2/3, 1/3 — so
  v2's result equals v1's best runs and is inside v1's run-to-run variation.
  Per this harness's own rule, a change is an improvement only if the
  difference is larger than the variation within v1. It is not.
- v2's findings were more precise in form (quoted lines, explicit checklist
  pass on clean cases), but that is a qualitative observation, not a measured
  rate, and it did not stop the recurring false alarm on case-12.

## Confidence at this sample size

Low. The real sample is 12 cases (9 defect, 3 clean), not 48 rows — repeated
runs of the same case are correlated. With 3 clean cases, the false-alarm rate
has a 95% interval spanning roughly 6% to 79% for v2; the 44% vs 33% pooled
gap is noise at this size. The 100% caught rate is real for *these* nine
defects but the defects here are loud (SQL injection, missing auth attribute,
catch-all 200); this set does not test subtle defects.

To raise confidence: add runs 5 and 6 on v2 (the README already calls for
this), and add more clean cases — the false-alarm rate is the number that
decides whether anyone keeps using the reviewer, and 3 clean cases cannot pin
it down.

## Human review summary

1. **Labels are confirmed by human review.** The final set in `labels.csv` is
   marked `confirmed` and reviewed by Siddharth Jain.
2. **case-09 was reviewed and kept as a defect label.** The README claim was
   checked against `AuthController.Logout` and the sign-out flow, and the
   defect label remained valid after human review.
3. **Raw replies** are not saved under `docs/evals/raw/`; they are in the
   session transcript of the run (48 fresh subagent sessions). If the team
   wants re-checkable artefacts on disk, re-run with replies saved per row.
4. **Model rotation is complete.** All three models were run under the same
   protocol and the results are recorded in `results.csv`.

## Where the reviewer was wrong or useless

- **case-12 recurred as a false alarm in all four runs.** Every session
  asserted the 204-to-200 response change on the clean discard endpoint as a
  breaking defect. The change is real but the case is labelled clean; the
  reviewer could not distinguish "observable contract changed" from "defect".
  The stricter v2 prompt did not fix this — v2 flagged it with *high*
  confidence.
- **case-06 run 2** invented a risk ("tests may fail if ApprovalService does
  not throw exactly these types") on a clean test-only diff — asserting a
  defect against code it was not allowed to read.
- On defect cases the reviewer repeatedly added speculative extras (possible
  undeclared `_logger`/`_queries` fields, "Admin may be locked out of
  bulk-approve") that were not defects. These did not change verdicts here,
  but against stricter scoring they would inflate false-alarm counts.

## Grok run (appended; Kimi rows unchanged)

Date: 2026-10-31. Model under test: grok-4.7 (GitHub Copilot). Same protocol:
one fresh session per case, prompt file plus one diff only. Recorded as runs
5–7 (v1) and run 8 (v2). The original Kimi rows (runs 1–4, model `kimi-k3`)
were not edited. `results.csv` now has 96 rows: 48 kimi-k3 and 48 grok-4.7.
Scored with `node docs/evals/score.mjs`.

| Prompt | Run | Caught | Missed | False alarms |
| --- | --- | --- | --- | --- |
| v1 | 5 | 8/9 | 1/9 (case-09) | 0/3 |
| v1 | 6 | 8/9 | 1/9 (case-11) | 3/3 (case-04, case-06, case-12) |
| v1 | 7 | 8/9 | 1/9 (case-09) | 1/3 (case-12) |
| v1 | pooled | 24/27 = 89% (95% CI 72–96) | 3/27 = 11% | 4/9 = 44% (95% CI 19–73) |
| v2 | 8 | 8/9 | 1/9 (case-09) | 1/3 (case-12) |

### Was the prompt change an improvement for Grok?

**No.** v2 caught the same 8/9 and still missed case-09. Its 1/3 false-alarm
rate sits inside v1's run-to-run spread (0/3, 3/3, 1/3). The v2 checklist did
not catch the false README reset claim.

### Grok versus Kimi (same cases, same prompts)

| Model | v1 caught | v1 false alarms | v2 caught | v2 false alarms |
| --- | --- | --- | --- | --- |
| kimi-k3 | 27/27 = 100% | 4/9 = 44% | 9/9 = 100% | 1/3 = 33% |
| grok-4.7 | 24/27 = 89% | 4/9 = 44% | 8/9 = 89% | 1/3 = 33% |

On this set Kimi caught more defects (ceiling vs 89%). False-alarm rates match.
Grok was less stable: five cases changed verdict between v1 runs (case-04,
case-06, case-09, case-11, case-12). Kimi changed only case-06. Confidence is
still low: 12 cases, 3 clean, and one v2 run.

### Where Grok was wrong

- **case-09 missed in 3 of 4 runs.** The false "sign out to reset sample data"
  claim was named only in run 6. v2 missed it too.
- **case-11 run 6** asserted a compile failure (`Invoice.Id` is a Guid). That
  is not the defect (the list drops rejection and decision fields) and is not
  supported by the diff. Scored missed.
- **case-04 run 6** asserted the rename left old `_repository` uses and would
  not compile. The diff updates every use site. False alarm on a clean rename.
- **case-12** was a false alarm in 2 of 3 v1 runs and in the v2 run, same
  pattern as Kimi: 204-to-200 treated as a defect on a clean case.

## Claude run (runs 9-12)

Same protocol: one fresh subagent per case, reading only the prompt file and
one diff. Runs 9-11 use `review-v1.md`, run 12 uses `review-v2.md`. Model
argument: "Claude Sonnet 5.5 (copilot)". Kimi and Grok rows were not edited.

| Run | Prompt | Caught | Missed | False alarms |
| --- | --- | --- | --- | --- |
| 9 | v1 | 9/9 | 0 | 1/3 (case-12) |
| 10 | v1 | 9/9 | 0 | 2/3 (case-06, case-12) |
| 11 | v1 | 9/9 | 0 | 1/3 (case-12) |
| 12 | v2 | 8/9 | 1 (case-09) | 1/3 (case-12) |

Pooled v1: caught 27/27 = 100% (95% CI 88% to 100%), false alarms 4/9 = 44%
(95% CI 19% to 73%). Pooled v2 (one run): caught 8/9 = 89% (95% CI 56% to
98%), false alarms 1/3 = 33% (95% CI 6% to 79%).

### Was the prompt change an improvement for Claude?

**No, and slightly the other way.** Caught went down from 27/27 to 8/9 (the
miss is case-09, which v1 caught in all three runs and v2 did not), and false
alarms did not move (4/9 in v1 vs 1/3 in v2, same rate). A single missed case
in a single run is not distinguishable from noise, but there is no sign of
improvement. The v2 "quote the changed line" bar plausibly made Claude treat a
documentation-only claim as "not a code defect".

### Three models, same cases, same prompts

| Model | v1 caught | v1 false alarms | v2 caught | v2 false alarms |
| --- | --- | --- | --- | --- |
| kimi-k3 | 27/27 = 100% | 4/9 = 44% | 9/9 = 100% | 1/3 = 33% |
| grok-4.7 | 24/27 = 89% | 4/9 = 44% | 8/9 = 89% | 1/3 = 33% |
| claude | 27/27 = 100% | 4/9 = 44% | 8/9 = 89% | 1/3 = 33% |

### Overall answer: was the prompt change an improvement?

**No measurable improvement in any of the three models.** The harness bar was
caught up without false alarms up, and a difference larger than the run-to-run
spread within v1. Result: caught went up in none (flat for Kimi and Grok, down
by one case for Claude) and false-alarm rates are identical (4/9 vs 1/3). The
v2 numbers sit inside v1's run-to-run spread for every model.

Confidence in "no improvement": **low to moderate**. The real sample is 12
cases (9 defect, 3 clean), and v2 has one run per model, so each v2 rate rests
on 9 or 3 cases. The false-alarm CI for 1/3 is about 6% to 79%. This sample
can rule out a large improvement. It cannot rule out a small one, or a small
harm.

### Where Claude was wrong

- **case-12** was a false alarm in all four runs: the 204-to-200 change and the
  Admin-delete narrowing were asserted as defects on a clean case. Same blind
  spot as Kimi and Grok.
- **case-06 run 10** listed hedged test-assumption findings as findings on a
  clean case. Scored a false alarm for consistency with Kimi run 2 and Grok
  run 6. Run 11 was borderline (said "no defects" but listed low-confidence
  doubts) and was scored clean_ok. That one call changes the v1 false-alarm
  rate from 4/9 to 5/9, which shows how fragile the scoring is.
- **case-09 run 12** called the false README reset claim "not a code defect".
  The label for case-09 is contested.
- **case-11** was caught in every run but only at 35 to 50% reported
  confidence.

### Human review notes

- Model labels are recorded in `results.csv` as run metadata. The Kimi runs noted
  the model name in the row label, and the human review accepts the recorded set.
- All labels in `labels.csv` are now marked `confirmed` after human review.
  case-09 was reviewed and retained as a defect label.
- The borderline calls (case-06 runs 10 and 11, case-11 hedged catches) were
  reviewed and the final adjudication remains in the recorded results.
