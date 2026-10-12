import { useI18n } from "@/i18n";
import { Reveal } from "@/components/Layout";

/**
 * /21w — la cara del paquete npm `21w-mentor` y los comandos /21w:*.
 * Escrita para dos lectores a la vez: la persona que quiere el mentor en su
 * terminal, y el agente que llega aquí para aprender a usarlo.
 */

const COMMANDS = [
  {
    cmd: "/21w:start",
    es: "Perfil en 5 preguntas (rol, nivel, lenguajes, intereses, horas) y elección de proyecto entre 17 del ecosistema. Además configura el proyecto para el aprendizaje: desactiva las respuestas pre-dibujadas del agente (promptSuggestionEnabled: false) para que pienses tú.",
    en: "Profile in 5 questions (role, level, languages, interests, hours) and project choice among 17 in the ecosystem. It also sets up the project for learning: disables the agent's pre-drawn answers (promptSuggestionEnabled: false) so YOU do the thinking.",
  },
  {
    cmd: "/21w:issues [proyecto]",
    es: "Good-first-issues vetadas, no solo listadas: lee comentarios, detecta PRs en vuelo o mergeadas, issues ya reclamadas y pantanos de scope creep. Máximo 5, ordenadas por encaje contigo, con por qué encaja y qué verificar antes de empezar.",
    en: "Vetted good-first-issues, not just listed: reads comments, detects in-flight or merged PRs, already-claimed issues and scope-creep swamps. Max 5, ranked by fit, with why it fits you and what to check before starting.",
  },
  {
    cmd: "/21w:plan [proyecto] [#issue]",
    es: "Genera el plan de 21 semanas en formato json21weeks@v1 — el mismo que exporta e importa esta web. Puedes traer tu plan de la web a tu agente, o llevar el de tu agente a la web.",
    en: "Generates the 21-week plan in json21weeks@v1 format — the same one this website exports and imports. Bring your plan from the web into your agent, or take your agent's plan to the web.",
  },
  {
    cmd: "/21w:week <n>",
    es: "Mentoría de la semana N: repasa objetivos, tareas y entregable. Guía con preguntas y comandos concretos, pero los comandos los ejecutas TÚ (prefijo `!`). Antes de cerrar la semana verifica que puedes explicar lo que hiciste con tus palabras.",
    en: "Mentorship for week N: reviews objectives, tasks and deliverable. It guides with questions and concrete commands, but YOU run the commands (`!` prefix). Before closing the week it checks you can explain what you did in your own words.",
  },
  {
    cmd: "/21w:review [archivo]",
    es: "Review de tu borrador o diff con severidad de maintainer real: deadlocks, edge cases, causa raíz vs síntoma, tests ausentes, formato de commits del proyecto. No reescribe nada: señala, pregunta lo incómodo y deja que corrijas tú.",
    en: "Review of your draft or diff with real maintainer severity: deadlocks, edge cases, root cause vs symptom, missing tests, the project's commit format. It rewrites nothing: it points, asks the uncomfortable questions and lets you fix it.",
  },
];

export default function MentorCli() {
  const { locale } = useI18n();
  const es = locale === "es";

  return (
    <div className="mx-auto max-w-4xl px-5 py-16 md:py-24">
      <Reveal>
        <p className="eyebrow mb-3" style={{ color: "var(--ember)" }}>
          21w-mentor · npm
        </p>
        <h1 className="text-3xl md:text-5xl font-extrabold tracking-[-0.03em] mb-4">
          {es ? "El mentor, dentro de tu terminal" : "The mentor, inside your terminal"}
        </h1>
        <p className="opacity-70 max-w-2xl leading-relaxed">
          {es
            ? "El mismo mentor autor-primero de esta web —el que guía y pregunta pero nunca hace el trabajo por ti— empaquetado para tu agente de código local (Claude Code y compatibles). Esta página vale para dos lectores: para ti, que quieres instalarlo, y para tu agente, que puede leerla como manual."
            : "The same author-first mentor from this website —the one that guides and asks but never does the work for you— packaged for your local coding agent (Claude Code and compatible). This page serves two readers: you, who want to install it, and your agent, which can read it as a manual."}
        </p>
      </Reveal>

      {/* Instalación */}
      <Reveal>
        <section className="mt-14">
          <h2 className="text-xl md:text-2xl font-bold tracking-tight mb-4">
            {es ? "Instalación" : "Install"}
          </h2>
          <div
            className="rounded-lg p-5 font-mono2 text-sm leading-relaxed overflow-x-auto"
            style={{ background: "#171d36", color: "#e8e6df" }}
          >
            <div><span style={{ color: "#f7931a" }}>$</span> npx 21w-mentor init</div>
            <div className="opacity-50 text-xs mt-1 mb-3">
              {es
                ? "# global: ~/.claude — disponible en todos tus proyectos"
                : "# global: ~/.claude — available in all your projects"}
            </div>
            <div><span style={{ color: "#f7931a" }}>$</span> npx 21w-mentor init --project</div>
            <div className="opacity-50 text-xs mt-1 mb-3">
              {es
                ? "# solo este repo: ./.claude — viaja con el proyecto y tu equipo"
                : "# this repo only: ./.claude — travels with the project and your team"}
            </div>
            <div><span style={{ color: "#f7931a" }}>$</span> npx 21w-mentor uninstall</div>
          </div>
          <p className="mt-3 text-sm opacity-60">
            {es
              ? "Tras instalar, abre una sesión nueva de tu agente: los skills se cargan al arrancar."
              : "After installing, open a new agent session: skills load at startup."}
          </p>
        </section>
      </Reveal>

      {/* Qué instala */}
      <Reveal>
        <section className="mt-14">
          <h2 className="text-xl md:text-2xl font-bold tracking-tight mb-4">
            {es ? "Qué instala" : "What it installs"}
          </h2>
          <div className="grid md:grid-cols-2 gap-px" style={{ background: "var(--hairline)" }}>
            {[
              {
                t: es ? "Skill 21w-mentor" : "21w-mentor skill",
                d: es
                  ? "La regla autor-primero, 17 overlays de proyecto (cultura, política de IA, CONTRIBUTING de cada repo) y 2 de rol (developer/researcher), más el formato de plan json21weeks@v1 compatible con esta web."
                  : "The author-first rule, 17 project overlays (culture, AI policy, each repo's CONTRIBUTING) and 2 role overlays (developer/researcher), plus the json21weeks@v1 plan format compatible with this website.",
              },
              {
                t: es ? "Comandos /21w:*" : "/21w:* commands",
                d: es
                  ? "Cinco gatillos explícitos del flujo completo: perfil → issues vetadas → plan → mentoría semanal → review. Abajo, uno por uno."
                  : "Five explicit triggers for the full flow: profile → vetted issues → plan → weekly mentorship → review. Detailed below.",
              },
              {
                t: es ? "Config pedagógica" : "Pedagogy config",
                d: es
                  ? "/21w:start escribe promptSuggestionEnabled: false en el proyecto: sin respuestas pre-dibujadas, aprendes de verdad."
                  : "/21w:start writes promptSuggestionEnabled: false into the project: no pre-drawn answers, real learning.",
              },
              {
                t: es ? "Sin dependencias" : "Zero dependencies",
                d: es
                  ? "El instalador es un script Node.js sin dependencias: copia archivos, nada más. Lo que ves es lo que se instala."
                  : "The installer is a dependency-free Node.js script: it copies files, nothing else. What you see is what gets installed.",
              },
            ].map((c) => (
              <div key={c.t} className="p-5" style={{ background: "var(--ink)" }}>
                <h3 className="font-bold tracking-tight mb-1.5" style={{ color: "var(--paper)" }}>{c.t}</h3>
                <p className="text-sm opacity-70 leading-relaxed">{c.d}</p>
              </div>
            ))}
          </div>
        </section>
      </Reveal>

      {/* Comandos */}
      <Reveal>
        <section className="mt-14">
          <h2 className="text-xl md:text-2xl font-bold tracking-tight mb-2">
            {es ? "Los cinco comandos" : "The five commands"}
          </h2>
          <p className="text-sm opacity-60 mb-6">
            {es
              ? "El flujo completo: start → issues → plan → week (×21) → review antes de cada PR."
              : "The full flow: start → issues → plan → week (×21) → review before every PR."}
          </p>
          <div className="space-y-px" style={{ background: "var(--hairline)" }}>
            {COMMANDS.map((c, i) => (
              <div key={c.cmd} className="p-5 flex flex-col md:flex-row md:items-start gap-2 md:gap-6" style={{ background: "var(--ink)" }}>
                <code
                  className="font-mono2 text-sm font-bold shrink-0 md:w-64"
                  style={{ color: "var(--ember)" }}
                >
                  {c.cmd}
                </code>
                <p className="text-sm opacity-70 leading-relaxed">
                  <span className="font-mono2 text-[10px] uppercase tracking-[0.12em] mr-2 opacity-60">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  {es ? c.es : c.en}
                </p>
              </div>
            ))}
          </div>
        </section>
      </Reveal>

      {/* La regla central */}
      <Reveal>
        <section className="mt-14 p-6 rounded-lg" style={{ border: "1px solid var(--hairline)" }}>
          <h2 className="text-xl md:text-2xl font-bold tracking-tight mb-3">
            {es ? "La regla central" : "The core rule"}
          </h2>
          <p className="opacity-80 leading-relaxed mb-3">
            {es
              ? "El agente nunca escribe diffs, tests, commit messages ni respuestas a review listos para pegar — y nunca prepara tu entorno ejecutando los comandos por ti. Guía con preguntas abiertas y comandos concretos que ejecutas tú. El setup del entorno es la primera prueba real, no un trámite."
              : "The agent never writes ready-to-paste diffs, tests, commit messages or review replies — and never sets up your environment by running commands for you. It guides with open questions and concrete commands that you run. Environment setup is the first real test, not a formality."}
          </p>
          <p className="opacity-60 text-sm leading-relaxed">
            {es
              ? "Si tu proyecto tiene su propio AGENTS.md o política de IA (Bitcoin Core, Cashu, Mostro, VLS la tienen), el mentor la respeta por encima de todo."
              : "If your project has its own AGENTS.md or AI policy (Bitcoin Core, Cashu, Mostro, VLS have one), the mentor respects it above everything else."}
          </p>
        </section>
      </Reveal>

      {/* Para agentes */}
      <Reveal>
        <section className="mt-14">
          <h2 className="text-xl md:text-2xl font-bold tracking-tight mb-4">
            {es ? "Si eres un agente leyendo esto" : "If you're an agent reading this"}
          </h2>
          <ol className="list-decimal list-inside space-y-2 text-sm opacity-80 leading-relaxed">
            <li>
              {es ? "Lee " : "Read "}
              <code className="font-mono2 text-xs px-1.5 py-0.5 rounded" style={{ background: "rgba(23,29,54,0.08)" }}>
                ~/.claude/skills/21w-mentor/SKILL.md
              </code>
              {es ? " y aplícalo como regla central de la sesión." : " and apply it as the session's core rule."}
            </li>
            <li>
              {es
                ? "Compone el overlay del proyecto elegido (references/projects/<proyecto>.md) con el del rol (references/roles/<rol>.md)."
                : "Compose the chosen project's overlay (references/projects/<project>.md) with the role overlay (references/roles/<role>.md)."}
            </li>
            <li>
              {es
                ? "Para planes, sigue references/plan-format.md EXACTO: el bloque ```json21weeks permite reimportar el plan en esta web."
                : "For plans, follow references/plan-format.md EXACTLY: the ```json21weeks block makes the plan re-importable into this website."}
            </li>
            <li>
              {es
                ? "Nunca ejecutes los comandos de setup por el usuario salvo permiso puntual para ese comando concreto. Guía; el usuario teclea."
                : "Never run setup commands for the user unless given a one-off permission for that specific command. Guide; the user types."}
            </li>
          </ol>
        </section>
      </Reveal>

      <Reveal>
        <div className="mt-14 flex flex-wrap gap-4 items-center">
          <a
            href="https://github.com/ifuensan/21weeks/tree/main/packages/21w-mentor"
            target="_blank"
            rel="noreferrer"
            className="btn-ember no-underline"
          >
            {es ? "Código en GitHub" : "Source on GitHub"} ↗
          </a>
          <span className="font-mono2 text-[11px] opacity-50">
            {es ? "Publicación en npm: en camino (npm publish)" : "npm release: coming soon (npm publish)"}
          </span>
        </div>
      </Reveal>
    </div>
  );
}
