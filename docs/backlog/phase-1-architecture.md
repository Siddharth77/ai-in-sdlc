# Phase 1 — As-built and target architecture (Requirement Task 1)

Goal: show what the code does today, with evidence, then what the target state adds. Output goes in `docs/diagrams/`.

### P1-S1 — Inventory as-built elements with citations
- Status: Done
- Source: Requirement §1
- Agent: `architecture-mapper`
- Depends on: P0-S1
- Acceptance criteria:
  - [x] Table of elements (web UI, API, auth middleware, session store, controllers, `ApprovalService`, `IInvoiceRepository`, in-memory repository) each with a file or symbol citation.
  - [x] Only code is cited. No `ops/` content in the as-built inventory.
- Human gate: [x] Human spot-checks at least five citations against the code — Siddharth Jain, 2026-10-31 (stated in chat). The agent also re-read every cited source file on 2026-10-31.
- Evidence: `docs/diagrams/as-built-citations.md`

### P1-S2 — As-built container diagram (Mermaid)
- Status: Done
- Source: Requirement §1
- Agent: `architecture-mapper`
- Depends on: P1-S1, P0-S2
- Acceptance criteria:
  - [x] Mermaid source `docs/diagrams/as-built-container.mmd` renders without errors. (`node docs/diagrams/render.mjs as-built-container`: OK, 2026-10-31.)
  - [x] Every node appears in the citation table. (C0 to C17.)
- Human gate: [x] Human corrects wrong elements — Siddharth Jain, 2026-10-31 (stated in chat). Agent correction: the middleware to `AuthController` edge label.
- Evidence: `.mmd` file and rendered image

### P1-S3 — As-built approval sequence diagram
- Status: Done
- Source: Requirement §1
- Agent: `architecture-mapper`
- Depends on: P1-S1
- Acceptance criteria:
  - [x] Sequence covers sign-in, submit, approve and reject through controller, `RequireRole`, `ApprovalService`, repository.
  - [x] Every participant and message cites a symbol.
- Human gate: [x] Human walks the sequence against the code — Siddharth Jain, 2026-10-31 (stated in chat)
- Evidence: `docs/diagrams/as-built-approval-sequence.mmd`

### P1-S4 — Inferred-items list and corrections
- Status: Done
- Source: Requirement §1 ("list separately everything the agent inferred. Correct whatever is wrong")
- Agent: `architecture-mapper`, `risk-reviewer`
- Depends on: P1-S2, P1-S3
- Acceptance criteria:
  - [x] Separate list of everything the agent inferred without a citation.
  - [x] Each inference marked confirmed, corrected or removed. (Result column in `inferred-items.md`; I7 is marked not confirmed, I8 partly.)
  - [x] Human decisions for I1 to I8 and F1 to F10 are listed in the decision record. (Section D in `inferred-items.md`.)
  - [x] Corrections the human made are listed. (Section C lists the two diagram corrections.)
- Human gate: [x] Human signs off the list — Siddharth Jain, 2026-10-31 (stated in chat)
- Evidence: `docs/diagrams/inferred-items.md`

### P1-S5 — Target-state diagram
- Status: Done
- Source: Requirement §1, scenario facts, `ops/README.md`
- Agent: `architecture-mapper`
- Depends on: P1-S2
- Acceptance criteria:
  - [x] Shows Azure SQL, Service Bus and PayEx. (`docs/diagrams/target-state.mmd`, rendered to `docs/diagrams/rendered/target-state.svg`.)
  - [x] Every element that does not exist in code is visibly marked planned, with a legend. (Checked in the rendered SVG: 18 nodes, planned ones carry the `planned` class and the word PLANNED. The `ApprovalService` node is mixed, see the inferred list in `docs/diagrams/README.md`, item 7.)
  - [x] PayEx timeout ambiguity (30 s, not reliably a failure) is shown or noted. (On the PayEx node and the PayEx client node.)
- Human gate: [x] Human confirms no planned element looks built — Siddharth Jain, 2026-10-31 (stated in chat; the open question on the mixed `ApprovalService` node, README inferred item 7, was not answered)
- Evidence: `docs/diagrams/target-state.mmd`, `docs/diagrams/rendered/target-state.svg`, inferred items in `docs/diagrams/README.md`

### P1-S6 — One architecture test that runs
- Status: To Do
- Source: Requirement §1 ("one test that runs beats five that are described")
- Agent: `test-author`
- Depends on: P1-S1
- Acceptance criteria:
  - [ ] One structural rule is encoded in a test under `backend/tests/InvoiceApp.Tests` (suggested rule: Domain must not reference Api or web, storage, messaging namespaces).
  - [ ] Inspects compiled assemblies or references, not source text.
  - [ ] Run command written down in the test file header and in `docs/diagrams/README.md`, e.g. `dotnet test backend/InvoiceApp.sln --filter DomainDependencyRuleTests`.
  - [ ] Seen passing, and seen failing against a deliberate violation.
- Human gate: [ ] Human runs the command and reads the result — name/date:
- Evidence: test output pass and fail
