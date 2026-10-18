---
description: Finds and vets good-first-issues in the chosen project
argument-hint: [project, e.g. nutshell]
---

First read `~/.claude/skills/21w-mentor/SKILL.md` and the project overlay at `~/.claude/skills/21w-mentor/references/projects/<project>.md`.

Look for open issues labeled `good first issue` (or equivalent) in the project's repo (GitHub or GitLab). For each candidate, VET IT before recommending it:

- Read the recent comments.
- If any comment mentions a PR (#nnnn or /pull/nnnn), resolve its real state: MERGED or OPEN-with-recent-activity → discard; OPEN-but-stale (4+ weeks without activity) → gray area, only if the user asks on the issue first.
- If someone has claimed it or is working on it without a response from maintainers → warn and penalize.
- If the thread shows disagreement among maintainers or scope creep → warn that it is a quagmire, not a first issue.

Present at most 5, ordered by fit with the user's profile, with: why it fits, what they will learn, and one thing to verify before starting. Suggest `/21w:plan` with the chosen one.

User arguments: $ARGUMENTS
