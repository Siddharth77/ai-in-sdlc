#!/usr/bin/env bash
# Paced runner for the 8 minute demo video. Read-only: runs tests and scripts, edits nothing.
#
#   bash submission/demo/run-demo.sh          run all chapters, press Enter between steps
#   bash submission/demo/run-demo.sh 3        run chapter 3 only (for retakes)
#   bash submission/demo/run-demo.sh --check  dry run: run every command quietly, report ok or FAIL
#
# Talking points and the timeline are in submission/demo/RUNBOOK.md.

set -u
cd "$(dirname "$0")/../.." || exit 1

EDITOR_APP="Visual Studio Code"
CHECK_ONLY=0
FAILED=0

banner() { printf '\n\033[1;36m== %s ==\033[0m\n' "$1"; }
wait_for_enter() { [ "$CHECK_ONLY" = 1 ] || read -r -p "" _; }

show_file() {
  [ "$CHECK_ONLY" = 1 ] && return 0
  printf '\033[2m   open: %s\033[0m' "$1"
  open -a "$EDITOR_APP" "$1" 2>/dev/null || true
  wait_for_enter
}

show_in_browser() {
  [ "$CHECK_ONLY" = 1 ] && return 0
  printf '\033[2m   open: %s\033[0m' "$1"
  open "$1" 2>/dev/null || true
  wait_for_enter
}

# Print the command, wait for Enter, then run it. In --check mode, run quietly and report the exit code.
run() {
  if [ "$CHECK_ONLY" = 1 ]; then
    if eval "$1" >/dev/null 2>&1; then printf 'ok    %s\n' "$1"; else printf 'FAIL  %s\n' "$1"; FAILED=1; fi
    return 0
  fi
  printf '\033[1;32m$ %s\033[0m' "$1"
  wait_for_enter
  eval "$1"
}

chapter_1() {
  banner "1/7  Guardrails: who is allowed to do what"
  show_file AGENTS.md
  run "ls .github/agents .github/hooks"
  run "node .github/hooks/smoke-test.mjs | tail -14"
}

chapter_2() {
  banner "2/7  Task 1: as-built architecture and the architecture test"
  show_in_browser docs/diagrams/rendered/as-built-container.svg
  show_file docs/diagrams/as-built-citations.md
  show_file backend/tests/InvoiceApp.Tests/DomainDependencyRuleTests.cs
  run "dotnet test backend/InvoiceApp.sln --filter \"FullyQualifiedName~DomainDependencyRuleTests\" --nologo | tail -3"
}

chapter_3() {
  banner "3/7  Task 2: exactly-once decision record"
  show_file docs/adr/0001-exactly-once-submission.md
  run "grep -nE '^- Status|^## (Gate 0|Strongest objection|Where the agent was wrong)|^Status on 2026-11-01' docs/adr/0001-exactly-once-submission.md | cut -c1-100"
}

chapter_4() {
  banner "4/7  Task 4: review evaluation, 144 scored rows"
  show_file docs/evals/report.md
  run "node docs/evals/score.mjs | grep -E '^== |^  (caught|false alarm)'"
  run "sed -n '1,12p' docs/evals/raw/README.md"
}

chapter_5() {
  banner "5/7  Task 5: measurement baseline (fixture data, not production)"
  show_file docs/policies/measurement-plan.md
  run "node docs/measurement/capture-baseline.mjs | sed -n '1,30p'"
}

chapter_6() {
  banner "6/7  Tasks 3 and 5: autonomy policy and risk audit"
  show_file docs/policies/autonomy-policy.md
  show_file docs/policies/risk-audit.md
  run "wc -w docs/policies/autonomy-policy.md"
}

chapter_7() {
  banner "7/7  Close: logs and the full test suite"
  run "ls docs/ai-logs"
  run "dotnet test backend/InvoiceApp.sln --nologo | tail -3"
}

if [ "${1:-}" = "--check" ]; then
  CHECK_ONLY=1
  for n in 1 2 3 4 5 6 7; do "chapter_$n"; done
  echo
  if [ "$FAILED" = 0 ]; then echo "All demo commands ran. Ready to record."; else echo "At least one command failed. Fix before recording."; exit 1; fi
  exit 0
fi

if [ -n "${1:-}" ]; then "chapter_$1"; exit 0; fi
for n in 1 2 3 4 5 6 7; do "chapter_$n"; done
banner "End of demo"
