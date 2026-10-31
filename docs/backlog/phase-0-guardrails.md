# Phase 0 — Agent workspace and guardrails

Goal: make the agent setup safe and reviewed before any assignment work starts.

### P0-S1 — Review and approve agent customization files
- Status: To Do
- Source: Project conventions (`AGENTS.md`), manual-intervention requirement
- Agent: none (human), optionally `risk-reviewer`
- Depends on: none
- Acceptance criteria:
  - [ ] Every file under `.github/agents`, `.github/instructions`, `.github/hooks` has been read by a human.
  - [ ] Hook smoke test run: `git push --force` denied, `git commit` asks, `dotnet test` silent, Domain `using Microsoft.AspNetCore` blocked after edit.
  - [ ] Agents appear in the VS Code agent picker and `sdlc-orchestrator` can list its subagents.
- Human gate: [ ] Tech lead approves guardrails — name/date:
- Evidence: hook test output, screenshot of agent picker

### P0-S2 — Pin and approve a Mermaid MCP server
- Status: To Do
- Source: Requirement §1 (use the Mermaid MCP)
- Agent: none (human decides), `risk-reviewer` for supply-chain review
- Depends on: P0-S1
- Acceptance criteria:
  - [ ] A Mermaid MCP server is added to `.mcp.json` with a pinned version, not `@latest`.
  - [ ] Package source and permissions reviewed and noted.
  - [ ] One test diagram renders through the server.
- Human gate: [ ] Human approves the dependency — name/date:
- Evidence: `.mcp.json` diff, rendered output

### P0-S3 — Start AI augmentation log
- Status: To Do
- Source: Requirement hand-in item 9
- Agent: none
- Depends on: none
- Acceptance criteria:
  - [ ] One log file per session in `docs/ai-logs/` using the template.
  - [ ] Entries include failures and rejected output.
- Human gate: [ ] Author confirms logs are complete — name/date:
- Evidence: files in `docs/ai-logs/`

### P0-S4 — Record green baseline
- Status: To Do
- Source: `AGENTS.md` Commands
- Agent: `test-author`
- Depends on: none
- Acceptance criteria:
  - [ ] `dotnet test backend/InvoiceApp.sln` run; real pass/fail counts recorded.
  - [ ] Any failure is reported, not fixed silently.
- Human gate: [ ] Human reads the test output — name/date:
- Evidence: terminal output saved in the AI log
