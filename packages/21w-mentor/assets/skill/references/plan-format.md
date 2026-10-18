# Plan format: `json21weeks@v1`

The 21-week plan is a Markdown file readable by humans AND agents, with a
JSON state block at the end. It is the exchange format with the 21weeks web
app («Import plan» button): follow it exactly so that plans generated here
can be imported there.

## Structure

```markdown
# 21 Weeks to Bitcoin OSS: <Project name>

> 21-week plan (author-first mentoring): the person writes the code,
> the tests and the PRs; the agent guides, asks and reviews.

- Project: **<name>**
- Profile: <role> · <level> · <languages> · <hours> h/week
- Interests: <tracks>
- Anchor issue: [#<n> <title>](<url>)        (optional)
- Generated: <YYYY-MM-DD>
- Progress at export: <n>/21 weeks

## Introduction

<2-3 sentences>

## The 21 weeks

### [ ] Week 1: <phase>. <title>

**Objectives**
- <2-4 objectives, ≤14 words each>

**Tasks**
- [ ] <3-5 concrete actions that THE USER does>

**Resources**
- [<short, specific label>](<real, verified url>)

**Deliverable**: <tangible outcome of the week>

(...weeks 2-21 the same; mark completed ones `[x]`)

## Graduation: week 21

<3-4 sentences: what "being a contributor" means in that project>

---
The following block holds the full state to reimport this plan into
21weeks. Do not edit by hand.

​```json21weeks
{ ...state... }
​```
```

## `json21weeks` state block (v1)

```json
{
  "v": "json21weeks@v1",
  "profile": { "role": "developer", "level": "beginner", "languages": ["es"], "tracks": ["..."], "hoursPerWeek": 10 },
  "projectId": "bitcoin-core",
  "projectName": "Bitcoin Core",
  "issue": null,
  "plan": {
    "projectId": "bitcoin-core",
    "projectName": "Bitcoin Core",
    "generatedAt": "<ISO 8601>",
    "intro": "...",
    "graduation": "...",
    "weeks": [
      {
        "week": 1,
        "phase": "Setup",
        "title": "...",
        "objectives": ["..."],
        "tasks": ["..."],
        "resources": [{ "label": "...", "url": "https://..." }],
        "outcome": "..."
      }
    ]
  },
  "doneWeeks": [],
  "exportedAt": "<ISO 8601>"
}
```

Rules:

- `weeks` has exactly 21 entries, in order.
- Every URL in `resources` must be real and verified (official
  repo, docs, specs). Never invent URLs.
- `issue` is `null` or `{ "id": "github:owner/repo:N", "number": N, "title":
  "...", "url": "...", "labels": [...], "comments": 0, "body": "..." }`.
- Versioning: this document is `json21weeks@v1`. Any structural change is a
  protocol change; do not edit existing fields.
