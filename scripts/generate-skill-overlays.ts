/**
 * Genera los overlays de proyecto del skill 21w-mentor
 * (packages/21w-mentor/assets/skill/references/projects/<id>.md)
 * a partir de la FUENTE ÚNICA: contracts/catalog.ts
 * (PROJECTS + CULTURE + MENTOR_ADDENDA + LEARNING_RESOURCES).
 *
 * Uso: npm run skill:overlays
 *
 * No editar los .md generados a mano: el cambio se hace en catalog.ts
 * y se regenera.
 */
import { writeFileSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import {
  PROJECTS,
  CULTURE,
  MENTOR_ADDENDA,
  LEARNING_RESOURCES,
} from "../contracts/catalog";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const outDir = join(root, "packages/21w-mentor/assets/skill/references/projects");
mkdirSync(outDir, { recursive: true });

const HEADER =
  "> Generado desde `contracts/catalog.ts` (PROJECTS + CULTURE +\n" +
  "> MENTOR_ADDENDA + LEARNING_RESOURCES). No editar a mano:\n" +
  "> el cambio se hace en la fuente y se regenera con `npm run skill:overlays`.";

function mentorRules(id: string): string {
  const raw = MENTOR_ADDENDA[id];
  if (!raw) return "";
  // quita la cabecera "PROJECT-SPECIFIC MENTOR RULES — X:" y recorta
  return raw
    .trim()
    .replace(/^PROJECT-SPECIFIC MENTOR RULES — [^:]+:\s*/s, "")
    .trim();
}

function relatedResources(projectTracks: readonly string[]): string {
  const hits = LEARNING_RESOURCES.filter((r) =>
    r.tracks.some((t) => projectTracks.includes(t)),
  );
  if (hits.length === 0) return "";
  const lines = hits.map(
    (r) =>
      `- [${r.title.es} / ${r.title.en}](${r.url}): ${r.note.en} (niveles: ${r.levels.join(", ")}; idioma: ${r.lang})`,
  );
  return `## Recursos de aprendizaje curados\n\n${lines.join("\n")}\n`;
}

let count = 0;
for (const p of PROJECTS) {
  const urlLines = [
    `- **Repo**: ${p.urls.repo}`,
    p.urls.contributing ? `- **Contributing**: ${p.urls.contributing}` : null,
    p.urls.docs ? `- **Docs**: ${p.urls.docs}` : null,
    p.urls.chat ? `- **Chat comunidad**: ${p.urls.chat}` : null,
    p.urls.chatAlt ? `- **Chat dev**: ${p.urls.chatAlt}` : null,
  ].filter(Boolean);

  const culture = CULTURE[p.id];
  const sections = [
    `# Overlay de proyecto: ${p.name}\n\n${HEADER}\n`,
    `- **Repo/host**: \`${p.repo}\` (${p.host})`,
    `- **Lenguajes**: ${p.languages.join(", ")}`,
    `- **Tracks**: ${p.tracks.join(", ")}`,
    `- **Dificultad**: ${p.difficulty}/3 · **Roles**: ${p.roles.join(", ")}`,
    ``,
    `## URLs canónicas\n\n${urlLines.join("\n")}\n`,
  ];

  const rules = mentorRules(p.id);
  if (rules) sections.push(`## Reglas del mentor\n\n${rules}\n`);
  if (culture) {
    sections.push(
      `## Cultura de contribución\n\n**ES**: ${culture.es}\n\n**EN**: ${culture.en}\n`,
    );
  }
  sections.push(relatedResources(p.tracks));

  writeFileSync(join(outDir, `${p.id}.md`), sections.filter(Boolean).join("\n"));
  count++;
}

console.log(`✔ ${count} overlays regenerados en ${outDir}`);
