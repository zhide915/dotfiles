# dotfiles

One home for my personal configs.

## How it works

The `home/` directory is a mirror of your home directory. Each file in `home/`
is a managed file, and its live path is the same relative path under `~`. For
example, `home/.claude/settings.json` is the managed file for
`~/.claude/settings.json`.

The `link` script makes each live path a link to its managed file, so an edit
in either location is the same edit. The script links files only, and never a
directory.

A managed file is in one of the following states:

| State | Meaning |
|-------|---------|
| Linked | The live path is a link to the managed file. |
| Missing | Nothing exists at the live path. The `link` script can create the link. |
| Blocked | Something else is at the live path, or a link or a file is in its parent path. |

The `link` script only creates links. It never deletes or replaces a file, so
you must remove the item that blocks a managed file yourself.

## Set up a machine

To set up a machine, complete the prerequisites, and then run the `install`
script.

### Before you begin

Install the following prerequisites:

| Prerequisite | Required by |
|--------------|-------------|
| Git | The clone of this repository, and Git Bash, which runs the `~/.bashrc` file |
| Node.js | The scripts in the `bin/` directory and the hook in the `~/.claude/hooks/` directory |
| Go | The `install` script, to build `statusline` |
| fnm | The `~/.bashrc` file |
| herdr | The `~/.zhide915/herdr.toml` file |
| Claude Code | The managed files in the `~/.claude/` directory |

On Windows, also turn on Developer Mode or use an elevated shell, because
Windows requires one of the two to create a file link.

### Run the `install` script

To run the `install` script, do the following:

1. Clone this repository.
1. In the root directory of the repository, run the following command:

   ```sh
   node bin/install.js
   ```

1. If the script sets `HERDR_CONFIG_PATH`, restart herdr. To verify the path,
   run `herdr --help` and read the `Config:` line.

The script does the following:

1. Checks that each prerequisite is on your `PATH`.
1. Installs [`statusline`](https://github.com/zhide915/statusline) with
   `go install`.
1. Sets the `HERDR_CONFIG_PATH` user environment variable to
   `~/.zhide915/herdr.toml`.
1. Links each managed file.
1. Reports the state of each managed file.

Each step checks first and prints `ok` when nothing needs to change, so you can
run the script again at any time. The script exits with code 1 if a step
prints anything other than `ok` or `done`.

The script doesn't install Claude Code plugins. Install the plugins that you
need manually.

## Link the managed files

To create a link for each missing managed file, run the following command:

```sh
node bin/link.js
```

If a managed file is blocked, the output names the item that blocks it. To
unblock a managed file, do the following:

1. Compare the item at the live path with the managed file.
1. Copy the content that you want to keep into the managed file.
1. Remove the item at the live path.
1. Run the command again.

## Check the state of the managed files

To see the state of each managed file without changing anything, run the
following command:

```sh
node bin/status.js
```

The command exits with code 1 unless every managed file is linked.

## Add or remove a managed file

To add a managed file, do the following:

1. Move the file into `home/`, at the same path that it has under `~`.
1. Run `node bin/link.js`.

To remove a managed file, do the following:

1. Delete the link at the live path.
1. Delete the managed file from `home/`.

If you delete the managed file first, the link stays at the live path and
points to nothing.

## Run the tests

To test the `link` and `status` scripts against a scratch repository and a
scratch home directory, run the following commands:

```sh
node test/link.test.js
node test/status.test.js
```

The `install` script has no automated test, because it changes the machine. To
test the script, run it on a machine that is already set up. In a successful
test, every step prints `ok`.
