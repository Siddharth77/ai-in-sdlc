---
description: "Use when writing architecture diagrams, ADRs, policies, risk audits, measurement plans or eval reports under docs/ or reading ops/. Covers as-built vs target separation, citations and evidence rules."
applyTo: ["docs/**", "ops/**"]
---
# Evidence and documentation rules

- `ops/` describes a planned production deployment (database, message topic, PayEx) that does not exist in code. It is read-only evidence. Never describe it as current behaviour.
- As-built content cites a file or symbol for every element (e.g. `ApprovalService.Approve`). Anything not citable goes in a separate "Inferred" list.
- Target-state content marks every not-yet-existing element explicitly (e.g. `:::planned` class or "NOT BUILT").
- Numbers must come from a command, file or query that is written next to them. Never invent or estimate a metric. If it cannot be captured, say so.
- Do not assume PayEx offers idempotency keys or lookup. The only known contract: it returns a reference on success and a 30 s timeout does not reliably mean failure.
- Decision records, the autonomy policy and the "Where the agent was wrong or useless" section are written by the human. Agents may draft options and critiques, never the final decision.
- AI assistance must be logged in `docs/ai-logs/` (see its README).
