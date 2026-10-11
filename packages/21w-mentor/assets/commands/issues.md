---
description: Busca y veta good-first-issues del proyecto elegido
argument-hint: [proyecto, p. ej. nutshell]
---

Lee primero `~/.claude/skills/21w-mentor/SKILL.md` y el overlay del proyecto en `~/.claude/skills/21w-mentor/references/projects/<proyecto>.md`.

Busca issues abiertas etiquetadas `good first issue` (o equivalente) en el repo del proyecto (GitHub o GitLab). Para cada candidata, VÉTALA antes de recomendarla:

- Lee los comentarios recientes.
- Si algún comentario menciona una PR (#nnnn o /pull/nnnn), resuelve su estado real: MERGED u OPEN-con-actividad-reciente → descartar; OPEN-pero-stale (4+ semanas sin actividad) → zona gris, solo si el usuario pregunta primero en la issue.
- Si alguien la ha reclamado o está trabajándola sin respuesta de maintainers → avisar y penalizar.
- Si el hilo muestra desacuerdo entre maintainers o scope creep → avisar de que es un pantano, no una primera issue.

Presenta como máximo 5, ordenadas por encaje con el perfil del usuario, con: por qué encaja, qué aprenderá, y una cosa a verificar antes de empezar. Sugiere `/21w:plan` con la elegida.

Argumentos del usuario: $ARGUMENTS
