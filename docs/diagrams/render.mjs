#!/usr/bin/env node
// Renders docs/diagrams/<name>.mmd to docs/diagrams/rendered/<name>.svg through the pinned Mermaid MCP server.
// Run from the repo root:  node docs/diagrams/render.mjs [name ...]
// With no names it renders every *.mmd in this folder.
// Local output only (svg). Never use the svg_url or png_url output types: they send the diagram to public mermaid.ink.
// Needs npx to fetch mcp-mermaid@0.4.1 (pinned, see .mcp.json) and its Chromium postinstall.
import { spawn } from 'node:child_process';
import { readFileSync, writeFileSync, readdirSync, mkdirSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const outDir = path.join(here, 'rendered');
mkdirSync(outDir, { recursive: true });

const requested = process.argv.slice(2);
const names = requested.length > 0
  ? requested
  : readdirSync(here).filter((file) => file.endsWith('.mmd')).map((file) => file.replace(/\.mmd$/, ''));

const server = spawn('npx', ['-y', 'mcp-mermaid@0.4.1'], { stdio: ['pipe', 'pipe', 'pipe'] });
server.stderr.on('data', (chunk) => process.stderr.write(String(chunk).slice(0, 300)));

const waiting = new Map();
let buffered = '';
server.stdout.on('data', (chunk) => {
  buffered += chunk;
  let newline;
  while ((newline = buffered.indexOf('\n')) >= 0) {
    const line = buffered.slice(0, newline).trim();
    buffered = buffered.slice(newline + 1);
    if (!line) continue;
    const message = JSON.parse(line);
    if (message.id && waiting.has(message.id)) {
      waiting.get(message.id)(message);
      waiting.delete(message.id);
    }
  }
});

let nextId = 1;
const call = (method, params) =>
  new Promise((resolve) => {
    const id = nextId++;
    waiting.set(id, resolve);
    server.stdin.write(JSON.stringify({ jsonrpc: '2.0', id, method, params }) + '\n');
  });

await call('initialize', {
  protocolVersion: '2024-11-05',
  capabilities: {},
  clientInfo: { name: 'render-diagrams', version: '1' },
});
server.stdin.write(JSON.stringify({ jsonrpc: '2.0', method: 'notifications/initialized' }) + '\n');

let failures = 0;
for (const name of names) {
  const source = readFileSync(path.join(here, `${name}.mmd`), 'utf8');
  const response = await Promise.race([
    call('tools/call', {
      name: 'generate_mermaid_diagram',
      arguments: { mermaid: source, outputType: 'svg', theme: 'default', backgroundColor: '#ffffff' },
    }),
    new Promise((resolve) => setTimeout(() => resolve({ timeout: true }), 90000)),
  ]);
  const text = (response.result?.content ?? []).map((part) => part.text ?? '').join('');
  if (response.timeout || response.error || response.result?.isError || !text.includes('<svg')) {
    failures += 1;
    console.log(`${name}: FAILED ${response.timeout ? 'timeout' : text.slice(0, 600) || JSON.stringify(response.error ?? {})}`);
    continue;
  }
  // The server leaves the root <svg> transparent. Viewers with a dark theme then show dark text on a dark page.
  const withBackground = text.replace(/<svg\b([^>]*?)style="/, '<svg$1style="background-color:#ffffff;');
  if (!withBackground.includes('background-color:#ffffff')) {
    failures += 1;
    console.log(`${name}: FAILED could not set a white background on the root svg`);
    continue;
  }
  writeFileSync(path.join(outDir, `${name}.svg`), withBackground);
  console.log(`${name}: OK (${withBackground.length} bytes)`);
}

server.kill();
process.exit(failures === 0 ? 0 : 1);
