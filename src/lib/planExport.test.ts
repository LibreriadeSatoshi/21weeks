import { describe, expect, it } from "vitest";
import {
  buildPlanMarkdown,
  parseImportedPlan,
  type ExportState,
} from "./planExport";

const state: ExportState = {
  profile: {
    role: "developer",
    level: "beginner",
    languages: ["TypeScript"],
    tracks: ["infra"],
    hoursPerWeek: 4,
  },
  projectId: "bitcoin-core",
  projectName: "Bitcoin Core",
  issue: null,
  plan: {
    projectId: "bitcoin-core",
    projectName: "Bitcoin Core",
    generatedAt: "2026-10-16T12:00:00.000Z",
    intro: "Una introducción al plan.",
    graduation: "Contribuir de forma autónoma.",
    weeks: [
      {
        week: 1,
        phase: "Preparación",
        title: "Preparar el entorno",
        objectives: ["Compilar el proyecto"],
        tasks: ["Ejecutar los tests"],
        resources: [{ label: "Repositorio", url: "https://github.com/bitcoin/bitcoin" }],
        outcome: "Entorno de desarrollo funcional",
      },
    ],
  },
  doneWeeks: [1],
  exportedAt: "2026-10-16T12:30:00.000Z",
};

describe("plan export", () => {
  it("round-trips the complete state through Markdown", () => {
    const markdown = buildPlanMarkdown(state, "es");

    expect(markdown).toContain("### [x] Semana 1");
    expect(markdown).not.toContain("—");
    expect(parseImportedPlan(markdown)).toEqual(state);
  });

  it("rejects content without a valid embedded plan", () => {
    expect(parseImportedPlan("# Sin estado")).toBeNull();
    expect(parseImportedPlan("```json21weeks\n{}\n```")).toBeNull();
  });
});
