---
description: "Use when creating, splitting, updating or reviewing backlog phases and user stories under docs/backlog. Covers story format, status values and human gates."
applyTo: "docs/backlog/**"
---
# Backlog rules

- Layout: `docs/backlog/README.md` (conventions and board) plus one `phase-N-*.md` per phase.
- Story ID: `P<phase>-S<number>`. Heading format: `### P1-S2 — Title`.
- Required fields: Status, Source (requirement section), Agent, Depends on, Acceptance criteria (checkbox list), Human gate, Evidence.
- Status values: `To Do`, `In Progress`, `In Review`, `Done`, `Blocked`. New stories are always `To Do`.
- Only a human moves a story to `Done`, and only after the Human gate is checked off with their name and date.
- Each acceptance criterion must be verifiable by a command, a file, or a named reviewer.
- Do not add stories for work outside the requirement document without asking.
