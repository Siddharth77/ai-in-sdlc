# AI log: guardrails, diagrams and architecture test, 2026-10-31

Reconstructed on 2026-11-01 from the local chat transcript of 2026-10-31 and the repository. It is a summary, not a transcript.

| Field | Value |
| --- | --- |
| id | 2026-10-31-p0-p1-diagrams-and-architecture-test |
| timestamp (UTC) | 2026-10-31T09:49Z to 12:16Z |
| stage | Phase 0 (P0-S1, P0-S2) and Phase 1 (P1-S1 to P1-S6) |
| agent | GitHub Copilot, agent mode, with the custom `architecture-mapper` and `test-author` roles |
| model | Not recorded by the tooling for the main agent. Copilot Chat 0.52.0, VS Code 1.124.2 |
| MCP tools / tools used | Mermaid MCP (`mcp-mermaid@0.4.1`, one render call; the `svg_url` and `png_url` outputs are never used). Playwright MCP code ran 10 times and screenshots 3 times to check pages. 12 image views, 1 web fetch, 5 tool searches |
| human decision | Approved the guardrails at P0-S1 and the pinned Mermaid server at P0-S2 (including the `npm audit` findings). Flagged the first SVG as wrong at 11:52Z. Decided inferred items I1 to I7 and findings F1 to F10 at 12:16Z |
| verification | `dotnet test backend/InvoiceApp.sln --filter "FullyQualifiedName~DomainDependencyRuleTests"`: 2 of 2 pass. Every citation re-read against the source file. `node docs/diagrams/render.mjs` for the SVGs |
| limitation | The as-built SVGs were re-rendered on 2026-11-01 to include the label corrections. The architecture test's failing case is a negative control on the test assembly, not a deliberate violation in Domain |
| status | Reconstructed |
| artifacts | `docs/diagrams/`, `backend/tests/InvoiceApp.Tests/DomainDependencyRuleTests.cs`, `.mcp.json` |

## Entries

1. **Wrong label on the first render (11:52Z).** The human flagged the rendered SVG as incorrect. The `middleware to AuthController` edge label was wrong and was corrected in the source.
2. **Missing deliverables (11:55Z to 11:56Z).** `inferred-items.md` did not exist, and PayEx and persistence were missing from the first target-state view. Both added.
3. **Target-state visibility (12:01Z).** Planned elements were not visibly marked in the SVG. Fixed with a `planned` class, the word PLANNED and a legend. The `ApprovalService` node is mixed (built logic, planned behaviour) and the human did not answer that question.
4. **Architecture test.** The rule is that Domain must not reference Api or web, storage or messaging assemblies. It inspects referenced assemblies, not source text.
