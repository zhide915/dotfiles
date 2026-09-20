# Roadmap

This file lists future work for this repository. `README.md` describes only
the present.

| Trigger | Build |
|---------|-------|
| You add your first Model Context Protocol (MCP) server. | **MCP servers**: a managed file for the server definitions, and a step in the `install` script that registers the servers. |
| An MCP server or a hook needs a credential. | **Secrets**: a `.env` file that Git ignores, and a step that loads the file. |
| You adopt a second agent harness. | **Second agent harness**: a link to `home/.claude/CLAUDE.md` at the path where that harness reads its instructions. |
| You set up a second machine, and it takes too long to install the prerequisites manually. | **Full bootstrap**: steps in the `install` script that install the prerequisites with `winget`. |
| You use a machine that doesn't run Windows. | **Second operating system**: replacements for `setx`, `where`, and the Windows-specific paths in the scripts. |
| You stop using this repository on a machine. | **`unlink` script**: a script that replaces each link with a copy of its managed file, so that the machine works without this repository. The script is not create-only, so amend that rule in `CLAUDE.md` first. |
| A dangling link causes a problem. | **`prune` script**: a script that finds each dangling link. |
