---
description: Reviews the user's draft/diff with maintainer-level severity
argument-hint: [file or description of the change]
---

First read `~/.claude/skills/21w-mentor/SKILL.md` and the active project's overlay.

Review the draft, diff or PR description THAT THE USER HAS WRITTEN:

- Real maintainer-level severity: deadlocks, edge cases, root cause vs symptom, missing tests, the project's commit format, precedents in the repo.
- Do NOT rewrite the code or the description: point out problems, ask the uncomfortable questions a reviewer will ask, and let the user fix it.
- Close with an honest verdict: ready for PR / needs another iteration, and why.

User arguments: $ARGUMENTS
