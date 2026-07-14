#!/usr/bin/env node
// Pull live config back into the repo (~/.claude -> repo). Use --dry-run to preview.
'use strict';

const fs = require('fs');
const path = require('path');
const os = require('os');

const dryRun = process.argv.includes('--dry-run');
const repoRoot = path.resolve(__dirname, '..');
const manifest = JSON.parse(fs.readFileSync(path.join(repoRoot, 'manifest.json'), 'utf8'));

function expandHome(p) {
  return p.startsWith('~') ? path.join(os.homedir(), p.slice(1)) : p;
}

function mirrorDir(src, dst) {
  fs.mkdirSync(dst, { recursive: true });
  const srcEntries = fs.readdirSync(src, { withFileTypes: true });
  const keep = new Set(srcEntries.map((e) => e.name));
  for (const name of fs.readdirSync(dst)) {
    if (!keep.has(name)) fs.rmSync(path.join(dst, name), { recursive: true, force: true });
  }
  for (const e of srcEntries) {
    const s = path.join(src, e.name);
    const d = path.join(dst, e.name);
    if (e.isDirectory()) mirrorDir(s, d);
    else fs.copyFileSync(s, d);
  }
}

function sameFile(a, b) {
  try { return fs.realpathSync(a) === fs.realpathSync(b); } catch (e) { return false; }
}

function pullEntry(src, dst) {
  if (!fs.existsSync(src)) { console.log(`  skip: ${src}`); return; }
  if (sameFile(src, dst)) { console.log(`  same: ${src} (linked) — skip`); return; }
  if (dryRun) { console.log(`  pull: ${src} -> ${dst}`); return; }
  if (fs.statSync(src).isDirectory()) {
    mirrorDir(src, dst);
  } else {
    fs.mkdirSync(path.dirname(dst), { recursive: true });
    fs.copyFileSync(src, dst);
  }
  console.log(`  ok: ${dst}`);
}

for (const [agentName, agent] of Object.entries(manifest.agents)) {
  const repoDir = path.join(repoRoot, agent.repoDir);
  const targetDir = expandHome(agent.targetDir);
  console.log(`==> ${agentName}  ->  ${repoDir}`);
  if (agent.instructions) {
    pullEntry(path.join(targetDir, agent.instructions.to), path.join(repoRoot, agent.instructions.from));
  }
  for (const entry of agent.sync) {
    pullEntry(path.join(targetDir, entry), path.join(repoDir, entry));
  }
}
