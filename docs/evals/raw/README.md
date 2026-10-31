# Raw review replies: not retained for runs 1 to 12

The 144 scored rows in `../results.csv` (12 runs x 12 cases) were produced by fresh, read-only review sessions. The raw replies were **not saved to disk**, and they cannot be recovered:

- The chat transcripts record only that each review session finished successfully, not the reply text.
- The editor's debug log holds only a session start and the model list.

What is kept for each row is the scored `finding_summary`, `notes` and `verdict` in `../results.csv`, with the human-confirmed labels in `../labels.csv`. So the scores can be recomputed (`node docs/evals/score.mjs`) but a verdict cannot be re-checked against the original wording. Nothing in this folder has been reconstructed or back-filled.

Model attribution: runs 5 to 12 (Grok 4.7, Claude Sonnet 5.5) are recorded in the review-session arguments. Runs 1 to 4 (kimi-k3) are attributed from the author's statement; the tooling did not record the model.

## How to keep them from now on

Save each reply as `docs/evals/raw/run-<N>/case-<NN>.txt` at the time of the run, before scoring, and do not edit it afterwards. Any run saved this way should be labelled as a new run (13 onwards) and must not be merged into runs 1 to 12.

Status: P4-S4 "Raw outputs saved" is therefore only partly met. A re-run with replies saved is a separate, human-approved step.
