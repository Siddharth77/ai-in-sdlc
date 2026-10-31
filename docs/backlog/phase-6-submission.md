# Phase 6 — Submission pack

### P6-S1 — Assemble the nine hand-in items
- Status: Done
- Source: Requirement "What to hand in"
- Agent: `backlog-planner` (checklist)
- Depends on: P1-S6, P2-S6, P3-S5, P4-S6, P5-S5
- Acceptance criteria:
  - [x] Checklist maps hand-in items 1-9 to file paths. (Item 8 is a labelled placeholder for the video link.)
  - [x] Every path exists; test command from item 2 runs. (Re-run 2026-11-01: 2 of 2.)
- Human gate: [x] Human ticks each item — Siddharth Jain, 2026-11-01 (stated in chat), with item 8 still pending under P6-S2
- Evidence: `submission/README.md` (index of the nine items, with links and verify commands)

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
- Evidence: video link. Open: the video is not recorded yet. A placeholder and shot list are at the top and bottom of `submission/README.md`.

### P6-S3 — Export AI augmentation logs
- Status: Done
- Source: Requirement hand-in item 9
- Agent: none
- Depends on: P0-S3
- Acceptance criteria:
  - [x] Logs cover every phase and include failures. (Phases 0 to 5 and the 2026-11-01 fixes; phase 6 work is in the 2026-11-01 log.)
  - [x] No secrets or personal data. (Pattern scan of `docs/` on 2026-11-01 found no tokens, keys, absolute user paths or email addresses. The author's name appears as the named owner.)
- Human gate: [x] Human reads for secrets — Siddharth Jain, 2026-11-01 (stated in chat)
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
- Evidence: reviewer findings and resolutions. Open: depends on the video (P6-S2), and the final read-only reviewer pass has not been run.
