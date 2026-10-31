# Phase 3 — Autonomy policy (Requirement Task 3)

Goal: one page for one workflow. Human-authored. Output: `docs/policies/autonomy-policy.md`.

### P3-S1 — Choose the workflow
- Status: To Do
- Source: Requirement §3 (month-end log triage, dependency bumps, or first-response incident summaries)
- Agent: none (human decision)
- Depends on: none
- Acceptance criteria:
  - [ ] One workflow chosen with a two-line reason.
- Human gate: [ ] Human decides — name/date:
- Evidence: first lines of the policy

### P3-S2 — Tasks by autonomy level
- Status: To Do
- Source: Requirement §3
- Agent: `risk-reviewer` (critique only)
- Depends on: P3-S1
- Acceptance criteria:
  - [ ] Every task in the workflow assigned to one level (for example suggest, act with approval, act and report).
  - [ ] Level definitions stated at the top.
- Human gate: [ ] Human assigns levels — name/date:
- Evidence: table in the policy

### P3-S3 — Controls that make each level safe
- Status: To Do
- Source: Requirement §3
- Agent: `risk-reviewer`
- Depends on: P3-S2
- Acceptance criteria:
  - [ ] Controls named per level (tool restrictions, hooks, read-only access, review step, logging).
  - [ ] Each control points to a real mechanism in this repo or is marked planned.
- Human gate: [ ] Human confirms controls exist or are marked planned — name/date:
- Evidence: policy section

### P3-S4 — Promotion evidence and approver
- Status: To Do
- Source: Requirement §3
- Agent: none
- Depends on: P3-S2
- Acceptance criteria:
  - [ ] Measurable evidence required to move a task up a level (volume, error rate, review sample).
  - [ ] A named role approves each move, and demotion triggers are stated.
- Human gate: [ ] Human approves criteria — name/date:
- Evidence: policy section

### P3-S5 — Day-one level for this team
- Status: To Do
- Source: Requirement §3 (two of six engineers new to the codebase)
- Agent: none
- Depends on: P3-S3, P3-S4
- Acceptance criteria:
  - [ ] One explicit day-one level stated, with the reason tied to the two new engineers.
  - [ ] Whole policy fits one page.
- Human gate: [ ] Another engineer reads it cold — name/date:
- Evidence: final policy
