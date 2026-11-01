# AI log: first working session, 2026-10-29 to 2026-10-30

Reconstructed on 2026-11-01 from the local chat transcript (counts and subagent arguments only). The transcript does not hold the agent's reasoning or file contents, so this log is short on purpose.

| Field | Value |
| --- | --- |
| id | 2026-10-29-first-attempt |
| timestamp (UTC) | 2026-10-29T16:59Z to 2026-10-30T13:26Z |
| stage | First attempt at the five tasks, before the backlog and guardrails existed |
| agent | GitHub Copilot, agent mode |
| model | Main agent: not recorded by the tooling. Two Explore subagents recorded "GPT-4.1" in their arguments. Copilot Chat 0.52.0, VS Code 1.124.2 |
| subagents / tools used | 14 subagent runs: Explore x9 and the custom `SDLC Evidence Reviewer` x5 (three of them are the ADR stress tests). About 777 tool calls in total. 56 user messages |
| human decision | The author discarded this attempt's documents and restarted from a backlog with human gates |
| verification | None that is kept. The documents from this session were never committed |
| limitation | Not reproducible: the only surviving parts are the three stress-test prompts and replies, saved in `2026-10-30-adr-stress-tests.md` |
| status | Reconstructed |
| artifacts | None in the repository. The old draft `docs/decision-record-exact-once.md` was replaced by `docs/adr/0001-exactly-once-submission.md` |

## Entries

- The ADR stress tests were run here at 2026-10-30T05:28Z against the old draft. They are the only part carried forward.
- The old draft carried an unvalidated build figure (15 to 25 engineer-days). Stress test 3 flagged it, and it was removed from the ADR.
- Lesson that shaped the restart: results were written as if verified before anything had been run, which is why the later phases add a human gate and an evidence rule to every story.
