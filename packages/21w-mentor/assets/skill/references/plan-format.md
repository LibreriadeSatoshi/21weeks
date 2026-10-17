# Formato de plan: `json21weeks@v1`

El plan de 21 semanas es un archivo Markdown legible por humanos Y agentes,
con un bloque JSON de estado al final. Es el formato de intercambio con la web
21weeks (botón «Importar plan»): respétalo exactamente para que los planes
generados aquí se puedan importar allí.

## Estructura

```markdown
# 21 Weeks to Bitcoin OSS: <Nombre del proyecto>

> Plan de 21 semanas (mentoría autor-primero): la persona escribe el código,
> los tests y los PRs; el agente guía, pregunta y revisa.

- Proyecto: **<nombre>**
- Perfil: <rol> · <nivel> · <lenguajes> · <horas> h/semana
- Intereses: <tracks>
- Issue ancla: [#<n> <título>](<url>)        (opcional)
- Generado: <YYYY-MM-DD>
- Progreso al exportar: <n>/21 semanas

## Introducción

<2-3 frases>

## Las 21 semanas

### [ ] Semana 1: <fase>. <título>

**Objetivos**
- <2-4 objetivos, ≤14 palabras cada uno>

**Tareas**
- [ ] <3-5 acciones concretas que hace EL USUARIO>

**Recursos**
- [<etiqueta corta y específica>](<url real verificada>)

**Entregable**: <resultado tangible de la semana>

(...semanas 2-21 igual; marcar `[x]` las completadas)

## Graduación: semana 21

<3-4 frases: qué significa "ser contribuidor" en ese proyecto>

---
El bloque siguiente contiene el estado completo para reimportar este plan en
21weeks. No lo edites a mano.

​```json21weeks
{ ...estado... }
​```
```

## Bloque de estado `json21weeks` (v1)

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

Reglas:

- `weeks` tiene exactamente 21 entradas, en orden.
- Toda URL de `resources` debe ser real y haber sido verificada (repo
  oficial, docs, specs). Nunca inventes URLs.
- `issue` es `null` o `{ "id": "github:owner/repo:N", "number": N, "title":
  "...", "url": "...", "labels": [...], "comments": 0, "body": "..." }`.
- Versionado: este documento es `json21weeks@v1`. Cualquier cambio de
  estructura es un cambio de protocolo; no edites campos existentes.
