# Roadmap

This file lists future work for this repository. `README.md` describes only
the present. Build each item when its trigger occurs, not before.

The following table lists the planned work:

| Planned work | What it involves | Trigger |
|--------------|------------------|---------|
| Model Context Protocol (MCP) servers | A managed file for the server definitions, and a step in the `install` script that registers the servers | You add your first MCP server. |
| Secrets | A `.env` file that Git ignores, and a step that loads the file | An MCP server or a hook needs a credential. |
| Second agent harness | A link to `home/.claude/CLAUDE.md` at the path where that harness reads its instructions | You adopt a second agent harness. |
| Full bootstrap | Steps in the `install` script that install the prerequisites with `winget` | You set up a second machine, and it takes too long to install the prerequisites manually. |
| Second operating system | Replacements for `setx`, `where`, and the Windows-specific paths in the scripts | You use a machine that doesn't run Windows. |
| `unlink` script | A script that replaces each link with a copy of its managed file, so that the machine works without this repository | You stop using this repository on a machine. |
| `prune` script | A script that finds each link at a live path that points to nothing | A link that points to nothing causes a problem. |
