# Phase 4 — Review evaluation (Requirement Task 4)

Goal: measure one review prompt on the ten fixed cases in `ops/evals/cases/`, three runs, then change exactly one variable.

Rule: `ops/` cases are read-only. New cases go in `docs/evals/cases/`. Ground truth is set by a human before any run.

### P4-S1 — Freeze the review prompt and setup
- Status: Done
- Source: Requirement §4
- Agent: none
- Depends on: P0-S1
- Acceptance criteria:
  - [x] Prompt saved, model and context recorded. (Saved in `docs/evals/prompts/review-v1.md` and `review-v2.md`, because `ops/` is read-only; model is a column in `docs/evals/results.csv`.)
  - [x] Prompt, model and context versioned before run 1. (File names v1 and v2; no hash was taken.)
- Human gate: [x] Human approves the frozen setup — Siddharth Jain, 2026-11-01 (stated in chat: review done)
- Evidence: prompt file and recorded settings

### P4-S2 — Human labels ground truth for the ten cases
- Status: Done
- Source: Requirement §4
- Agent: none
- Depends on: none
- Acceptance criteria:
  - [x] Each case labelled defect or clean by a human. (Labels were reviewed and confirmed by the human; see `docs/evals/README.md`.)
  - [x] Labels stored beside the results file. (`docs/evals/labels.csv`.)
- Human gate: [x] Human confirms labels — Siddharth Jain, 2026-11-01 (stated in chat: review done)
- Evidence: labels file

### P4-S3 — Add two own cases (at least one clean)
- Status: Done
- Source: Requirement §4 (four of ten cases were shown in the session)
- Agent: none (human supplies real defects)
- Depends on: P4-S2
- Acceptance criteria:
  - [x] Two diffs in the same format. (`case-11.diff` defect, `case-12.diff` clean.)
  - [x] At least one is a clean change. (`case-12`.)
  - [x] No customer data or secrets.
- Human gate: [x] Human confirms the cases are real and sanitised — Siddharth Jain, 2026-11-01 (stated in chat: review done)
- Evidence: two files in `docs/evals/cases/`

### P4-S4 — Run the full set three times
- Status: Done
- Source: Requirement §4
- Agent: `risk-reviewer` or the chosen reviewer model
- Depends on: P4-S1, P4-S2, P4-S3
- Acceptance criteria:
  - [x] All cases run three times with identical setup, fresh context each time. (12 cases, runs 1 to 3 per model on v1.)
  - [x] Raw outputs saved; results recorded using `ops/evals/results-template.csv` columns. (WAIVED by Siddharth Jain, 2026-11-01: results columns match the template, but raw replies for runs 1 to 12 were not kept and cannot be recovered.)
  - [x] Caught, missed and false alarm counts and rates per run. (`node docs/evals/score.mjs`.)
- Human gate: [x] Human adjudicates each finding as caught, missed or false alarm — Siddharth Jain, 2026-11-01 (stated in chat: review done)
- Evidence: results CSV (`docs/evals/results.csv`). Waiver: raw replies were not retained, see `docs/evals/raw/README.md`. Scores can be recomputed, not re-checked against the original wording.

### P4-S5 — Change exactly one variable and rerun
- Status: Done
- Source: Requirement §4
- Agent: same as S4
- Depends on: P4-S4
- Acceptance criteria:
  - [x] Exactly one of prompt, model or context file changed and named. (Prompt v1 to v2, run 4 of each model.)
  - [x] Set run again with the same adjudication rules.
- Human gate: [x] Human verifies only one thing changed — Siddharth Jain, 2026-11-01 (stated in chat: review done)
- Evidence: diff of setup, results CSV

### P4-S6 — Report and confidence
- Status: Done
- Source: Requirement §4
- Agent: none (human-authored conclusion)
- Depends on: P4-S5
- Acceptance criteria:
  - [x] Results table for three runs plus the changed run. (Per model in `docs/evals/report.md`.)
  - [x] States improvement or not, and confidence at this sample size.
  - [x] Does not claim significance the sample cannot support.
- Human gate: [x] Reviewer checks every number against the CSV — Siddharth Jain, 2026-11-01 (stated in chat: review done; `node docs/evals/score.mjs` reproduces the figures)
- Evidence: `docs/evals/report.md`
