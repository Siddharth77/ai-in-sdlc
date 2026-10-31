---
description: "Use when writing or editing xUnit tests in backend/tests, including architecture (structural rule) tests. Covers naming, fakes and what a test must prove."
applyTo: "backend/tests/**"
---
# xUnit test standards

- One test class per class under test, named `<ClassUnderTest>Tests`. Structural rules go in a class named for the rule, e.g. `DomainDependencyRuleTests`.
- Use `FakeInvoiceRepository`; never touch real storage or network.
- Test names state behaviour: `Approve_WhenInvoiceIsDraft_Throws`.
- A test must be able to fail. Before reporting a new test as done, show it failing against a deliberately broken input, or explain why that is not possible.
- Architecture tests must inspect compiled assemblies or project references, not grep source text.
- Run: `dotnet test backend/InvoiceApp.sln`. Report the real pass/fail counts, never an assumed result.
