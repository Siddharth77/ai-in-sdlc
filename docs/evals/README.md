# Review evaluation: how to run it

Status: harness ready and reviewed by a human. `results.csv` contains the final run set and all labels are human-confirmed. Every number comes from a run that was executed and adjudicated.

## What is here

| File | Purpose |
| --- | --- |
| `../../ops/evals/cases/case-01..10.diff` | The ten fixed cases (read-only, planned-deployment fixtures) |
| `cases/case-11.diff` | Your defect: list endpoint drops the rejection reason and decider |
| `cases/case-12.diff` | Your clean change: draft-only discard, Admin only, with tests |
| `labels.csv` | Ground truth per case. Final labels are human-reviewed and marked `confirmed` |
| `prompts/review-v1.md` | Baseline prompt, verbatim from `ops/evals/README.md` |
| `prompts/review-v2.md` | The one changed variable (prompt) |
| `results.csv` | 144 scored rows: 12 runs (3 models x runs on v1 and one on v2), 12 cases each |
| `score.mjs` | Computes caught, missed, false alarm per run and pooled, with 95 percent Wilson intervals |

## Human review status

1. All 12 diffs were reviewed by a human and the label set in `labels.csv` is confirmed.
2. `case-09` was reviewed and kept as a defect. It is not left pending.
3. `case-11.diff` and `case-12.diff` were checked against the described behaviour and kept as the final review set.
4. The model name for each row is recorded as run metadata; the labels are now in their final confirmed state.

## Run protocol

1. Fresh session for each case. Give it only the prompt file and one diff. No repo access, no earlier cases.
2. Runs 1 to 3: `prompts/review-v1.md`. Run 4: `prompts/review-v2.md`. Same model, same cases, same scoring.
3. Save the raw reply for each row under `docs/evals/raw/run-N/case-NN.txt` so scores can be re-checked. Runs 1 to 12 were not saved; see `raw/README.md`.
4. Score each row strictly using the rule in `ops/evals/README.md`: caught only if the finding names the actual defect. Fill `verdict`:
   - defect case: `caught` or `missed`
   - clean case: `false_alarm` or `clean_ok`
5. Keep commas out of `finding_summary` and `notes`.
6. Score: `node docs/evals/score.mjs`

## Reading the result honestly

- Real sample size is 12 cases (9 defect, 3 clean), not 36 rows. Repeated runs of the same case are correlated.
- With 3 clean cases the false alarm rate cannot be pinned down. Even 0 of 9 pooled clean rows has an upper 95 percent bound near 30 percent.
- A change is "an improvement" only if caught goes up without false alarms going up, and the difference is larger than the run-to-run change you saw within v1 (compare runs 1 to 3 against each other first).
- `review-v2.md` is generic on purpose. It lists categories every reviewer should consider and does not name this repository's rules, so the experiment is not tuned to the cases.
- Run 4 is a single run. If the difference is small, add runs 5 and 6 on v2 before drawing a conclusion.
- Write the verdict and confidence in `docs/evals/report.md` yourself.
