#!/usr/bin/env node
// Symlink repo config into live dirs (repo -> ~/.claude). Use --dry-run to preview.
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

function removeTarget(dst) {
  let st;
  try { st = fs.lstatSync(dst); } catch (e) { return; }
  if (st.isSymbolicLink()) {
    try { fs.unlinkSync(dst); } catch (e) { fs.rmdirSync(dst); }
  } else {
    fs.rmSync(dst, { recursive: true, force: true });
  }
}

function linkEntry(src, dst) {
  if (!fs.existsSync(src)) { console.log(`  skip: ${src}`); return; }
  src = fs.realpathSync(src);
  if (dryRun) { console.log(`  link: ${dst} -> ${src}`); return; }
  removeTarget(dst);
  fs.mkdirSync(path.dirname(dst), { recursive: true });
  const type = fs.statSync(src).isDirectory() ? 'junction' : 'file';
  try {
    fs.symlinkSync(src, dst, type);
  } catch (e) {
    if (e.code === 'EPERM') throw new Error(`symlink needs Developer Mode or an elevated shell: ${dst}`);
    throw e;
  }
  console.log(`  ok: ${dst}`);
}

for (const [agentName, agent] of Object.entries(manifest.agents)) {
  const repoDir = path.join(repoRoot, agent.repoDir);
  const targetDir = expandHome(agent.targetDir);
  console.log(`==> ${agentName}  ->  ${targetDir}`);
  if (agent.instructions) {
    linkEntry(path.join(repoRoot, agent.instructions.from), path.join(targetDir, agent.instructions.to));
  }
  for (const entry of agent.sync) {
    linkEntry(path.join(repoDir, entry), path.join(targetDir, entry));
  }
}
