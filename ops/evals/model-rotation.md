# One-time model rotation for review eval

Use the same 10-case set and the same prompt for each model.

## Order
1. Kimi K3
2. Grok
3. Claude

## Procedure
1. Open a fresh session for each case.
2. Load the exact case diff from `ops/evals/cases/*.diff`.
3. Give the model the review prompt from `ops/evals/README.md` only.
4. Record the verdict in `ops/evals/results-template.csv` with the `model` column set to:
   - `kimi-k3`
   - `grok`
   - `claude`
5. Keep the same scoring rubric for all three runs.

## Important note
This is a one-time comparison run, not a statistically meaningful sample.
It is useful for a quick side-by-side check, but it does not replace a repeated
multi-run evaluation. The repo does not include provider credentials for these
models, so the model calls must be executed from a machine or environment where
those credentials are configured.

## Interpretation
- Compare the caught, missed and false-alarm rates across the three models.
- Do not treat a single run as proof of quality.
- Use the result as a decision aid, not as a final production sign-off.
