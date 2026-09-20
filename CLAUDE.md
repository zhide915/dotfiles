# CLAUDE.md

- `README.md`: read before adding, removing, or unblocking a managed file, or
  running the tests.
- `CONTEXT.md`: the terms. In code, output, and docs, name every concept by
  its term, and by no word from that term's _Avoid_ list.

## Editing under `home/`: live and public

Each live path on this machine is a link to its managed file under `home/`.

- **Live**: a managed file is the running config itself, so an edit takes
  effect as it is saved, including in the session making the edit.
- **Public**: tools write to their managed files through the links, and a push
  publishes what they wrote.
- To move, rename, or delete a managed file, delete its link first. In
  the other order, a dangling link stays at the old live path.

Done when: before saving a file, you can say whether it is a managed file and
which tool reads it. Before a commit, you have read every hunk of the `home/`
diff.

## Editing `home/.claude/CLAUDE.md`: global

It is the user's **global** instructions for every project on this machine.
Keep it agent-agnostic: promote guidance into it only after the same
correction recurs across projects, and cut bullets that stop earning their
keep.

## Changing `bin/`: create-only

The scripts are **create-only**: they create what is missing and report the
rest. A blocked file is left for the user to unblock, because a real file at a
live path can be the only copy of its content. Keep every change create-only.

- Link leaf files only. A linked directory hands every file a tool writes
  there to this repo: a linked `~/.claude` would publish sessions and
  credentials.
- `bin/install.js` changes the machine outside this repo (`go install`,
  `setx`) and has no automated test. Run it only when the user asks.

Done when: every `fs` write call in `bin/` is a `mkdirSync` or a
`symlinkSync`, every file in `test/` passes, and `node bin/status.js` reports
every managed file as linked.

## Conventions

- Scripts and hooks are Node.js on the stdlib only, with no `package.json`.
- `README.md` describes only the present. Future work goes in `ROADMAP.md` as
  a row with a trigger, built when the trigger fires, not before.
