# AI log: submission readiness and fixes, 2026-11-01

Written during the session, from what was actually done.

| Field | Value |
| --- | --- |
| id | 2026-11-01-submission-readiness |
| timestamp (UTC) | 2026-10-31T18:22Z (readiness audit); 2026-11-01 (fixes) |
| stage | Phase 6 preparation, and fixes to phases 1 to 5 |
| agent | GitHub Copilot, agent mode |
| model | Claude Sonnet 5.5 (stated by the assistant; not logged by the tooling) |
| tools used | File read and edit tools, terminal (`dotnet test`, `node`), transcript extraction with Python |
| human decision | Verdict from the audit: not ready to submit. The author then asked for item-by-item fixes, accepted the reviews ("review done") and asked for every remaining story to be marked Done |
| verification | `dotnet test backend/InvoiceApp.sln`: 9 of 9 pass. `node .github/hooks/smoke-test.mjs`: 17 of 17. `node docs/evals/score.mjs`: matches the report |
| limitation | The video does not exist yet. Waivers recorded in the backlog: no second ADR reviewer, no cold reader for the policy, no numeric promotion threshold, no raw eval replies. The MCP write tools still have to be switched off by hand in the editor |
| status | Live for the fixes; the audit itself is reconstructed |
| artifacts | See the lists below |

## Entries

1. **Hook, risk-audit Option A.** `curl` and `wget` now ask a human, and five GitKraken MCP write tools ask a human. This gates the external-communication leg and does not remove it. Verified only on simulated payloads.
2. **ADR.** Objection and "wrong or useless" section drafted by the agent, accepted by the author. Status accepted conditional on Gate 0 (PayEx answers), "at most once automatically".
3. **Autonomy policy.** Cut to 495 words, decisions unchanged.
4. **Backlog.** P1-S6 ticked on the author's statement and a fresh pass (2 of 2). P2 to P4 gates ticked as stated in chat. Four gates are recorded as waived by the author, not approved by anyone else.
5. **Agent mistakes this session.** Two malformed batch edits were rejected by the tool and redone. The agent first marked stories In Review instead of Done, and the author corrected that. It also wrote word counts of 157, 187 and 177 into the stress-test log from memory; a recount gave 193, 206 and 190 and the log was corrected.
