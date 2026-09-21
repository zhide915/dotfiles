# Context

This file defines the terms of this repository. Each definition uses only the terms above it.

## Language

**Home tree**:
The `home/` directory: a mirror of `~`.
_Avoid_: Home directory (`~`)

**Managed file**:
A file in the home tree: a tool's configuration.
_Avoid_: Source

**Live path**:
The managed file's path, mirrored under `~`: where its tool reads it.
_Avoid_: Target, destination

**Link**:
A symbolic link. The correct link runs from a live path to its managed file.
_Avoid_: Symlink

**Dangling link**:
A link that resolves to nothing.
_Avoid_: Broken link

**Prerequisite**:
A tool that this repository needs, installed by hand.
_Avoid_: Dependency

## States

A state describes a managed file. Missing and blocked also describe anything else that the scripts check, such as a prerequisite.

**Linked**:
The correct link is at the live path.
_Avoid_: Synced, deployed

**Missing**:
Nothing is at the live path.
_Avoid_: Unlinked

**Blocked**:
Something else is at the live path, or above it.
_Avoid_: Conflict
