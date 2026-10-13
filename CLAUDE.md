# CLAUDE.md

- `README.md`: read it before you add, remove, or unblock a managed file, or run the tests.
- `CONTEXT.md`: the terms. In code, output, and docs, use each term, and no word from its _Avoid_ list.

## Conventions

- Write scripts and hooks in Node.js with the standard library only. The repository has no `package.json`.
- Keep Markdown unwrapped: each paragraph or list item is one line, and the editor soft-wraps it.
- `README.md` describes only the present. Put future work in `ROADMAP.md` as a row with a trigger, and build it when the trigger fires.

## Editing the home tree: live and public

Each live path on this computer is a link to its managed file in the home tree.

- **Live**: A managed file is the running configuration. An edit takes effect when you save it, also in the session that makes the edit.
- **Public**: Tools write to their managed files through the links, and a push publishes what they wrote.
- To move, rename, or delete a managed file, delete its link first. Else, a dangling link stays at the old live path.

Done when: before you save a file, you can say if it is a managed file and which tool reads it. Before a commit, you read each hunk of `git diff -- home/`.

## Editing `home/.claude/CLAUDE.md`: global

This file holds the **global** instructions of the user, for each project on this computer.

- Keep it agent-agnostic.
- Add a rule only after the same correction occurs in two or more projects.
- Remove each rule that no longer changes behaviour.

## Changing `bin/`: create-only

The scripts are **create-only**: they create what is missing, and report the rest. A blocked managed file stays for the user to unblock, because a real file at a live path can be the only copy of its content.

- Link leaf files only. A linked folder gives this repository each file that a tool writes there. For example, a linked `~/.claude` publishes sessions and credentials.
- `bin/install.js` changes the computer outside this repository, with `go install` and `setx`, and has no automated test. Run it only when the user asks.

Done when: each `fs` write call in `bin/` is a `mkdirSync` or a `symlinkSync`, each `test/*.test.js` passes, and `node bin/status.js` reports each managed file as linked.
