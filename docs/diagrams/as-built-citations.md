# As-built citations (human gates recorded)

Status: Human gates P1-S1 to P1-S3 are recorded as signed in `docs/backlog/phase-1-architecture.md` (Siddharth Jain, 2026-10-31, stated in chat). The rendered SVGs in `rendered/` were re-rendered on 2026-11-01 with `node docs/diagrams/render.mjs` and now include the two label corrections in `inferred-items.md` section C (checked: the `mw` to `authc` edge label is in the SVG).
Scope: code only. Nothing from `ops/` is used (it describes a planned deployment). Line numbers are from the tree at the time of writing; re-check after any edit.
Diagram sources: [as-built-container.mmd](as-built-container.mmd), [as-built-approval-sequence.mmd](as-built-approval-sequence.mmd).

Provenance: the Mermaid source is hand-written by the agent. It was then rendered through the `mermaid` MCP server (`mcp-mermaid@0.4.1`, tool `generate_mermaid_diagram`, pinned in `.mcp.json`), which parsed both files without errors. Output is in `rendered/` (SVG, white background). A successful render proves the syntax, not that the content is correct; that is what the human gates below are for.

## Container elements

| ID | Element | Citation | What the cited code shows |
|---|---|---|---|
| C0 | Users (Approver, Admin) | `backend/src/InvoiceApp.Api/appsettings.json:9-12` | Two configured users with roles Approver and Admin |
| C1 | Web UI | `backend/src/InvoiceApp.Api/wwwroot/index.html`, `app.js`, `styles.css` | Static page that calls `/api` with `fetch` (`app.js:15-26`) |
| C2 | sessionStorage | `wwwroot/app.js:4`, `:108`, `:95` | Session read on load, written on login, removed on sign-out |
| C3 | Static files | `Program.cs:19-20` | `UseDefaultFiles()`, `UseStaticFiles()` |
| C4 | `SessionAuthMiddleware` | `Auth/SessionAuthMiddleware.cs:4-38`, registered `Program.cs:21` | Requires a bearer token on `/api` except `/api/auth/login` (`:19`) |
| C5 | `SessionStore` | `Auth/SessionStore.cs:7-22`, registered `Program.cs:13` | `ConcurrentDictionary` of token to `UserSession`, singleton |
| C6 | Demo users config | `Auth/UserSession.cs:5-15` (`DemoUser`, `DemoUsersOptions`), `Program.cs:12` | Users bound from root configuration key `Users` |
| C7 | `AuthController` | `Controllers/AuthController.cs:23-36` (login), `:38-48` (logout) | Matches username and password, creates or removes a session token |
| C8 | `InvoicesController` | `Controllers/InvoicesController.cs:22-75` | List, get, create, submit, delete; talks to repository and `ApprovalService` |
| C9 | `ApprovalsController` | `Controllers/ApprovalsController.cs:7-28` | Approve and reject, class-level `[RequireRole("Approver", "Admin")]` (`:9`) |
| C10 | `ApiControllerBase.Handle` | `Controllers/ApiControllerBase.cs:9-27` | Maps `KeyNotFoundException` to 404, `InvalidOperationException` to 409, `ArgumentException` to 400 |
| C11 | `RequireRoleAttribute` | `Auth/RequireRoleAttribute.cs:17-25` | Returns 403 when the session role is not listed |
| C12 | `InMemoryInvoiceRepository` | `InMemoryInvoiceRepository.cs:6-63`, registered `Program.cs:14` | `List<Invoice>` guarded by a lock, seeded with five invoices (`:11-18`) |
| C13 | `ApprovalService` | `InvoiceApp.Domain/ApprovalService.cs:7-73`, registered `Program.cs:15` | Submit, Approve, Reject with the lifecycle rules |
| C14 | `IInvoiceRepository` | `InvoiceApp.Domain/IInvoiceRepository.cs:3-11` | Port that the in-memory repository implements |
| C15 | `Invoice`, `InvoiceStatus` | `InvoiceApp.Domain/Invoice.cs:3-13`, `InvoiceStatus.cs` | Fields include `DecidedBy`, `DecidedAt`, `DecisionNote`; no creator field |
| C16 | `DiscountCalculator` | `InvoiceApp.Domain/DiscountCalculator.cs:4-35` | Exists, but a search of `src` and `tests` found no caller outside the file |
| C17 | `InvoiceApp.Tests` | `backend/tests/InvoiceApp.Tests/InvoiceApp.Tests.csproj` | Project reference to Domain only; `FakeInvoiceRepository.cs` implements the port |

## Sequence messages

| Step in the sequence diagram | Citation |
|---|---|
| Login skips the token check | `SessionAuthMiddleware.cs:19` |
| Token created (16 random bytes, hex) | `SessionStore.cs:13-15` |
| UI stores the session | `wwwroot/app.js:108` |
| Submit button and call | `wwwroot/app.js:52`; `InvoicesController.cs:69-70` |
| Only Draft may be submitted (409 otherwise) | `ApprovalService.cs:20-24`; mapping `ApiControllerBase.cs:19-22` |
| Approve and reject calls from the UI | `wwwroot/app.js:72-73` |
| Token lookup and 401 | `SessionAuthMiddleware.cs:25-31` |
| Session placed in `HttpContext.Items` | `SessionAuthMiddleware.cs:33` |
| 403 for wrong role | `RequireRoleAttribute.cs:21-24` |
| Controller passes the signed-in username | `ApprovalsController.cs:23`, `:27` |
| Blank reason gives 400 before lookup | `ApprovalService.cs:45-48` |
| Not found gives 404 | `ApprovalService.cs:61-63` |
| Not pending gives 409 | `ApprovalService.cs:65-71` |
| Status and decision fields mutated | `ApprovalService.cs:36-39` (approve), `:53-56` (reject) |
| Repository returns the stored instance | `InMemoryInvoiceRepository.cs:27` |
| Update under the lock | `InMemoryInvoiceRepository.cs:50-57` |
| 200 with the invoice | `ApiControllerBase.cs:13` |

## Not in the code (so not in the diagrams)

No database, no Azure SQL client, no Service Bus client, no PayEx client, no outbox, no background worker, no audit table. A search for these in `backend/src` is the check; the human should repeat it (`grep -rniE "ServiceBus|PayEx|SqlClient|EntityFramework" backend/src --include='*.cs' --include='*.csproj'`).

## Human gates (P1-S1, P1-S2, P1-S3)

- [x] Spot-check at least five rows above against the code. Siddharth Jain, 2026-10-31 (per P1-S1 in the backlog).
- [x] Walk the sequence diagram against the code, start to finish. Siddharth Jain, 2026-10-31 (per P1-S3 in the backlog).
- [x] Correct any wrong element in the `.mmd` files. Siddharth Jain, 2026-10-31 (per P1-S2; corrections listed in `inferred-items.md` section C).
