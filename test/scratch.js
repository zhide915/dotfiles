'use strict';

const fs = require('fs');
const path = require('path');
const os = require('os');

function setup(files) {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'dotfiles-test-'));
  const repoRoot = path.join(root, 'repo');
  const home = path.join(root, 'user');
  fs.mkdirSync(home, { recursive: true });
  for (const [file, content] of Object.entries(files)) {
    const managed = path.join(repoRoot, 'home', file);
    fs.mkdirSync(path.dirname(managed), { recursive: true });
    fs.writeFileSync(managed, content);
  }
  return { root, repoRoot, home };
}

function teardown(root) {
  fs.rmSync(root, { recursive: true, force: true });
}

module.exports = { setup, teardown };
