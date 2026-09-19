'use strict';

const fs = require('fs');
const path = require('path');
const os = require('os');

// Paths use '/' on every OS, because classify splits on it.
function managedFiles(repoRoot) {
  const tree = path.join(repoRoot, 'home');
  const files = [];
  (function walk(dir) {
    for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
      const p = path.join(dir, e.name);
      if (e.isDirectory()) walk(p);
      else files.push(path.relative(tree, p).split(path.sep).join('/'));
    }
  })(tree);
  return files.sort();
}

function lstat(p) {
  try { return fs.lstatSync(p); } catch (e) { return null; }
}

function classify(repoRoot, home, file) {
  const managed = path.join(repoRoot, 'home', file);
  const live = path.join(home, file);
  // A link above the live path would send writes somewhere else.
  let parent = home;
  for (const part of file.split('/').slice(0, -1)) {
    parent = path.join(parent, part);
    const pst = lstat(parent);
    if (!pst) break;
    if (pst.isSymbolicLink()) return { file, state: 'blocked', reason: `link in the parent path at ${parent}` };
    if (!pst.isDirectory()) return { file, state: 'blocked', reason: `real file in the parent path at ${parent}` };
  }
  const st = lstat(live);
  if (!st) return { file, state: 'missing' };
  if (!st.isSymbolicLink()) {
    return { file, state: 'blocked', reason: `real ${st.isDirectory() ? 'directory' : 'file'} at ${live}` };
  }
  // The native realpath gives the true letter case on Windows. It throws on a
  // link to nothing, which is a wrong link too.
  let resolved = null;
  try { resolved = fs.realpathSync.native(live); } catch (e) {}
  if (resolved === fs.realpathSync.native(managed)) return { file, state: 'linked' };
  return { file, state: 'blocked', reason: `link to ${fs.readlinkSync(live)} at ${live}` };
}

function describe(r) {
  return `~/${r.file}${r.reason ? ` (${r.reason})` : ''}`;
}

const MACHINE = { repoRoot: path.resolve(__dirname, '..'), home: os.homedir() };

module.exports = { managedFiles, classify, describe, MACHINE };
