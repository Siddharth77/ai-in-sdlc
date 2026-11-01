Review this diff for defects in an ASP.NET Core 8 invoice approval service.
Invoices move Draft, PendingApproval, then Approved or Rejected. Every endpoint
requires sign-in, destructive actions are Admin only, approvals are Approver or
Admin, and business rules live in the Domain project.

Check specifically for: missing or wrong authorization, injection, behaviour
that changes silently (rounding, status codes, error handling), data that
callers or auditors previously received and no longer do, sensitive data
written to logs, shared state used from several threads, and partial failure
in batch operations.

Report a finding only if you can quote the changed line and explain the
concrete failure it causes. Do not report style, naming or refactoring
preferences. For each finding give the file, the line, what goes wrong, and how
confident you are. If you find nothing, say so explicitly rather than listing
general observations.
