# Review evaluation: how to run it

Status: harness ready, **no model runs recorded yet**. `results.csv` is blank on purpose. Every number must come from a run you did and adjudicated.

## What is here

| File | Purpose |
| --- | --- |
| `../../ops/evals/cases/case-01..10.diff` | The ten fixed cases (read-only, planned-deployment fixtures) |
| `cases/case-11.diff` | Your defect: list endpoint drops the rejection reason and decider |
| `cases/case-12.diff` | Your clean change: draft-only discard, Admin only, with tests |
| `labels.csv` | Ground truth per case. `AI-provisional` labels must be confirmed by a human **before run 1** |
| `prompts/review-v1.md` | Baseline prompt, verbatim from `ops/evals/README.md` |
| `prompts/review-v2.md` | The one changed variable (prompt) |
| `results.csv` | 48 blank rows: runs 1 to 3 on v1, run 4 on v2, 12 cases each |
| `score.mjs` | Computes caught, missed, false alarm per run and pooled, with 95 percent Wilson intervals |

## Before run 1 (human steps)

1. Read all 12 diffs and confirm or change each label in `labels.csv`. Change `labelled_by` to your name and `status` to `confirmed`.
2. Decide `case-09`. It is marked contested: the README text it adds says sign out resets data, but `AuthController.Logout` only removes the session. Re-labelling it `clean` changes the defect count from 9 to 8 and the clean count from 3 to 4.
3. Check that `case-11.diff` and `case-12.diff` describe defects you have really seen. Replace them if not. They were written from your description, not copied from a real pull request.
4. Pick one model and write it in the `model` column of every row. Do not change it between runs.

## Run protocol

1. Fresh session for each case. Give it only the prompt file and one diff. No repo access, no earlier cases.
2. Runs 1 to 3: `prompts/review-v1.md`. Run 4: `prompts/review-v2.md`. Same model, same cases, same scoring.
3. Save the raw reply for each row (for example under `docs/evals/raw/run-N/case-NN.txt`) so scores can be re-checked.
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
