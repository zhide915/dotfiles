# CLAUDE.md

Guidance for agents working in this repo. `README.md` explains usage; this file
covers what bites: the hazards and conventions you can't see from any single
file.

## This repo is the live ~/.claude config

`bin/link.js` deploys by symlinking entries under `~/.claude` into this repo,
and that is the usual state of this machine. While linked:

- Editing `claude/settings.json`, `claude/hooks/`, or `instructions.md` changes
  the running Claude Code environment immediately — including the session making
  the edit.
- `instructions.md` deploys as `~/.claude/CLAUDE.md`: the user's **global**
  instructions for every project on this machine, not repo-local config. Edit
  with that blast radius in mind.
- The skills entry is a single directory symlink, so everything inside it is
  live whatever it's called — renaming a skill folder in place does not disable
  it. To test without a skill, move its folder out of `claude/skills/` entirely.
- This file is not in the manifest and never deploys; it applies only when
  working inside this repo.

Test: before touching any file here, you can say whether the edit lands in the
live environment.

## How sync works — and bites

- `manifest.json` is the single source of truth for what syncs where. A new
  config path does nothing until it has a manifest entry — and the scripts
  silently print `skip:` for source paths that don't exist, so a typo'd entry
  fails quietly. Read the script output.
- `apply.js` and `capture.js` mirror directories (a recursive copy that deletes
  extras): files absent on the source side get **deleted** at the destination.
  `apply.js` can delete live config; `capture.js` can delete repo files. Never
  run either with unsynced changes on the losing side.
- The directions are opposites: `link.js`/`apply.js` push repo → live;
  `capture.js` pulls live → repo. Know which way data flows before running
  anything.
- There are no tests. All three scripts take `--dry-run`; verify script changes
  by reading the planned operations it prints before running for real.

Test: you've seen the `--dry-run` output of a script run before its real one.

## Conventions

- Scripts are Node.js CommonJS (`#!/usr/bin/env node`, `require`, `'use
  strict'`), run with `node bin/<name>.js`. They lean on the stdlib only
  (`fs`/`path`/`os`) — no dependencies, no `package.json`; keep it that way.
  On Windows, `link.js` links directories as junctions and files as symlinks;
  file symlinks need Developer Mode or an elevated shell, and it surfaces an
  `EPERM` hint when it lacks the rights.
- Document placement: `README.md` describes only the present. Future work goes
  in `ROADMAP.md` as a row with a trigger, built when the trigger fires, not
  before. This file holds repo-local hazards only.
- `instructions.md` is agent-agnostic and follows its own rules: promote
  guidance into it only after the same correction recurs across projects, and
  cut bullets that stop earning their keep.
