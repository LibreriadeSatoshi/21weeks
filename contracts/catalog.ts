/**
 * contracts/catalog.ts — Datos compartidos frontend ↔ backend.
 * Catálogo curado del ecosistema Bitcoin / Lightning (sin shitcoins),
 * tipos de perfil de usuario y tipos de issues / plan.
 *
 * FUENTE ÚNICA del conocimiento por proyecto: PROJECTS + CULTURE +
 * MENTOR_ADDENDA + LEARNING_RESOURCES. De aquí comen la web y los
 * overlays del skill 21w-mentor (npm run skill:overlays).
 */

export type Role = "developer" | "researcher";
export type Level = "beginner" | "intermediate" | "advanced";
export type Locale = "es" | "en";

export interface Profile {
  role: Role;
  level: Level;
  languages: string[];
  tracks: string[];
  hoursPerWeek: number;
}

export const TRACKS = [
  "consensus",
  "lightning",
  "wallets",
  "privacy",
  "p2p",
  "infra",
  "research",
  "docs",
] as const;

export type Track = (typeof TRACKS)[number];

export const LANGUAGES = [
  "C++",
  "C",
  "Rust",
  "Go",
  "Python",
  "TypeScript",
  "C#",
  "Kotlin",
  "Specs",
] as const;

export interface Project {
  id: string;
  name: string;
  tagline: { es: string; en: string };
  summary: { es: string; en: string };
  host: "github" | "gitlab";
  repo: string; // owner/repo o grupo/proyecto
  labels: string[]; // etiquetas de "good first issue" a consultar
  languages: string[];
  tracks: Track[];
  difficulty: 1 | 2 | 3; // 1 = amable para empezar, 3 = exigente
  roles: Role[];
  urls: {
    repo: string;
    contributing?: string;
    docs?: string;
    chat?: string;
    chatAlt?: string; // segundo canal (p.ej. Matrix dev junto a Telegram general)
  };
}
