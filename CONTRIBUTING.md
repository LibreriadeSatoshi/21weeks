# Contributing to 21 Weeks

Thanks for contributing. This project adopts the **Developer Certificate of Origin 1.1**
(see the [`DCO`](./DCO) file) and an explicit policy on AI use.

## DCO: every commit carries `Signed-off-by`

Every commit must include the sign-off of **a human person**:

```
Signed-off-by: First Last <you@email>
```

`git commit -s` adds it automatically. With it you certify that:

- you have the right to contribute that code under the project's license, and
- **you have reviewed and understood what you contribute**, whoever wrote it
  (you, a teammate or an AI agent).

The `Signed-off-by` is the piece that carries real weight in this system. A commit
without a valid human sign-off is not merged (CI checks it).

## AI policy

Using AI agents is allowed and common in this project (in fact, much of it
was born that way). The rules:

1. **AI never adds `Signed-off-by`.** Only the human who answers for the
   commit adds it. If an agent generated the code, whoever commits it reviews it,
   understands it and signs it.
2. **AI use is declared with an `Assisted-by` trailer:**

   ```
   Assisted-by: AGENT:MODEL [tools]
   ```

   Examples: `Assisted-by: Kimi:K3`, `Assisted-by: Claude:claude-opus-4-5 [claude-code]`.

3. **No `Co-authored-by` for an AI.** An AI is not an author: it cannot
   certify the DCO or be legally responsible for the contribution. Authorship
   and sign-off are always human.

`Assisted-by` is a voluntary, unverifiable declaration; its value is
transparency, not compliance. What is required and checked is the human
`Signed-off-by`.

### Recommended commit format

```bash
git commit -s --trailer "Assisted-by: Kimi:K3"
```

produces:

```
fix: validate addr length

Assisted-by: Kimi:K3
Signed-off-by: Iván Fuentes <ivan@example.com>
```

### Configure your agent

If you use a coding agent (Claude Code, Kimi Code, Cursor…), configure it so that it:

- **never** adds `Signed-off-by` or `Co-authored-by`,
- **does** add the matching `Assisted-by` trailer,
- has automatic attribution turned off (in Claude Code,
  `includeCoAuthoredBy: false` in settings; confirm the exact name in the
  documentation for your version).

This repo includes an [`AGENTS.md`](./AGENTS.md) with these instructions, which
most agents read automatically.

### Local hook (optional but recommended)

```bash
git config core.hooksPath .githooks
```

The `commit-msg` hook rejects commits without `Signed-off-by` and sign-offs from
AI or bot identities.

## Merging: watch out for squash

**Squash merge is the usual trap**: GitHub generates a new message and the
trailers (`Signed-off-by`, `Assisted-by`) can get lost or duplicated.
We prefer **rebase merge** or **merge commit**. If a squash is ever done,
whoever merges must copy the trailers into the final message.

## Cryptographic signing (optional but advisable)

```bash
git config commit.gpgsign true
git config gpg.format ssh
git config user.signingkey ~/.ssh/id_ed25519.pub
```

and turn on "Require signed commits" in the `main` branch protection on GitHub.
