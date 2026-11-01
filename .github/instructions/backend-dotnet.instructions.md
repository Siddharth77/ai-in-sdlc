---
description: "Use when writing or changing C# in the ASP.NET Core 8 backend: controllers, services, auth, repositories, Program.cs. Covers layering, role checks and error mapping."
applyTo: "backend/src/**/*.cs"
---
# Backend C# standards

- Controllers live in `InvoiceApp.Api/Controllers/`, one per resource, route `api/[controller]`, inherit `ApiControllerBase`, and wrap service calls in `Handle(...)` so errors map to 404, 409 and 400.
- Request bodies are `record` types declared inside the controller.
- Every endpoint is behind sign-in. Add `[RequireRole("...")]`: destructive actions Admin only, approvals Approver or Admin.
- Business rules go in `InvoiceApp.Domain`. Never in controllers or `Program.cs`.
- Register services in `Program.cs`. Repositories are interfaces in Domain; implementations live in Api (in-memory today).
- Clear names. No one-letter variables, no boolean `flag` parameters.
- No real credentials, tokens or customer data in code, config or tests. Demo accounts are the only exception.
- Anything not yet in code (SQL, Service Bus, PayEx) must not be referenced as if it exists. See `docs/backlog/` for planned work.
- Stop and ask the human before changing auth, `Program.cs`, `appsettings*`, or any `.csproj`.
