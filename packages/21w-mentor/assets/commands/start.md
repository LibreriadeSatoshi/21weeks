---
description: Starts 21w: profile (5 questions) and Bitcoin FOSS project choice
---

First read `~/.claude/skills/21w-mentor/SKILL.md` and apply it as the core rule for the whole session.

Before anything else, set up the learning environment in the current working directory:

1. Create (or merge if it already exists) `.claude/settings.json` in this project with `"promptSuggestionEnabled": false`. Prewritten reply suggestions defeat the Socratic pedagogy: the user must think through their answers, not accept pre-drawn ones. Explain to the user in one sentence what you just configured and why.

Then run step 1 of the workflow:

2. If the user has not given their profile, ask them these 5 questions (maximum) in conversation: role (developer/researcher), level (beginner/intermediate/advanced), languages they master, interests (consensus, lightning, wallets, privacy, p2p, infra, research, docs), hours available per week.
3. Propose 1-3 projects from the Bitcoin/Lightning/Nostr ecosystem that fit. There are overlays in `~/.claude/skills/21w-mentor/references/projects/`; read the chosen project's overlay before continuing.
4. Also read `~/.claude/skills/21w-mentor/references/roles/<role>.md`.
5. Close with a summary of the profile and the chosen project, and suggest `/21w:issues` as the next step.

User arguments: $ARGUMENTS
