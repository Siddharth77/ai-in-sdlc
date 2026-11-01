# Phase 3 — Autonomy policy (Requirement Task 3)

Goal: one page for one workflow. Human-authored. Output: `docs/policies/autonomy-policy.md`.

### P3-S1 — Choose the workflow
- Status: Done
- Source: Requirement §3 (month-end log triage, dependency bumps, or first-response incident summaries)
- Agent: none (human decision)
- Depends on: none
- Acceptance criteria:
  - [x] One workflow chosen with a two-line reason. (Month-end log triage; first lines of the policy.)
- Human gate: [x] Human decides — Siddharth Jain, 2026-11-01 (stated in chat: review done)
- Evidence: first lines of the policy

### P3-S2 — Tasks by autonomy level
- Status: Done
- Source: Requirement §3
- Agent: `risk-reviewer` (critique only)
- Depends on: P3-S1
- Acceptance criteria:
  - [x] Every task in the workflow assigned to one level. (Six tasks, day-one level and ceiling each.)
  - [x] Level definitions stated at the top. (L0 to L3 table.)
- Human gate: [x] Human assigns levels — Siddharth Jain, 2026-11-01 (stated in chat: review done)
- Evidence: table in the policy

### P3-S3 — Controls that make each level safe
- Status: Done
- Source: Requirement §3
- Agent: `risk-reviewer`
- Depends on: P3-S2
- Acceptance criteria:
  - [x] Controls named per level (tool restrictions, hooks, read-only access, review step, logging). (Shortened on 2026-11-01 to one controls table for the whole workflow, not one per level; accepted by the human.)
  - [x] Each control points to a real mechanism in this repo or is marked planned. (Hooks in `.github/hooks/`, the human gate, `docs/ai-logs/`.)
- Human gate: [x] Human confirms controls exist or are marked planned — Siddharth Jain, 2026-11-01 (stated in chat: review done)
- Evidence: policy section

### P3-S4 — Promotion evidence and approver
- Status: Done
- Source: Requirement §3
- Agent: none
- Depends on: P3-S2
- Acceptance criteria:
  - [x] Measurable evidence required to move a task up a level (volume, error rate, review sample). (WAIVED by Siddharth Jain, 2026-11-01: the five promotion conditions are qualitative and have no numeric threshold.)
  - [x] A named role approves each move, and demotion triggers are stated. (Siddharth Jain approves; demotion triggers are in the policy.)
- Human gate: [x] Human approves criteria — Siddharth Jain, 2026-11-01 (stated in chat), with the waiver above
- Evidence: policy section. Waiver: no volume, error-rate or review-sample threshold exists. Recommended before the first promotion: add one numeric threshold.

### P3-S5 — Day-one level for this team
- Status: Done
- Source: Requirement §3 (two of six engineers new to the codebase)
- Agent: none
- Depends on: P3-S3, P3-S4
- Acceptance criteria:
  - [x] One explicit day-one level stated, with the reason tied to the two new engineers. (L1; policy section "Day-one level".)
  - [x] Whole policy fits one page. (495 words by `wc -w`.)
- Human gate: [x] Another engineer reads it cold — WAIVED by Siddharth Jain, 2026-11-01 (stated in chat). No other engineer has read it.
- Evidence: final policy (495 words). Waiver, not a cold read: the policy was reviewed and accepted by its author only.
