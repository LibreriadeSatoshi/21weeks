# AGENTS.md: instructions for AI agents in this repo

This repo adopts the DCO 1.1 (see `DCO` and `CONTRIBUTING.md`). If you are an
AI agent working here, these rules are **mandatory**:

## When committing

1. **NEVER add `Signed-off-by`.** Only the human who answers for the
   commit adds it (with `git commit -s`). You cannot certify the DCO.
2. **NEVER add `Co-authored-by` with an AI identity.** An AI is not the
   author of anything in this repo.
3. **DO add an `Assisted-by` trailer** declaring yourself:

   ```
   Assisted-by: AGENT:MODEL [tools]
   ```

   Examples: `Assisted-by: Kimi:K3`, `Assisted-by: Claude:claude-opus-4-5 [claude-code]`.

4. The human runs the correct command:

   ```bash
   git commit -s --trailer "Assisted-by: AGENT:MODEL"
   ```

5. If your tool has automatic co-author attribution, it must be
   turned off (e.g. `includeCoAuthoredBy: false` in Claude Code).

## When writing code

- The human reviews and understands every change before signing it: explain
  what your diff does and why, so they can certify it in good faith.
- Follow the project style (Prettier, ESLint) and do not add dependencies
  without justifying them.

## Design system (ISMOS)

Any UI, styling, layout, copy or icon work follows the ISMOS design
system.

- Read `.claude/skills/ismos-ui/SKILL.md` before touching UI. It is the working
  summary; the full guide is in `design/ismos/docs/` (01–10) and wins in
  case of conflict.
- Use the tokens and the `ism-*` classes (already imported in `src/index.css`).
  Never hex, px spacing, radii or shadows outside the tokens.
- Do not edit the generated files in `design/ismos/css/` (except
  `components.css`), `tailwind/` or `js/`: change `design/ismos/tokens.json` and
  run `npm run ismos:tokens`.
- Before finishing, `npm run ismos:check` must pass. Check light mode and
  `data-theme="hacker"`, at 360 px and on desktop.
