# Risk audit: agent setup vs the lethal trifecta (reviewed; Option A application pending)

Date: 2026-10-31. Author: AI draft for P5-S1 and P5-S2. The decision section and
"Where the agent was wrong or useless" are human-authored per
`.github/instructions/evidence-docs.instructions.md`; the agent only drafts
options and evidence.

## Context

Requirement Task 5 asks for an audit of "the agent setup described at the end of
`ops/README.md`" against the lethal trifecta, then a redesign that removes a leg
or a written acceptance with a revisit trigger.

The lethal trifecta definition used here is the one this repository already
carries in `.github/agents/risk-reviewer.agent.md` (line 18): **access to
private data**, **exposure to untrusted input**, **ability to communicate
externally**. An agent with all three can be prompt-injected through untrusted
content into reading private data and sending it out.

## Evidence

### What is being audited (P5-S1 finding)

- **Verified:** `ops/README.md` in this checkout does **not** end with an
  agent-setup description. The file ends with the sections "A note on the
  scenario" and "No answers here" (read in full on 2026-10-31). Per backlog
  P5-S1, the missing description is not invented here.
- **Assumption (needs human confirmation):** the setup audited below is the
  agent setup that actually exists and is citable in this repository:
  - `.github/agents/`: `sdlc-orchestrator` plus subagents `backlog-planner`,
    `architecture-mapper`, `backend-implementer`, `test-author`,
    `risk-reviewer`.
  - `.github/hooks/human-in-the-loop.json` registering `PreToolUse` →
    `scripts/pre-tool-guard.mjs` (deny/ask policy) and `PostToolUse` →
    `scripts/post-edit-check.mjs`.
  - `.github/instructions/` file rules and `AGENTS.md` conventions.
  - The tool surface the agent can call: workspace file read/edit, terminal,
    subagents, browser/fetch, and the GitKraken MCP tools (git, issues,
    pull requests).
- If the facilitator's intended setup differs, the human replaces this
  assumption and the leg assessment is re-done.

### Leg 1 — access to private data: PRESENT as capability

- **Verified:** the agent can read any file in the workspace (read/search
  tools, terminal). `pre-tool-guard.mjs` denies *edits* to `.env*` and `.git/`
  (`DENY_PATHS`) and asks before terminal commands that *write* protected
  paths, but a read-only command such as `cat .env` matches no deny or ask
  rule — reading secrets is not blocked.
- **Verified:** the workspace currently holds no real private data. Demo
  accounts in `README.md` and `AGENTS.md` are labelled "not real credentials";
  `ops/README.md` states all names, hosts and figures are invented.
- Conclusion: the leg is present as a capability. Today it is mitigated by the
  environment (nothing real to read), not by a control.

### Leg 2 — exposure to untrusted input: PRESENT

- **Verified:** the agent ingests content not authored by the operator:
  remote issues and pull requests via the GitKraken MCP tools, web pages via
  the browser/fetch tools, and the `ops/` evidence packs and eval diffs, which
  are treated as input to analyse, not as trusted instructions.
- **Verified:** nothing in `pre-tool-guard.mjs` inspects or filters content
  the agent reads; the hooks gate actions, not input.
- Conclusion: present. A malicious issue body, PR description or web page is a
  prompt-injection channel.

### Leg 3 — ability to communicate externally: PRESENT

- **Verified:** the GitKraken MCP write tools (create issue, add comment,
  create pull request, push) are not shell commands and are not file edits, so
  `pre-tool-guard.mjs` does not see them; they pass with no deny or ask rule.
- **Verified:** in the terminal, `DENY_COMMANDS` blocks `curl`/`wget` only when
  piped into a shell. A plain egress command such as
  `curl -X POST <url> --data @file` matches no deny or ask rule. `git push`
  and cloud CLIs (`az`, `kubectl`, `terraform`, `helm`, `gh`) are ask-gated.
- Conclusion: present. Two unguarded egress paths exist: MCP write tools and
  non-piped terminal egress.

### Trifecta verdict

All three legs are present in capability. The setup as it stands is the full
lethal trifecta; the only reason no harm is recorded is that the workspace
contains no real private data. That is luck of environment, not a control, so
"do nothing" is not a defensible acceptance.

## Decision (human — options drafted by the agent)

All three options stay open. The agent's only guidance, noted for the human
reviewer: prefer the option with **low cost and high value** — on that basis
Option A looks strongest (small change, removes a whole leg), but the choice,
owner and date are for the human (P5-S3).

- **Option A — remove leg 3.** Scope the GitKraken MCP
  configuration to read-only operations, and add non-piped `curl`/`wget`
  egress to the `ASK_COMMANDS` list in `pre-tool-guard.mjs`. Cost: low. Value:
  high — removes the exfiltration leg entirely. The
  human keeps `git push` approval. Note: editing `.github/hooks/` is itself
  ask-gated, so a human applies this change.
- **Option B — remove leg 1.** Keep all real secrets out of the workspace
  (already true) and extend the guard to deny *reading* secret files. Cost:
  low. Value: partial — read-denial is easy to bypass with shell tricks, so
  this works best as a complement to Option A rather than alone.
- **Option C — remove leg 2.** The human pre-reads all external content
  (issues, PRs, web pages) before the agent sees it. Cost: high; slows every
  session. Value: high in principle, but the ongoing cost makes it the weakest
  fit for the low-cost preference.

### Interim risk acceptance (until the human picks an option and it is applied)

Risk accepted: the agent runs with all three legs present in a workspace that
contains no real private data, with human approval gates on git, installs,
config, auth, Domain and CI changes.

**Revisit triggers** (any one ends the acceptance):
1. Real credentials, customer data or production secrets enter the workspace.
2. The agent is connected to cloud accounts or a runtime/production context.
3. Any agent action executes without a log entry in `docs/ai-logs/`.
4. A suspected prompt injection via remote content (issue, PR, web page).
5. The MCP tool set changes (new write-capable tools appear).

Decision owner: Siddharth Jain  Date: 2026-10-31  (P5-S3 gate; Option A chosen, application pending)

## Where the agent was wrong or useless

> Errors recorded in this session. Every item below happened and is traceable. Reviewed and accepted as correct by Siddharth Jain, 2026-10-31.

**Wrong (caught and fixed):**

1. **Claimed a file existed that did not.** An earlier session summary said
   `docs/policies/risk-audit.md` already existed, with a non-standard trifecta
   definition. It did not exist on disk. Caught when the file was looked up;
   the audit was written fresh against the repo's own definition in
   `.github/agents/risk-reviewer.agent.md`. Logged in
   `docs/ai-logs/2026-10-31-p5-risk-audit.md`. Lesson: a summary is not
   evidence; check the file system before relying on a claim about it.
2. **Wrong commit count in the measurement plan.** Caveat 5 said "7 commits".
   `git rev-list --count main` gives 6. The capture script counts the
   checked-out branch (13 at the time), so the number was neither. Found by
   re-running the commands and corrected in
   `docs/policies/measurement-plan.md`.
3. **Inaccurate log entry.** The AI log said "Some code changed" when only
   documentation changed. Corrected.
4. **Stale text left behind.** After the eval runs were finalised, the report
   header ("kimi-k3, 48 rows") and the evals README ("48 blank rows") were
   not updated. Still open at the time of writing.
5. **Stated a cause as fact.** The plan and log say the first CI run was
   missed because the workflow was not yet registered when the PR opened. The
   evidence is that the workflows API went from 0 to 1 and a run appeared
   after a push; the ordering was inferred, not observed.

**Useless or unable:**

- **Could not produce the audit target.** `ops/README.md` has no agent-setup
  section. The agent could not recover it and documented an assumption
  instead; only the facilitator or the human can supply the real setup.
- **Could not act on shared state.** The agent cannot push, open the PR or
  change the hook rules, because those are ask-gated. It diagnosed why CI
  had no runs but the human had to do the fixing steps. This is the intended
  control, but it means the agent alone could not have captured the real CI
  run.
- **Fixture data.** The agent could compute the 20-run proxies, but they come
  from an invented file, so they say nothing about real delivery performance.
  The only real CI number (n = 1) is too small to use.
- **Did not make the risk decision.** Choosing Option A, the owner and the
  date were the human's. The agent supplied options and a cost/value note
  only.

## Open items for the human

- Done: "Where the agent was wrong or useless" reviewed and accepted by
  Siddharth Jain, 2026-10-31.
- Confirm or replace the audited-setup assumption above (P5-S1 gate).
- Option A chosen by Siddharth Jain on 2026-10-31 (P5-S3). Remaining: apply the
  hook and MCP changes (ask-gated, human-run), then re-run this audit's leg 3
  checks.
