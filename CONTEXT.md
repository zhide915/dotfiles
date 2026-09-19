# dotfiles

The personal configuration files of one machine, kept in one repository and
linked into the locations where each tool reads them.

## Language

**Home tree**:
The `home/` directory, whose structure is a mirror of the user's home directory.
_Avoid_: Manifest, mirror directory

**Managed file**:
A file in the home tree: the one real copy of a configuration file's content.
_Avoid_: Entry, source

**Live path**:
The path where a tool reads a managed file: the managed file's path with the
home tree replaced by the user's home directory.
_Avoid_: Target, destination

**Prerequisite**:
A tool that a managed file needs and that the user installs by hand.
_Avoid_: Dependency

## States of a managed file

Every managed file is in exactly one state.

**Linked**:
The live path is a link that resolves to the managed file.
_Avoid_: Synced, deployed

**Missing**:
Nothing exists at the live path.
_Avoid_: Unlinked

**Blocked**:
Something other than the correct link is at the live path, or something other
than a real directory is above it.
_Avoid_: Conflict
