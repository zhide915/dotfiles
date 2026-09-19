#!/usr/bin/env node
'use strict';

const test = require('node:test');
const assert = require('node:assert');
const fs = require('fs');
const path = require('path');
const { setup, teardown } = require('./scratch.js');
const { link } = require('../bin/link.js');

test('link creates a file link, and real parent directories, for a missing file', () => {
  const { root, repoRoot, home } = setup({ '.claude/hooks/guard.js': '// hook' });
  try {
    const results = link({ repoRoot, home });
    assert.deepStrictEqual(results, [{ file: '.claude/hooks/guard.js', state: 'linked', created: true }]);
    const live = path.join(home, '.claude', 'hooks', 'guard.js');
    assert.ok(fs.lstatSync(live).isSymbolicLink());
    assert.strictEqual(fs.readFileSync(live, 'utf8'), '// hook');
    assert.ok(!fs.lstatSync(path.join(home, '.claude', 'hooks')).isSymbolicLink(), 'parents are real directories');
  } finally { teardown(root); }
});

test('link leaves a blocked file untouched and still links the others', () => {
  const { root, repoRoot, home } = setup({ '.bashrc': 'managed', '.profile': 'managed', '.zshrc': 'managed' });
  try {
    fs.writeFileSync(path.join(home, '.bashrc'), 'only copy');
    const other = path.join(root, 'other.profile');
    fs.writeFileSync(other, 'old repo');
    fs.symlinkSync(other, path.join(home, '.profile'), 'file');
    const results = link({ repoRoot, home });
    assert.deepStrictEqual(results.map((r) => r.state), ['blocked', 'blocked', 'linked']);
    assert.strictEqual(fs.readFileSync(path.join(home, '.bashrc'), 'utf8'), 'only copy');
    assert.strictEqual(fs.readFileSync(path.join(home, '.profile'), 'utf8'), 'old repo');
    assert.strictEqual(fs.readlinkSync(path.join(home, '.profile')), other, 'the wrong link is still the old link');
    assert.strictEqual(fs.readFileSync(path.join(home, '.zshrc'), 'utf8'), 'managed');
  } finally { teardown(root); }
});

test('link does not write through a link in the parent path', () => {
  const { root, repoRoot, home } = setup({ '.claude/hooks/guard.js': '// hook' });
  try {
    const oldHooks = path.join(root, 'old-hooks');
    fs.mkdirSync(oldHooks);
    fs.mkdirSync(path.join(home, '.claude'));
    fs.symlinkSync(oldHooks, path.join(home, '.claude', 'hooks'), 'junction');
    const [r] = link({ repoRoot, home });
    assert.strictEqual(r.state, 'blocked');
    assert.deepStrictEqual(fs.readdirSync(oldHooks), []);
  } finally { teardown(root); }
});

test('a second run changes nothing and reports linked', () => {
  const { root, repoRoot, home } = setup({ '.bashrc': 'managed' });
  try {
    link({ repoRoot, home });
    assert.deepStrictEqual(link({ repoRoot, home }), [{ file: '.bashrc', state: 'linked' }]);
  } finally { teardown(root); }
});

test('the scripts link the real home tree into an empty home, and the exit codes follow the states', () => {
  const { root, home } = setup({});
  const { spawnSync } = require('child_process');
  const run = (script) => spawnSync(process.execPath, [path.join(__dirname, '..', 'bin', script)], {
    env: { ...process.env, USERPROFILE: home, HOME: home }, encoding: 'utf8',
  });
  try {
    assert.strictEqual(run('status.js').status, 1, 'missing files make status exit 1');
    const linked = run('link.js');
    assert.strictEqual(linked.status, 0, linked.stdout + linked.stderr);
    assert.match(linked.stdout, /created: ~\/\.claude\/settings\.json/);
    assert.strictEqual(run('status.js').status, 0, 'all linked makes status exit 0');
    fs.unlinkSync(path.join(home, '.bashrc'));
    fs.writeFileSync(path.join(home, '.bashrc'), 'real');
    const blocked = run('link.js');
    assert.strictEqual(blocked.status, 1, 'a blocked file makes link exit 1');
    assert.match(blocked.stdout, /blocked: ~\/\.bashrc \(real file/);
  } finally { teardown(root); }
});
