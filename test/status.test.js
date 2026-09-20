#!/usr/bin/env node
'use strict';

const test = require('node:test');
const assert = require('node:assert');
const fs = require('fs');
const path = require('path');
const { setup, teardown } = require('./scratch.js');
const { status } = require('../bin/status.js');

test('a managed file with nothing at its live path is missing', () => {
  const { root, repoRoot, home } = setup({ '.claude/settings.json': '{"a":1}' });
  try {
    assert.deepStrictEqual(status({ repoRoot, home }), [
      { file: '.claude/settings.json', state: 'missing' },
    ]);
  } finally { teardown(root); }
});

test('a live path that is a link to the managed file is linked', () => {
  const { root, repoRoot, home } = setup({ '.bashrc': 'export A=1' });
  try {
    fs.symlinkSync(path.join(repoRoot, 'home', '.bashrc'), path.join(home, '.bashrc'), 'file');
    assert.deepStrictEqual(status({ repoRoot, home }), [{ file: '.bashrc', state: 'linked' }]);
  } finally { teardown(root); }
});

test('linked does not depend on the letter case of the path to the repo', { skip: process.platform !== 'win32' }, () => {
  const { root, repoRoot, home } = setup({ '.bashrc': 'export A=1' });
  try {
    fs.symlinkSync(path.join(repoRoot, 'home', '.bashrc'), path.join(home, '.bashrc'), 'file');
    assert.deepStrictEqual(status({ repoRoot: repoRoot.toUpperCase(), home }), [{ file: '.bashrc', state: 'linked' }]);
  } finally { teardown(root); }
});

test('a real file at the live path is blocked', () => {
  const { root, repoRoot, home } = setup({ '.bashrc': 'export A=1' });
  try {
    fs.writeFileSync(path.join(home, '.bashrc'), 'only copy');
    const [r] = status({ repoRoot, home });
    assert.strictEqual(r.state, 'blocked');
    assert.match(r.reason, /real file/);
  } finally { teardown(root); }
});

test('a link to a different file, or a dangling link, is blocked', () => {
  const { root, repoRoot, home } = setup({ '.bashrc': 'export A=1', '.profile': 'x' });
  try {
    const other = path.join(root, 'other.bashrc');
    fs.writeFileSync(other, 'old repo');
    fs.symlinkSync(other, path.join(home, '.bashrc'), 'file');
    fs.symlinkSync(path.join(root, 'gone'), path.join(home, '.profile'), 'file');
    const [bashrc, profile] = status({ repoRoot, home });
    assert.strictEqual(bashrc.state, 'blocked');
    assert.match(bashrc.reason, /link to .*other\.bashrc/);
    assert.strictEqual(profile.state, 'blocked');
    assert.match(profile.reason, /link to .*gone/);
  } finally { teardown(root); }
});

test('a link in the parent path is blocked, even when the file resolves correctly', () => {
  const { root, repoRoot, home } = setup({ '.claude/hooks/guard.js': '// hook' });
  try {
    fs.mkdirSync(path.join(home, '.claude'));
    fs.symlinkSync(path.join(repoRoot, 'home', '.claude', 'hooks'), path.join(home, '.claude', 'hooks'), 'junction');
    const [r] = status({ repoRoot, home });
    assert.strictEqual(r.state, 'blocked');
    assert.match(r.reason, /link in the parent path/);
    assert.match(r.reason, /hooks/);
  } finally { teardown(root); }
});

test('a real file in the parent path is blocked', () => {
  const { root, repoRoot, home } = setup({ '.claude/settings.json': '{}' });
  try {
    fs.writeFileSync(path.join(home, '.claude'), 'not a directory');
    const [r] = status({ repoRoot, home });
    assert.strictEqual(r.state, 'blocked');
    assert.match(r.reason, /real file in the parent path/);
  } finally { teardown(root); }
});

test('a real directory at the live path is blocked', () => {
  const { root, repoRoot, home } = setup({ '.bashrc': 'x' });
  try {
    fs.mkdirSync(path.join(home, '.bashrc'));
    const [r] = status({ repoRoot, home });
    assert.strictEqual(r.state, 'blocked');
    assert.match(r.reason, /real directory/);
  } finally { teardown(root); }
});
