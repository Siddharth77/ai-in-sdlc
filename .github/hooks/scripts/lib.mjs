// Shared helpers for hook scripts. Keep small and auditable.
import { readFileSync } from 'node:fs';
import path from 'node:path';

export const readHookInput = () => {
  try {
    return JSON.parse(readFileSync(0, 'utf8') || '{}');
  } catch {
    return {};
  }
};

export const workspaceRoot = (input) => input.cwd ?? process.cwd();

const PATH_KEY = /^(file_?path|path|file|filename|uri)$/i;

// Collects every file path mentioned in a tool_input, including nested arrays such as `replacements`.
export const collectPaths = (value, found = new Set()) => {
  if (Array.isArray(value)) {
    value.forEach((item) => collectPaths(item, found));
  } else if (value && typeof value === 'object') {
    for (const [key, child] of Object.entries(value)) {
      if (typeof child === 'string' && PATH_KEY.test(key)) {
        found.add(child);
      } else {
        collectPaths(child, found);
      }
    }
  }
  return found;
};

// apply_patch style payloads carry paths inside the patch text.
export const collectPatchPaths = (toolInput, found = new Set()) => {
  const text = typeof toolInput?.input === 'string' ? toolInput.input : '';
  for (const match of text.matchAll(/^\*\*\* (?:Add|Update|Delete) File: (.+)$/gm)) {
    found.add(match[1].trim());
  }
  return found;
};

export const toRelative = (rawPath, root) => {
  const withoutScheme = rawPath.replace(/^file:\/\//, '');
  const absolute = path.isAbsolute(withoutScheme) ? withoutScheme : path.join(root, withoutScheme);
  return path.relative(root, absolute).split(path.sep).join('/');
};

export const isEditTool = (toolName = '') =>
  /(create|replace|edit|write|delete|rename|move|patch|insert)/i.test(toolName);
