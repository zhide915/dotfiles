# CLAUDE.md

Guidance for agents working in this repo. `README.md` holds the procedures
and `CONTEXT.md` defines the terms used here. This file covers what bites:
hazards you can't see from any single file.

## Every managed file is live and public

Each live path on this machine is a link to its managed file under `home/`.

- **Live**: a managed file is the running config itself, so an edit under
  `home/` takes effect as it is saved, including in the session making the
  edit.
- **Public**: tools write to their managed files through the links, and a push
  publishes what they wrote.
- `home/.claude/CLAUDE.md` is the user's **global** instructions for every
  project on this machine, so keep it agent-agnostic: promote guidance into it
  only after the same correction recurs across projects, and cut bullets that
  stop earning their keep. This file, at the repo root, is outside `home/` and
  applies only inside this repo.
- Moving, renaming, or deleting a managed file leaves a broken link at its old
  live path. Delete the live link first.

Test: before saving a file here, you can say whether it is a managed file and
which tool reads it. Before a commit, you have read every hunk of the `home/`
diff.

## The scripts only create

`bin/link.js` creates a link where a managed file is missing, plus real parent
directories, and `bin/install.js` sets a variable only when it is not set. A
blocked file is reported and left for the user to clear, because a real file
at a live path can be the only copy of its content. Keep that invariant in
every change.

- Link leaf files only. A linked directory hands every file a tool writes
  there to this repo: a linked `~/.claude` would publish sessions and
  credentials.
- `bin/install.js` changes the machine outside this repo (`go install`,
  `setx`) and has no automated test. Run it only when the user asks.

Test: after a change to `bin/`, every `fs` write call there is a `mkdirSync`
or a `symlinkSync`, every file in `test/` passes, and `node bin/status.js`
reports every managed file as linked.

## Conventions

- Skill scripts are Node.js on the stdlib only, with no `package.json`.
- Name things with the `CONTEXT.md` terms in code, output, and docs.
- `README.md` describes only the present. Future work goes in `ROADMAP.md` as
  a row with a trigger, built when the trigger fires, not before.

Test: your change names every `CONTEXT.md` concept by its term, and by no word
from that term's _Avoid_ list.
