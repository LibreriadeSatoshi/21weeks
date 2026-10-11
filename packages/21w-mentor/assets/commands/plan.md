---
description: Genera el plan de 21 semanas (formato json21weeks@v1)
argument-hint: [proyecto] [#issue opcional]
---

Lee primero `~/.claude/skills/21w-mentor/SKILL.md`, el overlay de proyecto (`references/projects/<proyecto>.md`), el de rol (`references/roles/<rol>.md`) y OBLIGATORIAMENTE `references/plan-format.md`.

Genera el plan de 21 semanas siguiendo el formato `json21weeks@v1` EXACTO (el bloque ```json21weeks permite reimportarlo en la web 21weeks):

- Fases: semanas 1-3 entorno/build/cultura (el usuario ejecuta los comandos, tú guías); 4-6 inmersión en el área de la issue ancla; 7-10 primera contribución real end-to-end escrita por el usuario; 11-15 ampliar (review de PRs ajenos, segunda issue); 16-21 área propia y graduación.
- Respeta las horas/semana del perfil. Tareas: acciones concretas que hace EL USUARIO.
- Recursos: solo URLs reales verificadas (repo, CONTRIBUTING, docs oficiales, specs BIPs/BOLTs/NIPs/NUTs). Nunca inventes URLs.
- Guarda el resultado como `21weeks-plan.md` en el directorio de trabajo.

Argumentos del usuario: $ARGUMENTS
