# Phase 6 — Submission pack

### P6-S1 — Assemble the nine hand-in items
- Status: To Do
- Source: Requirement "What to hand in"
- Agent: `backlog-planner` (checklist)
- Depends on: P1-S6, P2-S6, P3-S5, P4-S6, P5-S5
- Acceptance criteria:
  - [ ] Checklist maps hand-in items 1-9 to file paths.
  - [ ] Every path exists; test command from item 2 runs.
- Human gate: [ ] Human ticks each item — name/date:
- Evidence: `docs/submission-checklist.md`

### P6-S2 — Record the demo video
- Status: To Do
- Source: Requirement "The demo video" (8 to 10 minutes, MP4 or Teams)
- Agent: none
- Depends on: P6-S1
- Acceptance criteria:
  - [ ] Duration between 8 and 10 minutes.
  - [ ] Shows the architecture test running, the ADR, the eval results and the baseline commands.
  - [ ] Uploaded and the link is in the checklist.
- Human gate: [ ] Human plays it back end to end — name/date:
- Evidence: video link

### P6-S3 — Export AI augmentation logs
- Status: To Do
- Source: Requirement hand-in item 9
- Agent: none
- Depends on: P0-S3
- Acceptance criteria:
  - [ ] Logs cover every phase and include failures.
  - [ ] No secrets or personal data.
- Human gate: [ ] Human reads for secrets — name/date:
- Evidence: `docs/ai-logs/`

### P6-S4 — Final sign-off
- Status: To Do
- Source: All
- Agent: `risk-reviewer` (read-only pass)
- Depends on: P6-S1, P6-S2, P6-S3
- Acceptance criteria:
  - [ ] No `ops/` content presented as as-built.
  - [ ] No unsourced numbers.
  - [ ] `dotnet test backend/InvoiceApp.sln` passes.
- Human gate: [ ] Submitter signs off — name/date:
- Evidence: reviewer findings and resolutions
