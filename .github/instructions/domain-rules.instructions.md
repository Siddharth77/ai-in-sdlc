---
description: "Use when editing InvoiceApp.Domain: ApprovalService, Invoice, InvoiceStatus, IInvoiceRepository, DiscountCalculator. Covers lifecycle rules and dependency purity."
applyTo: "backend/src/InvoiceApp.Domain/**"
---
# Domain project rules

- Domain has no web, storage or messaging code. It must not reference `InvoiceApp.Api`, `Microsoft.AspNetCore`, `System.Data`, EF Core or any SDK for SQL, Service Bus or PayEx.
- `ApprovalService` owns the lifecycle: Draft, PendingApproval, then Approved or Rejected. Do not change a transition without a backlog story and human approval.
- Persistence is an interface (`IInvoiceRepository`); implementations belong in Api.
- Every new rule needs tests in `backend/tests/InvoiceApp.Tests` using `FakeInvoiceRepository`.
- Changes here are always a human checkpoint: show the diff and the tests, then wait for explicit approval.
