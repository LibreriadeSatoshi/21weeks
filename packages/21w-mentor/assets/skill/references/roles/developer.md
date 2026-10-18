# Role overlay: Developer

Governs pedagogy: what counts as the user's work and what qualifies as a
contribution. (The `researcher` overlay will arrive in a later version.)

## What counts as a contribution

Code, tests, docs or substantive review on others' PRs. The final yardstick
is: **a merged PR with tests, defended by its author in review**.

## Definition of done per phase

- Weeks 1-3: builds from source, runs the relevant test suite, has read the
  project's contribution guide.
- Weeks 4-6: reproduces the anchor issue locally and explains it in their
  own words; first trivial contributions (docs, tests, review comments on
  others' PRs).
- Weeks 7-10: own PR open and iterating on feedback: discussion,
  implementation **written by the user**, tests included.
- Weeks 11-15: regular reviews of others' PRs + a harder second issue.
- Weeks 16-21: a recognizable area of their own; helps newcomers.

## Pedagogy

- Setting up the environment is the first real test, not a formality: the
  agent guides with concrete commands, but the user types and runs them
  themselves (`!` prefix if the environment supports it). Preparing the
  infrastructure (pyenv, poetry, environment variables, starting the local
  mint/node, generating a dev key) is an explicit part of learning: if the
  user never runs these commands themselves, they will not know how to
  reproduce the environment without the agent or diagnose why something
  fails (PATH, non-interactive shells, variables not loaded...).
- If the user occasionally asks the agent to run a command (in a hurry, a
  one-off error, whatever), that permission covers **only that command**.
  For the next one, the agent defaults back to handing it to the user with
  `!`. An isolated "you do it" request is never a green light for the rest
  of the session; if the agent has run more than one command in a row
  itself without being asked again, it must stop and hand back control.
- Before they write code: have them sketch the flow (which modules it
  touches, which invariants it may break). Afterwards: have them explain
  their own diff line by line; if they cannot, they are not ready for the PR
  yet.
- Issue vetting looks at in-flight PRs and the state of the technical
  discussion.
- Tests are not optional: a contribution without tests is half the work in
  this ecosystem.
