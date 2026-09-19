#!/usr/bin/env node
/**
 * Refuses outright instead of prompting, because a prompt does not survive
 * where it matters: bypassPermissions skips permission rules entirely, and a
 * denial still holds there.
 *
 * Matching is textual. This catches an install nobody meant to authorise, not
 * one somebody is concealing.
 */
"use strict";

const fs = require("fs");

// A trailing comment, so that bash and PowerShell both ignore it. Unanchored,
// because a quote follows it in `bash -c "npm add x # INSTALL_OK"`.
const MARKER = "# INSTALL_OK";
const MARKER_RE = /#\s*INSTALL_OK\b/;

// Reinstalling what a manifest already pins introduces no name the repo had
// not already committed to, so it needs no approval. Set false to demand it
// anyway, at the cost of a prompt on every fresh clone.
const ALLOW_LOCKFILE_RESTORE = true;

// The install has to be the command being run, not text sitting inside one.
// Otherwise `grep -r "pip install"` counts as an install.
const CMD_POS = String.raw`(?:^|[\n;&|(){}]|-c\s+["'])\s*` +
  String.raw`(?:(?:sudo|env|time|command)\s+|[A-Za-z_]\w*=\S*\s+)*`;

// Where adding and restoring share a subcommand, a bare argument is the
// package name: it separates `install lodash` from `install`. Flags are
// stepped over, so `install --save-dev vitest` still qualifies. An `-r` or
// `--requirement` means pip is restoring, and the filename after it is not a
// name being added.
const NAMED_ARG =
  String.raw`(?![^;&|\n]*(?:\s-r\b|\s--requirement\b))[^;&|\n]*\s(?!-)[^\s;&|#]`;

const RULES = [
  [String.raw`(?:npm|pnpm|yarn|bun)\s+(?:add|link)\b`, "adds a Node package"],
  [String.raw`(?:npm|pnpm|bun)\s+(?:i|install)\b[^;&|\n]*\s-{1,2}g(?:lobal)?\b`, "installs a Node package globally"],
  [String.raw`yarn\s+global\s+add\b`, "installs a Node package globally"],
  [String.raw`(?:npm|pnpm|bun)\s+(?:i|install)\b` + NAMED_ARG, "adds a Node package"],

  [String.raw`(?:pip|pip3)\s+install\b` + NAMED_ARG, "installs a Python package"],
  [String.raw`uv\s+(?:add|tool\s+install)\b`, "adds a Python dependency or tool"],
  [String.raw`uv\s+pip\s+install\b` + NAMED_ARG, "installs a Python package"],
  [String.raw`(?:poetry|pipenv)\s+add\b`, "adds a Python dependency"],
  [String.raw`pipenv\s+install\b` + NAMED_ARG, "adds a Python dependency"],
  [String.raw`pipx\s+install\b`, "installs a Python application"],

  [String.raw`cargo\s+(?:install|add)\b`, "installs a Rust crate"],
  [String.raw`go\s+(?:install|get)\b`, "installs a Go module"],
  [String.raw`gem\s+install\b`, "installs a Ruby gem"],
  [String.raw`dotnet\s+(?:add\s+package|tool\s+install)\b`, "adds a .NET package or tool"],

  [String.raw`(?:winget|choco|scoop|brew|apt|apt-get|dnf|yum|pacman|snap|flatpak)\s+(?:install|add|-S)\b`, "installs a system package"],
  [String.raw`Install-(?:Module|Package|Script)\b`, "installs a PowerShell module or package"],

  [String.raw`claude\s+(?:plugin\s+install|mcp\s+add)\b`, "changes Claude Code's installed plugins or MCP servers"],

  [String.raw`(?:curl|wget|iwr|Invoke-WebRequest)\b[^;&\n]*\|\s*(?:sudo\s+)?(?:ba|z|d)?sh\b`, "pipes a remote script into a shell"],
  [String.raw`curl\b[^;&\n]*\|\s*(?:sudo\s+)?(?:python3?|node|perl|ruby)\b`, "pipes a remote script into an interpreter"],
];

const RESTORE_RULES = [
  [String.raw`(?:npm\s+ci|(?:npm|pnpm|yarn|bun)\s+install)\s*(?:$|[;&|#\n])`, "restores declared Node dependencies"],
  [String.raw`(?:pip|pip3|uv\s+pip)\s+install\s+(?:-r|--requirement)\b`, "restores declared Python dependencies"],
  [String.raw`(?:uv\s+sync|poetry\s+install|bundle\s+install|dotnet\s+restore|cargo\s+fetch|go\s+mod\s+download)\b`, "restores declared dependencies"],
];

function compile(rules) {
  return rules.map(([body, label]) => [new RegExp(CMD_POS + body, "i"), label]);
}

const COMPILED = compile(RULES);
const COMPILED_RESTORE = compile(RESTORE_RULES);

const LOG_FILE = process.env.INSTALL_GUARD_LOG || "";

function log(msg) {
  if (!LOG_FILE) return;
  try {
    fs.appendFileSync(LOG_FILE, `[${new Date().toISOString()}] ${msg}\n`);
  } catch (_) { /* a failed write must not take the hook down with it */ }
}

function deny(reason) {
  process.stdout.write(
    JSON.stringify({
      hookSpecificOutput: {
        hookEventName: "PreToolUse",
        permissionDecision: "deny",
        permissionDecisionReason: reason,
      },
    })
  );
  process.exit(0);
}

function match(rules, cmd) {
  for (const [re, label] of rules) if (re.test(cmd)) return label;
  return null;
}

let raw = "";
process.stdin.setEncoding("utf8");
process.stdin.on("data", (d) => (raw += d));
process.stdin.on("end", () => {
  let data;
  try {
    data = JSON.parse(raw);
  } catch (_) {
    process.exit(0); // a bad payload must not wedge the session
  }

  const tool = String(data.tool_name || "");
  const toolInput = data.tool_input || {};
  const cmd = String(toolInput.command || "");
  if (!cmd) process.exit(0);

  if (MARKER_RE.test(cmd)) {
    log(`approved via marker: ${cmd}`);
    process.exit(0);
  }

  let label = match(COMPILED, cmd);
  if (!label && !ALLOW_LOCKFILE_RESTORE) label = match(COMPILED_RESTORE, cmd);
  if (!label) {
    log(`no-op (${tool}): ${cmd}`);
    process.exit(0);
  }

  log(`DENY (${tool}, ${label}): ${cmd}`);
  deny(
    `Blocked: this command ${label}. It needs the user's explicit yes to this install, given in this conversation.\n` +
    `Without that yes: ask the user what you want to install, why, and what you will do instead if they decline. Then end your turn.\n` +
    `With that yes: run the exact same command again with '${MARKER}' at the end, for example "npm add left-pad ${MARKER}". The marker is your record of their yes.\n` +
    `The yes covers the package, not the command: any other way to get the same package needs the same yes.`
  );
});
