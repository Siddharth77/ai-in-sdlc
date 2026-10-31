# Phase 4 — Review evaluation (Requirement Task 4)

Goal: measure one review prompt on the ten fixed cases in `ops/evals/cases/`, three runs, then change exactly one variable.

Rule: `ops/` cases are read-only. New cases go in `docs/evals/cases/`. Ground truth is set by a human before any run.

### P4-S1 — Freeze the review prompt and setup
- Status: To Do
- Source: Requirement §4
- Agent: none
- Depends on: P0-S1
- Acceptance criteria:
  - [ ] Prompt saved in `ops/evals/prompts/` (human-approved write), model and context file recorded.
  - [ ] Prompt, model and context file hashed or versioned before run 1.
- Human gate: [ ] Human approves the frozen setup — name/date:
- Evidence: prompt file and recorded settings

### P4-S2 — Human labels ground truth for the ten cases
- Status: To Do
- Source: Requirement §4
- Agent: none
- Depends on: none
- Acceptance criteria:
  - [ ] Each case labelled defect or clean by a human, before seeing model output.
  - [ ] Labels stored beside the results file.
- Human gate: [ ] Human confirms labels — name/date:
- Evidence: labels file

### P4-S3 — Add two own cases (at least one clean)
- Status: To Do
- Source: Requirement §4 (four of ten cases were shown in the session)
- Agent: none (human supplies real defects)
- Depends on: P4-S2
- Acceptance criteria:
  - [ ] Two diffs from real defects the human has seen, in the same format as `ops/evals/cases/*.diff`.
  - [ ] At least one is a clean change.
  - [ ] No customer data or secrets.
- Human gate: [ ] Human confirms the cases are real and sanitised — name/date:
- Evidence: two files in `docs/evals/cases/`

### P4-S4 — Run the full set three times
- Status: To Do
- Source: Requirement §4
- Agent: `risk-reviewer` or the chosen reviewer model
- Depends on: P4-S1, P4-S2, P4-S3
- Acceptance criteria:
  - [ ] All cases run three times with identical setup, fresh context each time.
  - [ ] Raw outputs saved; results recorded using `ops/evals/results-template.csv` columns.
  - [ ] Caught, missed and false alarm counts and rates per run.
- Human gate: [ ] Human adjudicates each finding as caught, missed or false alarm — name/date:
- Evidence: results CSV and raw outputs

### P4-S5 — Change exactly one variable and rerun
- Status: To Do
- Source: Requirement §4
- Agent: same as S4
- Depends on: P4-S4
- Acceptance criteria:
  - [ ] Exactly one of prompt, model or context file changed and named.
  - [ ] Set run again with the same adjudication rules.
- Human gate: [ ] Human verifies only one thing changed — name/date:
- Evidence: diff of setup, results CSV

### P4-S6 — Report and confidence
- Status: To Do
- Source: Requirement §4
- Agent: none (human-authored conclusion)
- Depends on: P4-S5
- Acceptance criteria:
  - [ ] Results table for three runs plus the changed run.
  - [ ] States improvement or not, and confidence at this sample size (run-to-run spread, number of defect cases).
  - [ ] Does not claim significance the sample cannot support.
- Human gate: [ ] Reviewer checks every number against the CSV — name/date:
- Evidence: `docs/evals/report.md`
