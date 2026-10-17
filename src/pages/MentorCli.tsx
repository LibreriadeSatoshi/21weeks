import { useI18n } from "@/i18n";
import { OpenNewWindow } from "iconoir-react";
import { PageHeader, SectionHead } from "@/components/ismos";

/**
 * /21w: la cara del paquete npm `21w-mentor` y los comandos /21w:*.
 * Escrita para dos lectores a la vez: la persona que quiere el mentor en su
 * terminal, y el agente que llega aquí para aprender a usarlo.
 */

const COMMANDS = [
  {
    cmd: "/21w:start",
    es: "Perfil en 5 preguntas (rol, nivel, lenguajes, intereses, horas) y elección de proyecto entre 17 del ecosistema. Además configura el proyecto para el aprendizaje: desactiva las respuestas pre-dibujadas del agente (promptSuggestionEnabled: false) para que pienses tú.",
    en: "Profile in 5 questions (role, level, languages, interests, hours) and project choice among 17 in the ecosystem. It also sets up the project for learning: disables the agent's pre-drawn answers (promptSuggestionEnabled: false) so you do the thinking.",
  },
  {
    cmd: "/21w:issues [proyecto]",
    es: "Good-first-issues vetadas, no solo listadas: lee comentarios, detecta PRs en vuelo o mergeadas, issues ya reclamadas y pantanos de scope creep. Máximo 5, ordenadas por encaje contigo, con por qué encaja y qué verificar antes de empezar.",
    en: "Vetted good-first-issues, not just listed: reads comments, detects in-flight or merged PRs, already-claimed issues and scope-creep swamps. Max 5, ranked by fit, with why it fits you and what to check before starting.",
  },
  {
    cmd: "/21w:plan [proyecto] [#issue]",
    es: "Genera el plan de 21 semanas en formato json21weeks@v1, el mismo que exporta e importa esta web. Puedes traer tu plan de la web a tu agente, o llevar el de tu agente a la web.",
    en: "Generates the 21-week plan in json21weeks@v1 format, the same one this website exports and imports. Bring your plan from the web into your agent, or take your agent's plan to the web.",
  },
  {
    cmd: "/21w:week <n>",
    es: "Mentoría de la semana N: repasa objetivos, tareas y entregable. Guía con preguntas y comandos concretos, pero los comandos los ejecutas tú (prefijo `!`). Antes de cerrar la semana verifica que puedes explicar lo que hiciste con tus palabras.",
    en: "Mentorship for week N: reviews objectives, tasks and deliverable. It guides with questions and concrete commands, but you run the commands (`!` prefix). Before closing the week it checks you can explain what you did in your own words.",
  },
  {
    cmd: "/21w:review [archivo]",
    es: "Review de tu borrador o diff con severidad de maintainer real: deadlocks, edge cases, causa raíz vs síntoma, tests ausentes, formato de commits del proyecto. No reescribe nada: señala, pregunta lo incómodo y deja que corrijas tú.",
    en: "Review of your draft or diff with real maintainer severity: deadlocks, edge cases, root cause vs symptom, missing tests, the project's commit format. It rewrites nothing: it points, asks the uncomfortable questions and lets you fix it.",
  },
];

const INSTALLS = [
  {
    es: {
      t: "Skill 21w-mentor",
      d: "La regla autor-primero, 17 overlays de proyecto (cultura, política de IA, CONTRIBUTING de cada repo) y 2 de rol (developer/researcher), más el formato de plan json21weeks@v1 compatible con esta web.",
    },
    en: {
      t: "21w-mentor skill",
      d: "The author-first rule, 17 project overlays (culture, AI policy, each repo's CONTRIBUTING) and 2 role overlays (developer/researcher), plus the json21weeks@v1 plan format compatible with this website.",
    },
  },
  {
    es: {
      t: "Comandos /21w:*",
      d: "Cinco gatillos explícitos del flujo completo: perfil, issues vetadas, plan, mentoría semanal y review. Abajo, uno por uno.",
    },
    en: {
      t: "/21w:* commands",
      d: "Five explicit triggers for the full flow: profile, vetted issues, plan, weekly mentorship and review. Detailed below.",
    },
  },
  {
    es: {
      t: "Config pedagógica",
      d: "/21w:start escribe promptSuggestionEnabled: false en el proyecto: sin respuestas pre-dibujadas, aprendes de verdad.",
    },
    en: {
      t: "Pedagogy config",
      d: "/21w:start writes promptSuggestionEnabled: false into the project: no pre-drawn answers, real learning.",
    },
  },
  {
    es: {
      t: "Sin dependencias",
      d: "El instalador es un script Node.js sin dependencias: copia archivos, nada más. Lo que ves es lo que se instala.",
    },
    en: {
      t: "Zero dependencies",
      d: "The installer is a dependency-free Node.js script: it copies files, nothing else. What you see is what gets installed.",
    },
  },
];

const PACKAGE_URL =
  "https://github.com/LibreriadeSatoshi/21weeks/tree/main/packages/21w-mentor";

export default function MentorCli() {
  const { locale } = useI18n();
  const es = locale === "es";

  return (
    <div className="app-container py-64">
      <div className="max-w-reading">
        <PageHeader
          label="21w-mentor · npm"
          title={
            es
              ? "El mentor, dentro de tu terminal"
              : "The mentor, inside your terminal"
          }
          lead={
            es
              ? "El mismo mentor autor-primero de esta web, que guía y pregunta pero nunca hace el trabajo por ti, empaquetado para tu agente de código local (Claude Code y compatibles). Esta página vale para dos lectores: para ti, que quieres instalarlo, y para tu agente, que puede leerla como manual."
              : "The same author-first mentor from this website, the one that guides and asks but never does the work for you, packaged for your local coding agent (Claude Code and compatible). This page serves two readers: you, who want to install it, and your agent, which can read it as a manual."
          }
        />

        <section className="mb-64">
          <SectionHead num="01" title={es ? "Instalación" : "Install"} />
          <div className="ism-term">
            <div>
              <span className="pr">$</span> npx 21w-mentor init
            </div>
            <div className="cm">
              {es
                ? "# global: ~/.claude, disponible en todos tus proyectos"
                : "# global: ~/.claude, available in all your projects"}
            </div>
            <div>
              <span className="pr">$</span> npx 21w-mentor init --project
            </div>
            <div className="cm">
              {es
                ? "# solo este repo: ./.claude, viaja con el proyecto y tu equipo"
                : "# this repo only: ./.claude, travels with the project and your team"}
            </div>
            <div>
              <span className="pr">$</span> npx 21w-mentor uninstall
            </div>
          </div>
          <p className="ism-t-body-small text-text-muted mt-12 mb-0">
            {es
              ? "Tras instalar, abre una sesión nueva de tu agente: los skills se cargan al arrancar."
              : "After installing, open a new agent session: skills load at startup."}
          </p>
        </section>
      </div>

      <section className="mb-64">
        <SectionHead num="02" title={es ? "Qué instala" : "What it installs"} />
        <ul className="grid md:grid-cols-2 gap-32 m-0 p-0 list-none">
          {INSTALLS.map(item => {
            const c = es ? item.es : item.en;
            return (
              <li key={c.t} className="flex flex-col gap-8">
                <h3 className="ism-t-h3 text-text-heading m-0">{c.t}</h3>
                <p className="ism-t-body-small m-0">{c.d}</p>
              </li>
            );
          })}
        </ul>
      </section>

      <section className="mb-64">
        <SectionHead
          num="03"
          title={es ? "Los cinco comandos" : "The five commands"}
        />
        <p className="ism-t-body-small text-text-muted mt-0 mb-24">
          {es
            ? "El flujo completo: start, issues, plan, week (21 veces) y review antes de cada PR."
            : "The full flow: start, issues, plan, week (21 times) and review before every PR."}
        </p>
        <ol className="m-0 p-0 list-none border-t-1 border-hairline">
          {COMMANDS.map(c => (
            <li
              key={c.cmd}
              className="py-16 border-b-1 border-hairline flex flex-col md:flex-row md:items-start gap-8 md:gap-24"
            >
              <code className="ism-t-figure text-text-heading shrink-0 md:w-1/3">
                {c.cmd}
              </code>
              <p className="ism-t-body-small m-0">{es ? c.es : c.en}</p>
            </li>
          ))}
        </ol>
      </section>

      <section className="mb-64 max-w-reading">
        <SectionHead
          num="04"
          title={es ? "La regla central" : "The core rule"}
        />
        <p className="ism-t-body mt-0 mb-12">
          {es
            ? "El agente nunca escribe diffs, tests, commit messages ni respuestas a review listos para pegar. Tampoco prepara tu entorno ejecutando los comandos por ti. Guía con preguntas abiertas y comandos concretos que ejecutas tú. El setup del entorno es la primera prueba real, no un trámite."
            : "The agent never writes ready-to-paste diffs, tests, commit messages or review replies. Nor does it set up your environment by running commands for you. It guides with open questions and concrete commands that you run. Environment setup is the first real test, not a formality."}
        </p>
        <p className="ism-t-body-small text-text-muted m-0">
          {es
            ? "Si tu proyecto tiene su propio AGENTS.md o política de IA (Bitcoin Core, Cashu, Mostro, VLS la tienen), el mentor la respeta por encima de todo."
            : "If your project has its own AGENTS.md or AI policy (Bitcoin Core, Cashu, Mostro, VLS have one), the mentor respects it above everything else."}
        </p>
      </section>

      <section className="mb-64 max-w-reading">
        <SectionHead
          num="05"
          title={
            es
              ? "Si eres un agente leyendo esto"
              : "If you're an agent reading this"
          }
        />
        <ol className="ism-t-body-small m-0 ps-24 list-decimal flex flex-col gap-8">
          <li>
            {es ? "Lee " : "Read "}
            <code className="font-mono">
              ~/.claude/skills/21w-mentor/SKILL.md
            </code>
            {es
              ? " y aplícalo como regla central de la sesión."
              : " and apply it as the session's core rule."}
          </li>
          <li>
            {es
              ? "Compone el overlay del proyecto elegido (references/projects/<proyecto>.md) con el del rol (references/roles/<rol>.md)."
              : "Compose the chosen project's overlay (references/projects/<project>.md) with the role overlay (references/roles/<role>.md)."}
          </li>
          <li>
            {es
              ? "Para planes, sigue references/plan-format.md al pie de la letra: el bloque ```json21weeks permite reimportar el plan en esta web."
              : "For plans, follow references/plan-format.md exactly: the ```json21weeks block makes the plan re-importable into this website."}
          </li>
          <li>
            {es
              ? "Nunca ejecutes los comandos de setup por el usuario salvo permiso puntual para ese comando concreto. Guía; el usuario teclea."
              : "Never run setup commands for the user unless given a one-off permission for that specific command. Guide; the user types."}
          </li>
        </ol>
      </section>

      <div className="flex flex-wrap gap-16 items-center">
        <a
          href={PACKAGE_URL}
          target="_blank"
          rel="noreferrer"
          className="ism-btn"
        >
          {es ? "Ver el código en GitHub" : "Read the source on GitHub"}
          <OpenNewWindow width={20} height={20} aria-hidden="true" />
        </a>
        <span className="ism-t-caption text-text-muted">
          {es ? "Publicación en npm: en camino" : "npm release: coming soon"}
        </span>
      </div>
    </div>
  );
}
