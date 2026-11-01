# Submission: AI in SDLC, Invoice Approval service

> **Demo video link: https://drive.google.com/file/d/1Btk5AogAKMnrDF3rHs0saoLYz9pG7Rdi/view?usp=sharing** (item 8 below, backlog P6-S2). Everything else in this index is ready, apart from the open items listed in the last column.

Start here. Each item links to the single source file in this repository (nothing is copied, so there is one version of each document). All links are relative to this folder.

Scope note: the service in `backend/` is a demo (in-memory repository, no database, no Service Bus, no PayEx client). `ops/` describes a planned production deployment and is used only as evidence input, never as a description of what is built. The target-state diagram marks every planned element as PLANNED.

## The nine hand-in items

| # | Item | Where | Ready? |
| --- | --- | --- | --- |
| 1 | Mermaid source for the as-built and target diagrams, citation list, inferred-items list | Sources: [as-built container](../docs/diagrams/as-built-container.mmd), [as-built approval sequence](../docs/diagrams/as-built-approval-sequence.mmd), [target state](../docs/diagrams/target-state.mmd). Lists: [citations](../docs/diagrams/as-built-citations.md), [inferred items](../docs/diagrams/inferred-items.md). Renders: [rendered/](../docs/diagrams/rendered/) | Sources, citations and inferred list: yes. SVGs re-rendered 2026-11-01 and newer than the sources |
| 2 | One architecture test and its command | [DomainDependencyRuleTests.cs](../backend/tests/InvoiceApp.Tests/DomainDependencyRuleTests.cs). Command below | Yes. Passes (2 of 2). P1-S6 done 2026-11-01. The failing case is a negative control, not a deliberate violation in Domain |
| 3 | Exactly-once decision record, with "Where the agent was wrong or useless" | [ADR-0001](../docs/adr/0001-exactly-once-submission.md) | Yes, with open conditions. Accepted by the author 2026-11-01 conditional on Gate 0: PayEx has not answered, so the guarantee claimed is "at most once automatically". Author and approver are the same person (second-reviewer gate waived). The objection and "wrong or useless" section were drafted by an AI agent and accepted by the author, as the ADR header says |
| 4 | One-page autonomy policy, day-one level stated | [autonomy-policy.md](../docs/policies/autonomy-policy.md). Day-one level: L1 assist, no delegated action | Yes. 495 words, one page. Cold-read gate waived (no second reader). Promotion criteria are qualitative (waived) |
| 5 | Two added eval cases, results for three runs plus the changed-variable run | Cases: [case-11](../docs/evals/cases/case-11.diff), [case-12](../docs/evals/cases/case-12.diff). Labels: [labels.csv](../docs/evals/labels.csv). Results: [results.csv](../docs/evals/results.csv). Report: [report.md](../docs/evals/report.md). Prompts: [v1](../docs/evals/prompts/review-v1.md), [v2](../docs/evals/prompts/review-v2.md) | Yes. Raw model replies for runs 1 to 12 were not saved and cannot be recovered: see [raw/README.md](../docs/evals/raw/README.md) (waived) |
| 6 | Risk audit with a decision recorded | [risk-audit.md](../docs/policies/risk-audit.md). Decision: Option A (gate the external-communication leg) | Decision recorded and applied in the hook 2026-11-01 (smoke test 17 of 17): `curl`, `wget` and five GitKraken MCP write tools now ask a human. This gates the leg; it does not remove it. Still manual: switch off those five write tools in the editor |
| 7 | Measurement plan with the two captured numbers | [measurement-plan.md](../docs/policies/measurement-plan.md). Data: [baseline JSON](../docs/measurement/baseline-2026-10-31.json), [real CI run](../docs/measurement/ci-runs-2026-10-31.json). Re-captured 2026-11-01: [baseline](../docs/measurement/baseline-2026-11-01.json), [CI runs](../docs/measurement/ci-runs-2026-11-01.json) | Yes. Fixture numbers unchanged. Real CI now 5 runs, all success (17 s, 23 s, 22 s, 30 s, 32 s) |
| 8 | 8 to 10 minute demo video, uploaded and linked | Link: https://drive.google.com/file/d/1Btk5AogAKMnrDF3rHs0saoLYz9pG7Rdi/view?usp=sharing | Recorded and linked. See the shot list below |
| 9 | AI augmentation logs | [docs/ai-logs/](../docs/ai-logs/) | Yes: 8 logs and an index. Reconstructed ones say so and name their source. Model of the main agent is not recorded by the tooling for the first sessions (stated in each log). Scanned for secrets 2026-11-01: none found |

Delete the "Ready?" column once every row is complete.

## Demo video shot list (8 to 10 minutes)

1. Repository layout and `AGENTS.md`, 1 minute.
2. Architecture test: run `dotnet test backend/InvoiceApp.sln --filter "FullyQualifiedName~DomainDependencyRuleTests"`, read the result, show the negative control, 2 minutes.
3. ADR-0001: the decision, Gate 0 and the "at most once automatically" claim, the strongest objection, and "Where the agent was wrong or useless", 2 to 3 minutes.
4. Evaluation: run `node docs/evals/score.mjs`, show the results table and the raw-replies limitation, 2 minutes.
5. Baseline: run `node docs/measurement/capture-baseline.mjs`, show the two proxies and the real CI runs, 1 to 2 minutes.
6. Guardrails: run `node .github/hooks/smoke-test.mjs` and show a hook asking for approval, 1 minute.

Recorded and linked: the video URL is at the top of this file and in item 8. P6-S2 is complete in `docs/backlog/phase-6-submission.md`.

## Commands to verify

Run from the repository root.

```
# Item 2: the architecture test
dotnet test backend/InvoiceApp.sln --filter "FullyQualifiedName~DomainDependencyRuleTests"

# Whole suite
dotnet test backend/InvoiceApp.sln

# Item 5: re-score the review evaluation
node docs/evals/score.mjs

# Item 7: re-capture the baseline
node docs/measurement/capture-baseline.mjs
gh run list --limit 100 --json databaseId,event,headBranch,status,conclusion,createdAt,updatedAt,headSha,workflowName
```

## Measured numbers and where they come from

| Number | Source |
| --- | --- |
| Architecture test: 2 of 2 pass, full suite 9 of 9 (re-run 2026-11-01) | the two `dotnet test` commands above |
| Review eval: 12 cases (9 defect, 3 clean), 144 scored rows, three models | `node docs/evals/score.mjs` |
| CI proxy (fixture, 20 runs): median 1,875.5 s, 2 of 20 failed | `node docs/measurement/capture-baseline.mjs`, reading `ops/pipeline/run-timings.csv` (an invented fixture, labelled as such in the plan) |
| Real CI (5 runs, all success, 17 s, 23 s, 22 s, 30 s, 32 s) | `gh run list`, saved in `docs/measurement/ci-runs-2026-10-31.json` (1 run) and `docs/measurement/ci-runs-2026-11-01.json` (5 runs) |

## Reading order for a reviewer

1. Item 1 diagrams, then the inferred-items list.
2. Item 3 decision record.
3. Items 4 and 6 (policy and risk audit).
4. Items 5 and 7 (evaluation and measurement).
5. Item 9 logs, then the video.
