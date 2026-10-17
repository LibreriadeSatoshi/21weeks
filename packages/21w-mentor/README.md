# 21w-mentor

Mentor **autor-primero** para entrar a contribuir a open source de Bitcoin,
Lightning, Nostr y ecash para tu agente de código (Claude Code y
compatibles). Tú escribes el código, los tests y los PRs; el agente guía,
pregunta y revisa. Nunca hace el trabajo por ti.

## Instalación

```bash
npx 21w-mentor init              # global: ~/.claude (todos tus proyectos)
npx 21w-mentor init --project    # solo este proyecto: ./.claude (viaja con el repo)
```

Desinstalar: `npx 21w-mentor uninstall`

Tras instalar, abre una **sesión nueva** de Claude Code.

## Comandos

| Comando | Qué hace |
|---|---|
| `/21w:start` | Perfil (5 preguntas) + elección de proyecto entre 17 del ecosistema |
| `/21w:issues [proyecto]` | Good-first-issues **vetadas**: detecta PRs en vuelo, issues reclamadas y pantanos |
| `/21w:plan [proyecto] [#issue]` | Plan de 21 semanas (4 h/día), exportable e importable en la web 21weeks |
| `/21w:week <n>` | Mentoría de la semana: guía con comandos que ejecutas TÚ (`!`) |
| `/21w:review` | Review de tu borrador/diff con severidad de maintainer |

## Qué instala

- **Skill** `21w-mentor`: regla autor-primero, composición de overlays
  (17 proyectos × 2 roles), formato de plan `json21weeks@v1` compatible con
  la web.
- **Comandos** `/21w:*` como gatillos explícitos del flujo.

## La regla central

El agente nunca escribe diffs, tests, commit messages ni respuestas a review
listos para pegar. Tampoco prepara tu entorno ejecutando los comandos por
ti. Guía con preguntas abiertas y comandos concretos que ejecutas tú. Si tu
proyecto tiene su propio `AGENTS.md` o política de IA (Bitcoin Core, Cashu,
Mostro, VLS la tienen), el mentor la respeta.

Parte del proyecto [21weeks](https://github.com/ifuensan/21weeks):
Librería de Satoshi / HackNodes Lab. Licencia MIT.
