#!/usr/bin/env node
// Invariant: only creates. A blocked file is left alone, because it can be the
// only copy of its content.
'use strict';

const fs = require('fs');
const path = require('path');
const { managedFiles, classify, describe, MACHINE } = require('./lib.js');

function link({ repoRoot, home }) {
  return managedFiles(repoRoot).map((file) => {
    const before = classify(repoRoot, home, file);
    if (before.state !== 'missing') return before;
    const live = path.join(home, file);
    fs.mkdirSync(path.dirname(live), { recursive: true });
    try {
      fs.symlinkSync(fs.realpathSync(path.join(repoRoot, 'home', file)), live, 'file');
    } catch (e) {
      if (e.code === 'EPERM') throw new Error(`a file link needs Developer Mode or an elevated shell: ${live}`);
      throw e;
    }
    return { file, state: 'linked', created: true };
  });
}

module.exports = { link };

if (require.main === module) {
  let results;
  try { results = link(MACHINE); } catch (e) { console.error(`  error: ${e.message}`); process.exit(1); }
  for (const r of results) {
    const fix = r.state === 'blocked' ? '; remove it, then run link again' : '';
    console.log(`  ${r.created ? 'created' : r.state}: ${describe(r)}${fix}`);
  }
  if (results.some((r) => r.state === 'blocked')) process.exit(1);
}
