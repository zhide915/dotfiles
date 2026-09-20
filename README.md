# dotfiles

One home for my personal configs.

The `home/` directory is the home tree: each file in it is a managed file,
linked to the same path under `~`. For example, `~/.claude/settings.json` is a
link to `home/.claude/settings.json`, so an edit in either place is the same
edit.

## Set up

1. Install Git, Node.js, Go, fnm, herdr, and Claude Code.
1. On Windows, turn on Developer Mode or use an elevated shell, so that the
   script can create links.
1. Clone this repository, and run the following command in its root directory:

   ```sh
   node bin/install.js
   ```

1. If the script sets `HERDR_CONFIG_PATH`, restart herdr.

The script changes only what needs to change, so you can run it again at any
time.

## Use

| Command | Result |
|---------|--------|
| `node bin/status.js` | Shows the state of each managed file, and changes nothing. |
| `node bin/link.js` | Creates a link for each missing managed file. |

A managed file is in one of the following states:

- **Linked**: the live path is a link to the managed file.
- **Missing**: nothing exists at the live path.
- **Blocked**: something else is at the live path, or in the path above it.

The scripts never delete or replace a file. To unblock a managed file, copy
the content that you want to keep into the managed file, remove the item at
the live path, and then run `node bin/link.js`.

To add a managed file, move the file into `home/`, at the same path that it
has under `~`, and then run `node bin/link.js`.

To remove a managed file, delete the link at the live path first, and then
delete the managed file. In the other order, the link stays and points to
nothing.

## Test

```sh
node test/link.test.js
node test/status.test.js
```

The `install` script has no automated test, because it changes the machine.
To test it, run it on a machine that is already set up. Every step prints
`ok`.
