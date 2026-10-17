# ISMOS design kit para desarrollo con LLMs

Kit para meter el design system de ISMOS (v1 final, oct 2026) en cualquier repo y que Claude Code, Cursor, Copilot o cualquier agente lo respete.

## Estado en este repo (21weeks)

El kit está **activado**: la app usa Tailwind 4 con `design/ismos/tailwind/theme.css` y `ismos.css` desde `src/index.css`, el body lleva `ism-root` (en `index.html`) y los iconos son `iconoir-react@7.11.0`.

- Scripts: `npm run ismos:tokens`, `npm run ismos:check` (sobre `src`, `contracts` e `index.html`) y `npm run test:ismos` (incluido en `npm test` y, por tanto, en CI).
- Instrucciones para agentes: sección "Design system" de `AGENTS.md` y el skill `.claude/skills/ismos-ui/`.
- Pendiente: los SVG oficiales del logo en `logos/` (la cabecera muestra el nombre del producto hasta que lleguen).
- Licencias de las fuentes: `fonts/OFL.txt` y `fonts/COPYRIGHT.md`.
- Demo: `examples/tailwind-demo.html`. `examples/out.css` se genera desde `examples/input.css` (que solo escanea `examples/`):
  ```bash
  npx @tailwindcss/cli@4.1.11 -i examples/input.css -o examples/out.css
  ```
  Ábrelo directamente en el navegador; las fuentes se cargan desde `design/ismos/css/fonts.css`.

## Qué hay

```
design/ismos/
  tokens.json            ← fuente de verdad (copiada del design system, no tocar salvo cambio de marca)
  css/
    ismos.css            ← punto de entrada: fonts + tokens + typography + components
    tokens.css           ← GENERADO: variables CSS, light + hacker (data-theme / prefers-color-scheme)
    fonts.css            ← GENERADO: @font-face con rutas relativas (Vite/Astro)
    fonts.public.css     ← GENERADO: @font-face con /fonts/ismos/ (Tailwind CLI, PostCSS sin rebase)
    typography.css       ← GENERADO: clases .ism-t-display … .ism-t-figure
    components.css       ← bundle oficial ism-* (+1 fix, ver abajo)
  tailwind/theme.css     ← GENERADO: tema Tailwind v4, sin defaults (p-16 = 16px, rounded-4, bg-surface…)
  js/tokens.ts           ← GENERADO: tokens para emails, OG images, canvas
  fonts/                 ← Literata, IBM Plex Sans/Mono, Bricolage Grotesque (OFL)
  docs/                  ← guía completa 01–10 + un .md por componente
  logos/                 ← PENDIENTE: SVG oficiales (ver README dentro)
.claude/skills/ismos-ui/SKILL.md   ← skill para Claude Code (resumen operativo de la guía)
AGENTS.md                          ← lo mismo para cualquier agente (Codex, Copilot, Gemini CLI…)
.cursor/rules/ismos.mdc            ← regla de Cursor
CLAUDE.md.snippet                  ← pegar en tu CLAUDE.md
scripts/build-tokens.mjs           ← regenera todo lo GENERADO desde tokens.json (sin dependencias)
scripts/check-ismos.mjs            ← guardia: hex fuera de paleta, spacing/radius fuera de escala, gradientes, sombras, emoji, em dash, palabras e iconos prohibidos
examples/tailwind-demo.html        ← página de referencia con todos los componentes
package.scripts.json               ← scripts y dependencia a fusionar en tu package.json
```

## Instalación (Astro / Vite)

1. Copia `design/`, `scripts/`, `.claude/`, `AGENTS.md` y `.cursor/` a la raíz del repo.
2. Pega `CLAUDE.md.snippet` en tu `CLAUDE.md`. Fusiona `package.scripts.json` en `package.json` y ejecuta `npm i`.
3. En tu CSS global:
   ```css
   @import "tailwindcss";
   @import "../../design/ismos/css/ismos.css";
   @import "../../design/ismos/tailwind/theme.css";
   ```
   Sin Tailwind, basta con `ismos.css`. Envuelve el layout en `<body class="ism-root">`.
4. Tema: `<html data-theme="hacker">` fuerza Hacker mode, `data-theme="light"` fuerza claro, sin atributo sigue al dispositivo.
5. Iconos: `iconoir` (o `iconoir-react`), versión 7.11.0, estilo regular y `currentColor`.

**Si usas Tailwind CLI o PostCSS sin rebase de `url()`:** importa `fonts.public.css` en vez de `ismos.css` (más `tokens.css`, `typography.css` y `components.css` por separado) y copia `design/ismos/fonts/*` a `public/fonts/ismos/`. Vite y Astro reescriben las rutas solos, así que ahí no hace falta.

## Uso con LLMs

- **Claude Code:** carga el skill `ismos-ui` solo para trabajo de UI. Pídelo explícitamente con "usa el skill ismos-ui".
- **Cursor:** usa `.cursor/rules/ismos.mdc`. **Codex, Copilot, Gemini CLI y otros:** leen `AGENTS.md`.
- **Chat suelto (ChatGPT, Gemini, claude.ai):** adjunta `SKILL.md`, `tokens.json` y `components.css`. Para assets que no sean código (posts, slides), usa el bloque de `docs/08-production.md`.
- **Red de seguridad:** `npm run ismos:check` en el pre-commit o en CI. Un LLM se salta reglas de vez en cuando; el check no.

## Mantenimiento

Si cambia la marca, reemplaza `design/ismos/tokens.json` y `docs/`, ejecuta `npm run ismos:tokens` y revisa `SKILL.md` si cambió alguna regla dura.

## Incidencias encontradas en el design system (para Dulce)

1. **Bug en el bundle:** `.ism-root a` tenía más especificidad que `.ism-btn`, así que un `<a class="ism-btn">` salía Mauveine y subrayado. Está corregido en `components.css` con dos reglas marcadas como "Kit fix". Convendría subirlo al bundle oficial.
2. **Inconsistencia en TextField:** `docs/components/TextField.md` dice "borde por defecto 2 px `text` (Ink)", pero `tokens.json` (`border-input`) y el bundle usan 1,5 px Logwood 700. El kit sigue lo que dicen los tokens y el bundle.
3. **El bundle usa valores fuera de escala** (gaps de 6 px, padding de 18/20 px en Terminal, bordes de 1,5 px). El checker ignora `design/ismos/` para no marcarlos, pero conviene normalizarlos.
4. **Los SVG del logo no se publican** como ficheros del artifact; hay que añadirlos a mano en `design/ismos/logos/`. Tampoco existe todavía artwork de lockup ni de favicon.
5. **`tokens.json` usa un formato propio**, no DTCG. Por eso el build es un script propio y no Style Dictionary.
