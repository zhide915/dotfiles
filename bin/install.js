#!/usr/bin/env node
// Invariant: each step checks first and acts only when there is something to
// do, so a second run prints ok throughout.
'use strict';

const { spawnSync } = require('child_process');
const { describe, MACHINE } = require('./lib.js');
const { link } = require('./link.js');
const { status } = require('./status.js');

const PREREQUISITES = ['git', 'node', 'go', 'fnm', 'herdr-app', 'claude'];
const FOOTLIGHT = 'github.com/zhide915/footlight@latest';

// `where` searches the current directory before PATH, so run it from bin/,
// which holds no file with a command's name.
function onPath(cmd) {
  return spawnSync('where', [cmd], { stdio: 'ignore', cwd: __dirname }).status === 0;
}

function install({ repoRoot, home }) {
  let failed = false;
  const say = (state, what) => {
    if (state !== 'ok' && state !== 'done') failed = true;
    console.log(`  ${state}: ${what}`);
  };

  console.log('==> prerequisites');
  for (const cmd of PREREQUISITES) say(onPath(cmd) ? 'ok' : 'missing', cmd);

  console.log('==> footlight');
  if (onPath('footlight')) say('ok', 'footlight');
  else if (!onPath('go')) say('missing', 'footlight (needs go)');
  else if (spawnSync('go', ['install', FOOTLIGHT], { stdio: 'inherit' }).status !== 0) say('failed', `go install ${FOOTLIGHT}`);
  else if (!onPath('footlight')) say('missing', 'footlight is built, but the Go bin directory is not on PATH');
  else say('done', `go install ${FOOTLIGHT}`);

  console.log('==> link');
  try {
    for (const r of link({ repoRoot, home })) say(r.created ? 'done' : r.state === 'linked' ? 'ok' : r.state, describe(r));
  } catch (e) { say('failed', e.message); }

  console.log('==> status');
  for (const r of status({ repoRoot, home })) say(r.state === 'linked' ? 'ok' : r.state, describe(r));

  return !failed;
}

// The check is exported so that it can run without the actions.
module.exports = { onPath };

if (require.main === module) {
  if (!install(MACHINE)) process.exit(1);
}
