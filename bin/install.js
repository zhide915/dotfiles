#!/usr/bin/env node
// Invariant: each step checks first and acts only when there is something to
// do, so a second run prints ok throughout.
'use strict';

const path = require('path');
const { spawnSync } = require('child_process');
const { describe, MACHINE } = require('./lib.js');
const { link } = require('./link.js');
const { status } = require('./status.js');

const PREREQUISITES = ['git', 'node', 'go', 'fnm', 'herdr', 'claude'];
const STATUSLINE = 'github.com/zhide915/statusline@latest';
const HERDR_VAR = 'HERDR_CONFIG_PATH';

// `where` searches the current directory before PATH, so run it from bin/,
// which holds no file with a command's name.
function onPath(cmd) {
  return spawnSync('where', [cmd], { stdio: 'ignore', cwd: __dirname }).status === 0;
}

// Reads the registry, because this process's copy can be stale. Output that
// can't be parsed still counts as set, so that setx never overwrites a value.
function userVar(name) {
  const r = spawnSync('reg', ['query', 'HKCU\\Environment', '/v', name], { encoding: 'utf8' });
  if (r.status !== 0) return { set: false };
  const line = r.stdout.split(/\r?\n/).find((l) => l.trim().toLowerCase().startsWith(name.toLowerCase()));
  const m = line && line.trim().slice(name.length).match(/^\s+REG_\w+\s*(.*)$/);
  return m ? { set: true, value: m[1].trim() } : { set: true };
}

function samePath(a, b) {
  return path.normalize(a).toLowerCase() === path.normalize(b).toLowerCase();
}

function install({ repoRoot, home }) {
  let failed = false;
  let restartHerdr = false;
  const say = (state, what) => {
    if (state !== 'ok' && state !== 'done') failed = true;
    console.log(`  ${state}: ${what}`);
  };

  console.log('==> prerequisites');
  for (const cmd of PREREQUISITES) say(onPath(cmd) ? 'ok' : 'missing', cmd);

  console.log('==> statusline');
  if (onPath('statusline')) say('ok', 'statusline');
  else if (!onPath('go')) say('missing', 'statusline (needs go)');
  else if (spawnSync('go', ['install', STATUSLINE], { stdio: 'inherit' }).status !== 0) say('failed', `go install ${STATUSLINE}`);
  else if (!onPath('statusline')) say('missing', 'statusline is built, but the Go bin directory is not on PATH');
  else say('done', `go install ${STATUSLINE}`);

  console.log(`==> ${HERDR_VAR}`);
  const want = path.join(home, '.zhide915', 'herdr.toml');
  const have = userVar(HERDR_VAR);
  if (!have.set) {
    const ok = spawnSync('setx', [HERDR_VAR, want], { stdio: 'ignore' }).status === 0;
    restartHerdr = ok;
    say(ok ? 'done' : 'failed', `setx ${HERDR_VAR} ${want}`);
  } else if (have.value !== undefined && samePath(have.value, want)) say('ok', want);
  else say('blocked', `already set to "${have.value === undefined ? 'a value that could not be read' : have.value}"; remove it, then run install again`);

  console.log('==> link');
  try {
    for (const r of link({ repoRoot, home })) say(r.created ? 'done' : r.state === 'linked' ? 'ok' : r.state, describe(r));
  } catch (e) { say('failed', e.message); }

  console.log('==> status');
  for (const r of status({ repoRoot, home })) say(r.state === 'linked' ? 'ok' : r.state, describe(r));

  if (restartHerdr) console.log(`\nRestart herdr to load ${HERDR_VAR}, then check the Config line of \`herdr --help\`.`);
  return !failed;
}

// The two checks are exported so that they can run without the actions.
module.exports = { onPath, userVar };

if (require.main === module) {
  if (!install(MACHINE)) process.exit(1);
}
