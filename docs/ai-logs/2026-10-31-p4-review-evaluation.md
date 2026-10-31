# AI log: review evaluation, 2026-10-31

Reconstructed on 2026-11-01 from the local chat transcript and `docs/evals/`. The raw replies were never saved; see `docs/evals/raw/README.md`.

| Field | Value |
| --- | --- |
| id | 2026-10-31-p4-review-evaluation |
| timestamp (UTC) | 2026-10-31T12:41Z to 13:04Z (runs 1 to 8); 16:44Z to 16:47Z (runs 9 to 12); human review 17:04Z to 17:09Z |
| stage | Task 4, review evaluation (P4-S1 to P4-S6) |
| agent | 144 read-only review subagent sessions, one per row, fresh context each |
| model | Runs 1 to 4 (kimi-k3): stated by the author, not recorded by the tooling. Runs 5 to 8 (Grok 4.7) and runs 9 to 12 (Claude Sonnet 5.5): recorded in the subagent arguments |
| human decision | Labelled the cases, confirmed the final label set, kept case-09 as a defect (the transcript shows the human reviewing it), accepted the 12-run result set |
| verification | `node docs/evals/score.mjs` reproduces every figure in `docs/evals/report.md` (checked on 2026-11-01) |
| limitation | Raw replies not retained. Only the scored summary, notes and verdict per row survive, so verdicts cannot be re-checked against the original wording. Real sample is 12 cases (9 defect, 3 clean), not 144 rows |
| status | Reconstructed |
| artifacts | `docs/evals/` (results.csv, labels.csv, prompts v1 and v2, cases 11 and 12, report.md, score.mjs) |

## Run layout

| Runs | Model | Prompt |
| --- | --- | --- |
| 1 to 3 | kimi-k3 | v1 |
| 4 | kimi-k3 | v2 (the one changed variable) |
| 5 to 7 | grok-4.7 | v1 |
| 8 | grok-4.7 | v2 |
| 9 to 11 | Claude Sonnet 5.5 | v1 |
| 12 | Claude Sonnet 5.5 | v2 |

## Entries

- **Prompt v2 first draft would have tuned the experiment.** It named this repository's own defect types. It was caught on re-read and rewritten as generic categories.
- **Result:** the prompt change was not shown to be an improvement, and the sample cannot support a claim of significance (see the report's confidence section).
- **Contested label:** case-09 stays a defect. `results.csv` still carries a note saying the contested label was kept.
