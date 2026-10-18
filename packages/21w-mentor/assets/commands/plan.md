---
description: Generates the 21-week plan (json21weeks@v1 format)
argument-hint: [project] [optional #issue]
---

First read `~/.claude/skills/21w-mentor/SKILL.md`, the project overlay (`references/projects/<project>.md`), the role overlay (`references/roles/<role>.md`) and, MANDATORILY, `references/plan-format.md`.

Generate the 21-week plan following the `json21weeks@v1` format EXACTLY (the ```json21weeks block lets it be reimported into the 21weeks web app):

- Phases: weeks 1-3 environment/build/culture (the user runs the commands, you guide); 4-6 immersion in the anchor issue's area; 7-10 first real end-to-end contribution written by the user; 11-15 broaden (reviewing others' PRs, second issue); 16-21 own area and graduation.
- Respect the profile's hours/week. Tasks: concrete actions that THE USER does.
- Resources: only real, verified URLs (repo, CONTRIBUTING, official docs, BIPs/BOLTs/NIPs/NUTs specs). Never invent URLs.
- Save the result as `21weeks-plan.md` in the working directory.

User arguments: $ARGUMENTS
