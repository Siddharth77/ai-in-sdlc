# Phase 0 — Agent workspace and guardrails

Goal: make the agent setup safe and reviewed before any assignment work starts.

### P0-S1 — Review and approve agent customization files
- Status: Done
- Source: Project conventions (`AGENTS.md`), manual-intervention requirement
- Agent: none (human), optionally `risk-reviewer`
- Depends on: none
- Acceptance criteria:
  - [x] Every file under `.github/agents`, `.github/instructions`, `.github/hooks` has been read by a human. (Confirmed by Siddharth Jain, 2026-10-31; checklist in the review notes below.)
  - [x] Hook smoke test run: `git push --force` denied, `git commit` asks, `dotnet test` silent, Domain `using Microsoft.AspNetCore` blocked after edit. Run with `node .github/hooks/smoke-test.mjs` from the repo root: 11/11 passed on 2026-10-31.
  - [x] Agents appear in the VS Code agent picker and `sdlc-orchestrator` can list its subagents. (Confirmed by Siddharth Jain, 2026-10-31. No screenshot is stored in the repo; add one under `docs/` if the hand-in needs it.)
- Human gate: [x] Tech lead approves guardrails — Siddharth Jain, 2026-10-31
- Evidence: hook test output (below), human confirmation of the picker check (screenshot not stored in the repo)
- Review notes (agent; hook smoke test run on 2026-10-31):
  - The smoke test feeds simulated tool calls to `pre-tool-guard.mjs` and `post-edit-check.mjs` and checks the decision. It runs the scripts directly. It does not prove VS Code itself calls the hooks. The Domain case uses a scratch folder under the OS temp dir, so no repo file is touched.
  - Result: git push --force denied, git push -f denied, recursive force delete denied, git commit asks, npm install asks, `dotnet test` silent, Domain file edit asks, `.env` edit denied, doc edit silent, `using Microsoft.AspNetCore` in a Domain file blocked after edit, clean Domain file passes. 11 of 11.
  - Live evidence that the guard runs inside VS Code: while drafting this test, a terminal command containing the text of a recursive force delete was denied before it ran ("Blocked: recursive force delete"). This is one observation, not a full test of every rule.
  - Known gaps in the guard, found by reading `pre-tool-guard.mjs`. They are for the human to decide on, not fixed by the agent:
    - Matching is on command text, so a harmless command that only mentions `git commit` or `rm -rf` in a string is also blocked or asked. Cheap to hit, safe direction.
    - It is not a sandbox. Commands built from variables or a script file (for example `node some-script.mjs` that itself runs git) are not inspected.
    - `PostToolUse` skips `.github/hooks/` and only scans `.cs .ts .js .mjs .json .yml .yaml .html .config`, so a secret in a `.md` file is not caught.
    - Edits through the terminal are checked only for `>`, `>>`, `tee`, `sed -i`, `mv`, `cp`, `rm`; other writers (for example `node -e` or `python -c`) are not.
  - Files for the human to read for criterion 1 (tick each when read):
    - [x] `.github/hooks/human-in-the-loop.json`
    - [x] `.github/hooks/scripts/lib.mjs`, `pre-tool-guard.mjs`, `post-edit-check.mjs`, `session-context.mjs`, `stop-reminder.mjs`
    - [x] `.github/hooks/smoke-test.mjs` (added for this story)
    - [x] `.github/agents/`: `sdlc-orchestrator`, `backlog-planner`, `architecture-mapper`, `backend-implementer`, `test-author`, `risk-reviewer` (`*.agent.md`)
    - [x] `.github/instructions/`: `backend-dotnet`, `backlog`, `domain-rules`, `e2e`, `evidence-docs`, `tests` (`*.instructions.md`)
    - [x] `.github/workflows/ci.yml` (not listed in the criterion, but it is a protected path in the guard)
  - Done by the human (stated in chat, not independently checked by the agent): reading every file, the agent picker check, and the approval. The four guard gaps above are accepted as known limits unless the human opens a story to fix them.

### P0-S2 — Pin and approve a Mermaid MCP server
- Status: Done
- Source: Requirement §1 (use the Mermaid MCP)
- Agent: GitHub copilot, but human decided, `risk-reviewer` for supply-chain review
- Depends on: P0-S1 (Done, 2026-10-31)
- Acceptance criteria:
  - [x] A Mermaid MCP server is added to `.mcp.json` with a pinned version, not `@latest`. Also added to `.vscode/mcp.json` so VS Code can start it. Both pin `mcp-mermaid@0.4.1`.
  - [x] Package source and permissions reviewed and noted (agent review, see Review notes; human must confirm).
  - [x] One test diagram renders through the server. Both as-built diagrams rendered via `generate_mermaid_diagram` (SVG, local output); results in `docs/diagrams/rendered/`.
- Human gate: [x] Human approves the dependency (reviewed, including the `npm audit` findings listed below) — Siddharth Jain, 2026-10-31
- Evidence: `.mcp.json` and `.vscode/mcp.json` diff, `docs/diagrams/rendered/*.svg`
- Review notes (agent; `npm view`, `npm audit` and a source grep on 2026-10-31; not a full security audit):
  - Package `mcp-mermaid@0.4.1`, MIT, one maintainer (`atool`), source `github.com/hustcc/mcp-mermaid`, published 2026-02-12. Registry integrity `sha512-GFVSYsrhNAcTm4dWvCrwiA5gfV03at5mxyR7XiUqgXLr250OV5zhFh3buZTxgAAWPlOD5ZhrEBEJY8mL6qjjhg==`.
  - It has a `postinstall` script: `playwright install --with-deps chromium`. It downloads a browser on first run (`--with-deps` can ask for system packages on Linux, so check CI before using it there).
  - `-y` in the args auto-accepts the npx install prompt. Only the top-level package is pinned. Its dependencies use caret ranges (`express ^5`, `playwright ^1.52`, `mermaid-isomorphic ^3`, `@modelcontextprotocol/sdk ^1.11`), so transitive versions can still change.
  - Data egress: the tool's `svg_url` and `png_url` output types send the diagram to public mermaid.ink. Use only `svg`, `base64` or `file`. Diagram sources here cite code only, but the rule should hold for any future diagram.
  - The server reports its own version as `0.1.3` while the package is `0.4.1`. Confirmed: `build/server.js:24` hard-codes `version: "0.1.3"`. Cosmetic.
  - `npm audit` (scratch install of `mcp-mermaid@0.4.1`, scripts disabled, then deleted): 5 findings, 2 high and 3 low, no critical. High: `zod` (memory exhaustion when validating very large constrained collections, GHSA-mrhx-c7xc-m3w5, no fix available) and `mcp-mermaid` itself, flagged only because it depends on that `zod`. Low: `katex` (prototype pollution can bypass trust restrictions, GHSA-238p-pmpm-9mq7), `mermaid`, `mermaid-isomorphic` (fixes exist, not available through the pinned package). Resolved versions: `express 5.3.0`, `playwright 1.64.1`, `@modelcontextprotocol/sdk 1.32.2`, `mermaid-isomorphic 3.1.0`.
  - Risk reading (agent opinion, human to confirm): the server runs locally over stdio on diagram text we author, so the `zod` and `katex` issues need hostile input that this setup does not receive. Accepting them is a risk decision for the human, not something the agent can close.
  - Source grep of `build/*.js` for network and process use: the only outbound URL is `https://mermaid.ink/...` in `build/utils/mermaidUrl.js:18`, used by the `svg_url` and `png_url` outputs. The other `http://` hits are local `localhost` listeners for the optional SSE and streamable transports, which our `.mcp.json` and `.vscode/mcp.json` do not enable. No `child_process`, `exec` or `spawn` use was found. Chromium is launched through `playwright`.
  - Not done: network traffic was not captured during a render; the grep above is not a full source review.
  - Verified: VS Code Copilot Chat in this workspace lists the server and a direct tool call returned a rendered image (`base64` output, local).

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
