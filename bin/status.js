#!/usr/bin/env node
// Invariant: read-only.
'use strict';

const { managedFiles, classify, describe, MACHINE } = require('./lib.js');

function status({ repoRoot, home }) {
  return managedFiles(repoRoot).map((file) => classify(repoRoot, home, file));
}

module.exports = { status };

if (require.main === module) {
  const results = status(MACHINE);
  for (const r of results) console.log(`  ${r.state}: ${describe(r)}`);
  if (results.some((r) => r.state !== 'linked')) process.exit(1);
}
