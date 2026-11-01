#!/usr/bin/env node
// PreToolUse guard. Deterministic human-in-the-loop policy:
//   deny = never allowed by an agent, ask = a human must confirm, silence = default behaviour.
import {
  readHookInput,
  workspaceRoot,
  collectPaths,
  collectPatchPaths,
  toRelative,
  isEditTool,
} from './lib.mjs';

const input = readHookInput();
const toolName = input.tool_name ?? input.toolName ?? '';
const toolInput = input.tool_input ?? input.toolInput ?? {};
const root = workspaceRoot(input);

const respond = (permissionDecision, reason) => {
  process.stdout.write(
    JSON.stringify({
      hookSpecificOutput: {
        hookEventName: 'PreToolUse',
        permissionDecision,
        permissionDecisionReason: reason,
      },
    }),
  );
  process.exit(0);
};

const DENY_COMMANDS = [
  [/\brm\s+-[a-z]*(rf|fr)\b/i, 'recursive force delete'],
  [/\bgit\s+push\b.*(--force\b|--force-with-lease|\s-f\b)/i, 'force push'],
  [/\bgit\s+reset\s+--hard\b/i, 'git reset --hard'],
  [/\bgit\s+clean\s+-[a-z]*f/i, 'git clean -f'],
  [/--no-verify\b/i, 'bypassing git hooks'],
  [/\b(curl|wget)\b[^|]*\|\s*(ba|z)?sh\b/i, 'piping a download into a shell'],
  [/\bdrop\s+(table|database)\b/i, 'dropping database objects'],
  [/\bsudo\b/i, 'privilege escalation'],
];

const ASK_COMMANDS = [
  [/\bgit\s+(commit|push|checkout|switch|merge|rebase|stash|tag|restore|branch\s+-[dD])\b/i, 'git change that alters history or working tree'],
  [/\b(npm|pnpm|yarn)\s+(install|i|add|publish|exec)\b|\bnpx\b/i, 'package install or remote code execution'],
  [/\bdotnet\s+(add\s+package|nuget|publish|ef)\b/i, 'dotnet dependency, publish or database command'],
  [/\bpip3?\s+install\b/i, 'package install'],
  [/\b(az|kubectl|terraform|helm|gh)\s/i, 'cloud, cluster or GitHub CLI command'],
  [/\b(curl|wget)\b/i, 'network request that can send data out (risk audit option A)'],
];

// MCP tools that send data to a remote service. They are not shell commands or file edits, so the rules
// below never see them; they are matched by tool name instead (risk audit option A, docs/policies/risk-audit.md).
const ASK_TOOLS = [
  [
    /gitkraken.*(issues_create|issues_add_comment|pull_request_create|pull_request_create_review|git_push)$/i,
    'MCP tool that sends data to GitHub or a remote',
  ],
];

const DENY_PATHS = [
  [/^\.env(\.|$)/, 'secret environment file'],
  [/(^|\/)\.git\//, 'git internals'],
];

const ASK_PATHS = [
  [/^(AGENTS|CLAUDE)\.md$/, 'project conventions'],
  [/^\.mcp\.json$/, 'MCP server configuration'],
  [/^\.github\/(agents|hooks|instructions|workflows)\//, 'agent customization or CI'],
  [/^ops\//, 'ops evidence (read-only, planned deployment)'],
  [/^docs\/requirement\//, 'requirement source document'],
  [/^docs\/adr\//, 'decision records are human-authored'],
  [/^backend\/src\/InvoiceApp\.Domain\//, 'domain business rules'],
  [/^backend\/src\/InvoiceApp\.Api\/(Program\.cs|appsettings.*|Auth\/)/, 'startup, config or auth'],
  [/\.(csproj|sln)$/, 'project or solution file'],
  [/^e2e\/(package(-lock)?\.json|playwright\.config\.ts)$/, 'e2e dependencies or config'],
];

const matchPath = (rules, relativePath) => rules.find(([pattern]) => pattern.test(relativePath));

// 0. MCP tools that send data out
const askedTool = ASK_TOOLS.find(([pattern]) => pattern.test(toolName));
if (askedTool) respond('ask', `Manual approval required: ${askedTool[1]}.`);

// 1. Terminal commands
const command = typeof toolInput.command === 'string' ? toolInput.command : '';
if (command) {
  const denied = DENY_COMMANDS.find(([pattern]) => pattern.test(command));
  if (denied) respond('deny', `Blocked: ${denied[1]}. A human must run this manually if it is truly needed.`);

  const asked = ASK_COMMANDS.find(([pattern]) => pattern.test(command));
  if (asked) respond('ask', `Manual approval required: ${asked[1]}.`);

  const writesFiles = /(>|>>|\btee\b|\bsed\s+-i|\bmv\b|\bcp\b|\brm\b)/.test(command);
  if (writesFiles) {
    const touched = [...ASK_PATHS, ...DENY_PATHS].find(([pattern]) =>
      command.split(/\s+/).some((token) => pattern.test(token.replace(/^['"]|['"]$/g, ''))),
    );
    if (touched) respond('ask', `Terminal command appears to write a protected path (${touched[1]}).`);
  }
}

// 2. File edits
if (isEditTool(toolName) || toolInput.input) {
  const paths = collectPatchPaths(toolInput, collectPaths(toolInput));
  for (const rawPath of paths) {
    const relativePath = toRelative(rawPath, root);
    if (relativePath.startsWith('..')) {
      respond('ask', `Edit targets a path outside the workspace: ${rawPath}`);
    }
    const denied = matchPath(DENY_PATHS, relativePath);
    if (denied) respond('deny', `Blocked: ${relativePath} is a ${denied[1]}.`);
    const asked = matchPath(ASK_PATHS, relativePath);
    if (asked) respond('ask', `Manual approval required: ${relativePath} (${asked[1]}).`);
  }
}
