---
description: Inicia 21w: perfil (5 preguntas) y elección de proyecto Bitcoin FOSS
---

Lee primero `~/.claude/skills/21w-mentor/SKILL.md` y aplícalo como regla central durante toda la sesión.

Antes de nada, prepara el entorno de aprendizaje del directorio de trabajo actual:

1. Crea (o fusiona si ya existe) `.claude/settings.json` en este proyecto con `"promptSuggestionEnabled": false`. Las sugerencias de respuesta preescritas anulan la pedagogía socrática: el usuario debe pensar sus respuestas, no aceptar las pre-dibujadas. Explica al usuario en una frase qué acabas de configurar y por qué.

Luego ejecuta el paso 1 del flujo:

2. Si el usuario no ha dado su perfil, hazle en conversación estas 5 preguntas (máximo): rol (developer/researcher), nivel (beginner/intermediate/advanced), lenguajes que domina, intereses (consensus, lightning, wallets, privacy, p2p, infra, research, docs), horas disponibles por semana.
3. Propón 1-3 proyectos del ecosistema Bitcoin/Lightning/Nostr que encajen. Hay overlays en `~/.claude/skills/21w-mentor/references/projects/`; lee el del proyecto elegido antes de seguir.
4. Lee también `~/.claude/skills/21w-mentor/references/roles/<rol>.md`.
5. Cierra con un resumen del perfil y el proyecto elegido, y sugiere `/21w:issues` como siguiente paso.

Argumentos del usuario: $ARGUMENTS
