# 21w-mentor

An **author-first** mentor for your coding agent (Claude Code and
compatible) to help you start contributing to Bitcoin, Lightning, Nostr and
ecash open source. You write the code, the tests and the PRs; the agent
guides, asks and reviews. It never does the work for you.

## Installation

```bash
npx 21w-mentor init              # global: ~/.claude (all your projects)
npx 21w-mentor init --project    # this project only: ./.claude (travels with the repo)
```

Uninstall: `npx 21w-mentor uninstall`

After installing, open a **new session** of Claude Code.

## Commands

| Command                        | What it does                                                                      |
| ------------------------------ | --------------------------------------------------------------------------------- |
| `/21w:start`                   | Profile (5 questions) + project choice among 17 from the ecosystem                |
| `/21w:issues [project]`        | **Vetted** good-first-issues: detects in-flight PRs, claimed issues and quagmires |
| `/21w:plan [project] [#issue]` | 21-week plan (4 h/day), exportable to and importable into the 21weeks web app     |
| `/21w:week <n>`                | Weekly mentoring: guidance with commands that YOU run (`!`)                       |
| `/21w:review`                  | Review of your draft/diff with maintainer-level severity                          |

## What it installs

- **Skill** `21w-mentor`: the author-first rule, overlay composition
  (17 projects × 2 roles), and the `json21weeks@v1` plan format compatible
  with the web app.
- **Commands** `/21w:*` as explicit triggers for the workflow.

## The core rule

The agent never writes ready-to-paste diffs, tests, commit messages or
review replies. Nor does it set up your environment by running the commands
for you. It guides with open questions and concrete commands that you run.
If your project has its own `AGENTS.md` or AI policy (Bitcoin Core, Cashu,
Mostro and VLS do), the mentor respects it.

Part of the [21weeks](https://github.com/ifuensan/21weeks) project:
Librería de Satoshi / HackNodes Lab. MIT License.
