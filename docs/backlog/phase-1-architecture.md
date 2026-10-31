# Phase 1 — As-built and target architecture (Requirement Task 1)

Goal: show what the code does today, with evidence, then what the target state adds. Output goes in `docs/diagrams/`.

### P1-S1 — Inventory as-built elements with citations
- Status: To Do
- Source: Requirement §1
- Agent: `architecture-mapper`
- Depends on: P0-S1
- Acceptance criteria:
  - [ ] Table of elements (web UI, API, auth middleware, session store, controllers, `ApprovalService`, `IInvoiceRepository`, in-memory repository) each with a file or symbol citation.
  - [ ] Only code is cited. No `ops/` content in the as-built inventory.
- Human gate: [ ] Human spot-checks at least five citations against the code — name/date:
- Evidence: `docs/diagrams/as-built-citations.md`

### P1-S2 — As-built container diagram (Mermaid)
- Status: To Do
- Source: Requirement §1
- Agent: `architecture-mapper`
- Depends on: P1-S1, P0-S2
- Acceptance criteria:
  - [ ] Mermaid source `docs/diagrams/as-built-container.mmd` renders without errors.
  - [ ] Every node appears in the citation table.
- Human gate: [ ] Human corrects wrong elements — name/date:
- Evidence: `.mmd` file and rendered image

### P1-S3 — As-built approval sequence diagram
- Status: To Do
- Source: Requirement §1
- Agent: `architecture-mapper`
- Depends on: P1-S1
- Acceptance criteria:
  - [ ] Sequence covers sign-in, submit, approve and reject through controller, `RequireRole`, `ApprovalService`, repository.
  - [ ] Every participant and message cites a symbol.
- Human gate: [ ] Human walks the sequence against the code — name/date:
- Evidence: `docs/diagrams/as-built-approval-sequence.mmd`

### P1-S4 — Inferred-items list and corrections
- Status: To Do
- Source: Requirement §1 ("list separately everything the agent inferred. Correct whatever is wrong")
- Agent: `architecture-mapper`, `risk-reviewer`
- Depends on: P1-S2, P1-S3
- Acceptance criteria:
  - [ ] Separate list of everything the agent inferred without a citation.
  - [ ] Each inference marked confirmed, corrected or removed.
  - [ ] Corrections the human made are listed.
- Human gate: [ ] Human signs off the list — name/date:
- Evidence: `docs/diagrams/inferred-items.md`

### P1-S5 — Target-state diagram
- Status: To Do
- Source: Requirement §1, scenario facts, `ops/README.md`
- Agent: `architecture-mapper`
- Depends on: P1-S2
- Acceptance criteria:
  - [ ] Shows Azure SQL, Service Bus and PayEx.
  - [ ] Every element that does not exist in code is visibly marked planned, with a legend.
  - [ ] PayEx timeout ambiguity (30 s, not reliably a failure) is shown or noted.
- Human gate: [ ] Human confirms no planned element looks built — name/date:
- Evidence: `docs/diagrams/target-state.mmd`

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
