/**
 * Generates the project overlays for the 21w-mentor skill
 * (packages/21w-mentor/assets/skill/references/projects/<id>.md)
 * from the SINGLE SOURCE: contracts/catalog.ts
 * (PROJECTS + CULTURE + MENTOR_ADDENDA + LEARNING_RESOURCES).
 *
 * Usage: npm run skill:overlays
 *
 * Do not edit the generated .md files by hand: make the change in
 * catalog.ts and regenerate.
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
const outDir = join(
  root,
  "packages/21w-mentor/assets/skill/references/projects"
);
mkdirSync(outDir, { recursive: true });

const HEADER =
  "> Generated from `contracts/catalog.ts` (PROJECTS + CULTURE +\n" +
  "> MENTOR_ADDENDA + LEARNING_RESOURCES). Do not edit by hand:\n" +
  "> make the change in the source and regenerate with `npm run skill:overlays`.";

function mentorRules(id: string): string {
  const raw = MENTOR_ADDENDA[id];
  if (!raw) return "";
  // strips the "PROJECT-SPECIFIC MENTOR RULES: X:" header (X may contain
  // parentheses and quotes but no colon) and trims
  return raw
    .trim()
    .replace(/^PROJECT-SPECIFIC MENTOR RULES:\s*[^:\n]+:\s*/, "")
    .trim();
}

function relatedResources(projectTracks: readonly string[]): string {
  const hits = LEARNING_RESOURCES.filter(r =>
    r.tracks.some(t => projectTracks.includes(t))
  );
  if (hits.length === 0) return "";
  const lines = hits.map(
    r =>
      `- [${r.title.es} / ${r.title.en}](${r.url}): ${r.note.en} (levels: ${r.levels.join(", ")}; language: ${r.lang})`
  );
  return `## Curated learning resources\n\n${lines.join("\n")}\n`;
}

let count = 0;
for (const p of PROJECTS) {
  const urlLines = [
    `- **Repo**: ${p.urls.repo}`,
    p.urls.contributing ? `- **Contributing**: ${p.urls.contributing}` : null,
    p.urls.docs ? `- **Docs**: ${p.urls.docs}` : null,
    p.urls.chat ? `- **Community chat**: ${p.urls.chat}` : null,
    p.urls.chatAlt ? `- **Dev chat**: ${p.urls.chatAlt}` : null,
  ].filter(Boolean);

  const culture = CULTURE[p.id];
  const sections = [
    `# Project overlay: ${p.name}\n\n${HEADER}\n`,
    `- **Repo/host**: \`${p.repo}\` (${p.host})`,
    `- **Languages**: ${p.languages.join(", ")}`,
    `- **Tracks**: ${p.tracks.join(", ")}`,
    `- **Difficulty**: ${p.difficulty}/3 · **Roles**: ${p.roles.join(", ")}`,
    ``,
    `## Canonical URLs\n\n${urlLines.join("\n")}\n`,
  ];

  const rules = mentorRules(p.id);
  if (rules) sections.push(`## Mentor rules\n\n${rules}\n`);
  if (culture) {
    sections.push(
      `## Contribution culture\n\n**ES**: ${culture.es}\n\n**EN**: ${culture.en}\n`
    );
  }
  sections.push(relatedResources(p.tracks));

  writeFileSync(
    join(outDir, `${p.id}.md`),
    sections.filter(Boolean).join("\n")
  );
  count++;
}

console.log(`✔ ${count} overlays regenerated in ${outDir}`);
