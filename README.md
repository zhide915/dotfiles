# dotfiles

One home for my personal configs.

## How it works

`manifest.json` maps each agent's repo folder to its live config folder. Three
scripts move config along that map:

```
               link.js    ->
  dotfiles/    apply.js   ->   ~/.claude   (Claude Code)
              <-  capture.js
```

- `link.js`    symlinks live config to the repo (zero-drift: live edits ARE repo edits)
- `apply.js`   copies the repo into live config (a snapshot)
- `capture.js` pulls live config back into the repo (after `apply.js`), ready to commit

`link.js` needs Windows Developer Mode (or an elevated shell); it checks and
tells you.

## What it manages

| Path | Holds |
|------|-------|
| `instructions.md` | Global instructions, shared across agents |
| `claude/settings.json` | Claude Code settings |
| `claude/agents/` | Subagents |
| `claude/skills/` | Personal skills only — zee-kit skills come via the plugin, never here |
| `claude/hooks/` | Hooks (WSL routing) |

Paths are 1:1 — `claude/agents/foo.md` lives at `~/.claude/agents/foo.md`. The
shared `instructions.md` is the exception: it deploys as `~/.claude/CLAUDE.md`.

## Usage

```sh
node bin/link.js                 # repo -> ~/.claude as symlinks (zero-drift)
node bin/apply.js                # repo -> ~/.claude as copies instead
node bin/capture.js              # ~/.claude -> repo (after apply.js), then commit
# every script takes --dry-run to preview without writing
```

## Another agent

Add a top-level folder (e.g. `codex/`) and a `manifest.json` entry pointing it
at that agent's config folder. To share the global instructions, give it an
`"instructions": { "from": "instructions.md", "to": "<that agent's filename>" }`
field (e.g. `AGENTS.md`).
