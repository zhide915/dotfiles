#!/usr/bin/env node
/**
 * The Bash tool's shell snapshot keeps fnm's multishell folder on PATH but not
 * FNM_MULTISHELL_PATH, which comes from the terminal that started Claude Code
 * instead. fnm's `cd` hook then warns that the Node path is not on PATH.
 *
 * Adds a line to CLAUDE_ENV_FILE, which runs before each Bash command, to point
 * FNM_MULTISHELL_PATH at the folder on PATH.
 */
"use strict";

const fs = require("fs");

const LINE =
  `__fnm_ms=$(printf '%s' "$PATH" | tr ':' '\\n' | grep -m1 fnm_multishells); ` +
  `[ -n "$__fnm_ms" ] && export FNM_MULTISHELL_PATH="$(cygpath -w "$__fnm_ms")"; ` +
  `unset __fnm_ms`;

const file = process.env.CLAUDE_ENV_FILE;
if (file) {
  // SessionStart also fires on resume, clear and compact.
  const current = fs.existsSync(file) ? fs.readFileSync(file, "utf8") : "";
  if (!current.includes(LINE)) fs.appendFileSync(file, LINE + "\n");
}
