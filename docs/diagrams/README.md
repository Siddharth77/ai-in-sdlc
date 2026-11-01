# Diagrams

Mermaid sources (`*.mmd`) for the as-built and target views, with a citation table and an inferred-items list beside each. See backlog phase 1.

| File | What it shows | Status |
| --- | --- | --- |
| `as-built-container.mmd`, `as-built-approval-sequence.mmd` | Code as it is today. Cited in `as-built-citations.md`. | Reviewed by Siddharth Jain (P1-S1 to P1-S4, 2026-10-31). Citations re-read against the code. SVGs re-rendered 2026-11-01 (`node docs/diagrams/render.mjs`, all three OK) and now newer than the sources. |
| `target-state.mmd` | After persistence and PayEx. Every planned element is marked PLANNED. | Reviewed by Siddharth Jain (P1-S5, 2026-10-31; the open question on the mixed `ApprovalService` node, item 7 below, was not answered). Colour key: green solid = EXISTS, orange dashed = PLANNED, grey dotted = provisioned but unused, blue dashed = external. Every label also starts with that word. |
| `rendered/*.svg` | Output of the Mermaid MCP (local SVG only). | Generated. Do not edit by hand. |

## Re-render (Mermaid MCP, pinned `mcp-mermaid@0.4.1`)

```
node docs/diagrams/render.mjs                 # every .mmd in this folder
node docs/diagrams/render.mjs target-state    # one diagram
```

Needs `npx` and network access to fetch the pinned package. It asks for human approval in this workspace, because the hooks ask before any `npx` run. Never use the `svg_url` or `png_url` output types: they send the diagram to public mermaid.ink.

## Architecture test

The rule: `InvoiceApp.Domain` must not reference the Api project or web, storage or messaging assemblies. The test inspects the compiled Domain assembly.

```
dotnet test backend/InvoiceApp.sln --filter "FullyQualifiedName~DomainDependencyRuleTests"
```

Test file: `backend/tests/InvoiceApp.Tests/DomainDependencyRuleTests.cs`. Seen passing (2 of 2; full suite 9 of 9, re-run 2026-11-01). The second test is a negative control: it runs the same check against the test assembly, which really references `InvoiceApp.Domain`, so the check is shown to be able to fail. It was also seen failing earlier in a scratch copy with an `HttpClient` added to Domain. Result read and accepted by Siddharth Jain (P1-S6, 2026-11-01).

## Target-state: what is cited and what is inferred

Existing elements are cited by the IDs C0 to C17 in `as-built-citations.md`. Planned elements have no code to cite. Their sources are:

| Planned element | Source |
| --- | --- |
| Azure App Service, Azure SQL, Service Bus provisioned and unused | Scenario table in `docs/requirement/AI-in-SDLC-Home Assignment.pdf`, page 1 |
| Approval audit log, 7 years, SOC 2 Type II | Same table, row "Compliance" |
| PayEx returns a reference, 30 s timeout is not a reliable failure | Same table, row "PayEx behavior" |
| Submission table, unique idempotency key, worker, outbox in one transaction | Proposal in `docs/adr/0001-exactly-once-submission.md`. The ADR is accepted by its author on 2026-11-01 conditional on Gate 0 (PayEx answers, still open), so the mechanism may change. |
| Nightly reconciliation | Option C and the safety-net point in the same ADR |

Inferred by the agent. Not in any source. The human decides each:

1. **The mechanism itself.** Drawing the worker and the submission table assumes the ADR holds. The ADR is accepted only conditional on Gate 0; if PayEx offers neither a key nor a lookup, or the human picks a different option, redraw.
2. **SQL repository as the audit writer.** No source says which component writes the audit log. The arrow from the repository to the audit log is a guess.
3. **Separate `invoices`, `submission` and audit tables.** The table split is a guess. The sources name no schema.
4. **Worker runs inside the App Service process.** Nothing says whether it is a hosted service in the same app or a separate deployment.
5. **Reconciliation compares against PayEx.** This works only if PayEx offers a lookup or a report. That is unknown (ADR Gate 0). Both PayEx arrows from the worker and from reconciliation are drawn without a confirmed contract.
6. **Service Bus dotted arrow to the worker.** The ADR says it is not used at first. The arrow shows an optional later use only.
7. **`ApprovalService` is drawn green.** The class exists, but the planned change (approval and submission row in one transaction) does not. The label says so, but a reader could still take the whole node as built. Human gate for P1-S5: decide whether to split it into an existing node and a planned node.
