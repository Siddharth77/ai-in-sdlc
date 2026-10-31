# Inferred items and flags (as-built)

Status: Each row below was checked by reading the cited lines on 2026-10-31. The human decided what to do with every flag.

## A. Inferred (no direct citation, or a conclusion drawn from absence)

| ID | Statement | Basis | How to check | Result 2026-10-31 |
|---|---|---|---|---|
| I1 | `DiscountCalculator` has no callers | Search for `DiscountCalculator` in `backend/**/*.cs` returns only its own declaration (`DiscountCalculator.cs:4`) | `grep -rn DiscountCalculator backend --include='*.cs'` | Confirmed: command run, one hit, the declaration |
| I2 | `GetByIds` is unused by Api and Domain code | The only hits are the interface (`IInvoiceRepository.cs:7`), the in-memory repository (`:30`) and `FakeInvoiceRepository.cs:13` | `grep -rn GetByIds backend --include='*.cs'` | Confirmed: search run, only the three hits listed |
| I3 | No database, Service Bus, PayEx or audit table exists | Absence in `backend/src` | `grep -rniE "ServiceBus|PayEx|SqlClient|EntityFramework" backend/src --include='*.cs' --include='*.csproj'` | Confirmed: command run, no matches (exit 1) |
| I4 | Tokens never expire | `SessionStore.cs` has no expiry field or timer; entries leave only through `Remove` (`:21`) | Read `SessionStore.cs` | Confirmed by reading the file |
| I5 | The pipeline order is static files, then `SessionAuthMiddleware`, then controllers | `Program.cs:19-22` | Read `Program.cs` | Confirmed by reading the file |
| I6 | `RequireRoleAttribute` runs after the middleware, as an MVC action filter | Base type `ActionFilterAttribute` (`RequireRoleAttribute.cs:8`); the middleware only calls `_next` (`SessionAuthMiddleware.cs:36`) | Read both files | Confirmed by reading both files |
| I7 | Model binding errors on a malformed body would return 400 before the role filter runs | ASP.NET Core `[ApiController]` behaviour, not read in this repo, not tested | Run a request with a bad body as a non-approver | NOT confirmed: never run |
| I8 | The Web UI is the only client | `wwwroot/app.js` calls `/api`; no other client in the repo | Read `app.js` | Partly confirmed: `/api` calls found in `app.js`; other clients were not searched for |

## B. Flags for the human (look wrong or risky; nothing changed)

| ID | What looks wrong | Where | Why it matters |
|---|---|---|---|
| F1 | Check-then-mutate is not atomic. Two approvers can both read `PendingApproval`, then both write. The last write wins and both get 200 | `ApprovalService.cs:33-39`, `:50-57`; `EnsurePending` `:65-71` | Double decision, wrong `DecidedBy`; matters at ~80 approvals/min |
| F2 | `GetById` returns the stored mutable `Invoice`, so the service mutates the repository's own object before `Update` | `InMemoryInvoiceRepository.cs:27` with `ApprovalService.cs:36-39` | A failed or partial update cannot roll back; readers can see half-written state |
| F3 | `Submit` has no role restriction, so any signed-in user can submit any Draft | `InvoicesController.cs:69-70` | Possible separation-of-duties gap; the code has no creator field to check against |
| F4 | `Invoice` has no creator field | `Invoice.cs` | Cannot prove the submitter is not the approver |
| F5 | Demo passwords are stored in plain text in config | `appsettings.json:9-12`; compared with `==` at `AuthController.cs:28` | Fine for a demo only, not for production |
| F6 | Tokens never expire and live only in process memory | `SessionStore.cs:9-22` | No timeout; every restart signs everyone out; does not scale beyond one instance |
| F7 | `Delete` works on any status, including `Approved` | `InvoicesController.cs:72-75` | Admin can erase an approved invoice; conflicts with 7-year auditable approvals |
| F8 | `GetAll` and `GetById` return full invoices to any signed-in role | `InvoicesController.cs:22-45` | No per-role data limits |
| F9 | `Create` and `Submit` write no decision or audit record; only approve and reject set `DecidedBy`, `DecidedAt` | `ApprovalService.cs:16-28` | Audit gap for the stated SOC 2 requirement |
| F10 | `DiscountCalculator` is dead code | `DiscountCalculator.cs:4` | Unused code can hide wrong business rules |

## C. Corrections made to the diagrams on 2026-10-31

- Container: the edge from `SessionAuthMiddleware` to `AuthController` said "session in HttpContext.Items". Wrong: login skips the check and `Logout` never reads `Items`. Relabelled.
- Sequence: the middleware was drawn as calling `RequireRoleAttribute`. It is an MVC action filter run by the framework. Relabelled to "next(context)" with the filter noted.

## Human gates

- [x] Review F1 to F10 and decide what to do with each. Siddharth Jain, 2026-10-31 (stated in chat; the decision per flag is not recorded in this file)
- [x] Confirm I1 to I8 by running the commands. Siddharth Jain, 2026-10-31 (stated in chat; I7 is marked not confirmed above)
