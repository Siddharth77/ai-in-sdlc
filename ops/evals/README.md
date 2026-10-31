# Review eval

Ten fixed cases for measuring how well a review prompt performs on this
codebase. Each case is a diff in `cases/`. Some contain a defect and some do
not; which is which is not recorded here.

## Why run it

A review that finds something on one pull request has told you nothing about
how it behaves in general. This set gives you three numbers you can compare
over time, across models and across prompt versions:

- **Caught** — the case has a defect and the review named it.
- **Missed** — the case has a defect and the review did not.
- **False alarm** — the case is clean and the review reported a defect anyway.

The false alarm rate is the one people forget to measure, and it is the one
that decides whether anyone keeps using the reviewer.

## How to run it

1. Start a fresh session for each case. Context from a previous case will
   change the answer.
2. Give the agent the case diff and the review prompt below. Nothing else.
3. Record what it reported in `results.csv`, using `results-template.csv` as
   the starting point.
4. Repeat the whole set three times. Output varies between runs, so a single
   pass gives you an anecdote rather than a rate.
5. Change exactly one thing — the prompt, the model, or the context file —
   and run the set again.

## One-time model rotation: Kimi K3 -> Grok -> Claude

This is the model order for a single comparison pass on the same 10-case set:

1. Kimi K3
2. Grok
3. Claude

Use the same review prompt for all three model runs, on the same case diffs,
with a fresh session for each case. Do not add extra context beyond the case
file and the prompt. Record the model name in the `model` column of the CSV
as `kimi-k3`, `grok`, and `claude`.

This is a one-time model comparison, not a production-grade sample. It is
useful for comparing model behavior on the same set, but it is not enough to
make a final model choice. The repo does not include provider credentials or
API access for these models, so this run must be executed by a person with the
necessary environment variables or client access.

## The review prompt

> Review this diff for defects. For each finding give the file, the line, what
> goes wrong, and how confident you are. If you find nothing, say so
> explicitly rather than listing general observations.

## Scoring

Score one case per row. A finding counts as caught only if it names the actual
defect; a vague note that something "could be improved" near the right line
does not count, and neither does a correct finding reached for the wrong
reason. Be strict about this, because a generous score here is a score you
cannot act on later.

For the clean cases, style suggestions are not false alarms. A false alarm is
the review asserting a defect that is not there.
