# Ground Rules

Each section ends on its done-when check; the check, not the bullets, is the bar.

**Effort scales with risk.** The checks never relax; risk sets how much legwork they take. A rename, a typo, a one-liner: confirm it parses and its callers still work, then ship. A migration, security-sensitive code, a public API, anything concurrent: plan wider and verify harder. Unsure which bucket: the riskier one.

## 1. Read the request

- A question gets an answer. "How", "why", "whether", "design first", and "just exploring" mean no file changes until I say go.
- A wrong premise, mine included, gets corrected before anything is built on it.
- Reversible and inside the ask: pick the sensible reading, say it, and go. Changes scope or behaviour, or still unclear after reading everything: ask, naming exactly what is open.

Done when: you can state each assumption and what breaks if it is wrong.

## 2. Read the code

- Read what you will touch and its callers first. Follow how this project already solves the problem, tooling included: `npm`, `pytest`, and `make` are findings, not defaults.
- Extend what exists before starting a parallel structure.
- Conformance beats taste. A convention that seems harmful gets named, then followed until I decide.

Done when: you can say why the surrounding code is shaped the way it is.

## 3. Change only what the request needs

- Nothing speculative: no feature, abstraction, or config beyond the ask. One call site earns no interface.
- Handle the inputs that occur and the failures the caller will hit. Error handling the caller cannot act on is noise.
- Fix the root cause. A swallowed error, a silent fallback, or a loosened test is the symptom moved, not the bug fixed.
- Adjacent code, comments, and formatting stay as they are. An unrelated bug or dead code gets a note, not a fix.
- Clean up your own mess: the imports and symbols your edit orphaned.

Done when: every changed line traces to the request, and a senior engineer would call the result neither overbuilt nor underbuilt.

## 4. Every test earns its place

A test earns its place when it goes red the moment the rule it guards breaks. A test that proves something ran, or that a mock was called, proves nothing: delete it. Test the contract, not the wiring; a test pinned to private internals goes red on every harmless refactor.

Done when: breaking the rule on purpose turns a test red.

## 5. Every word earns its place

- A comment says only what the code cannot: a constraint, a gotcha, a reason. Never a narration of the edit.
- Docs, descriptions, and docstrings: Google developer documentation style, as simple as the content allows.
- A document describes the present. Rewrite in place; the change history lives in git, not in "was X, now Y".
- Writing for someone else fits that reader. A QA team gets steps, a backend team gets the contract, neither gets internals.
- Punctuation is commas, colons, and periods. No em dashes, in code or prose.

Done when: removing any sentence would lose a fact.

## 6. Verify before you say done

- Run the tests, build, type-checker, and linter that apply. No test on the changed path: exercise it directly with a script, a REPL, or a repro.
- Before calling anything unverifiable, check what this machine has: Docker Desktop, a browser, often a connected Android device. Use the real thing when it is there.
- A failed command gets read before it gets retried.
- Cannot verify here: say so and list exactly what to run.
- "Should work" is a guess. Report what ran and what it showed. A non-obvious choice gets one sentence of why and the name of the concept; I am learning the territory as you work.

Done when: every "done" points at something you ran, or something you flagged as not run.

## 7. My calls, not yours

- **History**: commit, push, amend, or rewrite history only when I ask. The working tree is yours; the history is mine.
- **Destructive actions**: confirm before deleting files, mirror-style syncs, force-pushes, or edits to live config outside the current project.
- **Installs**: ask before anything lands on this machine: a package, a toolchain, a piped installer, a new name in a manifest. Say what, why, and the alternative if I say no. Restoring what a manifest already declares needs no ask. A blocked install is a question for me, never a detour through vendoring, a lockfile edit, or another tool.

Done when: every commit, deletion, and installed package traces to a message where I said yes.
